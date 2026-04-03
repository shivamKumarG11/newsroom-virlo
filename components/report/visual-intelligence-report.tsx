'use client'

import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Calendar } from 'lucide-react'
import { ImageGrid } from './image-grid'
import type { VisualIntelligenceReport as ReportType } from '@/lib/report-generator'

interface VisualIntelligenceReportProps {
  report: ReportType
  isLoading?: boolean
}

export function VisualIntelligenceReport({ report, isLoading }: VisualIntelligenceReportProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!report || report.sections.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Unable to generate visual report. Please try again.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16"
    >
      {/* Header */}
      <div className="border-b border-border pb-8">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-accent/10 p-3">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-serif font-bold text-foreground">
              Visual Intelligence Report
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              {report.query}
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground">
              {report.summary}
            </p>
            <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(report.generatedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} />
                {(report.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Sections */}
      {report.sections.map((section, idx) => (
        <motion.section
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-6"
        >
          {/* Section Header */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
              {section.title}
            </h3>
            <p className="text-muted-foreground">
              {section.description}
            </p>
          </div>

          {/* Images Grid */}
          {section.images && section.images.length > 0 && (
            <ImageGrid
              images={section.images}
              columns={section.images.length <= 4 ? 2 : 3}
            />
          )}

          {/* Key Insights */}
          {section.insights && section.insights.length > 0 && (
            <div className="rounded-lg bg-secondary/50 p-6 border border-border">
              <h4 className="font-semibold text-foreground mb-4">Key Insights</h4>
              <ul className="space-y-3">
                {section.insights.map((insight, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-foreground">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.section>
      ))}

      {/* Footer */}
      <div className="border-t border-border pt-8">
        <p className="text-sm text-muted-foreground text-center">
          This Visual Intelligence Report was generated using advanced image analysis and curated from multiple sources.
          Images are sourced from Unsplash and Pexels.
        </p>
      </div>
    </motion.div>
  )
}
