"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  ArrowUpRight,
  Zap,
  Search,
  Orbit,
  Sparkles,
  Radio,
  BarChart3,
  Users,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { trendingTopics } from "@/lib/mock-data"
import { useVirlo } from "@/lib/virlo-context"
import { VirloConnect } from "@/components/virlo-connect"
import { cn } from "@/lib/utils"

const timeframes = ["24h", "7d", "30d", "90d"] as const
const categories = ["All", "Technology", "Climate", "Finance", "Society", "Culture"]

// Extended mock data for the trends page
const extendedTrends = [
  ...trendingTopics,
  { id: "7", title: "Space Tourism", category: "Technology", growth: 289, volume: "540K", sentiment: "positive" as const },
  { id: "8", title: "Plant-Based Food", category: "Society", growth: 156, volume: "720K", sentiment: "positive" as const },
  { id: "9", title: "Cryptocurrency Regulation", category: "Finance", growth: 234, volume: "1.1M", sentiment: "neutral" as const },
  { id: "10", title: "Mental Health Apps", category: "Technology", growth: 312, volume: "890K", sentiment: "positive" as const },
  { id: "11", title: "Renewable Energy Storage", category: "Climate", growth: 445, volume: "670K", sentiment: "positive" as const },
  { id: "12", title: "Remote Learning", category: "Society", growth: 123, volume: "450K", sentiment: "neutral" as const },
]

const risingCreators = [
  { name: "TechInsider", platform: "YouTube", followers: "2.4M", growth: 45, category: "Technology" },
  { name: "ClimateNow", platform: "TikTok", followers: "890K", growth: 78, category: "Climate" },
  { name: "FinanceDaily", platform: "Twitter", followers: "1.2M", growth: 32, category: "Finance" },
  { name: "FutureWatch", platform: "Instagram", followers: "670K", growth: 56, category: "Technology" },
]

export default function TrendsPage() {
  const { isConnected } = useVirlo()
  const [selectedTimeframe, setSelectedTimeframe] = useState<typeof timeframes[number]>("7d")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTrends = extendedTrends.filter(trend => {
    const matchesCategory = selectedCategory === "All" || trend.category === selectedCategory
    const matchesSearch = trend.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const sentimentColors = {
    positive: "bg-emerald-500",
    negative: "bg-red-500",
    neutral: "bg-amber-500"
  }

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="border-b border-border bg-gradient-to-b from-accent/5 to-transparent">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium text-accent">Powered by Virlo</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-2">
                Trend Intelligence
              </h1>
              <p className="text-muted-foreground max-w-lg">
                Real-time social signals and emerging topics. Discover what&apos;s driving conversations across platforms.
              </p>
            </div>
            
            {!isConnected && (
              <div className="lg:w-80">
                <VirloConnect />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Virlo Features Overview */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Orbit, name: "Orbit", desc: "Trend & topic discovery", active: true },
              { icon: Sparkles, name: "Comet", desc: "Monitoring & tracking", active: true },
              { icon: Radio, name: "Satellite", desc: "Creator deep-dives", active: true },
            ].map((feature) => (
              <motion.div
                key={feature.name}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                  feature.active 
                    ? "border-accent/30 bg-accent/5" 
                    : "border-border bg-card"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  feature.active ? "bg-accent/10" : "bg-secondary"
                )}>
                  <feature.icon className={cn(
                    "h-6 w-6",
                    feature.active ? "text-accent" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.name}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_320px] gap-12">
          {/* Trends Grid */}
          <div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search trends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-card border-border"
                />
              </div>
              <div className="flex gap-2">
                {timeframes.map((tf) => (
                  <Button
                    key={tf}
                    variant={selectedTimeframe === tf ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={cn(
                      "h-10",
                      selectedTimeframe === tf && "bg-foreground text-background"
                    )}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    selectedCategory === cat
                      ? "bg-foreground text-background"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Trends List */}
            <div className="space-y-4">
              {filteredTrends.map((trend, index) => (
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-semibold text-muted-foreground/50 w-8">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                        {trend.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{trend.category}</span>
                        <span className="text-xs text-muted-foreground">{trend.volume} mentions</span>
                        <div className="flex items-center gap-1">
                          <div className={cn("h-2 w-2 rounded-full", sentimentColors[trend.sentiment])} />
                          <span className="text-xs text-muted-foreground capitalize">{trend.sentiment}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        +{trend.growth}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs last {selectedTimeframe}</span>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Analytics Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Quick Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Signals</span>
                  <span className="font-semibold text-foreground">12.4M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Active Topics</span>
                  <span className="font-semibold text-foreground">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Sentiment</span>
                  <span className="font-semibold text-emerald-500">Positive</span>
                </div>
              </div>
            </motion.div>

            {/* Rising Creators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">Rising Creators</h3>
              </div>
              <div className="space-y-4">
                {risingCreators.map((creator) => (
                  <div key={creator.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{creator.name}</p>
                      <p className="text-xs text-muted-foreground">{creator.platform} • {creator.followers}</p>
                    </div>
                    <span className="text-xs text-emerald-500 font-medium">+{creator.growth}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Virlo CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 p-6"
            >
              <MessageCircle className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Want Deeper Insights?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your Virlo API key to unlock real-time trend data, creator analytics, and sentiment tracking.
              </p>
              <a 
                href="https://usevirlo.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent hover:underline"
              >
                Learn more about Virlo
              </a>
            </motion.div>
          </aside>
        </div>
      </div>
    </div>
  )
}
