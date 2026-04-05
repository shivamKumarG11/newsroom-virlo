"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, Terminal, Activity, Share2, Sparkles } from "lucide-react"
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

function YouTubeIcon() {
  return (
    <div className="relative group/icon">
      <svg viewBox="0 0 24 24" className="w-10 h-10 drop-shadow-xl" fill="none" aria-label="YouTube">
        <rect width="24" height="24" rx="6" fill="#FF0000" />
        <path d="M19.6 8.2a2 2 0 0 0-1.4-1.4C16.8 6.5 12 6.5 12 6.5s-4.8 0-6.2.3a2 2 0 0 0-1.4 1.4C4.1 9.6 4.1 12 4.1 12s0 2.4.3 3.8a2 2 0 0 0 1.4 1.4c1.4.3 6.2.3 6.2.3s4.8 0 6.2-.3a2 2 0 0 0 1.4-1.4c.3-1.4.3-3.8.3-3.8s0-2.4-.3-3.8z" fill="white" />
        <path d="M10.2 14.5V9.5L14.7 12l-4.5 2.5z" fill="#FF0000" />
      </svg>
      <div className="absolute -inset-2 rounded-full bg-red-500/10 blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
    </div>
  )
}

function InstagramIcon() {
  return (
    <div className="relative group/icon">
      <svg viewBox="0 0 24 24" className="w-10 h-10 drop-shadow-xl" aria-label="Instagram">
        <defs>
          <linearGradient id="ig-grad-large" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FED373" />
            <stop offset="30%" stopColor="#F15245" />
            <stop offset="60%" stopColor="#D92E7F" />
            <stop offset="80%" stopColor="#9B36B7" />
            <stop offset="100%" stopColor="#515ECF" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="7" fill="url(#ig-grad-large)" />
        <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" stroke="white" strokeWidth="1.2" fill="none" />
        <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.2" fill="none" />
        <circle cx="16.5" cy="7.5" r="0.8" fill="white" />
      </svg>
      <div className="absolute -inset-2 rounded-full bg-pink-500/10 blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
    </div>
  )
}

function TikTokIcon() {
  return (
    <div className="relative group/icon">
      <svg viewBox="0 0 24 24" className="w-10 h-10 drop-shadow-xl" aria-label="TikTok">
        <rect width="24" height="24" rx="6" fill="#2c2826" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <path d="M16.5 5.5c.3 1.8 1.4 2.8 3 3v2c-1 .1-2-.2-3-.8v5.3c0 2.6-2 4.5-4.5 4.5A4.5 4.5 0 0 1 7.5 15c0-2.6 2-4.5 4.5-4.5.3 0 .5 0 .8.1v2.1c-.2-.1-.5-.1-.8-.1a2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 2.5-2.5V5.5h2z" fill="white" />
        <path d="M15.8 5.5c.3 1.8 1.4 2.8 3 3v2c-1 .1-2-.2-3-.8" fill="#69C9D0" />
        <path d="M12 12.6c.3 0 .5 0 .8.1v-2.1c-.3 0-.5-.1-.8-.1-2.5 0-4.5 2-4.5 4.5a4.5 4.5 0 0 0 4.5 4.5c2.5 0 4.5-2 4.5-4.5v-5.3c1 .6 2 .9 3 .8V7.5" fill="#EE1D52" opacity="0.8" />
      </svg>
      <div className="absolute -inset-2 rounded-full bg-cyan-500/10 blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
    </div>
  )
}

function PlatformBadgeLarge({ platform }: { platform: TrendingTopic['platform'] }) {
  return (
    <div className="mb-4">
      {platform === 'youtube' && <YouTubeIcon />}
      {platform === 'instagram' && <InstagramIcon />}
      {platform === 'tiktok' && <TikTokIcon />}
    </div>
  )
}

export function TrendingHashtags() {
  const [data, setData] = useState<TrendingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => { fetchTrends() }, [fetchTrends])

  return (
    <section id="trending" className="relative py-32 lg:py-15 bg-[#120f0e] overflow-hidden">
      {/* Console Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')]" />
      <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-amber-500/[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Command Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-500">Global Pulse Stream</p>
            </div>
            <h2 className="font-serif text-7xl md:text-8xl font-bold text-white tracking-tighter leading-[0.9]">
              Social{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">Signals.</span>
            </h2>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 md:pb-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/5 border border-amber-500/20 rounded-md">
              <Terminal className="h-3 w-3 text-amber-600" />
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">Live Console Feed</span>
            </div>

          </div>
        </div>

        {/* Loading / Error States */}
        {loading && !data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 h-64 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-12 text-center">
            <Share2 className="h-10 w-10 mx-auto mb-4 text-red-500/40" />
            <p className="text-sm text-red-400 font-bold uppercase tracking-widest leading-loose">Pulse Error: {error}</p>
          </div>
        )}

        {/* The Pulse Deck (Grid of Metallic Slabs) */}
        {data?.topics && (
          <AnimatePresence mode="wait">
            <motion.div
              key={data.cachedAt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            >
              {data.topics.map((topic, i) => (
                <motion.div
                  key={`${topic.platform}-${topic.tag}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 60, delay: i * 0.05 }}
                  className={cn(
                    "relative group p-8 rounded-2xl transition-all duration-300 transform-gpu hover:-translate-y-2",
                    "bg-[#201d1c] border-2 shadow-2xl",
                    topic.trending ? "border-amber-500/40" : "border-zinc-800"
                  )}
                >
                  {/* Subtle Metallic Bevel Overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

                  {/* Top Bar with Big Icons */}
                  <div className="flex items-start justify-between mb-8">
                    <PlatformBadgeLarge platform={topic.platform} />
                    {topic.trending && (
                      <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse">
                        <Activity className="h-2.5 w-2.5 text-amber-500" />
                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Rising</span>
                      </div>
                    )}
                  </div>

                  <p className={cn(
                    "font-serif text-2xl font-bold tracking-tight mb-4 group-hover:text-amber-400 transition-colors cursor-default",
                    topic.trending ? "text-white" : "text-zinc-400"
                  )}>
                    #{topic.tag}
                  </p>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Volume</span>
                      <span className="text-[11px] font-bold text-amber-500">{topic.views} views</span>
                    </div>
                    <div className="w-full h-[3px] bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                      />
                    </div>
                    <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.2em] mt-1 text-right">
                      {topic.count.toLocaleString()} Posts Compiled
                    </p>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Sparkles className="h-4 w-4 text-amber-500/20" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Console Integrity Footer */}
        {data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-20 pt-10 border-t border-zinc-800/40 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">Engine Active</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                Divergence Sync Check: {new Date(data.cachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">
              <span>System Throughput</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`w-1 h-3 rounded-none ${i < 3 ? 'bg-amber-600' : 'bg-zinc-800'}`} />
                ))}
              </div>
              <span className="text-zinc-600">650ms Latency</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
