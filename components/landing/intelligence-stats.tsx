"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getArticleCount } from "@/lib/db"

export function IntelligenceStats() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function load() {
      const c = await getArticleCount()
      setCount(c)
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-y border-white/10 py-12 bg-white/[0.01]">
      <div className="text-center md:border-r border-white/10 last:border-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Live Articles</p>
        <p className="font-mono text-3xl font-bold text-white tabular-nums tracking-tighter">
          {count.toLocaleString()}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-500/80 uppercase">Streaming</span>
        </div>
      </div>

      <div className="text-center md:border-r border-white/10 last:border-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Sources</p>
        <p className="font-mono text-3xl font-bold text-white tracking-tighter">52</p>
        <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase">Verified Newswires</p>
      </div>

      <div className="text-center md:border-r border-white/10 last:border-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Ingestion Rate</p>
        <p className="font-mono text-3xl font-bold text-white tracking-tighter">8.4<span className="text-lg text-zinc-500 ml-1">avg</span></p>
        <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase">Articles / Min</p>
      </div>

      <div className="text-center md:border-r border-white/10 last:border-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Quality Score</p>
        <p className="font-mono text-3xl font-bold text-emerald-400 tracking-tighter">98.2<span className="text-lg opacity-50 ml-1">%</span></p>
        <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase">System Confidence</p>
      </div>
    </div>
  )
}
