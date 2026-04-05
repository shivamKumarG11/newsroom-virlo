"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import {
  Search, ExternalLink, Loader2, FileText,
  Check, X, ChevronDown, ChevronUp, Sparkles, ArrowLeft, Globe, Printer, Bookmark
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { search, SearchResponse } from "@/lib/search"
import { printReport } from "@/lib/print-report"
import { formatTimeAgo } from "@/lib/news-api"
import { cn } from "@/lib/utils"
import type { NormalizedNewsItem } from "@/app/api/news/route"

const MAX_SELECTION = 5

const EXAMPLES = [
  { label: "Geopolitics", query: "US China trade war 2025" },
  { label: "Technology", query: "AI regulation Europe" },
  { label: "Economy", query: "Federal Reserve interest rates" },
  { label: "Climate", query: "carbon emissions net zero" },
  { label: "Conflict", query: "Middle East ceasefire negotiations" },
  { label: "Markets", query: "crypto bitcoin ETF approval" },
]

// ─── Article card ─────────────────────────────────────────────────────────────

function ArticleCard({
  article, index, selected, disabled, onToggle,
}: {
  article: NormalizedNewsItem
  index: number
  selected: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 60, delay: index * 0.05 }}
      onClick={() => { if (!disabled || selected) onToggle() }}
      className={cn(
        "group relative flex gap-3 p-3 md:p-4 md:gap-4 rounded-none border-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
        selected
          ? "bg-white border-amber-500 shadow-[0_10px_30px_rgba(245,158,11,0.15)] transform -translate-y-0.5"
          : disabled
            ? "bg-[#fdfbf7] border-zinc-200 opacity-40 cursor-not-allowed pointer-events-none"
            : "bg-[#fdfbf7] border-zinc-200 hover:border-amber-400 hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {/* Decorative Gold Corner when selected */}
      {selected && (
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
          <div className="absolute top-0 right-0 border-t-4 border-r-4 border-amber-500 w-full h-full" />
        </div>
      )}

      {/* Checkbox / Indicator */}
      <div className="flex-shrink-0 mt-1">
        <div className={cn(
          "h-6 w-6 rounded-sm border-2 flex items-center justify-center transition-all duration-300 shadow-sm",
          selected ? "bg-amber-500 border-amber-500" : "bg-white border-zinc-300 group-hover:border-amber-400"
        )}>
          {selected && <Check className="h-4 w-4 text-[#120f0e]" strokeWidth={4} />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {article.category && (
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-500 block mb-1.5 bg-amber-500/10 self-start inline-block px-1.5 py-0.5">
                {article.category}
              </span>
            )}
            <p className={cn(
              "font-serif text-sm md:text-base font-bold line-clamp-1 leading-snug mb-1 transition-colors duration-300",
              selected ? "text-zinc-900" : "text-zinc-800 group-hover:text-amber-700"
            )}>
              {article.title}
            </p>
            {article.description && (
              <p className={cn(
                "text-xs line-clamp-1 mb-1.5 leading-normal break-words overflow-hidden",
                selected ? "text-zinc-600" : "text-zinc-500"
              )}>
                {article.description}
              </p>
            )}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#120f0e] bg-zinc-100 px-2 py-1">{article.source}</span>
                <span className="text-zinc-400 text-[10px] font-mono font-medium" suppressHydrationWarning>· {formatTimeAgo(article.publishedAt)}</span>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open source article"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-500 transition-colors"
              >
                <span className="hidden sm:inline">Source</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          {article.imageUrl && (
            <div className={cn(
              "hidden sm:block w-16 h-12 md:w-20 md:h-16 overflow-hidden flex-shrink-0 bg-zinc-100 border border-zinc-200 shadow-sm transition-all",
              selected ? "border-amber-400 shadow-md" : ""
            )}>
              <img
                src={article.imageUrl}
                alt=""
                className={cn("w-full h-full object-cover transition-all duration-700", selected ? "scale-105 opacity-100" : "opacity-90 group-hover:scale-105 group-hover:opacity-100")}
                onError={e => {
                  const img = e.target as HTMLImageElement
                  const parent = img.parentElement
                  if (parent) parent.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Report output ────────────────────────────────────────────────────────────

interface ReportData {
  digest: string
  editorial: string
  qa: { q: string; a: string }[]
  model: string
  imageUrls?: string[]
  sources?: { title: string; source: string; url: string }[]
  topic?: string
}

function ReportOutput({ data, topic, onBack }: { data: ReportData; topic: string; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'editorial' | 'digest' | 'qa' | 'pdf'>('editorial')
  const [openQA, setOpenQA] = useState<number | null>(null)

  const tabs = [
    { id: 'editorial' as const, label: 'Editorial Brief', icon: FileText },
    { id: 'digest' as const, label: 'Executive Digest', icon: Sparkles },
    { id: 'qa' as const, label: 'Interrogation', icon: ChevronDown },
    { id: 'pdf' as const, label: 'Print Ledger', icon: Printer },
  ]

  function handlePrint() {
    printReport({
      topic,
      digest: data.digest,
      editorial: data.editorial,
      qa: data.qa,
      model: data.model,
      imageUrls: data.imageUrls,
      sources: data.sources,
      generatedAt: new Date().toISOString(),
    }).catch(() => { })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-blend-multiply text-[#120f0e] pb-32"
    >
      {/* Massive Dark Meta Header */}
      <div className="bg-[#120f0e] pt-18 md:pt-28 pb-32 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-[#180f0c] to-[#120f0e] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-900/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="mx-auto max-w-5xl px-6 relative z-10">
          {/* Back + Meta Row */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3 px-5 py-2 bg-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Bookmark className="h-3.5 w-3.5 text-[#120f0e]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#120f0e]">Classified Ledger</span>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-3 px-5 py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 hover:bg-white/5 transition-all group backdrop-blur-sm shadow-xl"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Return to Index</span>
            </button>
          </div>

          {/* Topic heading */}
          {topic && (
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[1.05] text-white">
              {topic}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[11px] font-mono text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-sm border border-amber-500/20">
              Logic Engine: {data.model}
            </span>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              Generated {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="mx-auto max-w-5xl px-6 -mt-16 relative z-30">
        {/* Editorial Image Grid Straddling the Header */}
        {(data.imageUrls ?? []).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {(data.imageUrls ?? []).map((url, i) => (
              <div key={i} className="aspect-video bg-zinc-900 border-[6px] border-[#fdfbf7] shadow-xl overflow-hidden group">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105 transform"
                  onError={e => {
                    const img = e.target as HTMLImageElement
                    const parent = img.closest('div') as HTMLElement | null
                    if (parent) parent.style.display = 'none'
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Heavy Corporate Tabs */}
        <div className="flex gap-2 mb-12">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-3 py-5 border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                activeTab === tab.id
                  ? "bg-amber-500 border-amber-500 text-[#120f0e] shadow-lg shadow-amber-500/20"
                  : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm"
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content (Deep Espresso Reading Area) */}
        <AnimatePresence mode="wait">
          {activeTab === 'editorial' && (
            <motion.div key="editorial" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="bg-white border border-zinc-200 border-t-4 border-t-amber-500 p-8 md:p-16 shadow-2xl">
                <div className="prose prose-slate max-w-none
                  prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#120f0e]
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-zinc-200 prose-h2:pb-4
                  prose-p:text-zinc-700 prose-p:leading-[2] prose-p:font-medium prose-p:text-base
                  prose-li:text-zinc-700 prose-li:font-medium prose-li:text-base prose-li:leading-[2]
                  prose-strong:text-[#120f0e] prose-strong:font-bold
                  prose-hr:border-zinc-200">
                  <ReactMarkdown>{data.editorial}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'digest' && (
            <motion.div key="digest" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="bg-[#120f0e] border border-[#120f0e] border-t-4 border-t-amber-500 p-8 md:p-16 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-8 border-b border-amber-500/20 pb-4 inline-block">
                  Executive Brief · {(data.digest ?? '').split(/\s+/).filter(Boolean).length} words
                </p>
                <div className="prose prose-invert max-w-none
                  prose-p:text-zinc-300 prose-p:leading-[2.2] prose-p:text-lg prose-p:font-medium
                  prose-strong:text-white">
                  <ReactMarkdown>{data.digest}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'qa' && (
            <motion.div key="qa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {(() => {
                const qaItems = (data.qa ?? []).filter(item => item?.q && item?.a)
                if (qaItems.length === 0) {
                  return (
                    <div className="bg-white border border-zinc-200 p-12 text-center shadow-sm">
                      <p className="text-sm text-zinc-400 font-medium uppercase tracking-widest">Interrogation failed. No Q&A available.</p>
                    </div>
                  )
                }
                return (
                  <div className="space-y-4">
                    {qaItems.map((item, i) => (
                      <div key={`${i}-${item.q.slice(0, 20)}`} className={cn(
                        "border-l-4 transition-all duration-300",
                        openQA === i ? "border-amber-500 bg-white shadow-xl" : "border-zinc-200 bg-white hover:border-zinc-300 shadow-sm"
                      )}>
                        <button
                          type="button"
                          onClick={() => setOpenQA(openQA === i ? null : i)}
                          className="w-full flex items-center justify-between px-8 py-6 text-left gap-6 outline-none"
                        >
                          <span className="flex items-center gap-6 min-w-0">
                            <span className="font-mono text-[11px] text-amber-500 font-black flex-shrink-0">Q{i + 1}</span>
                            <span className={cn("text-base font-bold leading-snug transition-colors", openQA === i ? "text-[#120f0e]" : "text-zinc-600")}>
                              {item.q}
                            </span>
                          </span>
                          {openQA === i
                            ? <ChevronUp className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            : <ChevronDown className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                          }
                        </button>
                        <AnimatePresence>
                          {openQA === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-8 pb-8 pt-4 ml-[3.25rem] border-t border-zinc-100">
                                <p className="text-base text-zinc-600 leading-relaxed font-medium">
                                  {item.a}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </motion.div>
          )}

          {activeTab === 'pdf' && (
            <motion.div key="pdf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="bg-white border border-zinc-200 p-12 md:p-20 text-center space-y-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-100 blur-[100px] rounded-full" />
                <div className="w-24 h-24 rounded-none border border-zinc-200 bg-zinc-50 flex items-center justify-center mx-auto relative group cursor-pointer hover:border-[#120f0e] transition-colors" onClick={handlePrint}>
                  <div className="absolute -inset-2 border border-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Printer className="h-10 w-10 text-[#120f0e]" />
                </div>
                <div>
                  <h3 className="font-serif text-3xl font-bold text-[#120f0e] mb-4">Print Ledger</h3>
                  <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Generate a high-contrast corporate PDF of this dossier for external communication and saving.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-4 px-12 py-5 bg-[#120f0e] text-white font-black text-sm uppercase tracking-[0.2em] rounded-none hover:bg-black active:scale-95 transition-all shadow-xl"
                >
                  <Printer className="h-5 w-5" />
                  Initialize Print Sequence
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Generation loading screen (The "Report Assembler") ──────────────────────

function GeneratingScreen({ query }: { query: string }) {
  const steps = [
    "Establishing secure intelligence feeds",
    "Fetching global cross-platform context",
    "Running deep sentiment analysis",
    "Building executive editorial",
    "Synthesizing Q&A interrogations",
    "Finalizing physical ledger...",
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep(p => Math.min(p + 1, steps.length - 1)), 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#fdfbf7] flex items-center justify-center pt-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-80 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#120f0e]/5 to-transparent pointer-events-none" />

      <div className="text-center max-w-2xl mx-auto px-6 relative z-10">
        {/* Authoritative Loading Seal */}
        <div className="relative w-32 h-32 mx-auto mb-16 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-l-2 border-amber-500/50 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-b-2 border-r-2 border-amber-700/50 rounded-full"
          />
          <Bookmark className="h-10 w-10 text-amber-500 animate-pulse" />
        </div>

        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500 mb-6 border-b border-zinc-300 pb-4 inline-block">
          System Assembling Ledger
        </p>

        {query && (
          <p className="font-serif text-3xl md:text-5xl font-bold text-[#120f0e] tracking-tight mb-16 leading-tight max-w-xl mx-auto">
            {query}
          </p>
        )}

        <div className="space-y-5 text-left max-w-md mx-auto bg-white p-8 md:p-12 border border-zinc-200 shadow-[0_15px_40px_rgba(0,0,0,0.1)]">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-4"
            >
              <div className="flex-shrink-0 mt-1">
                {i < step ? (
                  <Check className="h-4 w-4 text-amber-500" strokeWidth={4} />
                ) : i === step ? (
                  <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                ) : (
                  <div className="h-4 w-4 border border-zinc-200" />
                )}
              </div>
              <span className={cn(
                "text-sm font-mono tracking-wide transition-colors duration-500",
                i === step ? "text-[#120f0e] font-bold" : i < step ? "text-zinc-400" : "text-zinc-300"
              )}>
                {s}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Sources sidebar ──────────────────────────────────────────────────────────

const SOURCE_DOMAINS: Record<string, string> = {
  'BBC News': 'bbc.com', 'BBC World': 'bbc.com', 'BBC Technology': 'bbc.com',
  'Reuters': 'reuters.com', 'Reuters Technology': 'reuters.com',
  'AP News': 'apnews.com',
  'Al Jazeera': 'aljazeera.com',
  'The Guardian': 'theguardian.com', 'The Guardian Tech': 'theguardian.com', 'The Guardian World': 'theguardian.com',
  'New York Times': 'nytimes.com', 'NY Times': 'nytimes.com',
  'TechCrunch': 'techcrunch.com', 'The Verge': 'theverge.com',
  'Wired': 'wired.com', 'Ars Technica': 'arstechnica.com',
  'Hacker News': 'news.ycombinator.com', 'MIT Tech Review': 'technologyreview.com',
  'Bloomberg': 'bloomberg.com', 'Financial Times': 'ft.com',
  'Wall Street Journal': 'wsj.com', 'Washington Post': 'washingtonpost.com',
  'CNN': 'cnn.com', 'CNBC': 'cnbc.com', 'Google News': 'news.google.com',
}

function getDomain(sourceName: string, articleUrl?: string): string {
  if (SOURCE_DOMAINS[sourceName]) return SOURCE_DOMAINS[sourceName]
  if (articleUrl) {
    try { return new URL(articleUrl).hostname.replace(/^www\./, '') } catch { }
  }
  return sourceName.toLowerCase().replace(/\s+/g, '') + '.com'
}

function SourcesSidebar({
  articles, sourcesQueried, optimizedQuery, loading, selectedSize, maxSelection
}: {
  articles: NormalizedNewsItem[], sourcesQueried: string[], optimizedQuery?: string, loading: boolean, selectedSize: number, maxSelection: number
}) {
  const publisherMap = new Map<string, { count: number; url?: string }>()
  for (const a of articles) {
    const existing = publisherMap.get(a.source)
    publisherMap.set(a.source, {
      count: (existing?.count ?? 0) + 1,
      url: existing?.url ?? a.url,
    })
  }
  const publishers = [...publisherMap.entries()].sort((a, b) => b[1].count - a[1].count)

  const API_LABELS: Record<string, string> = {
    'GNews': 'gnews.io', 'NewsAPI': 'newsapi.org', 'The Guardian': 'open-platform.theguardian.com',
    'New York Times': 'developer.nytimes.com', 'Currents': 'currentsapi.services',
    'NewsData.io': 'newsdata.io', 'Mediastack': 'mediastack.com', 'World News API': 'worldnewsapi.com',
    'Perigon': 'goperigon.com', 'GDELT': 'gdeltproject.org', 'Google News': 'news.google.com',
    'Google Search': 'google.com', 'RSS Feeds': 'rss',
  }

  return (
    <aside className="hidden md:block self-start">
      <div className="sticky top-[100px] space-y-6">

        {/* LLM Optimized Keywords (Moved to First Place) */}
        {optimizedQuery && (
          <div className="px-6 py-5 bg-[#120f0e] border-t-4 border-amber-500 shadow-[0_15px_40px_rgba(0,0,0,0.15)]">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              LLM Optimized Keywords
            </p>
            <p className="text-xs font-mono text-zinc-300 leading-relaxed italic border-l-2 border-amber-500/50 pl-4">
              &ldquo;{optimizedQuery}&rdquo;
            </p>
          </div>
        )}

        {/* Instructional Block (Moved here) */}
        {!loading && articles.length > 0 && (
          <div
            className={cn(
              "relative px-6 py-8 overflow-hidden transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.15)] border",
              selectedSize >= maxSelection
                ? "bg-[#120f0e] border-[#120f0e]"
                : "bg-amber-50 border-amber-200"
            )}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <p className={cn(
                  "text-[18px] font-black uppercase tracking-[0.18em] flex items-center gap-2",
                  selectedSize >= maxSelection ? "text-amber-500" : "text-amber-600"
                )}>

                  {selectedSize === 0 ? "Initial Action Required" : selectedSize >= maxSelection ? "Compilation Ready" : `Capacity`}
                </p>
                {selectedSize > 0 && selectedSize < maxSelection && (
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-500/20 px-2 py-0.5 rounded-sm">
                    {selectedSize} / {maxSelection}
                  </span>
                )}
              </div>

              <p className={cn("text-xs font-medium leading-relaxed", selectedSize >= maxSelection ? "text-zinc-300" : "text-zinc-800")}>
                {selectedSize === 0
                  ? `Select up to ${maxSelection} Articles to feed into the compilation engine.`
                  : selectedSize >= maxSelection
                    ? "Maximum inputs reached. Initiate the compilation sequence via the command bar below to generate your executive report."
                    : `Select ${maxSelection - selectedSize} more sources to hit optimal capacity.`}
              </p>
            </div>

            {/* Progress bar background for incomplete state */}
            {selectedSize > 0 && selectedSize < maxSelection && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-amber-500 transition-all duration-500 ease-out"
                style={{ width: `${(selectedSize / maxSelection) * 100}%` }}
              />
            )}
          </div>
        )}

        {/* ── Publishers card (Heavy Block) ── */}
        <div className="bg-[#fdfbf7] border border-zinc-200 shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between bg-[#120f0e]">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Active Sources</p>
            </div>
            <Globe className="h-4 w-4 text-amber-500" />
          </div>

          <div className="px-5 py-4 space-y-1 max-h-[350px] overflow-y-auto custom-scrollbar">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2 animate-pulse">
                  <div className="w-6 h-6 bg-zinc-200 flex-shrink-0" />
                  <div className="h-2 bg-zinc-200 flex-1" />
                </div>
              ))
            ) : publishers.length === 0 ? (
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 py-6 text-center">Standby</p>
            ) : (
              publishers.map(([name, { count, url }]) => {
                const domain = getDomain(name, url)
                return (
                  <div key={name} className="flex items-center gap-4 py-2 hover:bg-zinc-100 px-2 -mx-2 transition-colors group cursor-default">
                    <div className="w-6 h-6 bg-white border border-zinc-200 flex items-center shadow-sm justify-center flex-shrink-0">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                        alt={name}
                        className="w-3.5 h-3.5 object-contain opacity-70 group-hover:opacity-100"
                        onError={e => {
                          const el = e.target as HTMLImageElement
                          el.style.display = 'none'
                        }}
                      />
                    </div>
                    <span className="flex-1 text-xs font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors truncate">
                      {name}
                    </span>
                    <span className="text-[10px] font-black font-mono text-zinc-400 group-hover:text-amber-600 transition-colors flex-shrink-0">
                      {count}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </aside>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Phase = 'search' | 'generating' | 'report'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [inputValue, setInputValue] = useState(initialQuery)
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [report, setReport] = useState<ReportData | null>(null)
  const [phase, setPhase] = useState<Phase>('search')
  const [genError, setGenError] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setIsSearching(true)
    setQuery(q)
    setSelected(new Set())
    setReport(null)
    setPhase('search')
    setGenError('')
    const data = await search(q)
    setResults(data)
    setIsSearching(false)
  }, [])

  useEffect(() => {
    if (initialQuery) performSearch(initialQuery)
    else inputRef.current?.focus()
  }, [initialQuery, performSearch])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 150)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const articles = (results?.results.map(r => r.article) ?? []) as NormalizedNewsItem[]
  const atMax = selected.size >= MAX_SELECTION

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_SELECTION) next.add(id)
      return next
    })
  }

  async function generateReport() {
    const selectedArticles = articles.filter(a => selected.has(a.id))
    if (!selectedArticles.length) return

    setPhase('generating')
    setGenError('')
    setReport(null)

    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articles: selectedArticles.map(a => ({
            title: a.title, description: a.description, content: a.content,
            source: a.source, publishedAt: a.publishedAt, url: a.url,
          })),
          topic: query || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setGenError(data.error ?? 'Generation failed')
        setPhase('search')
      } else {
        const imageUrls = selectedArticles
          .filter(a => a.imageUrl)
          .slice(0, 3)
          .map(a => a.imageUrl as string)

        const sources = selectedArticles.map(a => ({ title: a.title, source: a.source, url: a.url }))

        setReport({ ...(data as ReportData), imageUrls, sources })
        setPhase('report')

        const firstArticle = selectedArticles[0]
        fetch('/api/report/archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: query || firstArticle?.title || 'Intelligence Report',
            topic: query || null,
            digest: data.digest ?? null,
            editorial: data.editorial ?? null,
            qa: data.qa ?? [],
            sources,
            model: data.model ?? null,
            provider: data.provider ?? null,
          }),
        }).catch(() => { })
      }
    } catch {
      setGenError('System error during ledger compilation.')
      setPhase('search')
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`)
      performSearch(inputValue.trim())
    }
  }

  if (phase === 'generating') {
    return (
      <>
        <Navbar />
        <GeneratingScreen query={query} />
      </>
    )
  }

  if (phase === 'report' && report) {
    return (
      <>
        <Navbar />
        <ReportOutput data={report} topic={query} onBack={() => setPhase('search')} />
      </>
    )
  }

  const showEmptyState = !results && !isSearching

  return (
    <div className="min-h-screen bg-[#180f0c] text-zinc-300">
      <Navbar />

      <main>
        {/* Massive Corporate Background Img for Hero/Empty State */}
        <div className={cn(
          "fixed top-0 left-0 w-full transition-all duration-1000 origin-top bg-[#180f0c] z-0",
          showEmptyState ? "h-[100vh] opacity-100" : "h-[40vh] opacity-90 blur-md scale-105"
        )}>
          {/* Using a high-end local archive/architecture image */}
          <div className="absolute inset-0 bg-[#0c0908 ]" />
          <img
            src="/hero/search-bg.jpg"
            className="w-full h-full object-cover  opacity-0.30"
            alt="Virlo Intelligence Vault"
            onError={e => {
              const img = e.target as HTMLImageElement
              img.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#180f0c]/50 via-[#fff]/0 to-[#180f0c] pointer-events-none" />
          <div className="absolute inset-0 bg-amber-900/50 mix-blend-color pointer-events-none" />
        </div>

        {/* Search Header Area */}
        {showEmptyState && (
          <section className="relative z-40 pt-40 pb-20 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <div className="mx-auto px-6 max-w-4xl">

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >

                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-8 leading-[0.95]">
                  Generate{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-300">Executive Insight.</span>
                </h1>

              </motion.div>

              {/* Premium Metallic Search Input */}
              <form onSubmit={handleSubmit} className="relative z-40 transform-gpu">
                <div className="relative group flex items-center transition-all duration-500 shadow-[0_20px_60px_-15px_rgba(245,158,11,0.15)]">
                  <div className="absolute left-6 pointer-events-none">
                    {isSearching
                      ? <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                      : <Search className="h-6 w-6 text-amber-600/50 group-focus-within:text-amber-500 transition-colors" />
                    }
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Type keywords that interest you..."
                    className="w-full pl-16 pr-40 border-2 transition-all duration-300 font-serif text-xl md:text-2xl outline-none placeholder:text-zinc-500 py-4 backdrop-blur-xl bg-[#1e2732]/100 text-amber-50 border-amber-900/50 focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isSearching}
                    className="absolute right-3 px-8 text-[#3e2723] font-black uppercase tracking-[0.2em] transition-all hover:bg-amber-400 disabled:opacity-30 py-4 text-sm bg-amber-500"
                  >
                    Intercept
                  </button>
                </div>
              </form>

              {/* Trending / Example queries */}
              {showEmptyState && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12 text-center"
                >

                  <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                    {EXAMPLES.map(ex => (
                      <button
                        key={ex.query}
                        type="button"
                        onClick={() => {
                          setInputValue(ex.query)
                          performSearch(ex.query)
                          router.push(`/search?q=${encodeURIComponent(ex.query)}`)
                        }}
                        className="group flex flex-col items-start gap-1 px-5 py-3 bg-[#7fff00] border border-amber-900/20 hover:border-amber-500/50 hover:bg-[#7fff00] transition-all duration-300 shadow-lg text-left"
                      >

                        <span className="text-sm font-bold text-[#000000] ">{ex.query}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Old LLM Optimized Keywords block was here and has been relocated to the right sidebar */}
            </div>
          </section>
        )}

        {/* Results Area */}
        {(results || isSearching) && (
          <section className="relative z-10 mx-auto max-w-6xl px-6 pt-28 pb-40">
            <div className="grid md:grid-cols-[1fr_300px] gap-10 lg:gap-14">

              {/* ── Left column: articles (The Index) ── */}
              <div>
                {isSearching && (
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-[#fdfbf7] border border-zinc-200 shadow-lg p-8 h-40 animate-pulse" />
                    ))}
                  </div>
                )}

                {!isSearching && articles.length > 0 && (
                  <>
                    {/* Instructional Block moved to SourcesSidebar */}

                    <div className="space-y-6">
                      {articles.map((article, i) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          index={i}
                          selected={selected.has(article.id)}
                          disabled={atMax && !selected.has(article.id)}
                          onToggle={() => toggleSelect(article.id)}
                        />
                      ))}
                    </div>

                    {genError && (
                      <div className="mt-10 p-8 bg-red-950/30 border border-red-500/30 text-red-500 text-sm font-bold uppercase tracking-widest text-center shadow-2xl">
                        Sequence Failed: {genError}
                      </div>
                    )}
                  </>
                )}

                {!isSearching && results && articles.length === 0 && (
                  <div className="text-center py-20 bg-white border border-zinc-200 mt-10 shadow-lg">
                    <Search className="h-10 w-10 text-zinc-300 mx-auto mb-6" />
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-900 mb-2">Zero Assets Located</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Broaden vector parameters and re-initiate search.</p>
                  </div>
                )}
              </div>

              {/* ── Right column: sources sidebar ── */}
              <SourcesSidebar
                articles={articles}
                sourcesQueried={results?.sourcesQueried ?? []}
                loading={isSearching}
                selectedSize={selected.size}
                maxSelection={MAX_SELECTION}
              />

            </div>
          </section>
        )}
      </main>

      {/* ── Heavy Corporate Action Bar ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-20 bg-[#120f0e] border-t-4 border-amber-500 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">

              <div className="hidden sm:block flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
                    {selected.size} of {MAX_SELECTION} Sources Locked
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap max-h-[24px] overflow-hidden">
                  {Array.from(selected).map((id) => {
                    const a = articles.find(x => x.id === id)
                    return a ? (
                      <span key={id} className="text-[10px] font-bold text-[#3e2723] bg-amber-500 px-3 py-1 truncate max-w-[150px]">
                        {a.source}
                      </span>
                    ) : null
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors group border border-transparent hover:border-zinc-700"
                  aria-label="Clear selection"
                >
                  <X className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={generateReport}
                  className="flex-1 sm:flex-initial flex justify-center items-center gap-4 px-10 py-2 bg-amber-500 text-[#120f0e] font-black text-sm md:text-base uppercase tracking-[0.2em] hover:bg-white hover:text-black shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all"
                >
                  <Printer className="h-3 w-5" />
                  Generate Report
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#180f0c]" />}>
      <SearchContent />
    </Suspense>
  )
}
