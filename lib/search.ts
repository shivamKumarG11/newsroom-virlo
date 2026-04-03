// Advanced Search System
// Combines keyword search with semantic understanding

import { NormalizedArticle, getCachedNews } from './news-api'
import { articles as mockArticles } from './mock-data'

export interface SearchResult {
  article: NormalizedArticle | typeof mockArticles[0]
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
}

// Keyword matching with scoring
function scoreKeywordMatch(text: string, query: string): number {
  const normalizedText = text.toLowerCase()
  const terms = query.toLowerCase().split(/\s+/)
  
  let score = 0
  let exactMatches = 0
  let partialMatches = 0
  
  for (const term of terms) {
    if (normalizedText.includes(term)) {
      // Check for exact word match vs partial
      const regex = new RegExp(`\\b${term}\\b`, 'i')
      if (regex.test(normalizedText)) {
        exactMatches++
        score += 10
      } else {
        partialMatches++
        score += 5
      }
    }
  }
  
  // Bonus for multiple term matches
  if (exactMatches > 1) score *= 1.5
  
  // Bonus for all terms matching
  if (exactMatches === terms.length) score *= 2
  
  return score
}

// Semantic similarity using keyword expansion
const SEMANTIC_EXPANSIONS: Record<string, string[]> = {
  'ai': ['artificial intelligence', 'machine learning', 'neural network', 'deep learning', 'gpt', 'llm'],
  'crypto': ['bitcoin', 'ethereum', 'blockchain', 'cryptocurrency', 'web3'],
  'climate': ['global warming', 'carbon', 'renewable', 'sustainability', 'emissions'],
  'tech': ['technology', 'software', 'digital', 'innovation', 'startup'],
  'finance': ['banking', 'investment', 'stocks', 'markets', 'economy'],
  'health': ['medical', 'healthcare', 'vaccine', 'treatment', 'disease'],
  'ev': ['electric vehicle', 'battery', 'tesla', 'charging', 'automotive'],
  'space': ['nasa', 'spacex', 'rocket', 'satellite', 'orbit', 'mars'],
}

function expandQuery(query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/)
  const expanded = new Set(terms)
  
  for (const term of terms) {
    if (SEMANTIC_EXPANSIONS[term]) {
      SEMANTIC_EXPANSIONS[term].forEach(t => expanded.add(t))
    }
    // Also check if term is in any expansion
    for (const [key, expansions] of Object.entries(SEMANTIC_EXPANSIONS)) {
      if (expansions.includes(term)) {
        expanded.add(key)
        expansions.forEach(t => expanded.add(t))
      }
    }
  }
  
  return Array.from(expanded)
}

// Extract highlights from content
function extractHighlights(content: string, query: string): string[] {
  const terms = query.toLowerCase().split(/\s+/)
  const sentences = content.split(/[.!?]+/)
  const highlights: string[] = []
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase()
    if (terms.some(term => lowerSentence.includes(term))) {
      const trimmed = sentence.trim()
      if (trimmed.length > 20 && trimmed.length < 200) {
        highlights.push(trimmed + '.')
      }
    }
    if (highlights.length >= 3) break
  }
  
  return highlights
}

// Generate related topics from results
function extractRelatedTopics(results: SearchResult[]): string[] {
  const topicCounts = new Map<string, number>()
  
  for (const result of results) {
    const article = result.article
    if ('tags' in article && article.tags) {
      for (const tag of article.tags) {
        topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1)
      }
    }
    if ('category' in article && article.category) {
      topicCounts.set(article.category, (topicCounts.get(article.category) || 0) + 1)
    }
  }
  
  return Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic)
}

// Generate search suggestions
function generateSuggestions(query: string, results: SearchResult[]): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = []
  
  // Trending suggestions
  const trendingSuggestions = [
    'AI regulation',
    'climate policy',
    'interest rates',
    'tech layoffs',
    'electric vehicles',
    'quantum computing'
  ]
  
  const queryLower = query.toLowerCase()
  for (const suggestion of trendingSuggestions) {
    if (suggestion.toLowerCase().includes(queryLower) || queryLower.includes(suggestion.split(' ')[0])) {
      suggestions.push({ query: suggestion, type: 'trending' })
    }
  }
  
  // Related suggestions based on results
  const relatedTopics = extractRelatedTopics(results)
  for (const topic of relatedTopics.slice(0, 3)) {
    if (!suggestions.some(s => s.query.toLowerCase() === topic.toLowerCase())) {
      suggestions.push({ query: topic, type: 'related' })
    }
  }
  
  return suggestions.slice(0, 5)
}

// Main search function
export async function search(query: string): Promise<SearchResponse> {
  const startTime = Date.now()
  
  if (!query.trim()) {
    return {
      results: [],
      suggestions: [],
      relatedTopics: [],
      totalResults: 0,
      processingTime: 0
    }
  }
  
  // Get all articles (both live and mock)
  const liveArticles = await getCachedNews()
  const allArticles = [...liveArticles, ...mockArticles]
  
  // Expand query semantically
  const expandedTerms = expandQuery(query)
  const expandedQuery = expandedTerms.join(' ')
  
  // Score all articles
  const scoredResults: SearchResult[] = []
  
  for (const article of allArticles) {
    const searchableText = `${article.title} ${article.content} ${article.tags?.join(' ') || ''} ${'category' in article ? article.category : ''}`
    
    // Keyword score
    const keywordScore = scoreKeywordMatch(searchableText, query)
    
    // Semantic score (using expanded query)
    const semanticScore = scoreKeywordMatch(searchableText, expandedQuery) * 0.5
    
    const totalScore = keywordScore + semanticScore
    
    if (totalScore > 0) {
      const matchType = keywordScore > semanticScore ? 'exact' : 'semantic'
      const highlights = extractHighlights(article.content, query)
      
      scoredResults.push({
        article: article as SearchResult['article'],
        score: totalScore,
        matchType,
        highlights
      })
    }
  }
  
  // Sort by score
  scoredResults.sort((a, b) => b.score - a.score)
  
  // Take top results
  const topResults = scoredResults.slice(0, 20)
  
  // Generate suggestions and related topics
  const suggestions = generateSuggestions(query, topResults)
  const relatedTopics = extractRelatedTopics(topResults)
  
  const processingTime = Date.now() - startTime
  
  return {
    results: topResults,
    suggestions,
    relatedTopics,
    totalResults: scoredResults.length,
    processingTime
  }
}

// Quick search for autocomplete
export async function quickSearch(query: string): Promise<string[]> {
  if (query.length < 2) return []
  
  const response = await search(query)
  return response.results.slice(0, 5).map(r => r.article.title)
}
