"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Database, Cpu, FileText, Zap, Globe, Layers, ArrowRight, Sparkles } from "lucide-react"

const STEPS = [
  {
    n: "01",
    icon: Globe,
    title: "Ingest",
    sub: "30+ live sources",
    tags: ["GNews", "Guardian", "RSS", "GDELT", "Google News"],
    color: "gold",
  },
  {
    n: "02",
    icon: Database,
    title: "Deduplicate",
    sub: "One story, one card",
    tags: ["URL fingerprint", "Normalize", "Schema unify"],
    color: "chocolate",
  },
  {
    n: "03",
    icon: Cpu,
    title: "AI Rank",
    sub: "LLM picks the best",
    tags: ["Query optimizer", "Relevance filter", "Intent match"],
    color: "silver",
  },
  {
    n: "04",
    icon: FileText,
    title: "Synthesize",
    sub: "Three outputs",
    tags: ["Digest", "Editorial", "Q & A"],
    color: "gold",
  },
  {
    n: "05",
    icon: Layers,
    title: "Archive",
    sub: "Persistent store",
    tags: ["Auto-save", "PDF export", "Searchable"],
    color: "chocolate",
  },
  {
    n: "06",
    icon: Zap,
    title: "Social pulse",
    sub: "Social Signals",
    tags: ["YouTube", "Instagram", "TikTok"],
    color: "gold",
  },
]

const COLOR: Record<string, { border: string; dot: string; tag: string; shadow: string; icon: string }> = {
  gold:      { border: "border-amber-400/30", dot: "bg-amber-500",    tag: "bg-amber-500/10 text-amber-900 border-amber-500/20",   shadow: "shadow-amber-500/5",   icon: "text-amber-600" },
  chocolate: { border: "border-orange-900/10", dot: "bg-orange-950", tag: "bg-orange-900/5 text-orange-950 border-orange-900/10", shadow: "shadow-orange-900/5", icon: "text-orange-900" },
  silver:    { border: "border-zinc-300",      dot: "bg-zinc-400",     tag: "bg-zinc-100 text-zinc-900 border-zinc-200",           shadow: "shadow-zinc-500/5",    icon: "text-zinc-600" },
}

export function WorkflowSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      ref={ref}
      className="relative py-32 lg:py-40 overflow-hidden bg-[#FAFAFA]"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(217,119,6,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    >
      {/* Texture & Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA] via-white to-[#F5F5F0]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/[0.03] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-900/[0.02] blur-[140px] rounded-full pointer-events-none" />
      
      {/* Decorative Architectural Line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header - Corporate Luxury */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-24 flex flex-col md:flex-row md:items-end md:justify-between gap-8"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-10 h-[1px] bg-amber-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600">The Blueprint</p>
            </div>
            <h2 className="font-serif text-5xl md:text-7xl font-bold text-zinc-950 tracking-tighter leading-[0.9]">
              How intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-800 to-zinc-950">
                gets made.
              </span>
            </h2>
          </div>
          <p className="text-zinc-500 text-sm font-medium max-w-xs md:text-right md:pb-2">
            Structured in **six layers of excellence**. Signal to structured insight in under thirty seconds.
          </p>
        </motion.div>

        {/* Pipeline Process */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const c = COLOR[step.color]

            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`group relative architectural-glass rounded-2xl border ${c.border} overflow-hidden p-8 hover:-translate-y-2 transition-all duration-500 ${c.shadow}`}
              >
                {/* Background Number Flourish */}
                <span className="absolute -top-4 -right-1 font-serif text-[120px] font-bold text-[#3e2723]/[0.03] select-none leading-none pointer-events-none group-hover:text-amber-500/[0.05] transition-colors">
                  {step.n}
                </span>

                <div className="relative">
                  {/* Icon with Gold Frame */}
                  <div className={`inline-flex items-center justify-center p-3.5 rounded-xl bg-white border ${c.border} shadow-sm mb-8 transition-transform duration-500 group-hover:bg-zinc-50`}>
                    <Icon className={`h-6 w-6 ${c.icon}`} />
                  </div>

                  {/* Step Title Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                    <h3 className="font-serif text-2xl font-bold text-zinc-950 tracking-tight">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">
                    {step.sub}
                  </p>

                  <div className="h-px w-full bg-gradient-to-r from-zinc-200 to-transparent mb-6" />

                  {/* Professional Signal Tags */}
                  <div className="flex flex-wrap gap-2">
                    {step.tags.map(tag => (
                      <span key={tag} className={`text-[9px] font-bold px-2.5 py-1 rounded-md border ${c.tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Stats Signature - The Executive Footer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 overflow-hidden rounded-2xl border border-orange-900/10 shadow-xl shadow-orange-900/5"
        >
          <div className="bg-[#3e2723] px-8 py-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-200/10">
            {[
              { n: "30+", label: "Global Handlers", color: "text-amber-400" },
              { n: "<30s", label: "Synthesis Rate", color: "text-white" },
              { n: "Triple", label: "LLM Assurance", color: "text-amber-400" },
              { n: "12", label: "Master Clusters", color: "text-white" },
            ].map(s => (
              <div key={s.label} className="px-6 text-center group">
                <p className={`font-serif text-4xl font-bold ${s.color} mb-2`}>{s.n}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-amber-400 transition-colors">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          {/* Bottom attribution bar */}
          <div className="bg-[#FAFAFA] px-8 py-4 border-t border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-amber-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Virlo System Architecture v2.c</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Operational Excellence Layer</span>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
