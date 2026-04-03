"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Database, Brain, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search/search-bar"
import { VirloConnect } from "@/components/virlo-connect"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements - Warm Editorial Aesthetic */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/8 via-transparent to-transparent" />
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] rounded-full bg-accent/8 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        
        {/* Subtle texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-sm px-4 py-2 text-sm">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-muted-foreground">6-Layer AI Intelligence Pipeline</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance max-w-5xl leading-tight text-foreground"
          >
            The Intelligence Engine for{" "}
            <span className="text-accent inline-block">Modern News</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance"
          >
            Not just AI-generated text. A complete intelligence system that ingests, 
            processes, and enriches news through a visible multi-agent pipeline.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 w-full max-w-2xl"
          >
            <SearchBar 
              variant="hero" 
              placeholder="Search news or ask a question..."
            />
          </motion.div>

          {/* Pipeline Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-2 md:gap-4 flex-wrap"
          >
            {[
              { icon: Database, label: "Ingest" },
              { icon: Sparkles, label: "Filter" },
              { icon: TrendingUp, label: "Enrich" },
              { icon: Brain, label: "Reason" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
                  <step.icon className="w-4 h-4 text-accent" />
                  <span className="text-sm text-muted-foreground">{step.label}</span>
                </div>
                {i < 3 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground mx-1" />
                )}
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 gap-2"
            >
              <Link href="/news">
                Explore News Feed
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8"
            >
              <Link href="#intelligence-engine">
                See How It Works
              </Link>
            </Button>
          </motion.div>

          {/* Virlo Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 w-full flex justify-center"
          >
            <VirloConnect />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 pt-8 border-t border-border w-full max-w-3xl"
          >
            {[
              { value: "50+", label: "News Sources" },
              { value: "10K+", label: "Articles/Day" },
              { value: "< 2s", label: "Processing Time" },
              { value: "6", label: "AI Layers" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-semibold text-foreground">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
