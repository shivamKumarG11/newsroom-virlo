"use client"

import { motion } from "framer-motion"
import { Calendar, Sparkles, ChevronRight } from "lucide-react"
import Link from "next/link"
import { dailyBrief } from "@/lib/mock-data"

export function DailyBrief() {
  return (
    <motion.section
      id="daily-brief"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/10 to-transparent px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Today&apos;s Brief
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {dailyBrief.date}
              </div>
            </div>
          </div>
          <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
            AI Generated
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary */}
        <p className="text-foreground leading-relaxed mb-6">
          {dailyBrief.summary}
        </p>

        {/* Key Points */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Key Points
          </h3>
          <ul className="space-y-2">
            {dailyBrief.keyPoints.map((point, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground">{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-border">
          <Link 
            href={`/news/${dailyBrief.topStories[0]}`}
            className="group flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              Read the top story
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
