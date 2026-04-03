"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Clock, 
  TrendingUp, 
  ExternalLink,
  Filter,
  Sparkles
} from "lucide-react"
import { SearchBar } from "@/components/search/search-bar"
import { PipelineVisualization } from "@/components/pipeline/pipeline-visualization"
import { VisualIntelligenceReport } from "@/components/report/visual-intelligence-report"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { search, SearchResponse, SearchResult } from "@/lib/search"
import { createPipeline, runPipeline, PipelineState } from "@/lib/pipeline"
import { generateVisualReport } from "@/lib/report-generator"
import { VirloProvider } from "@/lib/virlo-context"
import { cn } from "@/lib/utils"

function SearchResultCard({ result, index }: { result: SearchResult; index: number }) {
  const article = result.article
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/news/${'slug' in article ? article.slug : article.id}`}
        className="group block p-6 bg-card border border-border rounded-xl hover:border-accent/50 hover:shadow-lg transition-all"
      >
        <div className="flex gap-4">
          {/* Image */}
          <div className="hidden sm:block w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {'category' in article ? article.category : 'News'}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  result.matchType === 'exact' ? "border-green-500 text-green-600" : "border-accent text-accent"
                )}
              >
                {result.matchType === 'exact' ? 'Exact Match' : 'Semantic Match'}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                Score: {result.score.toFixed(1)}
              </span>
            </div>
            
            <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
              {article.title}
            </h3>
            
            {result.highlights.length > 0 && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                ...{result.highlights[0]}...
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
              {'source' in article && (
                <span className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  {article.source}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [pipeline, setPipeline] = useState<PipelineState | null>(null)
  const [report, setReport] = useState<any>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null)
      setPipeline(null)
      setReport(null)
      return
    }
    
    setIsSearching(true)
    setQuery(searchQuery)
    setReport(null)
    setReportLoading(false)
    
    // Create and run pipeline
    const newPipeline = createPipeline('search', searchQuery)
    setPipeline(newPipeline)
    
    // Run pipeline visualization
    await runPipeline(newPipeline, (state) => {
      setPipeline({ ...state })
    })
    
    // Perform actual search
    const searchResults = await search(searchQuery)
    setResults(searchResults)
    setIsSearching(false)
    
    // Generate visual report after search completes
    if (searchResults && searchResults.results.length > 0) {
      setReportLoading(true)
      try {
        const articles = searchResults.results.map(r => r.article)
        const generatedReport = await generateVisualReport(searchQuery, articles as any)
        setReport(generatedReport)
      } catch (error) {
        console.error('Report generation failed:', error)
      } finally {
        setReportLoading(false)
      }
    }
  }, [])
  
  // Initial search from URL
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery, performSearch])
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Search Header */}
        <section className="border-b border-border bg-gradient-to-b from-secondary/50 to-transparent">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <Link href="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to News
            </Link>
            
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-6">
              Search Intelligence
            </h1>
            
            <SearchBar 
              variant="hero" 
              onSearch={performSearch}
              placeholder="Search news, topics, or ask a question..."
            />
          </div>
        </section>
        
        {/* Pipeline Visualization */}
        <AnimatePresence>
          {pipeline && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-border bg-secondary/20"
            >
              <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <h2 className="font-medium text-foreground">Intelligence Pipeline</h2>
                  {!pipeline.isComplete && (
                    <span className="text-sm text-muted-foreground animate-pulse">Processing...</span>
                  )}
                </div>
                
                <PipelineVisualization 
                  pipeline={pipeline} 
                  variant="horizontal"
                  showDetails={true}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
        
        {/* Results */}
        <section className="mx-auto max-w-4xl px-6 py-12">
          {results && (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-muted-foreground">
                    Found <span className="font-medium text-foreground">{results.totalResults}</span> results for &quot;{query}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Processed in {results.processingTime}ms
                  </p>
                </div>
                
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
              
              {/* Related Topics */}
              {results.relatedTopics.length > 0 && (
                <div className="mb-8">
                  <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Related Topics
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.relatedTopics.map((topic, i) => (
                      <Button
                        key={i}
                        variant="secondary"
                        size="sm"
                        onClick={() => performSearch(topic)}
                        className="text-xs"
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Visual Intelligence Report */}
              {report && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12 border-t border-border pt-12"
                >
                  <VisualIntelligenceReport report={report} isLoading={reportLoading} />
                </motion.div>
              )}

              {/* Results List */}
              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <SearchResultCard key={result.article.id} result={result} index={index} />
                ))}
              </div>
              
              {/* No results */}
              {results.results.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
                    No results found for &quot;{query}&quot;
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try different keywords or browse our trending topics
                  </p>
                </div>
              )}
            </>
          )}
          
          {/* Initial state */}
          {!results && !isSearching && (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                AI-Powered Search
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Search across thousands of articles with semantic understanding. 
                Try asking questions or searching for abstract concepts.
              </p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <VirloProvider>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <SearchContent />
      </Suspense>
    </VirloProvider>
  )
}
