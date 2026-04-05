"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Database, Cpu, FileText, Zap, Globe, Layers, ArrowRight } from "lucide-react"

const STEPS = [
  {
    n: "01",
    icon: Globe,
    title: "Ingest",
    sub: "30+ live sources",
    tags: ["GNews", "Guardian", "RSS", "GDELT", "Google News"],
    color: "sky",
  },
  {
    n: "02",
    icon: Database,
    title: "Deduplicate",
    sub: "One story, one card",
    tags: ["URL fingerprint", "Normalize", "Schema unify"],
    color: "violet",
  },
  {
    n: "03",
    icon: Cpu,
    title: "AI Rank",
    sub: "LLM picks the 12 best",
    tags: ["Query optimizer", "Relevance filter", "Intent match"],
    color: "emerald",
  },
  {
    n: "04",
    icon: FileText,
    title: "Synthesize",
    sub: "Three parallel outputs",
    tags: ["Digest", "Editorial", "Q & A"],
    color: "amber",
  },
  {
    n: "05",
    icon: Layers,
    title: "Archive",
    sub: "Persistent SQLite store",
    tags: ["Auto-save", "PDF export", "Searchable"],
    color: "rose",
  },
  {
    n: "06",
    icon: Zap,
    title: "Social pulse",
    sub: "Cross-platform signals",
    tags: ["YouTube", "Instagram", "TikTok"],
    color: "cyan",
  },
]

const COLOR: Record<string, { border: string; dot: string; tag: string; glow: string }> = {
  sky:     { border: "border-sky-500/20",     dot: "bg-sky-400",     tag: "bg-sky-500/10 text-sky-400 border-sky-500/20",     glow: "from-sky-500/10" },
  violet:  { border: "border-violet-500/20",  dot: "bg-violet-400",  tag: "bg-violet-500/10 text-violet-400 border-violet-500/20", glow: "from-violet-500/10" },
  emerald: { border: "border-emerald-500/20", dot: "bg-emerald-400", tag: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", glow: "from-emerald-500/10" },
  amber:   { border: "border-amber-500/20",   dot: "bg-amber-400",   tag: "bg-amber-500/10 text-amber-400 border-amber-500/20",   glow: "from-amber-500/10" },
  rose:    { border: "border-rose-500/20",     dot: "bg-rose-400",    tag: "bg-rose-500/10 text-rose-400 border-rose-500/20",     glow: "from-rose-500/10" },
  cyan:    { border: "border-cyan-500/20",     dot: "bg-cyan-400",    tag: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",     glow: "from-cyan-500/10" },
}

export function WorkflowSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative py-32 overflow-hidden"
      style={{
        backgroundColor: "#000",
        backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.08) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[700px] bg-primary/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Architecture</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white tracking-tighter leading-[0.95]">
            How intelligence gets made.
          </h2>
          <p className="text-zinc-600 text-sm font-medium mt-4">
            Six layers · raw signal → structured insight · under 30 seconds
          </p>
        </motion.div>

        {/* Pipeline — horizontal on lg, vertical on mobile */}
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-3 lg:gap-0">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const c = COLOR[step.color]
            const isLast = i === STEPS.length - 1

            return (
              <div key={step.n} className="flex lg:flex-col lg:flex-1 items-center lg:items-stretch">

                {/* Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className={`group relative flex-1 rounded-sm border ${c.border} bg-black/70 backdrop-blur-sm overflow-hidden hover:-translate-y-1 transition-transform duration-400 p-6`}
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${c.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative">
                    {/* Step number */}
                    <span className="font-serif text-4xl font-bold text-white/[0.04] select-none leading-none block mb-4">
                      {step.n}
                    </span>

                    {/* Icon */}
                    <div className={`inline-flex p-2 rounded-sm bg-white/5 border ${c.border} mb-4 group-hover:bg-white/8 transition-colors`}>
                      <Icon className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>

                    {/* Title + sub */}
                    <h3 className="font-serif text-base font-bold text-white tracking-tight leading-tight mb-1">
                      {step.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">{step.sub}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {step.tags.map(tag => (
                        <span key={tag} className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${c.tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Arrow connector (between cards) */}
                {!isLast && (
                  <div className="flex-shrink-0 flex items-center justify-center lg:rotate-0 rotate-90 mx-2 lg:mx-0 lg:my-0 lg:w-5">
                    <ArrowRight className="h-3 w-3 text-zinc-800" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-sm overflow-hidden"
        >
          {[
            { n: "30+", label: "Live Sources" },
            { n: "<30s", label: "Report Time" },
            { n: "3×",  label: "Parallel AI" },
            { n: "12",  label: "Best Articles" },
          ].map(s => (
            <div key={s.label} className="bg-black/80 px-6 py-5 text-center group hover:bg-primary/5 transition-colors">
              <p className="font-serif text-2xl font-bold text-white mb-0.5">{s.n}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 group-hover:text-zinc-400 transition-colors">{s.label}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
