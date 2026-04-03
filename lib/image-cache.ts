/**
 * Client-side image cache to avoid duplicate API calls
 */

interface CachedImages {
  timestamp: number
  images: any[]
}

// In-memory cache
const imageCache = new Map<string, CachedImages>()
const CACHE_TTL = 3600000 // 1 hour in milliseconds

/**
 * Get cached images or null if expired/missing
 */
export function getCachedImages(key: string): any[] | null {
  const cached = imageCache.get(key)

  if (!cached) {
    return null
  }

  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    imageCache.delete(key)
    return null
  }

  return cached.images
}

/**
 * Store images in cache
 */
export function cacheImages(key: string, images: any[]): void {
  imageCache.set(key, {
    timestamp: Date.now(),
    images
  })
}

/**
 * Clear cache for a specific key
 */
export function clearCache(key?: string): void {
  if (key) {
    imageCache.delete(key)
  } else {
    imageCache.clear()
  }
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: imageCache.size,
    keys: Array.from(imageCache.keys())
  }
}
