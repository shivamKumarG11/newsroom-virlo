"use client"

import { motion } from "framer-motion"
import { TrendingUp, MessageCircle, Eye, Zap, ExternalLink } from "lucide-react"
import type { Article } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface VirloInsightsProps {
  data: Article["virloData"]
}

export function VirloInsights({ data }: VirloInsightsProps) {
  if (!data) return null

  const sentimentColors = {
    positive: "text-emerald-500 bg-emerald-500/10",
    negative: "text-red-500 bg-red-500/10",
    neutral: "text-amber-500 bg-amber-500/10"
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/10 to-transparent px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">Backed by Virlo Data</h3>
            <p className="text-xs text-muted-foreground">Real-time intelligence</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Trend Score & Sentiment */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Trend Score</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{data.trendScore}%</p>
          </div>
          <div className="rounded-xl bg-secondary/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sentiment</span>
            </div>
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
              sentimentColors[data.sentiment]
            )}>
              {data.sentiment}
            </span>
          </div>
        </div>

        {/* Related Topics */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Related Topics
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.relatedTopics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs text-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Viral Content */}
        {data.viralContent && data.viralContent.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Related Viral Content
            </h4>
            <div className="space-y-2">
              {data.viralContent.map((content, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg bg-secondary/30 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {content.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{content.platform}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {content.views}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learn More */}
        <a
          href="https://usevirlo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-accent hover:underline pt-2"
        >
          Learn more about Virlo
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </motion.aside>
  )
}
