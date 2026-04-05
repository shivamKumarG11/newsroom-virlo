"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, RefreshCw, Sparkles, ChevronRight, Newspaper } from "lucide-react"
import { StoryQA } from "@/components/news/story-qa"
import { formatTimeAgo } from "@/lib/news-api"
import { cn } from "@/lib/utils"
import type { NormalizedNewsItem } from "@/app/api/news/route"

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = ["All", "World", "Technology", "Business", "Science", "Health", "Politics"]

function matchesCategory(article: NormalizedNewsItem, cat: string): boolean {
  if (cat === "All") return true
  const c = article.category?.toLowerCase() ?? ""
  const t = article.title?.toLowerCase() ?? ""
  const map: Record<string, string[]> = {
    World: ["world", "international", "global", "war", "conflict", "ukraine", "middle east"],
    Technology: ["tech", "ai", "software", "crypto", "space", "science"],
    Business: ["business", "finance", "economy", "market", "stock", "trade"],
    Science: ["science", "research", "study", "climate", "environment", "space"],
    Health: ["health", "medical", "covid", "drug", "vaccine", "disease"],
    Politics: ["politic", "election", "government", "president", "congress", "parliament"],
  }
  const terms = map[cat] ?? []
  return terms.some(term => c.includes(term) || t.includes(term))
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function Source({ name, time, url }: { name: string; time: string; url?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">{name}</span>
      <span className="text-zinc-300">·</span>
      <span className="text-[11px] font-mono text-zinc-500" suppressHydrationWarning>
        {time}
      </span>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open source"
          onClick={e => e.stopPropagation()}
          className="ml-auto text-zinc-400 hover:text-amber-600 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}

// ─── Featured card (hero) ─────────────────────────────────────────────────────

function FeaturedCard({ article }: { article: NormalizedNewsItem }) {
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
      onKeyDown={e => e.key === 'Enter' && window.open(article.url, '_blank', 'noopener,noreferrer')}
      className="group bg-white rounded-3xl border border-zinc-100 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/50 cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Image on top for all screen sizes */}
      {article.imageUrl && (
        <div className="w-full h-64 md:h-[400px] bg-slate-100 overflow-hidden relative">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none opacity-1 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}
      <div className="p-8 md:p-12 relative bg-white">
        {article.category && (
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] bg-indigo-50 text-indigo-700 mb-6 border border-indigo-100/50">
            {article.category}
          </span>
        )}
        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-6">
          {article.title}
        </h2>
        {article.description && (
          <p className="text-base md:text-lg text-slate-600 line-clamp-3 leading-relaxed font-medium mb-10">
            {article.description}
          </p>
        )}
        <Source name={article.source} time={formatTimeAgo(article.publishedAt)} url={article.url} />
      </div>
    </div>
  )
}

// ─── Standard article card ────────────────────────────────────────────────────

function ArticleCard({
  article,
  onQA,
  compact = false,
}: {
  article: NormalizedNewsItem
  onQA: (a: NormalizedNewsItem) => void
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className="group flex gap-5 p-5 bg-white hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer rounded-2xl"
        onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}>
        {article.imageUrl && (
          <div className="w-20 h-20 flex-shrink-0 bg-slate-100 overflow-hidden rounded-xl">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {article.category && (
            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] bg-emerald-50 text-emerald-700 border border-emerald-100 self-start mb-2">
              {article.category}
            </span>
          )}
          <h3 className="font-serif text-base font-bold text-slate-900 line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <Source name={article.source} time={formatTimeAgo(article.publishedAt)} />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onQA(article); }}
              title="Ask intelligence"
              className="ml-2 flex-shrink-0 p-2 bg-indigo-50 border border-indigo-100/50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors rounded-full"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}>
      {article.imageUrl && (
        <div className="w-full h-52 bg-slate-100 overflow-hidden flex-shrink-0">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
          />
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col flex-1 bg-white">
        {article.category && (
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] bg-indigo-50 text-indigo-700 border border-indigo-100 mb-4 self-start">
            {article.category}
          </span>
        )}
        <h3 className="font-serif text-xl md:text-2xl font-bold text-slate-900 line-clamp-3 leading-snug tracking-tight mb-4">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium mb-6">
            {article.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
          <Source name={article.source} time={formatTimeAgo(article.publishedAt)} />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onQA(article); }}
            title="Ask intelligence"
            className="ml-4 flex-shrink-0 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AI Brief banner ──────────────────────────────────────────────────────────

function AIBrief({ articles }: { articles: NormalizedNewsItem[] }) {
  const [brief, setBrief] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/brief")
      const data = await res.json()
      setBrief(data.brief)
      setAiGenerated(data.aiGenerated)
    } catch {
      // suppress
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (articles.length > 0) load()
  }, [articles.length, load])

  if (!brief && !loading) return null

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-8 py-10 md:p-12 border border-indigo-100 rounded-3xl shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Newspaper className="h-64 w-64 text-indigo-500 transform rotate-12" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-8 relative z-10 border-b border-indigo-100/50 pb-6">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 rounded-full shadow-sm">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-100"></span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white">
            Executive Briefing
          </span>
        </div>
        {aiGenerated && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 border border-indigo-200 bg-white rounded-full px-3 py-1">Neural Synthesis</span>
        )}

      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-indigo-100/50 rounded-full animate-pulse w-full" />
          <div className="h-4 bg-indigo-100/50 rounded-full animate-pulse w-5/6" />
          <div className="h-4 bg-indigo-100/50 rounded-full animate-pulse w-4/6" />
        </div>
      ) : (
        <p className="text-xl md:text-2xl text-slate-800 font-serif leading-[1.8] relative z-10 text-balance tracking-tight">
          &ldquo;{brief}&rdquo;
        </p>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [articles, setArticles] = useState<NormalizedNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("All")
  const [qaArticle, setQAArticle] = useState<NormalizedNewsItem | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).toUpperCase()

  const loadArticles = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const url = showRefresh ? "/api/news?mode=latest&nocache=1" : "/api/news?mode=latest"
      const res = await fetch(url)
      const data = await res.json()
      setArticles(data.articles ?? [])
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadArticles() }, [loadArticles])

  const filtered = articles.filter(a => matchesCategory(a, category))
  const [featured, ...rest] = filtered
  const secondary = rest.slice(0, 4)
  const tertiary = rest.slice(4)

  return (
    <div className="min-h-screen bg-[#FFE7B5] pt-20 pb-32">

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-slate-100" />
                <div className="p-8 space-y-4">
                  <div className="h-2 bg-slate-100 rounded-full w-1/4" />
                  <div className="h-8 bg-slate-100 rounded-xl w-full mb-2" />
                  <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-3xl border border-zinc-100 shadow-sm mt-8">
            <Newspaper className="h-12 w-12 text-zinc-300 mx-auto mb-6" />
            <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-800 mb-3">No reporting available.</p>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Select an alternative sector or synchronize feed.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* AI Brief */}
            <AIBrief articles={articles} />

            {/* Hero + secondary grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-8 items-start">
              {/* Featured */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <FeaturedCard article={featured} />
                </motion.div>
              )}

              {/* Secondary column */}
              {secondary.length > 0 && (
                <div className="flex flex-col flex-1 divide-y divide-zinc-100 bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-xl">
                  <div className="px-6 py-5 bg-slate-50 border-b border-zinc-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Developing Stories</p>
                  </div>
                  {secondary.map((article, i) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <ArticleCard article={article} onQA={setQAArticle} compact />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Tertiary grid */}
            {tertiary.length > 0 && (
              <div className="pt-8">
                <div className="flex items-center gap-6 mb-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-5 py-2.5 whitespace-nowrap">
                    The Global Wire
                  </span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {tertiary.map((article, i) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    >
                      <ArticleCard article={article} onQA={setQAArticle} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Search CTA */}
            <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group border border-indigo-500/20 mt-10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="text-center md:text-left relative z-10">
                <p className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight mb-4">Investigate Further.</p>
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest bg-white/10 rounded-full inline-flex items-center px-4 py-2 border border-white/10">Query the global index and compile a classified ledger.</p>
              </div>
              <Link
                href="/search"
                className="relative z-10 flex-shrink-0 flex items-center justify-center gap-4 px-8 py-4 bg-white text-indigo-900 text-[11px] font-black uppercase tracking-[0.2em] transform transition-transform duration-500 hover:bg-indigo-50 rounded-2xl hover:scale-105 active:scale-95 shadow-xl"
              >
                Launch Scanner
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Story Q&A drawer */}
      <AnimatePresence>
        {qaArticle && (
          <StoryQA article={qaArticle} onClose={() => setQAArticle(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
