"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, delay },
})

const FEATURES = [
  {
    title: "Search and generate AI reports",
    body: "Search across 30+ newsrooms at once. Select any articles and generate a structured intelligence report — summary, key findings, and perspectives.",
    href: "/search",
    cta: "Try a search",
  },
  {
    title: "See what's actually trending",
    body: "Topic clusters built from live article volume. Real journalist coverage, not social virality — grouped and ranked as stories break.",
    href: "/trends",
    cta: "View trends",
  },
  {
    title: "AI deep dives on any topic",
    body: "Six major story areas, each synthesised from live sources into a long-form analysis. Ask follow-up questions on any story.",
    href: "/deep-dives",
    cta: "Read deep dives",
  },
]

const SOURCES_BY_TYPE = [
  { label: "Global Wires", sources: ["Reuters", "AP News", "AFP"] },
  { label: "Broadsheets", sources: ["The Guardian", "NY Times", "BBC", "DW", "France 24", "Al Jazeera"] },
  { label: "Tech", sources: ["TechCrunch", "Wired", "Ars Technica", "The Verge", "MIT Tech Review", "Engadget"] },
  { label: "Finance", sources: ["Reuters Finance", "CNBC", "BBC Business"] },
  { label: "Science", sources: ["New Scientist", "Phys.org", "NASA", "Space.com"] },
  { label: "Politics", sources: ["Politico", "NPR", "The Hill"] },
]

export function VirloFeatures() {
  return (
    <section className="py-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-px bg-white/5 mb-24 overflow-hidden rounded-xl border border-white/10">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fade(i * 0.07)}
              className="bg-zinc-950 p-10 flex flex-col group hover:bg-white/[0.02] transition-colors"
            >
              <h3 className="font-serif text-2xl font-medium text-white mb-4 leading-snug">
                {f.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed flex-1 mb-8">
                {f.body}
              </p>
              <Link
                href={f.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-400 transition-colors"
              >
                {f.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Source directory */}
        <motion.div {...fade(0)}>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.2em] mb-12">
            Sources covered
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {SOURCES_BY_TYPE.map((group, i) => (
              <motion.div key={group.label} {...fade(i * 0.05)}>
                <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-5 pb-2 border-b border-white/5">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-3">
                  {group.sources.map(s => (
                    <span
                      key={s}
                      className="text-xs text-zinc-500 hover:text-white transition-colors cursor-default"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
