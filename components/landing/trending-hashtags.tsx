"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendingTopic {
  tag: string
  platform: 'youtube' | 'instagram' | 'tiktok'
  views: string    // formatted e.g. "5.2B"
  count: number    // number of videos/posts
  trending: boolean
}

interface TrendingResponse {
  topics: TrendingTopic[]
  cacheHit: boolean
  cachedAt: string
  cost: number
  nextRefresh: string
}

function YouTubeLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-label="YouTube">
      <rect width="24" height="24" rx="5" fill="#FF0000" />
      <path d="M19.6 8.2a2 2 0 0 0-1.4-1.4C16.8 6.5 12 6.5 12 6.5s-4.8 0-6.2.3a2 2 0 0 0-1.4 1.4C4.1 9.6 4.1 12 4.1 12s0 2.4.3 3.8a2 2 0 0 0 1.4 1.4c1.4.3 6.2.3 6.2.3s4.8 0 6.2-.3a2 2 0 0 0 1.4-1.4c.3-1.4.3-3.8.3-3.8s0-2.4-.3-3.8z" fill="white" />
      <path d="M10.2 14.5V9.5L14.7 12l-4.5 2.5z" fill="#FF0000" />
    </svg>
  )
}

function InstagramLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-label="Instagram">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FED373" />
          <stop offset="30%" stopColor="#F15245" />
          <stop offset="60%" stopColor="#D92E7F" />
          <stop offset="80%" stopColor="#9B36B7" />
          <stop offset="100%" stopColor="#515ECF" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
      <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" fill="none" />
      <circle cx="16.2" cy="7.8" r="0.8" fill="white" />
    </svg>
  )
}

function TikTokLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-label="TikTok">
      <rect width="24" height="24" rx="5" fill="#010101" />
      <path
        d="M16.5 5.5c.3 1.8 1.4 2.8 3 3v2c-1 .1-2-.2-3-.8v5.3c0 2.6-2 4.5-4.5 4.5A4.5 4.5 0 0 1 7.5 15c0-2.6 2-4.5 4.5-4.5.3 0 .5 0 .8.1v2.1c-.2-.1-.5-.1-.8-.1a2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 2.5-2.5V5.5h2z"
        fill="white"
      />
      <path
        d="M15.8 5.5c.3 1.8 1.4 2.8 3 3v2c-1 .1-2-.2-3-.8"
        fill="#69C9D0"
      />
      <path
        d="M12 12.6c.3 0 .5 0 .8.1v-2.1c-.3 0-.5-.1-.8-.1-2.5 0-4.5 2-4.5 4.5a4.5 4.5 0 0 0 4.5 4.5c2.5 0 4.5-2 4.5-4.5v-5.3c1 .6 2 .9 3 .8V7.5"
        fill="#EE1D52"
        opacity="0.6"
      />
    </svg>
  )
}

function PlatformBadge({ platform }: { platform: TrendingTopic['platform'] }) {
  return (
    <div className="flex items-center">
      {platform === 'youtube'   && <YouTubeLogo />}
      {platform === 'instagram' && <InstagramLogo />}
      {platform === 'tiktok'   && <TikTokLogo />}
    </div>
  )
}

export function TrendingHashtags() {
  const [data, setData] = useState<TrendingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // No user key needed — backend VIRLO_API_KEY handles this
  const fetchTrends = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/trending")
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? "Failed to load trends")
        return
      }
      setData(await res.json())
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => { fetchTrends() }, [fetchTrends])

  return (
    <section id="trending" className="relative py-24 bg-black border-t border-white/5 overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Social Pulse</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
              Trending Now
            </h2>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Real-time trends across YouTube · Instagram · TikTok
            </p>
          </div>

          {data && (
            <div className="hidden md:flex flex-col items-end gap-1.5">
              <span className="text-[9px] font-mono text-zinc-600">
                Updated {new Date(data.cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[9px] font-mono text-zinc-700">
                {data.cacheHit ? 'Cached · 24h · $0.00' : `Live · $${data.cost.toFixed(2)} · 3 platforms`}
              </span>
            </div>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && !data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass rounded-sm p-5 animate-pulse border-white/5">
                <div className="h-3 bg-white/5 rounded w-2/3 mb-3" />
                <div className="h-5 bg-white/5 rounded w-full mb-3" />
                <div className="h-2 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="glass rounded-sm p-8 text-center border-red-500/10">
            <p className="text-sm text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Topics grid */}
        {data?.topics && (
          <AnimatePresence mode="wait">
            <motion.div
              key={data.cachedAt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {data.topics.map((topic, i) => (
                <motion.div
                  key={`${topic.platform}-${topic.tag}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "glass rounded-sm p-5 border transition-all duration-300 hover:-translate-y-1 cursor-default group",
                    topic.trending
                      ? "border-primary/10 hover:border-primary/30"
                      : "border-white/5 hover:border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <PlatformBadge platform={topic.platform} />
                    {topic.trending && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <p className={cn(
                    "font-serif text-lg font-bold tracking-tight mb-2 truncate group-hover:text-primary transition-colors",
                    topic.trending ? "text-white" : "text-zinc-300"
                  )}>
                    {topic.tag}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-500">{topic.views} views</span>
                    <span className="text-[9px] text-zinc-700 font-mono">{topic.count.toLocaleString()} videos</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {data && (
          <div className="mt-8 flex items-center gap-3 text-[9px] font-mono text-zinc-700">
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>Last updated {new Date(data.cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>Cached for 24h · Derived from Virlo API key</span>
          </div>
        )}
      </div>
    </section>
  )
}
