"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24 border-t border-white/10 bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-12 p-12 bg-white/[0.02] border border-white/10 rounded-2xl relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-4">
              Get Started
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-white leading-tight max-w-lg">
              News from sources you recognise, found faster.
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <Link
              href="/news"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-sm font-semibold rounded-sm hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              Open News Feed
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/10 text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition-all"
            >
              Search a topic
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
