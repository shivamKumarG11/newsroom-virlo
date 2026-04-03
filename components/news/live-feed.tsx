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
  Zap
} from "lucide-react"
import { NormalizedArticle, getCachedNews } from "@/lib/news-api"
import { articles as mockArticles, Article } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PipelineVisualization } from "@/components/pipeline/pipeline-visualization"
import { createPipeline, runPipeline, PipelineState } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

type CombinedArticle = NormalizedArticle | Article

interface LiveFeedProps {
  initialArticles?: CombinedArticle[]
  showPipeline?: boolean
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function LiveArticleCard({ 
  article, 
  index,
  isNew 
}: { 
  article: CombinedArticle
  index: number
  isNew?: boolean
}) {
  const slug = 'slug' in article ? article.slug : article.id
  const category = 'category' in article ? article.category : 'News'
  const source = 'source' in article && typeof article.source === 'string' ? article.source : 'Pulse'
  
  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative flex gap-4 p-4 rounded-xl transition-all",
        "hover:bg-secondary/50",
        isNew && "bg-accent/5 border border-accent/20"
      )}
    >
      {/* Live indicator for new articles */}
      {isNew && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        </div>
      )}
      
      {/* Image */}
      <Link 
        href={`/news/${slug}`}
        className="block w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary"
      >
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {category}
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>
        
        <Link href={`/news/${slug}`}>
          <h3 className="font-medium text-sm text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            {source}
          </span>
          {'virloData' in article && article.virloData && (
            <span className="flex items-center gap-1 text-accent">
              <TrendingUp className="w-3 h-3" />
              {article.virloData.trendScore}% trending
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export function LiveFeed({ initialArticles, showPipeline = false }: LiveFeedProps) {
  const [articles, setArticles] = useState<CombinedArticle[]>(initialArticles || [])
  const [isLoading, setIsLoading] = useState(!initialArticles)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [pipeline, setPipeline] = useState<PipelineState | null>(null)
  const [newArticleIds, setNewArticleIds] = useState<Set<string>>(new Set())
  const loaderRef = useRef<HTMLDivElement>(null)
  
  // Load articles
  const loadArticles = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
      
      // Show pipeline for refresh
      if (showPipeline) {
        const newPipeline = createPipeline('article', 'Loading latest news')
        setPipeline(newPipeline)
        await runPipeline(newPipeline, (state) => setPipeline({ ...state }))
      }
    } else {
      setIsLoading(true)
    }
    
    try {
      const liveArticles = await getCachedNews()
      
      // Combine with mock articles for more content
      const combined: CombinedArticle[] = [...liveArticles, ...mockArticles]
      
      // Sort by date
      combined.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      
      if (isRefresh) {
        // Track new articles
        const currentIds = new Set(articles.map(a => a.id))
        const newIds = combined.filter(a => !currentIds.has(a.id)).map(a => a.id)
        setNewArticleIds(new Set(newIds))
        
        // Clear new indicator after 5 seconds
        setTimeout(() => setNewArticleIds(new Set()), 5000)
      }
      
      setArticles(combined)
      setHasMore(combined.length > page * 10)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [articles, page, showPipeline])
  
  // Initial load
  useEffect(() => {
    if (!initialArticles) {
      loadArticles()
    }
  }, [])
  
  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(p => p + 1)
        }
      },
      { threshold: 0.1 }
    )
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }
    
    return () => observer.disconnect()
  }, [hasMore, isLoading])
  
  // Display articles based on pagination
  const displayedArticles = articles.slice(0, page * 10)
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent" />
          <h3 className="font-medium text-foreground">Live Feed</h3>
          <span className="text-xs text-muted-foreground">
            {articles.length} articles
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadArticles(true)}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>
      
      {/* Pipeline visualization */}
      <AnimatePresence>
        {showPipeline && pipeline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-secondary/30 rounded-xl p-4 mb-4"
          >
            <PipelineVisualization pipeline={pipeline} variant="compact" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Articles */}
      <div className="space-y-1">
        {isLoading && articles.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <AnimatePresence>
              {displayedArticles.map((article, index) => (
                <LiveArticleCard
                  key={article.id}
                  article={article}
                  index={index}
                  isNew={newArticleIds.has(article.id)}
                />
              ))}
            </AnimatePresence>
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={loaderRef} className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {!hasMore && articles.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                You&apos;ve reached the end of the feed
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
