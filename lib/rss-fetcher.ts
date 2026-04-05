/**
 * RSS Feed Fetcher — Always-On Fallback
 * Fetches real articles from BBC, Reuters, AP, The Guardian
 * No API key required. Uses free public RSS feeds.
 */

export interface RSSArticle {
  id: string
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
}

interface RSSFeed {
  name: string
  url: string
  category: string
  baseUrl: string
}

// Curated list of reliable, freely accessible RSS feeds — no API key required
const RSS_FEEDS: RSSFeed[] = [
  // ── General / World ────────────────────────────────────────────────────────
  { name: 'BBC News',          url: 'https://feeds.bbci.co.uk/news/rss.xml',                      category: 'General',    baseUrl: 'https://www.bbc.com' },
  { name: 'BBC World',         url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                category: 'World',      baseUrl: 'https://www.bbc.com' },
  { name: 'Reuters',           url: 'https://feeds.reuters.com/reuters/topNews',                  category: 'General',    baseUrl: 'https://www.reuters.com' },
  { name: 'AP News',           url: 'https://apnews.com/hub/ap-top-news?format=rss',              category: 'General',    baseUrl: 'https://apnews.com' },
  { name: 'Al Jazeera',        url: 'https://www.aljazeera.com/xml/rss/all.xml',                  category: 'World',      baseUrl: 'https://www.aljazeera.com' },
  { name: 'Deutsche Welle',    url: 'https://rss.dw.com/rdf/rss-en-top',                          category: 'World',      baseUrl: 'https://www.dw.com' },
  { name: 'France 24',         url: 'https://www.france24.com/en/rss',                            category: 'World',      baseUrl: 'https://www.france24.com' },
  { name: 'NPR News',          url: 'https://feeds.npr.org/1001/rss.xml',                         category: 'General',    baseUrl: 'https://www.npr.org' },
  { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss',                     category: 'World',      baseUrl: 'https://www.theguardian.com' },

  // ── Technology ─────────────────────────────────────────────────────────────
  { name: 'BBC Technology',    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',           category: 'Technology', baseUrl: 'https://www.bbc.com' },
  { name: 'Reuters Technology',url: 'https://feeds.reuters.com/reuters/technologyNews',           category: 'Technology', baseUrl: 'https://www.reuters.com' },
  { name: 'The Guardian Tech', url: 'https://www.theguardian.com/technology/rss',                 category: 'Technology', baseUrl: 'https://www.theguardian.com' },
  { name: 'Hacker News',       url: 'https://hnrss.org/frontpage',                               category: 'Technology', baseUrl: 'https://news.ycombinator.com' },
  { name: 'Ars Technica',      url: 'https://feeds.arstechnica.com/arstechnica/index',            category: 'Technology', baseUrl: 'https://arstechnica.com' },
  { name: 'TechCrunch',        url: 'https://techcrunch.com/feed/',                               category: 'Technology', baseUrl: 'https://techcrunch.com' },
  { name: 'The Verge',         url: 'https://www.theverge.com/rss/index.xml',                     category: 'Technology', baseUrl: 'https://www.theverge.com' },
  { name: 'Wired',             url: 'https://www.wired.com/feed/rss',                             category: 'Technology', baseUrl: 'https://www.wired.com' },
  { name: 'MIT Tech Review',   url: 'https://www.technologyreview.com/feed/',                     category: 'Technology', baseUrl: 'https://www.technologyreview.com' },
  { name: 'Engadget',          url: 'https://www.engadget.com/rss.xml',                           category: 'Technology', baseUrl: 'https://www.engadget.com' },
  { name: 'VentureBeat',       url: 'https://venturebeat.com/feed/',                              category: 'Technology', baseUrl: 'https://venturebeat.com' },

  // ── Science ────────────────────────────────────────────────────────────────
  { name: 'New Scientist',     url: 'https://www.newscientist.com/feed/home/',                    category: 'Science',    baseUrl: 'https://www.newscientist.com' },
  { name: 'Phys.org',          url: 'https://phys.org/rss-feed/',                                 category: 'Science',    baseUrl: 'https://phys.org' },
  { name: 'Space.com',         url: 'https://www.space.com/feeds/all',                            category: 'Space',      baseUrl: 'https://www.space.com' },
  { name: 'NASA',              url: 'https://www.nasa.gov/news-release/feed/',                    category: 'Space',      baseUrl: 'https://www.nasa.gov' },

  // ── Business & Finance ─────────────────────────────────────────────────────
  { name: 'BBC Business',      url: 'https://feeds.bbci.co.uk/news/business/rss.xml',             category: 'Business',   baseUrl: 'https://www.bbc.com' },
  { name: 'Reuters Finance',   url: 'https://feeds.reuters.com/reuters/businessNews',             category: 'Finance',    baseUrl: 'https://www.reuters.com' },
  { name: 'CNBC',              url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', category: 'Finance', baseUrl: 'https://www.cnbc.com' },

  // ── Politics ───────────────────────────────────────────────────────────────
  { name: 'Politico',          url: 'https://rss.politico.com/politics-news.xml',                 category: 'Politics',   baseUrl: 'https://www.politico.com' },
  { name: 'The Hill',          url: 'https://thehill.com/feed/',                                  category: 'Politics',   baseUrl: 'https://thehill.com' },

  // ── Health ─────────────────────────────────────────────────────────────────
  { name: 'BBC Health',        url: 'https://feeds.bbci.co.uk/news/health/rss.xml',               category: 'Health',     baseUrl: 'https://www.bbc.com' },
  { name: 'Reuters Health',    url: 'https://feeds.reuters.com/reuters/healthNews',               category: 'Health',     baseUrl: 'https://www.reuters.com' },
]

/**
 * Parse an RSS XML string into structured article objects.
 * Handles RSS 2.0 format used by BBC, Reuters, Guardian.
 */
function parseRSSXML(xml: string, feed: RSSFeed): RSSArticle[] {
  const articles: RSSArticle[] = []

  // Extract all <item> blocks
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null
  let count = 0

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    count++

    const title = extractTag(item, 'title')
    const link = extractTag(item, 'link') || extractAttr(item, 'guid', 'isPermaLink')
    const description = extractTag(item, 'description')
    const pubDate = extractTag(item, 'pubDate')
    const contentEncoded =
      extractTag(item, 'content:encoded') || extractTag(item, 'description')

    // Try to extract image from media:thumbnail or enclosure
    const mediaThumbnail = extractAttr(item, 'media:thumbnail', 'url')
    const enclosureUrl = extractAttr(item, 'enclosure', 'url')
    const imageUrl = mediaThumbnail || enclosureUrl || null

    if (!title || !link) continue

    // Clean HTML tags from description
    const cleanDescription = stripHtml(description || '')
    const cleanContent = stripHtml(contentEncoded || description || '')

    let parsedDate: string
    try {
      parsedDate = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
    } catch {
      parsedDate = new Date().toISOString()
    }

    // Generate a stable ID from the URL + feed name + count to ensure uniqueness
    const urlHash = btoa(link.slice(-20) + link.slice(0, 20)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
    const id = `rss-${urlHash}-${count}-${Date.now()}`

    articles.push({
      id,
      title: title.trim(),
      description: cleanDescription.slice(0, 300),
      content: cleanContent || cleanDescription,
      url: link.trim(),
      imageUrl,
      publishedAt: parsedDate,
      source: feed.name,
      sourceUrl: link.trim(),
      category: feed.category,
      isReal: true,
    })
  }

  return articles
}

/** Extract text content from an XML tag */
function extractTag(xml: string, tag: string): string {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i')
  const cdataMatch = xml.match(cdataRegex)
  if (cdataMatch) return cdataMatch[1].trim()

  // Handle regular tags
  const tagRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const tagMatch = xml.match(tagRegex)
  if (tagMatch) return tagMatch[1].trim()

  // Handle self-closing or link tag (BBC uses <link> differently)
  if (tag === 'link') {
    const linkRegex = /<link>([^<]+)<\/link>/i
    const linkMatch = xml.match(linkRegex)
    if (linkMatch) return linkMatch[1].trim()
  }

  return ''
}

/** Extract an attribute value from an XML element */
function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*>`, 'i')
  const match = xml.match(regex)
  return match ? match[1] : ''
}

/** Strip HTML tags from a string */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Fetch a single RSS feed and return parsed articles.
 * Times out after 4 seconds to avoid blocking.
 */
async function fetchSingleRSS(feed: RSSFeed): Promise<RSSArticle[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Virlo Intelligence Platform/1.0',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      next: { revalidate: 300 }, // Next.js fetch cache: 5 min
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.warn(`[RSS] ${feed.name}: HTTP ${response.status}`)
      return []
    }

    const xml = await response.text()
    const articles = parseRSSXML(xml, feed)
    console.log(`[RSS] ${feed.name}: fetched ${articles.length} articles`)
    return articles
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.warn(`[RSS] ${feed.name}: timeout`)
    } else {
      console.warn(`[RSS] ${feed.name}: ${(error as Error).message}`)
    }
    return []
  }
}

/**
 * Fetch from multiple RSS feeds in parallel.
 * Returns all successfully fetched articles, deduplicated by URL.
 */
export async function fetchFromRSS(feedUrls?: string[]): Promise<{
  articles: RSSArticle[]
  sourcesQueried: string[]
  sourcesSucceeded: string[]
}> {
  const feeds = feedUrls
    ? RSS_FEEDS.filter(f => feedUrls.includes(f.url))
    : RSS_FEEDS

  const results = await Promise.allSettled(feeds.map(feed => fetchSingleRSS(feed)))

  const sourcesSucceeded: string[] = []
  const allArticles: RSSArticle[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      sourcesSucceeded.push(feeds[i].name)
      allArticles.push(...result.value)
    }
  })

  // Deduplicate by URL
  const seen = new Set<string>()
  const deduplicated = allArticles.filter(a => {
    const key = a.url.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort newest first
  deduplicated.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  return {
    articles: deduplicated,
    sourcesQueried: feeds.map(f => f.name),
    sourcesSucceeded,
  }
}

/**
 * Search RSS articles by query terms (client-side filter after fetch).
 */
export function filterRSSByQuery(articles: RSSArticle[], query: string): RSSArticle[] {
  if (!query.trim()) return articles
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 2)

  return articles.filter(article => {
    const searchable = `${article.title} ${article.description} ${article.category}`.toLowerCase()
    return terms.some(term => searchable.includes(term))
  })
}

/** Get available RSS feed sources */
export function getRSSFeeds(): RSSFeed[] {
  return RSS_FEEDS
}
