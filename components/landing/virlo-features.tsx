"use client"

import { motion } from "framer-motion"
import { Orbit, Sparkles, Radio, TrendingUp, Eye, Users } from "lucide-react"

const features = [
  {
    icon: Orbit,
    name: "Orbit",
    title: "Trend Discovery",
    description: "Discover emerging trends and topics before they go mainstream. Real-time analysis of social signals across platforms.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    name: "Comet", 
    title: "Monitoring & Tracking",
    description: "Track topics that matter to you. Get instant alerts when trends shift or new stories emerge in your areas of interest.",
    gradient: "from-accent to-purple-500",
  },
  {
    icon: Radio,
    name: "Satellite",
    title: "Creator Deep-Dives",
    description: "Understand the influencers shaping narratives. Detailed analytics on creators driving conversations.",
    gradient: "from-orange-500 to-amber-500",
  },
]

const capabilities = [
  {
    icon: TrendingUp,
    title: "AI Reporting Engine",
    description: "Journalism-grade articles generated from verified sources and trend data.",
  },
  {
    icon: Eye,
    title: "Real-Time Insights",
    description: "Live sentiment analysis and topic tracking updated every minute.",
  },
  {
    icon: Users,
    title: "Conversational News",
    description: "Ask questions about any story and get AI-powered context and analysis.",
  },
]

export function VirloFeatures() {
  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-4">
            Powered by Virlo
          </p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-balance">
            Social Intelligence That Powers Real Journalism
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Virlo provides the real-time social data layer that transforms how we discover, 
            verify, and report on stories that matter.
          </p>
        </motion.div>

        {/* Virlo Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
                {/* Icon */}
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {feature.name}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Platform Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h3 className="font-serif text-2xl md:text-3xl font-medium">
            Built for Modern Journalism
          </h3>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary mb-4">
                <cap.icon className="h-6 w-6 text-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {cap.title}
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {cap.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
