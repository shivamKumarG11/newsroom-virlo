"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Clock, Loader2, RefreshCw, Sparkles, ChevronRight } from "lucide-react"
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
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{name}</span>
      <span className="text-muted-foreground/40">·</span>
      <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
        {time}
      </span>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open source"
          onClick={e => e.stopPropagation()}
          className="ml-auto text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
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
      className="group glass rounded-sm overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-700 hover:-translate-y-1 shadow-2xl cursor-pointer"
    >
      {/* Image on top for all screen sizes */}
      {article.imageUrl && (
        <div className="w-full h-56 md:h-72 bg-zinc-900 overflow-hidden relative">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-80 group-hover:opacity-100"
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      )}
      <div className="p-8 md:p-10">
        {article.category && (
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 block">
            {article.category}
          </span>
        )}
        <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.1] tracking-tighter mb-4 group-hover:text-primary transition-colors duration-500">
          {article.title}
        </h2>
        {article.description && (
          <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed font-medium mb-6">
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
      <div className="group flex gap-4 p-4 rounded-sm hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5">
        {article.imageUrl && (
          <div className="w-16 h-16 flex-shrink-0 rounded-sm overflow-hidden bg-zinc-900">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
              onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {article.category && (
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary mb-1 block">
              {article.category}
            </span>
          )}
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            <h3 className="font-serif text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300">
              {article.title}
            </h3>
          </a>
          <div className="flex items-center justify-between mt-2">
            <Source name={article.source} time={formatTimeAgo(article.publishedAt)} url={article.url} />
            <button
              type="button"
              onClick={() => onQA(article)}
              title="Ask intelligence"
              className="ml-2 flex-shrink-0 text-zinc-600 hover:text-primary transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex flex-col glass rounded-sm overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-500">
      {article.imageUrl && (
        <a href={article.url} target="_blank" rel="noopener noreferrer" aria-label={article.title}
          className="block w-full h-44 bg-zinc-900 overflow-hidden relative flex-shrink-0"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-100"
            onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </a>
      )}
      <div className="p-6 flex flex-col flex-1">
        {article.category && (
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
            {article.category}
          </span>
        )}
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="block mb-3">
          <h3 className="font-serif text-lg font-bold text-white line-clamp-3 leading-snug tracking-tight group-hover:text-primary transition-colors duration-300">
            {article.title}
          </h3>
        </a>
        {article.description && (
          <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium mb-4">
            {article.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <Source name={article.source} time={formatTimeAgo(article.publishedAt)} url={article.url} />
          <button
            type="button"
            onClick={() => onQA(article)}
            title="Ask intelligence"
            className="ml-4 flex-shrink-0 text-zinc-600 hover:text-primary transition-all hover:scale-110 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
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
    <div className="glass-emerald rounded-sm p-8 border-emerald-500/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="h-20 w-20 text-primary" />
      </div>
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-emerald" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Intelligence Brief
          </span>
        </div>
        {aiGenerated && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 border border-white/5 px-2 py-0.5 rounded-full">Neural Engine</span>
        )}
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="ml-auto text-zinc-500 hover:text-primary transition-all"
          title="Regenerate brief"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>
      {loading ? (
        <div className="space-y-3">
          <div className="h-3 bg-primary/10 rounded animate-pulse w-full" />
          <div className="h-3 bg-primary/10 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-primary/10 rounded animate-pulse w-4/6" />
        </div>
      ) : (
        <p className="text-lg text-white font-medium leading-relaxed relative z-10 text-balance tracking-tight italic">
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
    <div className="min-h-screen bg-black pt-20 pb-20">
      {/* Masthead */}
      <div className="border-b border-white/5 glass sticky top-20 z-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between py-6 border-b border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">{today}</p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => loadArticles(true)}
                disabled={refreshing}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-all group"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin group-hover:rotate-180 transition-transform")} />
                Refresh
              </button>
            </div>
          </div>

          {/* Category nav */}
          <nav className="flex gap-8 overflow-x-auto scrollbar-none py-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-2 py-4 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all relative group",
                  category === cat
                    ? "text-primary"
                    : "text-zinc-500 hover:text-zinc-200"
                )}
              >
                {cat}
                {category === cat && (
                  <motion.span 
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-emerald" 
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-sm border border-white/5 bg-zinc-950/50 overflow-hidden animate-pulse">
                <div className="aspect-[16/9] bg-zinc-900" />
                <div className="p-6 space-y-4">
                  <div className="h-2 bg-zinc-900 rounded w-1/4" />
                  <div className="h-6 bg-zinc-900 rounded" />
                  <div className="h-4 bg-zinc-900 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-zinc-500">
            <p className="text-sm font-bold uppercase tracking-widest mb-3">No articles found.</p>
            <p className="text-xs text-zinc-700">Try a different category or refresh.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* AI Brief */}
            <AIBrief articles={articles} />

            {/* Hero + secondary grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Featured */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="lg:col-span-2"
                >
                  <FeaturedCard article={featured} />
                </motion.div>
              )}

              {/* Secondary column */}
              {secondary.length > 0 && (
                <div className="flex flex-col divide-y divide-white/5 glass rounded-sm border border-white/5 overflow-hidden">
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
              <>
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 whitespace-nowrap">
                    More Stories
                  </span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {tertiary.map((article, i) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    >
                      <ArticleCard article={article} onQA={setQAArticle} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Search CTA */}
            <div className="glass rounded-sm p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5 group hover:border-primary/20 transition-all duration-500">
              <div className="text-center md:text-left">
                <p className="text-xl font-bold text-white tracking-tight mb-2">Looking for something specific?</p>
                <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Search across all sources and generate an AI report</p>
              </div>
              <Link
                href="/search"
                className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary group-hover:translate-x-2 transition-transform duration-500"
              >
                Start Search Intelligence
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
