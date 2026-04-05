"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { FileText, ExternalLink, Clock, Cpu, Loader2, Bookmark } from "lucide-react"
import type { ArchiveReport } from "@/lib/reports-db"
import { printReport } from "@/lib/print-report"

const PROVIDER_COLOR: Record<string, string> = {
  groq:       "text-amber-400 border-amber-500/30 bg-amber-500/5",
  openrouter: "text-zinc-400 border-zinc-500/30 bg-zinc-500/5",
  gemini:     "text-amber-500 border-amber-600/30 bg-amber-600/5",
  anthropic:  "text-orange-400 border-orange-500/30 bg-orange-500/5",
}

function ReportCard({ report, i }: { report: ArchiveReport; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const [printing, setPrinting] = useState(false)

  async function handleViewPdf() {
    setPrinting(true)
    try {
      const res = await fetch(`/api/report/archive?id=${report.id}`)
      const data = await res.json()
      const r: ArchiveReport = data.report ?? report
      await printReport({
        topic: r.title,
        digest: r.digest ?? '',
        editorial: r.editorial ?? '',
        qa: r.qa ?? [],
        model: r.model ?? '',
        sources: r.sources ?? [],
        generatedAt: r.created_at,
      })
    } catch {
      await printReport({
        topic: report.title,
        digest: report.digest ?? '',
        editorial: report.editorial ?? '',
        qa: report.qa ?? [],
        model: report.model ?? '',
        sources: report.sources ?? [],
        generatedAt: report.created_at,
      })
    } finally {
      setPrinting(false)
    }
  }

  const date = new Date(report.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
  const providerClass = report.provider ? PROVIDER_COLOR[report.provider] ?? "text-amber-400 border-amber-500/30 bg-amber-500/5" : "text-zinc-500 border-zinc-700 bg-transparent"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: i * 0.06 }}
      className="group relative bg-[#3e2723] border border-amber-500/30 rounded-none overflow-hidden hover:border-amber-500/60 transition-all duration-500 shadow-xl"
    >
      {/* Decorative Gold Inlay Corner */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
        <div className="absolute top-0 right-0 border-t-2 border-r-2 border-amber-500 w-full h-full" />
      </div>

      <div className="p-8">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {report.topic && (
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-none">
              {report.topic}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
            <Clock className="h-3 w-3 text-amber-500" />
            {date}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-xl font-bold text-white leading-tight tracking-tight mb-6 group-hover:text-amber-100 transition-colors line-clamp-2">
          {report.title}
        </h3>

        {/* Digest preview */}
        {report.digest && (
          <div className="relative mb-8">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent" />
            <p className="pl-4 text-xs text-zinc-400 line-clamp-3 leading-relaxed font-medium">
              {report.digest.replace(/#{1,6}\s/g, "").slice(0, 180)}…
            </p>
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-6 border-t border-amber-500/20">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
            <Cpu className="h-3 w-3 text-amber-600" />
            <span className="truncate max-w-[140px]">{report.model ?? "LLM System"}</span>
          </div>
          <button
            type="button"
            onClick={handleViewPdf}
            disabled={printing}
            className="flex items-center gap-2.5 px-4 py-2 border border-amber-500/30 bg-amber-500/5 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500 hover:text-[#3e2723] transition-all duration-300 disabled:opacity-50"
          >
            {printing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <FileText className="h-3.5 w-3.5" />
            }
            {printing ? 'Reading…' : 'Open Ledger'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const PAGE_SIZE = 12

export function ArchiveSection() {
  const [reports, setReports] = useState<ArchiveReport[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(headerRef, { once: true, margin: "-80px" })

  useEffect(() => {
    fetch("/api/report/archive")
      .then(r => r.json())
      .then(d => setReports(d.reports ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function loadMore() {
    setLoadingMore(true)
    setTimeout(() => {
      setVisible(v => v + PAGE_SIZE)
      setLoadingMore(false)
    }, 400)
  }

  const shown = reports.slice(0, visible)
  const hasMore = visible < reports.length

  return (
    <section className="archive-parallax relative py-40 overflow-hidden bg-zinc-950">
      {/* Heavy Artistic Overlays */}
      <div className="absolute inset-0 bg-[#1a1110]/95" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-orange-900/10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FAFAFA] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header - The Historical Record */}
        <div ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20"
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Bookmark className="h-4 w-4 text-amber-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-500">The Intelligence Ledger</p>
              </div>
              <h2 className="font-serif text-5xl md:text-7xl font-bold text-white tracking-tighter leading-[0.9]">
                Preserved <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-700">on record.</span>
              </h2>
              <p className="text-zinc-500 text-sm font-medium mt-8 max-w-md leading-relaxed">
                A permanent, cryptographically-aware history of all filtered intelligence. Every signal is immortalized in the Virlo archives for secondary analysis.
              </p>
            </div>
            <div className="flex-shrink-0 text-right md:pb-2">
              <p className="font-serif text-8xl font-black text-amber-500/10 leading-none select-none">{reports.length}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-2">Dossiers Compiled</p>
            </div>
          </motion.div>
        </div>

        {/* Grid of Solid Slabs */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#3e2723] border border-amber-500/20 h-80 animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-amber-500/20">
            <FileText className="h-10 w-10 mx-auto mb-6 text-amber-500/20" />
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-600">The Ledger is Empty</p>
            <p className="text-[10px] mt-2 text-zinc-700 uppercase tracking-widest">Awaiting First Field Report</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {shown.map((r, i) => (
                <ReportCard key={r.id} report={r} i={i % PAGE_SIZE} />
              ))}
            </div>

            {/* Load More Signature Footer */}
            <div className="mt-20 flex flex-col items-center gap-6">
              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="group flex flex-col items-center gap-4 py-8 px-20 border border-amber-500/20 hover:border-amber-500/50 transition-all duration-500 bg-amber-500/[0.02]"
                >
                  <div className="h-px w-20 bg-amber-500/40 group-hover:w-32 transition-all duration-700" />
                  <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">
                    {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loadingMore ? 'Deciphering…' : 'Access Further Dossiers'}
                  </span>
                  <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{reports.length - visible} Records Pending</p>
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </section>
  )
}
