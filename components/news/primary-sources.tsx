"use client"

import { ExternalLink, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"
import { SourceBadge } from "@/components/news/source-badge"
import { formatTimeAgo } from "@/lib/news-api"
import { cn } from "@/lib/utils"
import type { NormalizedNewsItem } from "@/app/api/news/route"

interface PrimarySourcesProps {
  articles: NormalizedNewsItem[]
  query?: string
  className?: string
  variant?: 'card' | 'inline'
  maxSources?: number
}

/**
 * Primary Sources Section
 * Displays a clean, verifiable list of real source articles.
 * Shows on search results, article pages, and reports.
 */
export function PrimarySources({
  articles,
  query,
  className,
  variant = 'card',
  maxSources = 8,
}: PrimarySourcesProps) {
  // De-duplicate by source name, keep most recent per source
  const bySource = new Map<string, NormalizedNewsItem>()
  for (const article of articles) {
    const existing = bySource.get(article.source)
    if (!existing || new Date(article.publishedAt) > new Date(existing.publishedAt)) {
      bySource.set(article.source, article)
    }
  }

  const sources = [...bySource.values()].slice(0, maxSources)
  const totalArticles = articles.length
  const uniqueSources = bySource.size

  if (sources.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border border-border",
        variant === 'card' ? "bg-card p-5" : "bg-secondary/20 p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Primary Sources</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {query
                ? `This report is based on ${totalArticles} verified article${totalArticles !== 1 ? 's' : ''} from ${uniqueSources} outlet${uniqueSources !== 1 ? 's' : ''}`
                : `${totalArticles} articles from ${uniqueSources} verified source${uniqueSources !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {/* Source count pill */}
        <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {/* Source list */}
      <div className="space-y-1.5">
        {sources.map((article, i) => (
          <motion.a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "group flex items-center gap-3 p-2.5 rounded-lg",
              "hover:bg-secondary/60 transition-colors cursor-pointer"
            )}
          >
            {/* Source badge */}
            <SourceBadge source={article.source} size="sm" className="flex-shrink-0" />

            {/* Title */}
            <span className="flex-1 text-xs text-foreground line-clamp-1 group-hover:text-accent transition-colors">
              {article.title}
            </span>

            {/* Right side: time + external link */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <span 
                className="text-[10px] text-muted-foreground hidden sm:block"
                suppressHydrationWarning
              >
                {formatTimeAgo(article.publishedAt)}
              </span>
              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </motion.a>
        ))}
      </div>

      {/* Footer note */}
      {uniqueSources > maxSources && (
        <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border">
          + {uniqueSources - maxSources} additional sources
        </p>
      )}
    </motion.div>
  )
}

/**
 * Compact inline version for sidebars
 */
export function PrimarySourcesCompact({
  articles,
  className,
}: {
  articles: NormalizedNewsItem[]
  className?: string
}) {
  const sources = [...new Set(articles.map(a => a.source))].slice(0, 5)

  if (sources.length === 0) return null

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        {sources.length} verified sources
      </p>
      <div className="flex flex-wrap gap-1">
        {sources.map((source, i) => {
          const article = articles.find(a => a.source === source)
          return (
            <SourceBadge key={i} source={source} url={article?.url} size="sm" />
          )
        })}
      </div>
    </div>
  )
}
