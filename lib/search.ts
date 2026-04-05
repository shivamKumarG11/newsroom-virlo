/**
 * lib/search.ts — Hybrid Real Search
 * Step 1: Hit /api/news with the query → get real articles
 * Step 2: Score by relevance (keyword + semantic expansion)
 * Step 3: Return scored results with highlight excerpts
 */

import type { NormalizedNewsItem } from '@/app/api/news/route'

export interface SearchResult {
  article: NormalizedNewsItem
  score: number
  matchType: 'exact' | 'semantic' | 'related'
  highlights: string[]
}

export interface SearchSuggestion {
  query: string
  type: 'trending' | 'related' | 'recent'
}

export interface SearchResponse {
  results: SearchResult[]
  suggestions: SearchSuggestion[]
  relatedTopics: string[]
  totalResults: number
  processingTime: number
  sourcesFound: number
  sourcesQueried: string[]
  isRealData: true
  optimizedQuery?: string
}

// ─── Semantic expansion ───────────────────────────────────────────────────────
const SEMANTIC_EXPANSIONS: Record<string, string[]> = {
  ai: ['artificial intelligence', 'machine learning', 'neural network', 'deep learning', 'gpt', 'llm', 'openai', 'gemini', 'anthropic'],
  crypto: ['bitcoin', 'ethereum', 'blockchain', 'cryptocurrency', 'web3', 'defi'],
  climate: ['global warming', 'carbon', 'renewable', 'sustainability', 'emissions', 'clean energy'],
  tech: ['technology', 'software', 'digital', 'innovation', 'startup'],
  finance: ['banking', 'investment', 'stocks', 'markets', 'economy', 'inflation', 'fed', 'rate'],
  health: ['medical', 'healthcare', 'vaccine', 'treatment', 'disease', 'fda', 'drug'],
  ev: ['electric vehicle', 'battery', 'tesla', 'charging', 'automotive'],
  space: ['nasa', 'spacex', 'rocket', 'satellite', 'orbit', 'mars', 'moon'],
  war: ['conflict', 'military', 'invasion', 'ukraine', 'russia', 'israel', 'gaza'],
  election: ['vote', 'voting', 'president', 'congress', 'senate', 'parliament', 'democracy'],
}

function expandQuery(query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/)
  const expanded = new Set(terms)
  for (const term of terms) {
    if (SEMANTIC_EXPANSIONS[term]) {
      SEMANTIC_EXPANSIONS[term].forEach(t => expanded.add(t))
    }
    for (const [key, expansions] of Object.entries(SEMANTIC_EXPANSIONS)) {
      if (expansions.some(e => e.includes(term) || term.includes(e))) {
        expanded.add(key)
        expansions.forEach(t => expanded.add(t))
      }
    }
  }
  return Array.from(expanded)
}

// ─── Keyword scoring ──────────────────────────────────────────────────────────

/** Score a single field, giving +weight for whole-word match, +weight/2 for partial */
function scoreField(field: string, terms: string[], weight: number): number {
  const f = field.toLowerCase()
  let score = 0
  for (const term of terms) {
    if (!f.includes(term)) continue
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    score += regex.test(f) ? weight : weight / 2
  }
  return score
}

/**
 * Weighted relevance score.
 * Title match >> description match >> content match.
 * Source/category names are intentionally excluded so "TechCrunch" doesn't
 * pollute a "tech" query with unrelated articles.
 */
function scoreArticle(article: { title: string; description: string; content: string }, query: string): {
  total: number
  titleScore: number
  descScore: number
} {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
  if (terms.length === 0) return { total: 0, titleScore: 0, descScore: 0 }

  const titleScore = scoreField(article.title, terms, 50)
  const descScore  = scoreField(article.description, terms, 20)
  const bodyScore  = scoreField(article.content ?? '', terms, 5)

  // Bonus: article covers ALL query terms in title
  const allInTitle = terms.every(t =>
    new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(article.title)
  )

  const raw = titleScore + descScore + bodyScore
  return {
    total: allInTitle ? raw * 1.8 : raw,
    titleScore,
    descScore,
  }
}

// Legacy wrapper kept for highlight extraction (not used for filtering)
function scoreKeywordMatch(text: string, query: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1)
  return scoreField(text, terms, 10)
}

// ─── Highlight extraction ─────────────────────────────────────────────────────
function extractHighlights(content: string, query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/)
  const sentences = content.split(/[.!?]+/)
  const highlights: string[] = []

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase()
    if (terms.some(term => lower.includes(term))) {
      const trimmed = sentence.trim()
      if (trimmed.length > 20 && trimmed.length < 250) {
        highlights.push(trimmed + '.')
      }
    }
    if (highlights.length >= 3) break
  }
  return highlights
}

// ─── Related topics ───────────────────────────────────────────────────────────
function extractRelatedTopics(results: SearchResult[]): string[] {
  const counts = new Map<string, number>()
  for (const r of results) {
    const cat = r.article.category
    counts.set(cat, (counts.get(cat) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic)
}

// ─── Suggestions ─────────────────────────────────────────────────────────────
function generateSuggestions(query: string, results: SearchResult[]): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = []
  const trending = [
    'AI regulation', 'climate policy', 'interest rates', 'tech layoffs',
    'electric vehicles', 'quantum computing', 'Ukraine war', 'US election',
  ]
  const lower = query.toLowerCase()
  for (const t of trending) {
    if (t.toLowerCase().includes(lower) || lower.includes(t.split(' ')[0].toLowerCase())) {
      suggestions.push({ query: t, type: 'trending' })
    }
  }
  const topics = extractRelatedTopics(results)
  for (const topic of topics.slice(0, 3)) {
    if (!suggestions.some(s => s.query.toLowerCase() === topic.toLowerCase())) {
      suggestions.push({ query: topic, type: 'related' })
    }
  }
  return suggestions.slice(0, 5)
}

// ─── Main search function ─────────────────────────────────────────────────────
export async function search(query: string): Promise<SearchResponse> {
  const startTime = Date.now()

  if (!query.trim()) {
    return {
      results: [], suggestions: [], relatedTopics: [],
      totalResults: 0, processingTime: 0,
      sourcesFound: 0, sourcesQueried: [], isRealData: true,
    }
  }

  // Fetch from real API
  const response = await fetch(`/api/news?q=${encodeURIComponent(query)}`)
  const data = await response.json()
  const articles: NormalizedNewsItem[] = data.articles || []
  const meta = data.meta || {}

  const expandedTerms = expandQuery(query)
  const expandedQuery = expandedTerms.join(' ')

  const scored: SearchResult[] = []

  for (const article of articles) {
    // Weighted score: title >> description >> content (source/category excluded)
    const { total: directScore, titleScore, descScore } = scoreArticle(article, query)

    // Semantic expansion score (lower weight, only on title+desc)
    const { total: semScore } = scoreArticle(article, expandedQuery)
    const total = directScore + semScore * 0.3

    // Hard filter: article must have at least one match in title OR description.
    // This prevents source names / stray content words from sneaking through.
    if (titleScore === 0 && descScore === 0) continue

    const matchType: 'exact' | 'semantic' | 'related' = titleScore > 0 ? 'exact' : 'semantic'
    const highlights = extractHighlights(article.content || article.description, query)
    scored.push({ article, score: total, matchType, highlights })
  }

  // Sort by score desc, then by recency
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime()
  })

  const top = scored.slice(0, 30)
  const suggestions = generateSuggestions(query, top)
  const relatedTopics = extractRelatedTopics(top)

  return {
    results: top,
    suggestions,
    relatedTopics,
    totalResults: scored.length,
    processingTime: Date.now() - startTime,
    sourcesFound: new Set(articles.map(a => a.source)).size,
    sourcesQueried: meta.sourcesQueried || [],
    isRealData: true,
    optimizedQuery: meta.optimizedQuery,
  }
}

// Quick search for autocomplete
export async function quickSearch(query: string): Promise<string[]> {
  if (query.length < 2) return []
  const resp = await search(query)
  return resp.results.slice(0, 5).map(r => r.article.title)
}
