"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { FileText, ExternalLink, Clock, Cpu, Loader2 } from "lucide-react"
import type { ArchiveReport } from "@/lib/reports-db"
import { printReport } from "@/lib/print-report"

const PROVIDER_COLOR: Record<string, string> = {
  groq:       "text-violet-400 border-violet-500/20 bg-violet-500/5",
  openrouter: "text-blue-400 border-blue-500/20 bg-blue-500/5",
  gemini:     "text-sky-400 border-sky-500/20 bg-sky-500/5",
  anthropic:  "text-amber-400 border-amber-500/20 bg-amber-500/5",
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
  const providerClass = report.provider ? PROVIDER_COLOR[report.provider] ?? "text-zinc-400 border-zinc-500/20 bg-zinc-500/5" : "text-zinc-500 border-zinc-700 bg-transparent"

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: i * 0.06 }}
      className="group relative bg-zinc-950 border border-zinc-800/60 rounded-sm overflow-hidden hover:border-zinc-600/80 transition-all duration-500 hover:-translate-y-1"
    >
      {/* Top accent bar */}
      <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-primary via-primary/40 to-transparent transition-all duration-700" />

      <div className="p-7">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {report.topic && (
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 px-2.5 py-1 border border-zinc-700/60 rounded-full">
              {report.topic}
            </span>
          )}
          {report.provider && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border rounded-full ${providerClass}`}>
              {report.provider}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
            <Clock className="h-3 w-3" />
            {date}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg font-bold text-white leading-tight tracking-tight mb-4 group-hover:text-zinc-100 transition-colors line-clamp-2">
          {report.title}
        </h3>

        {/* Digest preview */}
        {report.digest && (
          <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed font-medium mb-6">
            {report.digest.replace(/#{1,6}\s/g, "").slice(0, 200)}…
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-700">
            <Cpu className="h-3 w-3" />
            <span className="truncate max-w-[160px]">{report.model ?? "—"}</span>
          </div>
          <button
            type="button"
            onClick={handleViewPdf}
            disabled={printing}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors group/btn disabled:opacity-50"
          >
            {printing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <FileText className="h-3.5 w-3.5" />
            }
            {printing ? 'Loading…' : 'View PDF'}
            {!printing && <ExternalLink className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />}
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
    // Small delay so the button feels responsive
    setTimeout(() => {
      setVisible(v => v + PAGE_SIZE)
      setLoadingMore(false)
    }, 300)
  }

  const shown = reports.slice(0, visible)
  const hasMore = visible < reports.length

  return (
    <section className="archive-parallax relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-black/88 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/40 via-transparent to-amber-950/10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* Header */}
        <div ref={headerRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400/70 mb-4">Archive</p>
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-white tracking-tighter leading-[0.95]">
                Intelligence <br />on record.
              </h2>
              <p className="text-zinc-500 text-base font-medium mt-5 max-w-md leading-relaxed">
                Every report generated through AI-Vantage is preserved. Browse past intelligence, revisit analysis, and export any report as a formatted PDF.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="font-serif text-5xl font-bold text-white">{reports.length}</p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mt-1">Reports Archived</p>
            </div>
          </motion.div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-950 border border-zinc-800/60 rounded-sm p-7 animate-pulse">
                <div className="h-2 bg-zinc-800 rounded w-1/4 mb-5" />
                <div className="h-5 bg-zinc-800 rounded mb-3" />
                <div className="h-4 bg-zinc-800 rounded w-5/6 mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <FileText className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-bold uppercase tracking-widest">No reports yet.</p>
            <p className="text-xs mt-2">Generate one from the Search page.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shown.map((r, i) => (
                <ReportCard key={r.id} report={r} i={i % PAGE_SIZE} />
              ))}
            </div>

            {/* Load more / pagination row */}
            <div className="mt-12 flex flex-col items-center gap-4">
              {hasMore && (
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-3 px-10 py-3.5 border border-zinc-700/60 text-zinc-400 hover:text-white hover:border-zinc-500 text-[10px] font-black uppercase tracking-[0.25em] rounded-sm transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {loadingMore
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : null
                  }
                  {loadingMore ? 'Loading…' : `Load More  ·  ${reports.length - visible} remaining`}
                </button>
              )}
              <p className="text-[9px] font-mono text-zinc-700">
                Showing {shown.length} of {reports.length} reports
              </p>
            </div>
          </>
        )}

      </div>
    </section>
  )
}
