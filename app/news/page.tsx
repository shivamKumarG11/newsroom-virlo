"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Zap } from "lucide-react"
import { Metadata } from "next"
import { ArticleCard } from "@/components/news/article-card"
import { TrendsSidebar } from "@/components/news/trends-sidebar"
import { DailyBrief } from "@/components/news/daily-brief"
import { LiveFeed } from "@/components/news/live-feed"
import { SearchBar } from "@/components/search/search-bar"
import { PipelineVisualization } from "@/components/pipeline/pipeline-visualization"
import { getFeaturedArticle, getRecentArticles } from "@/lib/mock-data"
import { getCachedNews } from "@/lib/news-api"
import { createPipeline, runPipeline, PipelineState } from "@/lib/pipeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewsPage() {
  const featuredArticle = getFeaturedArticle()
  const recentArticles = getRecentArticles(5).filter(a => !a.featured)
  const [pipeline, setPipeline] = useState<PipelineState | null>(null)
  const [showPipeline, setShowPipeline] = useState(true)
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Run initial pipeline on load
  useEffect(() => {
    const initPipeline = async () => {
      const newPipeline = createPipeline('article', 'Loading news feed')
      setPipeline(newPipeline)
      await runPipeline(newPipeline, (state) => setPipeline({ ...state }))
      
      // Hide pipeline after completion + delay
      setTimeout(() => setShowPipeline(false), 2000)
    }
    
    initPipeline()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/50 to-transparent">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{today}</p>
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
                Latest News
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-powered journalism backed by real-time social intelligence.
            </p>
          </div>
          
          {/* Search Bar */}
          <SearchBar variant="default" className="max-w-2xl" />
        </div>
      </section>

      {/* Pipeline Visualization - Shows on initial load */}
      {showPipeline && pipeline && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-border bg-secondary/20"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                Intelligence Pipeline
              </span>
              {!pipeline.isComplete && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  Processing...
                </span>
              )}
            </div>
            <PipelineVisualization 
              pipeline={pipeline} 
              variant="horizontal" 
              showDetails={false}
            />
          </div>
        </motion.section>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          {/* Main Column */}
          <div className="space-y-12">
            {/* Featured Article */}
            {featuredArticle && (
              <section>
                <ArticleCard article={featuredArticle} variant="featured" />
              </section>
            )}

            {/* Daily Brief */}
            <section>
              <DailyBrief />
            </section>

            {/* Content Tabs */}
            <section>
              <Tabs defaultValue="top" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="top" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Top Stories
                  </TabsTrigger>
                  <TabsTrigger value="live" className="gap-2">
                    <Zap className="w-4 h-4" />
                    Live Feed
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="top">
                  <div className="grid md:grid-cols-2 gap-8">
                    {recentArticles.map((article, index) => (
                      <ArticleCard key={article.id} article={article} index={index} />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="live">
                  <LiveFeed showPipeline={true} />
                </TabsContent>
              </Tabs>
            </section>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <TrendsSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
