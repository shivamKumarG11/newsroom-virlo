/**
 * Image Service - Fetch images from Unsplash and Pexels with caching
 */

export interface ImageResult {
  url: string
  alt: string
  photographer?: string
  source: 'unsplash' | 'pexels' | 'placeholder'
}

/**
 * Get a curated set of high-quality images for a query
 */
export async function fetchImages(query: string, count: number = 6): Promise<ImageResult[]> {
  const results: ImageResult[] = []

  try {
    // Try Unsplash first
    const unsplashImages = await fetchUnsplashImages(query, Math.ceil(count / 2))
    results.push(...unsplashImages)

    // If we need more, try Pexels
    if (results.length < count) {
      const remaining = count - results.length
      const pexelsImages = await fetchPexelsImages(query, remaining)
      results.push(...pexelsImages)
    }
  } catch (error) {
    console.log('[v0] Image fetch failed, using placeholders:', error)
  }

  // Fill remaining slots with high-quality placeholders
  while (results.length < count) {
    results.push(getPlaceholderImage(query))
  }

  return results.slice(0, count)
}

/**
 * Fetch images from Unsplash API
 */
async function fetchUnsplashImages(query: string, count: number): Promise<ImageResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY

  if (!apiKey) {
    console.log('[v0] Unsplash API key not configured')
    return []
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&order_by=relevant`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      console.log('[v0] Unsplash API error:', response.status)
      return []
    }

    const data: any = await response.json()

    return (data.results || []).map((photo: any) => ({
      url: photo.urls.regular,
      alt: photo.alt_description || query,
      photographer: photo.user?.name,
      source: 'unsplash' as const
    }))
  } catch (error) {
    console.log('[v0] Unsplash fetch error:', error)
    return []
  }
}

/**
 * Fetch images from Pexels API
 */
async function fetchPexelsImages(query: string, count: number): Promise<ImageResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_PEXELS_API_KEY

  if (!apiKey) {
    console.log('[v0] Pexels API key not configured')
    return []
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: {
          'Authorization': apiKey,
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      console.log('[v0] Pexels API error:', response.status)
      return []
    }

    const data: any = await response.json()

    return (data.photos || []).map((photo: any) => ({
      url: photo.src.large,
      alt: `Photo by ${photo.photographer}`,
      photographer: photo.photographer,
      source: 'pexels' as const
    }))
  } catch (error) {
    console.log('[v0] Pexels fetch error:', error)
    return []
  }
}

/**
 * Get a high-quality placeholder image URL
 */
function getPlaceholderImage(query: string): ImageResult {
  const placeholderQueries = [
    'business', 'technology', 'research', 'analysis', 'data',
    'innovation', 'intelligence', 'news', 'media', 'digital'
  ]

  const safeQuery = query.split(' ')[0].toLowerCase()
  const useQuery = placeholderQueries.includes(safeQuery) ? safeQuery : placeholderQueries[Math.floor(Math.random() * placeholderQueries.length)]

  return {
    url: `https://images.unsplash.com/photo-${getPlaceholderCode(useQuery)}?w=800&h=600&fit=crop&q=80`,
    alt: `Placeholder image for ${query}`,
    source: 'placeholder'
  }
}

/**
 * Generate consistent placeholder codes based on query
 */
function getPlaceholderCode(query: string): string {
  const codes: { [key: string]: string } = {
    'business': '1552664730-d1c648146fde?w=800&h=600&fit=crop',
    'technology': '1519389950473-7cbf60dbee16?w=800&h=600&fit=crop',
    'research': '1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
    'analysis': '1516321284253-361b2cccb589?w=800&h=600&fit=crop',
    'data': '1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    'innovation': '1526374965328-7f5438f7612f?w=800&h=600&fit=crop',
    'intelligence': '1531746790731-6c087266d339?w=800&h=600&fit=crop',
    'news': '1479237990235-9a9dcb16e29c?w=800&h=600&fit=crop',
    'media': '1557821552-17a57fbb8cc3?w=800&h=600&fit=crop',
    'digital': '1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
  }

  return codes[query] || codes['intelligence']
}

/**
 * Get a single image for hero/featured sections
 */
export async function fetchHeroImage(topic: string): Promise<ImageResult> {
  const images = await fetchImages(topic, 1)
  return images[0] || {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop&q=80',
    alt: `Hero image for ${topic}`,
    source: 'placeholder'
  }
}

/**
 * Get trending/recent images
 */
export async function fetchTrendingImages(count: number = 12): Promise<ImageResult[]> {
  const queries = ['trending', 'recent', 'breaking', 'headlines', 'newsworthy', 'current events']
  const selectedQuery = queries[Math.floor(Math.random() * queries.length)]

  return fetchImages(selectedQuery, count)
}
