/**
 * /api/news — Real News Ingestion API Route
 * Sources: GNews · NewsAPI · The Guardian · NY Times · Currents · NewsData.io · RSS
 * Returns real articles + pipeline execution metadata
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchFromRSS, filterRSSByQuery, RSSArticle } from '@/lib/rss-fetcher'
import { generate, hasAIProvider } from '@/lib/ai-client'

// ─── Query optimiser cache (24 h TTL — same raw query = same result) ──────────
const queryOptCache = new Map<string, { optimized: string; timestamp: number }>()
const QUERY_OPT_TTL = 24 * 60 * 60 * 1000

async function optimizeSearchQuery(rawQuery: string): Promise<string> {
  const hit = queryOptCache.get(rawQuery.toLowerCase())
  if (hit && Date.now() - hit.timestamp < QUERY_OPT_TTL) return hit.optimized

  const aiAvailable = await hasAIProvider()
  if (!aiAvailable) return rawQuery

  try {
    const result = await generate(
      `User search input: "${rawQuery}"

Convert this into the most effective keyword query for news APIs (NewsAPI, GNews, Guardian).

Rules:
- Output ONLY the query string — no quotes, no explanation, no punctuation at the end
- 3–6 keywords or short phrases
- Prefer specific proper nouns: people, organizations, locations, events
- Strip vague filler: "what", "tell me", "latest", "news about", "happening"
- Add year 2025 only if it genuinely narrows scope
- If the input is already a clean keyword query, return it unchanged

Output:`,
      {
        system: 'You are a news search query optimizer. Return only the refined keyword string — nothing else.',
        maxTokens: 25,
      }
    )
    const optimized = result.text.trim().replace(/^["'`]|["'`]$/g, '').trim()
    const final = optimized || rawQuery
    queryOptCache.set(rawQuery.toLowerCase(), { optimized: final, timestamp: Date.now() })
    return final
  } catch {
    return rawQuery
  }
}

// ─── In-memory cache ──────────────────────────────────────────────────────────
interface CacheEntry {
  articles: NormalizedNewsItem[]
  meta: PipelineMeta
  timestamp: number
  query: string
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, CacheEntry>()

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NormalizedNewsItem {
  id: string
  slug?: string
  title: string
  description: string
  content: string
  url: string
  imageUrl: string | null
  publishedAt: string
  source: string
  sourceUrl: string
  category: string
  isReal: true
  dataSource: 'gnews' | 'newsapi' | 'guardian' | 'nytimes' | 'currents' | 'newsdata' | 'mediastack' | 'worldnews' | 'perigon' | 'gdelt' | 'rss'
}

export interface PipelineMeta {
  sourcesQueried: string[]
  sourcesSucceeded: string[]
  rawArticlesFound: number
  afterDedup: number
  afterFilter: number
  fetchDurationMs: number
  cacheHit: boolean
  lastFetched: string
  optimizedQuery?: string   // LLM-refined query actually sent to news APIs
}

export interface NewsAPIResponse {
  articles: NormalizedNewsItem[]
  meta: PipelineMeta
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function safeFetch(url: string, options?: RequestInit, timeoutMs = 6000): Promise<Response | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeout)
    return res
  } catch {
    clearTimeout(timeout)
    return null
  }
}

// ─── GNews ────────────────────────────────────────────────────────────────────

async function fetchFromGNews(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  const endpoint = query
    ? `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=30&apikey=${apiKey}`
    : `https://gnews.io/api/v4/top-headlines?lang=en&max=30&apikey=${apiKey}`

  const res = await safeFetch(endpoint, { next: { revalidate: 300 } })
  if (!res?.ok) { console.warn(`[GNews] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.articles || [])
    .filter((a: any) => a.url && a.title && !a.url.includes('[Removed]'))
    .map((a: any, i: number) => ({
      id: `gnews-${Date.now()}-${i}`,
      title: a.title.trim(),
      description: a.description?.trim() || '',
      content: a.content?.trim() || a.description?.trim() || '',
      url: a.url,
      imageUrl: a.image,
      publishedAt: a.publishedAt,
      source: a.source.name,
      sourceUrl: a.url,
      category: query ? 'Search' : 'Top News',
      isReal: true as const,
      dataSource: 'gnews' as const,
    }))
}

// ─── NewsAPI ──────────────────────────────────────────────────────────────────

async function fetchFromNewsAPI(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  const endpoint = query
    ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=30`
    : `https://newsapi.org/v2/top-headlines?language=en&pageSize=30`

  const res = await safeFetch(endpoint, {
    headers: { 'X-Api-Key': apiKey },
    next: { revalidate: 300 },
  })
  if (!res?.ok) { console.warn(`[NewsAPI] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.articles || [])
    .filter((a: any) => a.url && a.title && a.title !== '[Removed]')
    .map((a: any, i: number) => ({
      id: `newsapi-${Date.now()}-${i}`,
      title: a.title.trim(),
      description: a.description?.trim() || '',
      content: a.content?.trim() || a.description?.trim() || '',
      url: a.url,
      imageUrl: a.urlToImage,
      publishedAt: a.publishedAt,
      source: a.source.name,
      sourceUrl: a.url,
      category: query ? 'Search' : 'Top News',
      isReal: true as const,
      dataSource: 'newsapi' as const,
    }))
}

// ─── The Guardian ─────────────────────────────────────────────────────────────

async function fetchFromGuardian(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  const params = new URLSearchParams({
    'api-key': apiKey,
    'page-size': '30',
    'order-by': 'newest',
    'show-fields': 'headline,bodyText,thumbnail,trailText',
  })
  if (query) params.set('q', query)

  const res = await safeFetch(
    `https://content.guardianapis.com/search?${params}`,
    { next: { revalidate: 300 } }
  )
  if (!res?.ok) { console.warn(`[Guardian] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.response?.results || [])
    .filter((a: any) => a.webUrl && a.webTitle)
    .map((a: any, i: number) => ({
      id: `guardian-${Date.now()}-${i}`,
      title: (a.fields?.headline || a.webTitle).trim(),
      description: a.fields?.trailText?.trim() || '',
      content: a.fields?.bodyText?.trim() || a.fields?.trailText?.trim() || '',
      url: a.webUrl,
      imageUrl: a.fields?.thumbnail || null,
      publishedAt: a.webPublicationDate,
      source: 'The Guardian',
      sourceUrl: a.webUrl,
      category: a.sectionName || (query ? 'Search' : 'General'),
      isReal: true as const,
      dataSource: 'guardian' as const,
    }))
}

// ─── New York Times ───────────────────────────────────────────────────────────

async function fetchFromNYT(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  const params = new URLSearchParams({
    'api-key': apiKey,
    sort: 'newest',
  })
  if (query) params.set('q', query)

  const res = await safeFetch(
    `https://api.nytimes.com/svc/search/v2/articlesearch.json?${params}`,
    { next: { revalidate: 300 } }
  )
  if (!res?.ok) { console.warn(`[NYT] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  const docs = data.response?.docs || []

  return docs
    .filter((a: any) => a.web_url && a.headline?.main)
    .map((a: any, i: number) => {
      const multimedia = a.multimedia?.find((m: any) => m.subtype === 'xlarge' || m.subtype === 'wide')
      const imageUrl = multimedia
        ? `https://www.nytimes.com/${multimedia.url}`
        : null

      return {
        id: `nyt-${Date.now()}-${i}`,
        title: a.headline.main.trim(),
        description: a.abstract?.trim() || a.snippet?.trim() || '',
        content: a.lead_paragraph?.trim() || a.abstract?.trim() || '',
        url: a.web_url,
        imageUrl,
        publishedAt: a.pub_date,
        source: 'The New York Times',
        sourceUrl: a.web_url,
        category: a.section_name || (query ? 'Search' : 'General'),
        isReal: true as const,
        dataSource: 'nytimes' as const,
      }
    })
}

// ─── Currents API ─────────────────────────────────────────────────────────────

async function fetchFromCurrents(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  const params = new URLSearchParams({
    apiKey,
    language: 'en',
  })
  const endpoint = query
    ? `https://api.currentsapi.services/v1/search?${params}&keywords=${encodeURIComponent(query)}`
    : `https://api.currentsapi.services/v1/latest-news?${params}`

  const res = await safeFetch(endpoint, { next: { revalidate: 300 } })
  if (!res?.ok) { console.warn(`[Currents] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.news || [])
    .filter((a: any) => a.url && a.title && a.title !== 'N/A')
    .map((a: any, i: number) => ({
      id: `currents-${Date.now()}-${i}`,
      title: a.title.trim(),
      description: a.description?.trim() || '',
      content: a.description?.trim() || '',
      url: a.url,
      imageUrl: a.image !== 'None' ? a.image : null,
      publishedAt: a.published,
      source: a.author || 'Currents',
      sourceUrl: a.url,
      category: a.category?.[0] || (query ? 'Search' : 'General'),
      isReal: true as const,
      dataSource: 'currents' as const,
    }))
}

// ─── NewsData.io ──────────────────────────────────────────────────────────────

async function fetchFromNewsData(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  const params = new URLSearchParams({
    apikey: apiKey,
    language: 'en',
  })
  if (query) params.set('q', query)

  const res = await safeFetch(
    `https://newsdata.io/api/1/news?${params}`,
    { next: { revalidate: 300 } }
  )
  if (!res?.ok) { console.warn(`[NewsData] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.results || [])
    .filter((a: any) => a.link && a.title)
    .map((a: any, i: number) => ({
      id: `newsdata-${Date.now()}-${i}`,
      title: a.title.trim(),
      description: a.description?.trim() || '',
      content: a.content?.trim() || a.description?.trim() || '',
      url: a.link,
      imageUrl: a.image_url || null,
      publishedAt: a.pubDate || new Date().toISOString(),
      source: a.source_id || 'NewsData',
      sourceUrl: a.link,
      category: a.category?.[0] || (query ? 'Search' : 'General'),
      isReal: true as const,
      dataSource: 'newsdata' as const,
    }))
}

// ─── Mediastack ───────────────────────────────────────────────────────────────

async function fetchFromMediastack(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  // Free plan uses HTTP only
  const params = new URLSearchParams({
    access_key: apiKey,
    languages: 'en',
    limit: '25',
    sort: 'published_desc',
  })
  if (query) params.set('keywords', query)

  const res = await safeFetch(`http://api.mediastack.com/v1/news?${params}`, { next: { revalidate: 300 } })
  if (!res?.ok) { console.warn(`[Mediastack] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.data || [])
    .filter((a: any) => a.url && a.title)
    .map((a: any, i: number) => ({
      id: `mediastack-${Date.now()}-${i}`,
      title: a.title.trim(),
      description: a.description?.trim() || '',
      content: a.description?.trim() || '',
      url: a.url,
      imageUrl: a.image || null,
      publishedAt: a.published_at,
      source: a.source || 'Mediastack',
      sourceUrl: a.url,
      category: a.category || (query ? 'Search' : 'General'),
      isReal: true as const,
      dataSource: 'mediastack' as const,
    }))
}

// ─── World News API ───────────────────────────────────────────────────────────

async function fetchFromWorldNews(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  const params = new URLSearchParams({
    'api-key': apiKey,
    language: 'en',
    number: '25',
    'sort': 'publish-time',
    'sort-direction': 'DESC',
  })
  if (query) params.set('text', query)

  const res = await safeFetch(`https://api.worldnewsapi.com/search-news?${params}`, { next: { revalidate: 300 } })
  if (!res?.ok) { console.warn(`[WorldNews] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.news || [])
    .filter((a: any) => a.url && a.title)
    .map((a: any, i: number) => ({
      id: `worldnews-${Date.now()}-${i}`,
      title: a.title.trim(),
      description: a.summary?.trim() || '',
      content: a.text?.trim() || a.summary?.trim() || '',
      url: a.url,
      imageUrl: a.image || null,
      publishedAt: a.publish_date,
      source: a.source_country ? `World News (${a.source_country})` : 'World News',
      sourceUrl: a.url,
      category: query ? 'Search' : 'General',
      isReal: true as const,
      dataSource: 'worldnews' as const,
    }))
}

// ─── Perigon ──────────────────────────────────────────────────────────────────

async function fetchFromPerigon(query: string, apiKey: string): Promise<NormalizedNewsItem[]> {
  const params = new URLSearchParams({
    apiKey,
    language: 'en',
    pageSize: '25',
    sortBy: 'date',
    showNumResults: 'false',
  })
  if (query) params.set('q', query)

  const res = await safeFetch(`https://api.goperigon.com/v1/all?${params}`, { next: { revalidate: 300 } })
  if (!res?.ok) { console.warn(`[Perigon] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.articles || [])
    .filter((a: any) => a.url && a.title)
    .map((a: any, i: number) => ({
      id: `perigon-${Date.now()}-${i}`,
      title: a.title.trim(),
      description: a.description?.trim() || a.summary?.trim() || '',
      content: a.content?.trim() || a.description?.trim() || '',
      url: a.url,
      imageUrl: a.imageUrl || null,
      publishedAt: a.pubDate || a.addedDate,
      source: a.source?.domain || 'Perigon',
      sourceUrl: a.url,
      category: a.category || (query ? 'Search' : 'General'),
      isReal: true as const,
      dataSource: 'perigon' as const,
    }))
}

// ─── GDELT (no API key required) ─────────────────────────────────────────────

async function fetchFromGDELT(query: string): Promise<NormalizedNewsItem[]> {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:T]/g, '').slice(0, 14)

  const params = new URLSearchParams({
    query: query || 'news',
    mode: 'artlist',
    maxrecords: '25',
    format: 'json',
    startdatetime: fmt(yesterday),
    enddatetime: fmt(now),
    sort: 'DateDesc',
  })

  // Filter to English sources only when there's no specific query
  if (!query) params.set('query', 'sourcelang:english')

  const res = await safeFetch(
    `https://api.gdeltproject.org/api/v2/doc/doc?${params}`,
    { next: { revalidate: 300 } }
  )
  if (!res?.ok) { console.warn(`[GDELT] HTTP ${res?.status}`); return [] }

  const data = await res.json()
  return (data.articles || [])
    .filter((a: any) => a.url && a.title)
    .map((a: any, i: number) => ({
      id: `gdelt-${Date.now()}-${i}`,
      title: a.title.trim(),
      description: '',
      content: '',
      url: a.url,
      imageUrl: a.socialimage || null,
      publishedAt: a.seendate
        ? `${a.seendate.slice(0, 4)}-${a.seendate.slice(4, 6)}-${a.seendate.slice(6, 8)}T${a.seendate.slice(9, 11)}:${a.seendate.slice(11, 13)}:00Z`
        : new Date().toISOString(),
      source: a.domain || 'GDELT',
      sourceUrl: a.url,
      category: query ? 'Search' : 'General',
      isReal: true as const,
      dataSource: 'gdelt' as const,
    }))
}

// ─── Google News RSS (free, no key required) ─────────────────────────────────

/** Decode HTML entities so &lt;tag&gt; become <tag> before we strip them */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')           // must be last to avoid double-decoding
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

/**
 * Strip all HTML tags from a string (handles both literal <tags> and
 * entity-encoded &lt;tags&gt; that Google News RSS sometimes emits).
 */
function stripHtml(raw: string): string {
  // 1. decode entities so &lt;a href="URL"&gt; becomes <a href="URL">
  const decoded = decodeHtmlEntities(raw)
  // 2. strip all literal tags — including href values inside the tags
  return decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function fetchFromGoogleNews(query: string): Promise<NormalizedNewsItem[]> {
  if (!query.trim()) return []
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
  // Must send a browser User-Agent — Google blocks bare server requests
  const res = await safeFetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
  }, 10000)
  if (!res?.ok) { console.warn(`[Google News RSS] HTTP ${res?.status} for query: ${query}`); return [] }
  const xml = await res.text()

  // Extract <item> blocks from the RSS feed
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  const items = [...xml.matchAll(itemRegex)]
  const articles: NormalizedNewsItem[] = []

  for (const [, block] of items.slice(0, 15)) {
    const getTag = (tag: string) => {
      const cdataMatch = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i'))
      if (cdataMatch) return cdataMatch[1].trim()
      const plain = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
      return plain ? plain[1].trim() : ''
    }

    // Title: decode entities (already not HTML-tagged normally)
    const rawTitle = getTag('title')
    const title = decodeHtmlEntities(rawTitle)

    // Link: Google News <link> is often not a paired tag — use fallback pattern
    const link = getTag('link') || block.match(/<link>([^<]+)/i)?.[1]?.trim() || ''

    // Description: may be CDATA with HTML markup OR plain text with entity-encoded HTML.
    // Either way: decode entities first, THEN strip tags — so href values don't leak as text.
    const desc = stripHtml(getTag('description')).slice(0, 300)

    const pubDate = getTag('pubDate')
    // Google News puts the publication name in <source>
    const sourceName = decodeHtmlEntities(getTag('source')) || 'Google News'

    if (!title || !link) continue

    // Skip items where the link itself is clearly a Google redirect with no real content
    // (these will still work as links — users get redirected — but we flag them)
    const isGoogleRedirect = link.includes('news.google.com/rss/articles/')

    let publishedAt: string
    try { publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString() }
    catch { publishedAt = new Date().toISOString() }

    const urlHash = Buffer.from(link.slice(-20)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
    articles.push({
      id: `gnrss-${urlHash}`,
      title,
      description: desc,
      content: desc,
      url: link,
      imageUrl: null,
      publishedAt,
      source: sourceName,
      sourceUrl: isGoogleRedirect ? `https://news.google.com/search?q=${encodeURIComponent(query)}` : link,
      category: 'Search',
      isReal: true,
      dataSource: 'rss',
    })
  }
  return articles
}

// ─── Google Custom Search API (optional — needs GOOGLE_API_KEY + GOOGLE_CSE_ID) ──

async function fetchFromGoogleCSE(query: string, apiKey: string, cseId: string): Promise<NormalizedNewsItem[]> {
  const params = new URLSearchParams({
    key: apiKey,
    cx: cseId,
    q: query,
    sort: 'date',
    num: '10',
    dateRestrict: 'w1',   // last 7 days
  })
  const res = await safeFetch(`https://www.googleapis.com/customsearch/v1?${params}`, {}, 8000)
  if (!res?.ok) { console.warn(`[Google CSE] HTTP ${res?.status}`); return [] }

  const data = await res.json() as { items?: { title: string; link: string; snippet: string; pagemap?: { metatags?: { 'article:published_time'?: string }[] } }[] }
  return (data.items ?? []).map(item => {
    const pubTime = item.pagemap?.metatags?.[0]?.['article:published_time']
    const urlHash = Buffer.from(item.link.slice(-20)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
    return {
      id: `gcse-${urlHash}`,
      title: item.title.replace(/ - .*$/, ''),   // strip site name suffix
      description: item.snippet ?? '',
      content: item.snippet ?? '',
      url: item.link,
      imageUrl: null,
      publishedAt: pubTime ? new Date(pubTime).toISOString() : new Date().toISOString(),
      source: new URL(item.link).hostname.replace(/^www\./, ''),
      sourceUrl: item.link,
      category: 'Search',
      isReal: true as const,
      dataSource: 'rss' as const,
    }
  })
}

// ─── Normalize RSS to unified format ─────────────────────────────────────────

function normalizeRSSArticle(a: RSSArticle): NormalizedNewsItem {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    content: a.content || a.description,
    url: a.url,
    imageUrl: a.imageUrl,
    publishedAt: a.publishedAt,
    source: a.source,
    sourceUrl: a.url,
    category: a.category,
    isReal: true,
    dataSource: 'rss',
  }
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function deduplicateByUrl(articles: NormalizedNewsItem[]): NormalizedNewsItem[] {
  const seen = new Set<string>()
  return articles.filter(a => {
    const key = a.url.toLowerCase().replace(/\?.*$/, '').replace(/\/$/, '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ─── Category inference ───────────────────────────────────────────────────────

function inferCategory(text: string): string {
  const t = text.toLowerCase()
  if (/ai|artificial intelligence|machine learning|llm|gpt|openai|gemini|anthropic/.test(t)) return 'Technology'
  if (/climate|carbon|renewable|solar|wind|emissions|weather/.test(t)) return 'Climate'
  if (/stock|market|fed|rate|bank|economy|inflation|gdp|finance/.test(t)) return 'Finance'
  if (/space|nasa|spacex|rocket|satellite|mars|moon/.test(t)) return 'Space'
  if (/health|vaccine|drug|medical|hospital|cancer|covid/.test(t)) return 'Health'
  if (/election|president|congress|senate|parliament|government/.test(t)) return 'Politics'
  if (/war|military|conflict|ukraine|russia|israel|gaza/.test(t)) return 'World'
  if (/apple|google|microsoft|meta|amazon|tesla|nvidia|chip/.test(t)) return 'Tech Companies'
  return 'General'
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const noCache = searchParams.get('nocache') === '1'
  const mode = searchParams.get('mode') || ''  // 'latest' = 10 articles, 2-3 random APIs

  const cacheKey = `${mode}__${query}__${category}`

  if (!noCache) {
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        articles: cached.articles,
        meta: { ...cached.meta, cacheHit: true },
      } satisfies NewsAPIResponse)
    }
  }

  // ── LLM query optimisation (search mode only, skipped for latest/browse) ──────
  const searchQuery = (query && mode !== 'latest')
    ? await optimizeSearchQuery(query)
    : query

  const fetchStart = Date.now()

  const gNewsKey       = process.env.GNEWS_API_KEY
  const newsApiKey     = process.env.NEWS_API_KEY
  const guardianKey    = process.env.GUARDIAN_API_KEY
  const nytKey         = process.env.NYT_API_KEY
  const currentsKey    = process.env.CURRENTS_API_KEY
  const newsDataKey    = process.env.NEWSDATA_API_KEY
  const mediastackKey  = process.env.MEDIASTACK_API_KEY
  const worldNewsKey   = process.env.WORLDNEWS_API_KEY
  const perigonKey     = process.env.PERIGON_API_KEY
  const googleApiKey   = process.env.GOOGLE_API_KEY
  const googleCseId    = process.env.GOOGLE_CSE_ID

  const sourcesQueried: string[] = []
  const sourcesSucceeded: string[] = []
  let allArticles: NormalizedNewsItem[] = []

  // ── Source factory: all available paid API sources ─────────────────────────
  type SourceEntry = { name: string; fetcher: () => Promise<NormalizedNewsItem[]> }
  const availablePaid: SourceEntry[] = []
  if (gNewsKey)      availablePaid.push({ name: 'GNews',         fetcher: () => fetchFromGNews(searchQuery, gNewsKey) })
  if (newsApiKey)    availablePaid.push({ name: 'NewsAPI',        fetcher: () => fetchFromNewsAPI(searchQuery, newsApiKey) })
  if (guardianKey)   availablePaid.push({ name: 'The Guardian',   fetcher: () => fetchFromGuardian(searchQuery, guardianKey) })
  if (nytKey)        availablePaid.push({ name: 'New York Times', fetcher: () => fetchFromNYT(searchQuery, nytKey) })
  if (currentsKey)   availablePaid.push({ name: 'Currents',       fetcher: () => fetchFromCurrents(searchQuery, currentsKey) })
  if (newsDataKey)   availablePaid.push({ name: 'NewsData.io',    fetcher: () => fetchFromNewsData(searchQuery, newsDataKey) })
  if (mediastackKey) availablePaid.push({ name: 'Mediastack',     fetcher: () => fetchFromMediastack(searchQuery, mediastackKey) })
  if (worldNewsKey)  availablePaid.push({ name: 'World News API', fetcher: () => fetchFromWorldNews(searchQuery, worldNewsKey) })
  if (perigonKey)    availablePaid.push({ name: 'Perigon',        fetcher: () => fetchFromPerigon(searchQuery, perigonKey) })

  // ── Latest mode: pick 2-3 random paid sources + RSS (cost-optimized) ──────
  const fetchers: Promise<{ name: string; articles: NormalizedNewsItem[] }>[] = []

  if (mode === 'latest') {
    // Shuffle paid sources and pick at most 2
    const shuffled = [...availablePaid].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 2)
    for (const src of selected) {
      sourcesQueried.push(src.name)
      fetchers.push(src.fetcher().then(articles => ({ name: src.name, articles })).catch(() => ({ name: src.name, articles: [] })))
    }
    // Always include RSS (free, broad coverage)
    sourcesQueried.push('RSS Feeds')
    fetchers.push(
      fetchFromRSS().then(({ articles: rssArticles, sourcesSucceeded: rssOk }) => {
        const normalized = rssArticles.map(normalizeRSSArticle)
        return { name: `RSS (${rssOk.length} outlets)`, articles: normalized }
      })
    )
  } else {
    // Full mode: run all enabled sources in parallel
    for (const src of availablePaid) {
      sourcesQueried.push(src.name)
      fetchers.push(src.fetcher().then(articles => ({ name: src.name, articles })))
    }
    // GDELT — no key needed, always runs in full mode with both query variants
    sourcesQueried.push('GDELT')
    fetchers.push(fetchFromGDELT(searchQuery).then(articles => ({ name: 'GDELT', articles })).catch(() => ({ name: 'GDELT', articles: [] })))
    // If raw query differs from optimised, also run GDELT with raw (catches more)
    if (query && query !== searchQuery) {
      fetchers.push(fetchFromGDELT(query).then(articles => ({ name: 'GDELT', articles })).catch(() => ({ name: 'GDELT', articles: [] })))
    }
    // Google News RSS — always run with BOTH the raw query AND the optimised query
    if (query) {
      sourcesQueried.push('Google News')
      // optimised query
      fetchers.push(
        fetchFromGoogleNews(searchQuery)
          .then(articles => ({ name: 'Google News', articles }))
          .catch(() => ({ name: 'Google News', articles: [] }))
      )
      // raw query (different from optimised — catches niche/name queries)
      if (query !== searchQuery) {
        fetchers.push(
          fetchFromGoogleNews(query)
            .then(articles => ({ name: 'Google News', articles }))
            .catch(() => ({ name: 'Google News', articles: [] }))
        )
      }
    }
    // Google Custom Search — optional, key-gated
    if (googleApiKey && googleCseId && searchQuery) {
      sourcesQueried.push('Google Search')
      fetchers.push(
        fetchFromGoogleCSE(searchQuery, googleApiKey, googleCseId)
          .then(articles => ({ name: 'Google Search', articles }))
          .catch(() => ({ name: 'Google Search', articles: [] }))
      )
    }
    // RSS — filter by BOTH raw query terms and optimised query terms so short
    //       queries like "japan" still match articles that use "Japanese" etc.
    sourcesQueried.push('RSS Feeds')
    fetchers.push(
      fetchFromRSS().then(({ articles: rssArticles, sourcesSucceeded: rssOk }) => {
        let normalized: NormalizedNewsItem[]
        if (query) {
          // Use raw query for RSS filter — broader match than the LLM-optimised string
          const rssFiltered = filterRSSByQuery(rssArticles, query)
          // If optimised query is different, also include articles matching it
          const extra = query !== searchQuery ? filterRSSByQuery(rssArticles, searchQuery) : []
          const seen = new Set(rssFiltered.map(a => a.url))
          const merged = [...rssFiltered, ...extra.filter(a => !seen.has(a.url))]
          normalized = merged.map(normalizeRSSArticle)
        } else {
          normalized = rssArticles.map(normalizeRSSArticle)
        }
        return { name: `RSS (${rssOk.length} outlets)`, articles: normalized }
      })
    )
  }

  const results = await Promise.allSettled(fetchers)

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.articles.length > 0) {
      sourcesSucceeded.push(result.value.name)
      allArticles.push(...result.value.articles)
    }
  }

  const rawCount = allArticles.length

  // Deduplicate
  const deduped = deduplicateByUrl(allArticles)
  const afterDedup = deduped.length

  // Enrich categories
  deduped.forEach(a => {
    if (a.category === 'General' || a.category === 'Top News' || a.category === 'Search') {
      a.category = inferCategory(`${a.title} ${a.description}`)
    }
  })

  // Sort newest first
  deduped.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  // Apply category filter
  const filtered = category
    ? deduped.filter(a => a.category.toLowerCase() === category.toLowerCase())
    : deduped

  // ── LLM relevance ranking (search mode only, when we have > 12 candidates) ──
  const FINAL_LIMIT = mode === 'latest' ? 10 : 12
  const RANK_POOL   = 25   // feed LLM up to this many titles

  let final: NormalizedNewsItem[]

  if (mode !== 'latest' && query && filtered.length > FINAL_LIMIT) {
    // Pre-filter: keep articles where at least one raw-query term appears in
    // title, description, OR content. Also check partial matches (e.g. "japan"
    // matches "japanese"). Google News / GDELT articles fetched specifically
    // for the query always get a guaranteed slot.
    const rawTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
    const optTerms = searchQuery !== query
      ? searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 1)
      : []
    const allTerms = [...new Set([...rawTerms, ...optTerms])]

    const isRelevant = (a: NormalizedNewsItem) => {
      const hay = `${a.title} ${a.description} ${a.content}`.toLowerCase()
      return allTerms.some(t => hay.includes(t))
    }

    // Google News and GDELT articles were fetched specifically for this query
    // — treat them as always relevant regardless of text match
    const alwaysRelevant = (a: NormalizedNewsItem) =>
      a.id.startsWith('gnrss-') || a.id.startsWith('gdelt-')

    const relevant    = filtered.filter(a => isRelevant(a) || alwaysRelevant(a))
    const irrelevant  = filtered.filter(a => !isRelevant(a) && !alwaysRelevant(a))

    let preFiltered: NormalizedNewsItem[]
    if (relevant.length >= FINAL_LIMIT) {
      preFiltered = relevant
    } else {
      // Pad with remaining articles to ensure LLM has enough to pick from
      preFiltered = [...relevant, ...irrelevant]
    }

    const pool = preFiltered.slice(0, RANK_POOL)
    const aiAvailable = await hasAIProvider()

    if (aiAvailable) {
      try {
        const titleList = pool.map((a, i) => `${i}: "${a.title}"`).join('\n')
        const rankResult = await generate(
          `User query: "${query}"

${pool.length} candidate headlines:
${titleList}

Select exactly ${FINAL_LIMIT} headlines that are most directly about the user's query. Prefer articles where the query subject is the main topic, not a passing mention.
Order from most relevant to least.

Return ONLY a JSON array of indices, e.g. [3, 0, 7, 1, ...]
No explanation, no text — just the array.`,
          {
            system: 'You are a strict news relevance filter. Only include articles that are genuinely about the query. Return only a JSON integer array.',
            maxTokens: 60,
          }
        )

        // Parse the index array from the LLM response
        const raw = rankResult.text.trim().replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim()
        const match = raw.match(/\[[\d,\s]+\]/)
        if (match) {
          const indices: number[] = JSON.parse(match[0])
          const ranked = indices
            .filter(i => Number.isInteger(i) && i >= 0 && i < pool.length)
            .slice(0, FINAL_LIMIT)
            .map(i => pool[i])
            .filter(Boolean) as NormalizedNewsItem[]

          // Pad with remaining pool articles if LLM returned fewer than limit
          if (ranked.length < FINAL_LIMIT) {
            const used = new Set(ranked.map(a => a.id))
            for (const a of pool) {
              if (!used.has(a.id)) ranked.push(a)
              if (ranked.length >= FINAL_LIMIT) break
            }
          }
          final = ranked
        } else {
          throw new Error('No index array in LLM response')
        }
      } catch {
        final = preFiltered.slice(0, FINAL_LIMIT)
      }
    } else {
      final = preFiltered.slice(0, FINAL_LIMIT)
    }
  } else {
    // latest mode or not enough candidates for LLM — skip aggressive filtering,
    // just return what we have (sources already searched for the query directly)
    final = filtered.slice(0, FINAL_LIMIT)
  }

  // ── Last-resort: if still thin, blast Google News with raw query no filter ──
  if (query && mode !== 'latest' && final.length < 6) {
    try {
      const rescue = await fetchFromGoogleNews(query)
      const usedUrls = new Set(final.map(a => a.url.toLowerCase()))
      const fresh = rescue.filter(a => !usedUrls.has(a.url.toLowerCase()))
      final = [...final, ...fresh].slice(0, FINAL_LIMIT)
    } catch {
      // silently ignore — we already have whatever we have
    }
  }

  const meta: PipelineMeta = {
    sourcesQueried: [...new Set(sourcesQueried)],
    sourcesSucceeded: [...new Set(sourcesSucceeded)],
    rawArticlesFound: rawCount,
    afterDedup,
    afterFilter: final.length,
    fetchDurationMs: Date.now() - fetchStart,
    cacheHit: false,
    lastFetched: new Date().toISOString(),
    optimizedQuery: searchQuery !== query ? searchQuery : undefined,
  }

  cache.set(cacheKey, { articles: final, meta, timestamp: Date.now(), query: cacheKey })

  // Evict oldest entry when cache gets large
  if (cache.size > 50) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
    if (oldest) cache.delete(oldest[0])
  }

  return NextResponse.json({ articles: final, meta } satisfies NewsAPIResponse)
}
