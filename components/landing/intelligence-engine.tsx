"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Database, 
  Filter, 
  Tags, 
  TrendingUp, 
  Brain, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react"
import { IntelligenceStats } from "./intelligence-stats"
import { cn } from "@/lib/utils"

const PIPELINE_LAYERS = [
  {
    id: 'ingestion',
    icon: Database,
    name: 'Ingestion',
    title: 'Data Collection',
    description: 'Aggregating from 50+ trusted sources in real-time',
    metrics: ['50+ Sources', 'Real-time', '10K+ Articles/day'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'filtering',
    icon: Filter,
    name: 'Filtering',
    title: 'Quality Control',
    description: 'Removing noise and duplicates with smart algorithms',
    metrics: ['95% Accuracy', 'Deduplication', 'Relevance Scoring'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'enrichment',
    icon: Tags,
    name: 'Enrichment',
    title: 'Data Enhancement',
    description: 'Adding metadata, entities, and semantic tags',
    metrics: ['Entity Extraction', 'Auto-tagging', 'Categorization'],
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'virlo',
    icon: TrendingUp,
    name: 'Virlo Intelligence',
    title: 'Social Signals',
    description: 'Integrating trend data and creator insights',
    metrics: ['Trend Score', 'Sentiment', 'Viral Detection'],
    color: 'from-accent to-purple-600'
  },
  {
    id: 'reasoning',
    icon: Brain,
    name: 'AI Reasoning',
    title: 'Intelligence Layer',
    description: 'Synthesizing insights and generating analysis',
    metrics: ['GPT-4 Powered', 'Multi-perspective', 'Fact-checked'],
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'output',
    icon: CheckCircle2,
    name: 'Output',
    title: 'Final Delivery',
    description: 'Structured, verified intelligence ready for you',
    metrics: ['Quality Scored', 'Confidence Rated', 'Source Linked'],
    color: 'from-green-500 to-emerald-500'
  }
]

function AnimatedConnection({ isActive }: { isActive: boolean }) {
  return (
    <div className="hidden md:flex items-center justify-center w-12 relative">
      <div className="w-full h-0.5 bg-border relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          initial={{ width: 0 }}
          animate={{ width: isActive ? '100%' : 0 }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <motion.div
        className="absolute"
        animate={{ 
          x: isActive ? [0, 48, 0] : 0,
          opacity: isActive ? [1, 1, 0] : 0
        }}
        transition={{ 
          duration: 1.5, 
          repeat: isActive ? Infinity : 0,
          repeatDelay: 0.5
        }}
      >
        <Sparkles className="w-3 h-3 text-accent" />
      </motion.div>
    </div>
  )
}

function PipelineLayer({ 
  layer, 
  index, 
  isActive, 
  isComplete 
}: { 
  layer: typeof PIPELINE_LAYERS[0]
  index: number
  isActive: boolean
  isComplete: boolean
}) {
  const Icon = layer.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className={cn(
        "relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-500",
        isActive && "bg-card border-accent shadow-lg shadow-accent/10",
        !isActive && isComplete && "bg-card/50 border-border",
        !isActive && !isComplete && "bg-secondary/30 border-border/50"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "relative w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-500",
        isActive && `bg-gradient-to-r ${layer.color} text-white shadow-lg`,
        !isActive && isComplete && `bg-gradient-to-r ${layer.color} text-white opacity-80`,
        !isActive && !isComplete && "bg-secondary text-muted-foreground"
      )}>
        <Icon className="w-6 h-6" />
        
        {isActive && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-xl bg-gradient-to-r opacity-50",
              layer.color
            )}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      
      {/* Content */}
      <h4 className={cn(
        "text-sm font-medium mb-1 transition-colors",
        isActive ? "text-accent" : "text-foreground"
      )}>
        {layer.name}
      </h4>
      
      <p className="text-xs text-muted-foreground text-center mb-3">
        {layer.description}
      </p>
      
      {/* Metrics */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {layer.metrics.map((metric, i) => (
          <span
            key={i}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full transition-colors",
              isActive ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
            )}
          >
            {metric}
          </span>
        ))}
      </div>
      
      {/* Step number */}
      <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
      </div>
    </motion.div>
  )
}

export function IntelligenceEngine() {
  const [activeStep, setActiveStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  
  // Animate through steps
  useEffect(() => {
    if (!isAnimating) return
    
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % (PIPELINE_LAYERS.length + 1))
    }, 2000)
    
    return () => clearInterval(interval)
  }, [isAnimating])
  
  return (
    <section className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">The Intelligence Engine</span>
          </div>
          
          <h2 className="font-serif text-3xl md:text-5xl font-medium text-foreground mb-6 text-balance">
            From Raw Information to
            <br />
            <span className="text-accent">Structured Intelligence</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our 6-layer processing pipeline transforms raw news into actionable intelligence. 
            Every article passes through multiple AI agents for verification, enrichment, and analysis.
          </p>
        </motion.div>
        
        {/* Pipeline Visualization - Desktop */}
        <div className="hidden lg:flex items-start justify-center gap-2 mb-16">
          {PIPELINE_LAYERS.map((layer, index) => (
            <div key={layer.id} className="flex items-center">
              <PipelineLayer
                layer={layer}
                index={index}
                isActive={activeStep === index}
                isComplete={activeStep > index}
              />
              {index < PIPELINE_LAYERS.length - 1 && (
                <AnimatedConnection isActive={activeStep > index} />
              )}
            </div>
          ))}
        </div>
        
        {/* Pipeline Visualization - Mobile */}
        <div className="lg:hidden grid grid-cols-2 gap-4 mb-16">
          {PIPELINE_LAYERS.map((layer, index) => (
            <PipelineLayer
              key={layer.id}
              layer={layer}
              index={index}
              isActive={activeStep === index}
              isComplete={activeStep > index}
            />
          ))}
        </div>
        
        {/* Stats - Live from Database */}
        <IntelligenceStats />
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            See the pipeline in action on every search and article
          </p>
          <a
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl font-medium hover:bg-accent/90 transition-colors"
          >
            Explore the News Feed
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
