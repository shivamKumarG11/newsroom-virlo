"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Zap, ChevronDown, Wifi, Youtube, Instagram, TrendingUp, Sparkles } from "lucide-react"

// ── Slideshow images ──────────────────────────────────────────────────────────
const SLIDES = [
  { local: "/hero/slide-1.jpg", fallback: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1920&q=75", label: "Global Events" },
  { local: "/hero/slide-2.jpg", fallback: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1920&q=75", label: "Breaking News" },
  { local: "/hero/slide-3.jpg", fallback: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=75", label: "Intelligence" },
  { local: "/hero/slide-4.jpg", fallback: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=75", label: "Markets" },
  { local: "/hero/slide-5.jpg", fallback: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=75", label: "Technology" },
]

// Professional Light Mode Platforms
const PLATFORMS = [
  { icon: Youtube, label: "YouTube", color: "text-zinc-600", bg: "bg-white/0 border-zinc-200" },
  { icon: Instagram, label: "Instagram", color: "text-amber-700", bg: "bg-white/0 border-amber-200" },
  { icon: TrendingUp, label: "TikTok", color: "text-zinc-800", bg: "bg-white/0 border-zinc-300" },
]

// Framer Motion Variants for Staggered Entrances
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 60, damping: 20 }
  }
}

export function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrent(p => (p + 1) % SLIDES.length), 5000)
    return () => clearInterval(id)
  }, [])

  function scrollToTrending() {
    const el = document.getElementById("trending")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FAFAFA]">

      {/* ── Background Slideshow (Light Overlay) ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={SLIDES[current].local}
            alt={SLIDES[current].label}
            className="w-full h-full object-cover"
            onError={e => {
              const img = e.target as HTMLImageElement
              if (img.src !== SLIDES[current].fallback) {
                img.src = SLIDES[current].fallback
              } else {
                img.style.display = "none"
              }
            }}
          />
          {/* Bright, welcoming overlays instead of dark ones */}
          <div className="absolute inset-0 bg-white/0" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/0 to-white/0" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-transparent to-white/0" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content Grid ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-32 pb-20 w-full mt-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-16 lg:gap-12 items-center">

          {/* ── Left: Hero Copy ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-black uppercase tracking-[0.25em] text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                Intelligence Engine v2.1
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {SLIDES[current].label}
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-zinc-900 leading-[0.9] mb-8">
              News without <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-amber-500 via-amber-700 to-zinc-600">
                the noise.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-zinc-600 leading-relaxed mb-12 font-medium max-w-xl">
              30+ global sources. Multi-provider AI synthesis. Real-time intelligence — surfaced, deduplicated, and distilled.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
              <Link
                href="/news"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-sm font-bold uppercase tracking-[0.15em] rounded-md hover:brightness-110 shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-0.5 group"
              >
                Latest News
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-300 bg-white/60 backdrop-blur-md text-zinc-900 text-sm font-bold uppercase tracking-[0.15em] rounded-md hover:bg-white hover:border-zinc-400 transition-all shadow-sm hover:-translate-y-0.5"
              >
                <Zap className="h-4 w-4 text-amber-500" />
                Search Intelligence
              </Link>
            </motion.div>

            {/* Slide indicators */}
            <motion.div variants={itemVariants} className="flex items-center gap-2 mt-14">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`transition-all duration-500 rounded-full ${i === current
                    ? "w-8 h-1.5 bg-gradient-to-r from-amber-500 to-zinc-400"
                    : "w-1.5 h-1.5 bg-zinc-300 hover:bg-zinc-400"
                    }`}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Social Intelligence Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="w-full lg:translate-y-4"
          >
            <div className="architectural-glass rounded-xl border border-zinc-200 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.06)] bg-white/90">

              {/* Card header */}
              <div className="bg-gradient-to-br from-[#FAFAFA] to-white border-b border-zinc-100 px-7 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Premium Logo Mark */}
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center shadow-sm">
                      <span className="font-serif text-xl font-bold text-amber-900 italic">V</span>
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-tight text-zinc-900">Virlo</p>
                      <p className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-500 uppercase">
                        Social Pulse Layer
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-200">
                    <Wifi className="h-3 w-3 text-amber-600 animate-pulse" />
                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest">Live</span>
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="px-7 py-6 space-y-6">
                <div>
                  <p className="text-sm font-bold text-zinc-900 mb-1 tracking-tight">
                    Real-time social pulse
                  </p>
                  <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                    Virlo monitors trending narratives across top networks. Signals refresh every 24 hours to separate signal from the noise.
                  </p>
                </div>

                {/* Platform badges */}
                <div className="grid grid-cols-3 gap-3">
                  {PLATFORMS.map(({ icon: Icon, label, color, bg }) => (
                    <div key={label} className={`flex flex-col items-center gap-2 py-4 rounded-lg border transition-colors shadow-sm ${bg}`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Ledger list */}
                <div className="space-y-2.5">
                  {[
                    "Trending computational models",
                    "Global sentiment vectors",
                    "Real-time volume metrics",
                    "Deduplicated insight feeds",
                  ].map((item, idx) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-xs text-zinc-600 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Call to Action */}
                <button
                  type="button"
                  onClick={scrollToTrending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all group shadow-sm"
                >
                  <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform text-amber-600" />
                  Explore What&apos;s Trending
                </button>

                <p className="text-[9px] font-mono text-zinc-400 text-center uppercase tracking-widest">
                  Powered by Virlo Intelligence
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
