"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { IntelligenceStats } from "./intelligence-stats"

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, delay },
})

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Collect",
    body: "Pulls articles in real time from 30+ sources — newswires, broadsheets, and specialist outlets.",
  },
  {
    step: "02",
    title: "Deduplicate",
    body: "Strips out repeated stories and low-signal rewrites. You see the original reporting, not the echo.",
  },
  {
    step: "03",
    title: "Categorise",
    body: "Automatically assigns topic, region, and sentiment so you can filter to what you care about.",
  },
  {
    step: "04",
    title: "Surface",
    body: "Presents articles newest-first with source credibility ratings and direct links to the original publication.",
  },
]

export function IntelligenceEngine() {
  return (
    <section id="intelligence-engine" className="py-32 border-t border-zinc-800/50 bg-[#120f0e]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-20 mb-32 items-end">
          <motion.div {...fade(0)}>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] mb-6">
              Our Methodology
            </p>
            <h2 className="font-serif text-5xl md:text-7xl font-bold text-white leading-[0.9] tracking-tighter">
              Real sources.<br />No noise.
            </h2>
          </motion.div>
          <motion.p {...fade(0.08)} className="text-zinc-600 leading-relaxed md:pb-2 text-xl font-medium max-w-lg">
            aiVintage doesn't generate articles or rewrite them. We surface original reporting, 
            distilled through a high-signal intelligence pipeline.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div 
              key={item.step} 
              {...fade(i * 0.1)}
              className="group relative p-10 bg-[#201d1c] border border-zinc-800 rounded-sm overflow-hidden hover:border-amber-500/30 shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute -top-6 -right-6 text-9xl font-serif font-bold text-white/[0.02] select-none group-hover:text-amber-500/5 transition-colors duration-500">
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-white mb-6 relative z-10 tracking-tight">{item.title}</h3>
              <p className="text-zinc-400 leading-relaxed relative z-10 font-medium">{item.body}</p>
              
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </motion.div>
          ))}
        </div>

        <motion.div {...fade(0.2)}>
          <IntelligenceStats />
        </motion.div>

        <motion.div {...fade(0.26)} className="mt-24 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-amber-500 transition-all group"
          >
            Browse the live feed
            <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
