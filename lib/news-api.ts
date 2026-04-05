/**
 * lib/news-api.ts — Real News Engine
 * Fetches from /api/news (which hits GNews + NewsAPI + RSS + Guardian + NYT + more)
 * NO hardcoded fake articles. Everything is real.
 */

import type { NormalizedNewsItem, PipelineMeta } from '@/app/api/news/route'

// Re-export the type so consumer components don't need to change imports
export type { NormalizedNewsItem as NormalizedArticle }
export type { PipelineMeta }

// ─── Slug generation ──────────────────────────────────────────────────────────
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70)
}

// ─── In-browser cache ─────────────────────────────────────────────────────────
interface BrowserCache {
  articles: NormalizedNewsItem[]
  meta: PipelineMeta | null
  timestamp: number
  query: string
}

const BROWSER_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const browserCache = new Map<string, BrowserCache>()

// ─── Core fetch ───────────────────────────────────────────────────────────────

export interface FetchNewsResult {
  articles: NormalizedNewsItem[]
  meta: PipelineMeta | null
}

/**
 * Fetch real news articles from the server-side /api/news route.
 * Caches results for 5 minutes in-browser to avoid hammering the server.
 */
export async function fetchRealNews(
  query: string = '',
  category: string = '',
  forceRefresh = false
): Promise<FetchNewsResult> {
  const cacheKey = `${query}__${category}`

  if (!forceRefresh) {
    const cached = browserCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < BROWSER_CACHE_TTL) {
      return { articles: cached.articles, meta: cached.meta }
    }
  }

  try {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (forceRefresh) params.set('nocache', '1')

    const url = `/api/news${params.toString() ? `?${params}` : ''}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`News API returned ${response.status}`)
    }

    const data = await response.json()
    const articles: NormalizedNewsItem[] = (data.articles || []).map(
      (a: NormalizedNewsItem, i: number) => ({
        ...a,
        slug: generateSlug(a.title),
        id: a.id || `news-${i}-${Date.now()}`,
      })
    )
    const meta: PipelineMeta = data.meta || null

    browserCache.set(cacheKey, { articles, meta, timestamp: Date.now(), query: cacheKey })
    return { articles, meta }
  } catch (error) {
    console.error('[news-api] fetchRealNews error:', error)
    return { articles: [], meta: null }
  }
}

/**
 * Find a single article by its slug — needed by article page routing
 * Checks browser cache first; if not found, fetches topic from API
 */
export async function getArticleBySlug(slug: string): Promise<NormalizedNewsItem | null> {
  for (const cached of browserCache.values()) {
    const found = cached.articles.find(a => generateSlug(a.title) === slug)
    if (found) return { ...found, slug }
  }

  const { articles } = await fetchRealNews()
  return articles.find(a => generateSlug(a.title) === slug) || null
}

/**
 * Format a date as relative time ("5 min ago", "2h ago", "3 days ago")
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}
