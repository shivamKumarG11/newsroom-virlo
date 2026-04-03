// Virlo API Integration
// Documentation: https://docs.virlo.com

const VIRLO_BASE_URL = 'https://api.usevirlo.com/v1'

export interface VirloTrend {
  id: string
  title: string
  description: string
  category: string
  score: number
  growth: number
  volume: number
  sentiment: 'positive' | 'negative' | 'neutral'
  relatedTopics: string[]
  timestamp: string
}

export interface VirloCreator {
  id: string
  username: string
  displayName: string
  platform: string
  followers: number
  engagement: number
  growthRate: number
  topContent: string[]
  categories: string[]
}

export interface VirloContent {
  id: string
  title: string
  url: string
  platform: string
  views: number
  likes: number
  shares: number
  comments: number
  publishedAt: string
  creator: {
    username: string
    displayName: string
  }
}

export interface VirloSearchParams {
  query?: string
  category?: string
  platform?: string
  timeframe?: '24h' | '7d' | '30d' | '90d'
  limit?: number
}

// Get API key from localStorage
export function getVirloApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('virlo_api_key')
}

// Set API key to localStorage
export function setVirloApiKey(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('virlo_api_key', key)
}

// Remove API key from localStorage
export function removeVirloApiKey(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('virlo_api_key')
}

// Check if API key is valid
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(`${VIRLO_BASE_URL}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })
    return response.ok
  } catch {
    return false
  }
}

// ORBIT - Trend & Topic Discovery
export async function searchTrends(params: VirloSearchParams = {}): Promise<VirloTrend[]> {
  const apiKey = getVirloApiKey()
  if (!apiKey) throw new Error('Virlo API key not configured')

  const searchParams = new URLSearchParams()
  if (params.query) searchParams.set('query', params.query)
  if (params.category) searchParams.set('category', params.category)
  if (params.platform) searchParams.set('platform', params.platform)
  if (params.timeframe) searchParams.set('timeframe', params.timeframe)
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const response = await fetch(`${VIRLO_BASE_URL}/orbit/trends?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Virlo API error: ${response.statusText}`)
  }

  return response.json()
}

// COMET - Monitoring & Tracking
export async function monitorTopics(topics: string[]): Promise<{
  trends: VirloTrend[]
  alerts: { topic: string; change: number; message: string }[]
}> {
  const apiKey = getVirloApiKey()
  if (!apiKey) throw new Error('Virlo API key not configured')

  const response = await fetch(`${VIRLO_BASE_URL}/comet/monitor`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topics }),
  })

  if (!response.ok) {
    throw new Error(`Virlo API error: ${response.statusText}`)
  }

  return response.json()
}

// Get trending content
export async function getTrendingContent(params: VirloSearchParams = {}): Promise<VirloContent[]> {
  const apiKey = getVirloApiKey()
  if (!apiKey) throw new Error('Virlo API key not configured')

  const searchParams = new URLSearchParams()
  if (params.category) searchParams.set('category', params.category)
  if (params.platform) searchParams.set('platform', params.platform)
  if (params.timeframe) searchParams.set('timeframe', params.timeframe)
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const response = await fetch(`${VIRLO_BASE_URL}/comet/content?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Virlo API error: ${response.statusText}`)
  }

  return response.json()
}

// SATELLITE - Creator Deep-Dives
export async function getCreatorInsights(username: string, platform: string): Promise<VirloCreator> {
  const apiKey = getVirloApiKey()
  if (!apiKey) throw new Error('Virlo API key not configured')

  const response = await fetch(`${VIRLO_BASE_URL}/satellite/creator/${platform}/${username}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Virlo API error: ${response.statusText}`)
  }

  return response.json()
}

// Get rising creators
export async function getRisingCreators(params: VirloSearchParams = {}): Promise<VirloCreator[]> {
  const apiKey = getVirloApiKey()
  if (!apiKey) throw new Error('Virlo API key not configured')

  const searchParams = new URLSearchParams()
  if (params.category) searchParams.set('category', params.category)
  if (params.platform) searchParams.set('platform', params.platform)
  if (params.timeframe) searchParams.set('timeframe', params.timeframe)
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const response = await fetch(`${VIRLO_BASE_URL}/satellite/rising?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Virlo API error: ${response.statusText}`)
  }

  return response.json()
}

// Get sentiment analysis for a topic
export async function getSentimentAnalysis(topic: string): Promise<{
  overall: 'positive' | 'negative' | 'neutral'
  score: number
  breakdown: { positive: number; negative: number; neutral: number }
  timeline: { date: string; sentiment: number }[]
}> {
  const apiKey = getVirloApiKey()
  if (!apiKey) throw new Error('Virlo API key not configured')

  const response = await fetch(`${VIRLO_BASE_URL}/analysis/sentiment?topic=${encodeURIComponent(topic)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Virlo API error: ${response.statusText}`)
  }

  return response.json()
}
