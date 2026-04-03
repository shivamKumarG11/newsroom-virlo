"use client"

import { motion, AnimatePresence } from "framer-motion"
import { 
  Database, 
  Filter, 
  Tags, 
  TrendingUp, 
  Brain, 
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight
} from "lucide-react"
import { PipelineState, PipelineStep } from "@/lib/pipeline"
import { cn } from "@/lib/utils"

const STEP_ICONS: Record<string, React.ElementType> = {
  ingestion: Database,
  filtering: Filter,
  enrichment: Tags,
  virlo: TrendingUp,
  reasoning: Brain,
  output: CheckCircle2
}

const STEP_COLORS: Record<string, string> = {
  ingestion: 'from-blue-500 to-cyan-500',
  filtering: 'from-purple-500 to-pink-500',
  enrichment: 'from-amber-500 to-orange-500',
  virlo: 'from-accent to-purple-600',
  reasoning: 'from-emerald-500 to-teal-500',
  output: 'from-green-500 to-emerald-500'
}

interface PipelineVisualizationProps {
  pipeline: PipelineState | null
  variant?: 'horizontal' | 'vertical' | 'compact'
  showDetails?: boolean
}

function StepIcon({ step, className }: { step: PipelineStep; className?: string }) {
  const Icon = STEP_ICONS[step.id] || CheckCircle2
  
  return (
    <div className={cn(
      "relative flex items-center justify-center w-10 h-10 rounded-full",
      "transition-all duration-300",
      step.status === 'pending' && "bg-muted text-muted-foreground",
      step.status === 'processing' && `bg-gradient-to-r ${STEP_COLORS[step.id]} text-white shadow-lg`,
      step.status === 'completed' && `bg-gradient-to-r ${STEP_COLORS[step.id]} text-white`,
      step.status === 'error' && "bg-destructive text-destructive-foreground",
      className
    )}>
      {step.status === 'processing' ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Icon className="w-5 h-5" />
      )}
      
      {step.status === 'processing' && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r opacity-50",
            STEP_COLORS[step.id]
          )}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  )
}

function StepOutput({ output }: { output: unknown }) {
  if (!output || typeof output !== 'object') return null
  
  const entries = Object.entries(output as Record<string, unknown>).slice(0, 4)
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2 text-xs text-muted-foreground space-y-1"
    >
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
          <span className="font-medium text-foreground">
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
          </span>
        </div>
      ))}
    </motion.div>
  )
}

export function PipelineVisualization({ 
  pipeline, 
  variant = 'horizontal',
  showDetails = true 
}: PipelineVisualizationProps) {
  if (!pipeline) return null
  
  const isHorizontal = variant === 'horizontal'
  const isCompact = variant === 'compact'
  
  if (isCompact) {
    return (
      <div className="flex items-center gap-1">
        {pipeline.steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                step.status === 'pending' && "bg-muted",
                step.status === 'processing' && "bg-accent animate-pulse",
                step.status === 'completed' && "bg-green-500",
                step.status === 'error' && "bg-destructive"
              )}
            />
            {index < pipeline.steps.length - 1 && (
              <div className={cn(
                "w-3 h-0.5 mx-0.5",
                step.status === 'completed' ? 'bg-green-500' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={cn(
      "relative",
      isHorizontal ? "flex items-start gap-4 overflow-x-auto pb-4" : "space-y-4"
    )}>
      {pipeline.steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "relative",
            isHorizontal ? "flex flex-col items-center min-w-[140px]" : "flex gap-4"
          )}
        >
          {/* Connector line */}
          {index > 0 && (
            <motion.div
              className={cn(
                isHorizontal 
                  ? "absolute left-0 top-5 -translate-x-full h-0.5 w-4"
                  : "absolute top-0 left-5 -translate-y-full w-0.5 h-4",
                pipeline.steps[index - 1].status === 'completed' 
                  ? 'bg-green-500' 
                  : 'bg-border'
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: (index - 1) * 0.1 + 0.3 }}
            />
          )}
          
          {/* Step icon */}
          <StepIcon step={step} />
          
          {/* Step info */}
          <div className={cn(
            isHorizontal ? "text-center mt-2" : "flex-1"
          )}>
            <p className={cn(
              "font-medium text-sm transition-colors",
              step.status === 'processing' && "text-accent",
              step.status === 'completed' && "text-foreground",
              step.status === 'pending' && "text-muted-foreground"
            )}>
              {step.name}
            </p>
            
            {showDetails && (
              <>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-[140px]">
                  {step.description}
                </p>
                
                {step.duration && (
                  <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{step.duration}ms</span>
                  </div>
                )}
                
                <AnimatePresence>
                  {step.status === 'completed' && step.output && showDetails && (
                    <StepOutput output={step.output} />
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>
      ))}
      
      {/* Progress indicator */}
      {pipeline.isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 text-green-600 dark:text-green-400"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Complete</span>
        </motion.div>
      )}
    </div>
  )
}

// Minimal inline version for search results
export function PipelineIndicator({ 
  isProcessing, 
  stepName 
}: { 
  isProcessing: boolean
  stepName?: string 
}) {
  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span>{stepName || 'Processing...'}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
