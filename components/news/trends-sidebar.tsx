"use client"

import { motion } from "framer-motion"
import { TrendingUp, ArrowUpRight, Zap } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { trendingTopics } from "@/lib/mock-data"

export function TrendsSidebar() {
  return (
    <aside className="space-y-6">
      {/* Virlo Trends Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Virlo Trends</h3>
              <p className="text-xs text-muted-foreground">Real-time intelligence</p>
            </div>
          </div>
          <Link 
            href="/trends" 
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {trendingTopics.slice(0, 5).map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group flex items-start gap-3"
            >
              <span className="text-sm font-medium text-muted-foreground w-5">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <Link 
                  href={`/trends?topic=${encodeURIComponent(topic.title)}`}
                  className="block"
                >
                  <h4 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
                    {topic.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{topic.category}</span>
                    <span className="text-xs text-emerald-500 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      +{topic.growth}%
                    </span>
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Daily Brief Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border border-border bg-gradient-to-br from-accent/5 to-transparent p-6"
      >
        <h3 className="font-serif text-lg font-medium text-foreground mb-2">
          Today&apos;s Brief
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your AI-curated summary of the most important stories and trends.
        </p>
        <Link 
          href="/news#daily-brief"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          Read the brief
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </aside>
  )
}
