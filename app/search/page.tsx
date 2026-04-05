"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import {
  Search, ExternalLink, Loader2, FileText,
  Check, X, ChevronDown, ChevronUp, Sparkles, ArrowLeft, Globe, Printer,
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.22 }}
      onClick={() => { if (!disabled || selected) onToggle() }}
      className={cn(
        "group flex gap-4 p-5 rounded-sm border transition-all duration-300 cursor-pointer",
        selected
          ? "glass-emerald border-primary/40 shadow-emerald/10"
          : disabled
            ? "glass border-white/5 opacity-25 cursor-not-allowed pointer-events-none"
            : "glass border-white/5 hover:border-white/15"
      )}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-0.5">
        <div className={cn(
          "h-5 w-5 rounded-sm border-2 flex items-center justify-center transition-all duration-200",
          selected ? "bg-primary border-primary" : "border-zinc-700 group-hover:border-zinc-500"
        )}>
          {selected && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {article.category && (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary block mb-2">
                {article.category}
              </span>
            )}
            <p className="font-serif text-sm font-bold text-white line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors duration-300">
              {article.title}
            </p>
            {article.description && (
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed font-medium break-words overflow-hidden">
                {article.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{article.source}</span>
                <span className="text-zinc-700 text-[10px]" suppressHydrationWarning>· {formatTimeAgo(article.publishedAt)}</span>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open source article"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-700 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          {article.imageUrl && (
            <div className="hidden sm:block w-20 h-14 rounded-sm overflow-hidden flex-shrink-0 bg-zinc-900">
              <img
                src={article.imageUrl}
                alt=""
                className={cn("w-full h-full object-cover transition-all duration-500", selected ? "opacity-100" : "opacity-40 group-hover:opacity-60")}
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
    { id: 'editorial' as const, label: 'Editorial', icon: FileText },
    { id: 'digest' as const, label: 'Digest', icon: Sparkles },
    { id: 'qa' as const, label: 'Q & A', icon: ChevronDown },
    { id: 'pdf' as const, label: 'PDF', icon: Printer },
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
    }).catch(() => {})
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-black pt-24 pb-20"
    >
      <div className="mx-auto max-w-4xl px-6">

        {/* Back + meta row */}
        <div className="flex items-center justify-between mb-10">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to results</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Report</span>
          </div>
        </div>

        {/* Topic heading */}
        {topic && (
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tighter mb-2 leading-tight">
            {topic}
          </h1>
        )}
        <p className="text-[10px] font-mono text-zinc-600 mb-8">
          Generated by {data.model} · {new Date().toLocaleString()}
        </p>

        {/* Image strip — up to 3 article images */}
        {(data.imageUrls ?? []).length > 0 && (
          <div className="flex gap-3 mb-10 min-h-[144px]">
            {(data.imageUrls ?? []).map((url, i) => (
              <div key={i} className="flex-1 min-w-0 h-36 rounded-sm overflow-hidden bg-zinc-900">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover opacity-80"
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

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 p-1 glass rounded-sm border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-sm text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200",
                activeTab === tab.id
                  ? "bg-primary text-black"
                  : "text-zinc-500 hover:text-white"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'editorial' && (
            <motion.div key="editorial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="prose prose-invert max-w-none
                prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-3
                prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:font-medium prose-p:text-[15px]
                prose-li:text-zinc-300 prose-li:font-medium prose-li:text-[15px]
                prose-strong:text-white prose-strong:font-bold
                prose-hr:border-white/5">
                <ReactMarkdown>{data.editorial}</ReactMarkdown>
              </div>
            </motion.div>
          )}

          {activeTab === 'digest' && (
            <motion.div key="digest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-8">
                200-Word Intelligence Digest · {(data.digest ?? '').split(/\s+/).filter(Boolean).length} words
              </p>
              <div className="prose prose-invert max-w-none
                prose-p:text-zinc-300 prose-p:leading-[1.95] prose-p:text-[15px] prose-p:font-medium
                prose-strong:text-white">
                <ReactMarkdown>{data.digest}</ReactMarkdown>
              </div>
            </motion.div>
          )}

          {activeTab === 'qa' && (
            <motion.div key="qa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {(() => {
                const qaItems = (data.qa ?? []).filter(item => item?.q && item?.a)
                if (qaItems.length === 0) {
                  return (
                    <div className="glass border border-white/5 rounded-sm p-10 text-center">
                      <p className="text-sm text-zinc-500 font-medium">Q&amp;A could not be generated for this report.</p>
                    </div>
                  )
                }
                return (
                  <>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-8">
                      {qaItems.length} Questions · Tap to reveal
                    </p>
                    <div className="space-y-3">
                      {qaItems.map((item, i) => (
                        <div key={`${i}-${item.q.slice(0, 20)}`} className={cn(
                          "border rounded-sm overflow-hidden transition-all duration-300",
                          openQA === i ? "border-primary/30 glass-emerald" : "border-white/5 glass"
                        )}>
                          <button
                            type="button"
                            onClick={() => setOpenQA(openQA === i ? null : i)}
                            className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                          >
                            <span className="flex items-center gap-4 min-w-0">
                              <span className="font-mono text-[10px] text-primary font-black flex-shrink-0">Q{i + 1}</span>
                              <span className="text-sm font-bold text-white leading-snug">{item.q}</span>
                            </span>
                            {openQA === i
                              ? <ChevronUp className="h-4 w-4 text-primary flex-shrink-0" />
                              : <ChevronDown className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                            }
                          </button>
                          <AnimatePresence>
                            {openQA === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="px-6 pb-6 pt-4 text-[15px] text-zinc-400 leading-relaxed border-t border-white/5 ml-10">
                                  {item.a}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </motion.div>
          )}

          {activeTab === 'pdf' && (
            <motion.div key="pdf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="glass border border-white/10 rounded-sm p-10 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Printer className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white mb-2">Generate PDF Report</h3>
                  <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    Generates a formatted PDF and opens it in your browser&apos;s PDF viewer — ready to read, save, or print.
                  </p>
                </div>

                {/* Preview checklist */}
                <div className="inline-flex flex-col items-start gap-2 text-left mx-auto">
                  {[
                    '200-word intelligence digest',
                    'Full editorial analysis',
                    `Q&A — ${(data.qa ?? []).filter(x => x?.q && x?.a).length} questions with answers`,
                    (data.imageUrls?.length ?? 0) > 0 ? `${data.imageUrls!.length} article image${data.imageUrls!.length > 1 ? 's' : ''}` : null,
                    (data.sources?.length ?? 0) > 0 ? `${data.sources!.length} source references` : null,
                    'Generation date & model info',
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-xs text-zinc-400 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-black font-black text-sm uppercase tracking-[0.15em] rounded-sm hover:opacity-90 active:scale-95 transition-all shadow-lg"
                >
                  <Printer className="h-4 w-4" />
                  Open PDF
                </button>
                <p className="text-[9px] font-mono text-zinc-700">
                  Opens in browser PDF viewer · use Save (Ctrl+S) to keep a copy.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Generation loading screen ────────────────────────────────────────────────

function GeneratingScreen({ query }: { query: string }) {
  const steps = [
    "Fetching article context",
    "Running parallel AI synthesis",
    "Building Editorial Report",
    "Generating Digest",
    "Composing Q&A pairs",
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep(p => Math.min(p + 1, steps.length - 1)), 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex items-center justify-center pt-20"
    >
      <div className="text-center max-w-md mx-auto px-6">
        {/* Pulsing orb */}
        <div className="relative w-20 h-20 mx-auto mb-12">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-primary/15 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary mb-3">Generating Report</p>
        {query && (
          <p className="font-serif text-2xl font-bold text-white tracking-tight mb-10 leading-tight">
            {query}
          </p>
        )}

        <div className="space-y-3 text-left">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-500",
                i < step ? "border-primary bg-primary" : i === step ? "border-primary animate-pulse" : "border-zinc-800"
              )}>
                {i < step && <Check className="h-2.5 w-2.5 text-black" strokeWidth={3} />}
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors duration-500",
                i === step ? "text-white" : i < step ? "text-zinc-500" : "text-zinc-800"
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

// Well-known domain map for cleaner favicon lookups
const SOURCE_DOMAINS: Record<string, string> = {
  'BBC News': 'bbc.com', 'BBC World': 'bbc.com', 'BBC Technology': 'bbc.com',
  'Reuters': 'reuters.com', 'Reuters Technology': 'reuters.com',
  'AP News': 'apnews.com',
  'Al Jazeera': 'aljazeera.com',
  'The Guardian': 'theguardian.com', 'The Guardian Tech': 'theguardian.com', 'The Guardian World': 'theguardian.com',
  'New York Times': 'nytimes.com', 'NY Times': 'nytimes.com',
  'TechCrunch': 'techcrunch.com',
  'The Verge': 'theverge.com',
  'Wired': 'wired.com',
  'Ars Technica': 'arstechnica.com',
  'Hacker News': 'news.ycombinator.com',
  'MIT Tech Review': 'technologyreview.com',
  'Engadget': 'engadget.com',
  'VentureBeat': 'venturebeat.com',
  'France 24': 'france24.com',
  'Deutsche Welle': 'dw.com',
  'NPR News': 'npr.org',
  'Forbes': 'forbes.com',
  'Bloomberg': 'bloomberg.com',
  'Financial Times': 'ft.com',
  'Wall Street Journal': 'wsj.com',
  'Washington Post': 'washingtonpost.com',
  'CNN': 'cnn.com',
  'CNBC': 'cnbc.com',
  'Google News': 'news.google.com',
  'Google Search': 'google.com',
  'Phys.org': 'phys.org',
  'Space.com': 'space.com',
  'NASA': 'nasa.gov',
}

function getDomain(sourceName: string, articleUrl?: string): string {
  if (SOURCE_DOMAINS[sourceName]) return SOURCE_DOMAINS[sourceName]
  if (articleUrl) {
    try { return new URL(articleUrl).hostname.replace(/^www\./, '') } catch {}
  }
  return sourceName.toLowerCase().replace(/\s+/g, '') + '.com'
}

function SourcesSidebar({
  articles,
  sourcesQueried,
  optimizedQuery,
  loading,
}: {
  articles: NormalizedNewsItem[]
  sourcesQueried: string[]
  optimizedQuery?: string
  loading: boolean
}) {
  // Aggregate publishers from actual articles
  const publisherMap = new Map<string, { count: number; url?: string }>()
  for (const a of articles) {
    const existing = publisherMap.get(a.source)
    publisherMap.set(a.source, {
      count: (existing?.count ?? 0) + 1,
      url: existing?.url ?? a.url,
    })
  }
  const publishers = [...publisherMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)

  // API pipeline sources (providers that were queried)
  const API_LABELS: Record<string, string> = {
    'GNews': 'gnews.io',
    'NewsAPI': 'newsapi.org',
    'The Guardian': 'open-platform.theguardian.com',
    'New York Times': 'developer.nytimes.com',
    'Currents': 'currentsapi.services',
    'NewsData.io': 'newsdata.io',
    'Mediastack': 'mediastack.com',
    'World News API': 'worldnewsapi.com',
    'Perigon': 'goperigon.com',
    'GDELT': 'gdeltproject.org',
    'Google News': 'news.google.com',
    'Google Search': 'google.com',
    'RSS Feeds': 'rss',
  }

  return (
    <aside className="hidden md:block self-start">
      <div className="sticky top-[185px] space-y-5">

        {/* ── Publishers card ── */}
        <div className="glass rounded-sm border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Publishers</p>
              <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
                {loading ? '…' : `${publishers.length} unique sources`}
              </p>
            </div>
            <Globe className="h-3.5 w-3.5 text-zinc-700" />
          </div>

          <div className="px-4 py-3 space-y-1">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                  <div className="w-5 h-5 rounded-sm bg-white/5 flex-shrink-0" />
                  <div className="h-2.5 bg-white/5 rounded flex-1" />
                  <div className="h-2.5 bg-white/5 rounded w-4" />
                </div>
              ))
            ) : publishers.length === 0 ? (
              <p className="text-[10px] text-zinc-700 py-3 text-center">No results yet</p>
            ) : (
              publishers.map(([name, { count, url }]) => {
                const domain = getDomain(name, url)
                return (
                  <div key={name} className="flex items-center gap-3 py-1.5 group rounded-sm hover:bg-white/[0.02] px-1 transition-colors">
                    <div className="w-5 h-5 rounded-sm overflow-hidden flex-shrink-0 bg-zinc-900 flex items-center justify-center">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                        alt={name}
                        className="w-4 h-4 object-contain"
                        onError={e => {
                          const el = e.target as HTMLImageElement
                          el.style.display = 'none'
                          el.parentElement!.innerHTML = `<span class="text-[8px] font-black text-zinc-600">${name.slice(0, 2).toUpperCase()}</span>`
                        }}
                      />
                    </div>
                    <span className="flex-1 text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
                      {name}
                    </span>
                    <span className="text-[10px] font-black font-mono text-zinc-700 group-hover:text-primary transition-colors flex-shrink-0">
                      {count}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── API pipeline card ── */}
        {(sourcesQueried.length > 0 || loading) && (
          <div className="glass rounded-sm border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Data Pipeline</p>
              <p className="text-[9px] font-mono text-zinc-700 mt-0.5">APIs queried this search</p>
            </div>
            <div className="px-4 py-3 space-y-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5 flex-shrink-0" />
                    <div className="h-2 bg-white/5 rounded flex-1" />
                  </div>
                ))
              ) : (
                sourcesQueried.map(src => {
                  const label = API_LABELS[src]
                  const domain = label && label !== 'rss' ? label : null
                  return (
                    <div key={src} className="flex items-center gap-3 py-1.5">
                      {domain ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                          alt={src}
                          className="w-3.5 h-3.5 object-contain flex-shrink-0 opacity-60"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                          <span className="w-1 h-1 rounded-full bg-zinc-700" />
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-zinc-600 truncate">{src}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ── AI query note ── */}
        {optimizedQuery && (
          <div className="px-4 py-3 glass-emerald rounded-sm border border-primary/10">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-1.5">AI Refined Query</p>
            <p className="text-[11px] font-mono text-zinc-300 leading-relaxed italic">&ldquo;{optimizedQuery}&rdquo;</p>
          </div>
        )}

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

        // Save to archive (fire-and-forget)
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
        }).catch(() => {})
      }
    } catch {
      setGenError('Network error — please try again')
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

  // ── Generating phase: full screen loader ───────────────────────────────────
  if (phase === 'generating') {
    return (
      <>
        <Navbar />
        <GeneratingScreen query={query} />
      </>
    )
  }

  // ── Report phase: full screen report ──────────────────────────────────────
  if (phase === 'report' && report) {
    return (
      <>
        <Navbar />
        <ReportOutput
          data={report}
          topic={query}
          onBack={() => setPhase('search')}
        />
      </>
    )
  }

  // ── Search phase ───────────────────────────────────────────────────────────
  const showEmptyState = !results && !isSearching

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="pt-20">
        {/* Search bar section */}
        <section className={cn(
          "transition-all duration-700",
          showEmptyState ? "py-32" : "py-6 border-b border-white/5 sticky top-20 z-30 bg-black/90 backdrop-blur-xl"
        )}>
          <div className={cn("mx-auto px-6", showEmptyState ? "max-w-3xl" : "max-w-5xl")}>

            {showEmptyState && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-14"
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  AI-Vantage Intelligence Search
                </span>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-white tracking-tighter mb-6 leading-[0.9]">
                  Search anything.<br />
                  <span className="text-zinc-500">Understand everything.</span>
                </h1>
                <p className="text-zinc-500 text-base font-medium max-w-md mx-auto leading-relaxed">
                  Pick up to 5 articles, hit generate — get a full intelligence report in under 30 seconds.
                </p>
              </motion.div>
            )}

            {/* Search input */}
            <form onSubmit={handleSubmit}>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isSearching
                    ? <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    : <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                  }
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Topic, question, or keywords…"
                  className="w-full pl-14 pr-24 py-5 glass border-white/10 rounded-sm text-white text-base font-medium placeholder:text-zinc-600 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSearching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-sm hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Example queries */}
            {showEmptyState && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-7"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-700 mb-4 text-center">Try these</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex.query}
                      type="button"
                      onClick={() => {
                        setInputValue(ex.query)
                        performSearch(ex.query)
                        router.push(`/search?q=${encodeURIComponent(ex.query)}`)
                      }}
                      className="group flex items-center gap-2 px-4 py-2 glass border-white/5 rounded-sm hover:border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">{ex.label}</span>
                      <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors">{ex.query}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {results && !isSearching && (
              <div className="mt-4 flex flex-col gap-1.5">
                <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-700">
                  <span>{results.totalResults} articles · {results.sourcesFound} sources · {results.processingTime}ms</span>
                </div>
                {results.optimizedQuery && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
                    <span className="text-primary/60">AI refined to:</span>
                    <span className="text-zinc-400 italic">&ldquo;{results.optimizedQuery}&rdquo;</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        {(results || isSearching) && (
          <section className="mx-auto max-w-5xl px-6 pt-6 pb-32">
            <div className="grid md:grid-cols-[1fr_260px] gap-8">

              {/* ── Left column: articles ── */}
              <div>
                {isSearching && (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="glass border-white/5 rounded-sm p-5 animate-pulse">
                        <div className="h-3 bg-white/5 rounded w-1/4 mb-3" />
                        <div className="h-4 bg-white/5 rounded mb-2" />
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                )}

                {!isSearching && articles.length > 0 && (
                  <>
                    {/* ── Selection guide box ── */}
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className={cn(
                        "mb-5 rounded-sm border px-5 py-4 transition-all duration-500",
                        selected.size === 0
                          ? "glass border-white/10"
                          : selected.size >= MAX_SELECTION
                            ? "border-primary/30 bg-primary/5"
                            : "border-primary/15 bg-primary/[0.03]"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                          {Array.from({ length: MAX_SELECTION }).map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                i < selected.size ? "bg-primary" : "bg-zinc-800"
                              )}
                            />
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-[0.25em] mb-1 transition-colors",
                            selected.size >= MAX_SELECTION ? "text-primary" : "text-zinc-500"
                          )}>
                            {selected.size === 0
                              ? "Step 1 — Pick your sources"
                              : selected.size >= MAX_SELECTION
                                ? "Ready to generate"
                                : `${selected.size} of ${MAX_SELECTION} selected`}
                          </p>
                          <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                            {selected.size === 0
                              ? `We filtered ${articles.length} articles. Select up to ${MAX_SELECTION} to feed the AI — more sources = richer intelligence.`
                              : selected.size >= MAX_SELECTION
                                ? "You've picked 5 sources. Hit Generate Report below to build your intelligence brief."
                                : `Pick ${MAX_SELECTION - selected.size} more article${MAX_SELECTION - selected.size > 1 ? 's' : ''} — or hit Generate now with what you have.`}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <div className="space-y-3">
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
                      <div className="mt-6 px-5 py-4 glass border-red-500/20 rounded-sm text-sm text-red-400">
                        {genError}
                      </div>
                    )}
                  </>
                )}

                {!isSearching && results && articles.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-zinc-500 font-medium">No results for &quot;{query}&quot;</p>
                    <p className="text-zinc-700 text-sm mt-2">Try different keywords or broaden your topic</p>
                  </div>
                )}
              </div>

              {/* ── Right column: sources sidebar ── */}
              <SourcesSidebar
                articles={articles}
                sourcesQueried={results?.sourcesQueried ?? []}
                optimizedQuery={results?.optimizedQuery}
                loading={isSearching}
              />

            </div>
          </section>
        )}
      </main>

      {/* ── Generate Report CTA — full-width sticky, dominant ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/20 bg-black/95 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-5">
              {/* Selected info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{selected.size} of {MAX_SELECTION} selected</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="text-[10px] font-mono text-zinc-600">
                    {selected.size >= MAX_SELECTION ? "Ready to generate" : `${MAX_SELECTION - selected.size} more for full report`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Array.from(selected).map((id) => {
                    const a = articles.find(x => x.id === id)
                    return a ? (
                      <span key={id} className="inline-flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-sm max-w-[180px]">
                        <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        <span className="truncate">{a.source}</span>
                      </span>
                    ) : null
                  })}
                </div>
              </div>

              {/* Clear */}
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-zinc-600 hover:text-white transition-colors flex-shrink-0"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Generate */}
              <button
                type="button"
                onClick={generateReport}
                className="flex-shrink-0 flex items-center gap-3 px-8 py-3.5 bg-primary text-black font-black text-sm uppercase tracking-[0.15em] rounded-sm hover:opacity-90 active:scale-95 transition-all shadow-lg"
              >
                <Sparkles className="h-4 w-4" />
                Generate Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SearchContent />
    </Suspense>
  )
}
