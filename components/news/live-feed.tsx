"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  TrendingUp,
  RefreshCw,
  Loader2,
  ExternalLink,
  Zap,
  Radio,
} from "lucide-react"
import { fetchRealNews, formatTimeAgo, generateSlug } from "@/lib/news-api"
import type { NormalizedNewsItem } from "@/app/api/news/route"
import { SourceBadge } from "@/components/news/source-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PipelineVisualization } from "@/components/pipeline/pipeline-visualization"
import { createPipeline, runPipeline, PipelineState } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

interface LiveFeedProps {
  showPipeline?: boolean
  query?: string
}

function LiveArticleCard({
  article,
  index,
  isNew,
}: {
  article: NormalizedNewsItem
  index: number
  isNew?: boolean
}) {
  const slug = generateSlug(article.title)

  return (
    <motion.article
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn(
        "group relative flex gap-4 p-4 rounded-xl transition-all border",
        isNew
          ? "bg-accent/5 border-accent/25 shadow-sm"
          : "border-transparent hover:bg-secondary/50 hover:border-border"
      )}
    >
      {/* New indicator */}
      {isNew && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent text-accent-foreground">
            NEW
          </span>
        </div>
      )}

      {/* Image */}
      {article.imageUrl && (
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary"
        >
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </a>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {article.category}
          </Badge>
          <span 
            className="text-[10px] text-muted-foreground flex items-center gap-1"
            suppressHydrationWarning
          >
            <Clock className="w-3 h-3" />
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link block"
        >
          <h3 className="font-medium text-sm text-foreground group-hover/link:text-accent transition-colors line-clamp-2 leading-snug mb-2">
            {article.title}
          </h3>
        </a>

        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={article.source} url={article.url} size="sm" />
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-accent transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Read original
          </a>
        </div>
      </div>
    </motion.article>
  )
}

/** Countdown display for next auto-refresh */
function RefreshCountdown({ nextRefreshAt }: { nextRefreshAt: number }) {
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.floor((nextRefreshAt - Date.now()) / 1000))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.max(0, Math.floor((nextRefreshAt - Date.now()) / 1000)))
    }, 1000)
    return () => clearInterval(interval)
  }, [nextRefreshAt])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${mins}:${String(secs).padStart(2, '0')}`

  return (
    <span className="text-[10px] text-muted-foreground tabular-nums">
      Refreshes in {display}
    </span>
  )
}

export function LiveFeed({ showPipeline = false, query = '' }: LiveFeedProps) {
  const [articles, setArticles] = useState<NormalizedNewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pipeline, setPipeline] = useState<PipelineState | null>(null)
  const [newArticleIds, setNewArticleIds] = useState<Set<string>>(new Set())
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [nextRefreshAt, setNextRefreshAt] = useState(Date.now() + AUTO_REFRESH_INTERVAL)
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement>(null)

  const loadArticles = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true)
        if (showPipeline) {
          const p = createPipeline('article', query || 'Live news feed')
          setPipeline(p)

          // Run pipeline while fetching in parallel
          const [pipelineResult, fetchResult] = await Promise.all([
            runPipeline(p, state => setPipeline({ ...state })),
            fetchRealNews(query, '', true),
          ])

          const { articles: fresh, meta } = fetchResult

          // Inject real meta into completed pipeline for display
          if (meta) {
            setPipeline(prev =>
              prev ? { ...prev, realMeta: meta } : null
            )
          }

          const currentIds = new Set(articles.map(a => a.id))
          const newIds = new Set(fresh.filter(a => !currentIds.has(a.id)).map(a => a.id))
          setNewArticleIds(newIds)
          setTimeout(() => setNewArticleIds(new Set()), 8000)
          setArticles(fresh)
        } else {
          const { articles: fresh } = await fetchRealNews(query, '', true)
          const currentIds = new Set(articles.map(a => a.id))
          const newIds = new Set(fresh.filter(a => !currentIds.has(a.id)).map(a => a.id))
          setNewArticleIds(newIds)
          setTimeout(() => setNewArticleIds(new Set()), 8000)
          setArticles(fresh)
        }

        setIsRefreshing(false)
      } else {
        setIsLoading(true)
        const { articles: fresh, meta } = await fetchRealNews(query)

        if (showPipeline && fresh.length > 0) {
          const p = createPipeline('article', query || 'Live news feed')
          setPipeline(p)
          runPipeline(p, state => setPipeline({ ...state }), meta || undefined)
        }

        setArticles(fresh)
        setIsLoading(false)
      }

      setLastFetched(new Date())
      setNextRefreshAt(Date.now() + AUTO_REFRESH_INTERVAL)
    },
    [articles, query, showPipeline]
  )

  // Initial load
  useEffect(() => {
    loadArticles(false)
  }, [query])

  // Auto-refresh every 5 min
  useEffect(() => {
    const interval = setInterval(() => loadArticles(true), AUTO_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [loadArticles])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          setPage(p => p + 1)
        }
      },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [isLoading])

  const displayed = articles.slice(0, page * 12)
  const hasMore = displayed.length < articles.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="font-semibold text-sm text-foreground">Live News Feed</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {articles.length} articles
          </span>
          {lastFetched && (
            <span className="text-[10px] text-muted-foreground hidden sm:block">
              Updated {formatTimeAgo(lastFetched.toISOString())}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {lastFetched && !isRefreshing && (
            <RefreshCountdown nextRefreshAt={nextRefreshAt} />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadArticles(true)}
            disabled={isRefreshing || isLoading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Source summary strip */}
      {articles.length > 0 && !isLoading && (
        <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
          <Radio className="w-3 h-3 text-emerald-500" />
          <span>
            Pulling from:
          </span>
          {[...new Set(articles.slice(0, 20).map(a => a.source))].slice(0, 5).map((src, i) => (
            <span key={i} className="font-medium text-foreground">{src}</span>
          ))}
          {[...new Set(articles.map(a => a.source))].length > 5 && (
            <span>+{[...new Set(articles.map(a => a.source))].length - 5} more</span>
          )}
        </div>
      )}

      {/* Pipeline visualization */}
      <AnimatePresence>
        {showPipeline && pipeline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary/30 rounded-xl p-4"
          >
            <PipelineVisualization pipeline={pipeline} variant="compact" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Articles */}
      <div className="space-y-0.5">
        {isLoading && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Fetching from BBC, Reuters, and more...
            </p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No articles found. Try refreshing.</p>
          </div>
        ) : (
          <AnimatePresence>
              {displayed.map((article, index) => (
                <LiveArticleCard
                  key={`${article.id}-${index}`}
                  article={article}
                  index={index}
                  isNew={newArticleIds.has(article.id)}
                />
              ))}
          </AnimatePresence>
        )}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && !isLoading && (
        <div ref={loaderRef} className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-6">
          {articles.length} articles from {[...new Set(articles.map(a => a.source))].length} sources · All caught up
        </p>
      )}
    </div>
  )
}
