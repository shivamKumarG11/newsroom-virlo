/**
 * GET /api/trending
 *
 * Fetches real hashtag data from the Virlo API:
 *   - https://api.virlo.ai/v1/youtube/hashtags
 *   - https://api.virlo.ai/v1/instagram/hashtags
 *   - https://api.virlo.ai/v1/tiktok/hashtags
 *
 * All 3 platforms fetched in parallel. Cost: $0.05 per platform = $0.15/full refresh.
 *
 * Cache strategy (two layers):
 *   1. In-memory — fast path, valid within same serverless instance lifetime
 *   2. Supabase   — persistent across cold starts, checked when in-memory is stale
 * Result is only fetched from Virlo when BOTH caches are older than 24 h.
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export interface TrendingTopic {
  tag: string
  platform: 'youtube' | 'instagram' | 'tiktok'
  views: string    // formatted total views e.g. "5.2B"
  count: number    // number of videos/posts
  trending: boolean
}

interface MemCache {
  topics: TrendingTopic[]
  timestamp: number
  cost: number
}

interface VirloHashtag {
  hashtag: string
  count: number
  total_views: number
}

const CACHE_TTL = 24 * 60 * 60 * 1000  // 24 hours in ms
let memCache: MemCache | null = null    // in-process fast path

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatViews(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function dateRange() {
  const end = new Date()
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
  return { start_date: toYMD(start), end_date: toYMD(end) }
}

async function fetchPlatform(
  platform: 'youtube' | 'instagram' | 'tiktok',
  key: string,
): Promise<TrendingTopic[]> {
  const { start_date, end_date } = dateRange()
  const params = new URLSearchParams({
    start_date,
    end_date,
    limit: '12',
    order_by: 'views',
    sort: 'desc',
  })

  const res = await fetch(`https://api.virlo.ai/v1/${platform}/hashtags?${params}`, {
    headers: { Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(12000),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Virlo ${platform} ${res.status}: ${body.slice(0, 120)}`)
  }

  const json = await res.json() as { data: VirloHashtag[] }
  return (json.data ?? []).map((item, i) => ({
    tag: item.hashtag.startsWith('#') ? item.hashtag : `#${item.hashtag}`,
    platform,
    views: formatViews(item.total_views),
    count: item.count,
    trending: i < 4,
  }))
}

function interleave(topics: TrendingTopic[]): TrendingTopic[] {
  const byPlatform = {
    youtube:   topics.filter(t => t.platform === 'youtube'),
    instagram: topics.filter(t => t.platform === 'instagram'),
    tiktok:    topics.filter(t => t.platform === 'tiktok'),
  }
  const maxLen = Math.max(...Object.values(byPlatform).map(a => a.length))
  const result: TrendingTopic[] = []
  for (let i = 0; i < maxLen; i++) {
    for (const arr of Object.values(byPlatform)) {
      if (arr[i]) result.push(arr[i])
    }
  }
  return result
}

// ── Supabase cache ─────────────────────────────────────────────────────────────

async function readDbCache(): Promise<MemCache | null> {
  if (!supabase) return null  // Supabase not configured
  const { data } = await supabase
    .from('trending_cache')
    .select('topics, cost, cached_at')
    .eq('id', 'global')
    .maybeSingle()

  if (!data) return null
  const timestamp = new Date(data.cached_at).getTime()
  if (Date.now() - timestamp >= CACHE_TTL) return null   // stale

  return { topics: data.topics as TrendingTopic[], cost: Number(data.cost), timestamp }
}

async function writeDbCache(topics: TrendingTopic[], cost: number): Promise<void> {
  if (!supabase) return  // Supabase not configured
  await supabase.from('trending_cache').upsert({
    id: 'global',
    topics,
    cost,
    cached_at: new Date().toISOString(),
  })
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET() {
  // 1. In-memory fast path
  if (memCache && Date.now() - memCache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      topics: memCache.topics,
      cacheHit: true,
      cacheLayer: 'memory',
      cachedAt: new Date(memCache.timestamp).toISOString(),
      cost: 0,
      nextRefresh: new Date(memCache.timestamp + CACHE_TTL).toISOString(),
    })
  }

  // 2. Supabase persistent cache
  const dbCache = await readDbCache()
  if (dbCache) {
    memCache = dbCache   // warm memory cache from DB
    return NextResponse.json({
      topics: dbCache.topics,
      cacheHit: true,
      cacheLayer: 'database',
      cachedAt: new Date(dbCache.timestamp).toISOString(),
      cost: 0,
      nextRefresh: new Date(dbCache.timestamp + CACHE_TTL).toISOString(),
    })
  }

  // 3. Fetch fresh from Virlo
  const key = process.env.VIRLO_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'VIRLO_API_KEY not configured' },
      { status: 503 }
    )
  }

  const [ytResult, igResult, tkResult] = await Promise.allSettled([
    fetchPlatform('youtube',   key),
    fetchPlatform('instagram', key),
    fetchPlatform('tiktok',    key),
  ])

  const errors: string[] = []
  const allTopics: TrendingTopic[] = []

  for (const result of [ytResult, igResult, tkResult]) {
    if (result.status === 'fulfilled') {
      allTopics.push(...result.value)
    } else {
      errors.push(result.reason instanceof Error ? result.reason.message : String(result.reason))
      console.error('[Virlo Trending]', result.reason)
    }
  }

  if (allTopics.length === 0) {
    return NextResponse.json(
      { error: `All Virlo platforms failed: ${errors.join(' | ')}` },
      { status: 502 }
    )
  }

  const topics = interleave(allTopics)
  const COST_PER_PLATFORM = 0.05
  const succeededCount = [ytResult, igResult, tkResult].filter(r => r.status === 'fulfilled').length
  const cost = succeededCount * COST_PER_PLATFORM
  const now = Date.now()

  // Persist to Supabase + warm memory cache
  await writeDbCache(topics, cost)
  memCache = { topics, timestamp: now, cost }

  return NextResponse.json({
    topics,
    cacheHit: false,
    cacheLayer: 'fresh',
    cachedAt: new Date(now).toISOString(),
    cost,
    nextRefresh: new Date(now + CACHE_TTL).toISOString(),
  })
}
