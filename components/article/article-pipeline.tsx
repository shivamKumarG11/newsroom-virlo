"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { PipelineVisualization } from "@/components/pipeline/pipeline-visualization"
import { createPipeline, runPipeline, PipelineState } from "@/lib/pipeline"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ArticlePipelineProps {
  articleTitle: string
}

export function ArticlePipeline({ articleTitle }: ArticlePipelineProps) {
  const [pipeline, setPipeline] = useState<PipelineState | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)
  
  // Start pipeline on mount
  useEffect(() => {
    const startPipeline = async () => {
      const newPipeline = createPipeline('article', articleTitle)
      setPipeline(newPipeline)
      await runPipeline(newPipeline, (state) => setPipeline({ ...state }))
    }
    
    startPipeline()
  }, [articleTitle])
  
  // Auto-collapse after completion
  useEffect(() => {
    if (pipeline?.isComplete) {
      const timeout = setTimeout(() => {
        setIsExpanded(false)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [pipeline?.isComplete])
  
  if (isDismissed || !pipeline) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="border-b border-border bg-secondary/20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between py-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm"
            >
              <Sparkles className={cn(
                "w-4 h-4",
                pipeline.isComplete ? "text-green-500" : "text-accent animate-pulse"
              )} />
              <span className="font-medium text-foreground">
                Intelligence Pipeline
              </span>
              {!pipeline.isComplete && (
                <span className="text-xs text-muted-foreground">
                  Processing step {pipeline.currentStepIndex + 1} of {pipeline.steps.length}...
                </span>
              )}
              {pipeline.isComplete && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  Complete
                </span>
              )}
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsDismissed(true)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Pipeline visualization */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pb-6 overflow-hidden"
              >
                <PipelineVisualization 
                  pipeline={pipeline} 
                  variant="horizontal"
                  showDetails={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
