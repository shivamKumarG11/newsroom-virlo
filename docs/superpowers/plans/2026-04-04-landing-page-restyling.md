# Landing Page Restyling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Newsroom Virlo landing page into a "million-star" premium AI intelligence platform with a single, high-end dark aesthetic.

**Architecture:** We will replace the current "Warm Editorial" theme with a custom "Modern Intelligence" dark theme using Tailwind CSS. Each component on the landing page will be refactored for a cohesive, premium look featuring glassmorphism, ultra-thin borders, and authoritative typography.

**Tech Stack:** Next.js (App Router), Tailwind CSS v4, Framer Motion, Lucide React.

---

### Task 1: Global Theme & Base Styles

**Files:**
- Modify: `newsroom-virlo/app/globals.css`
- Modify: `newsroom-virlo/app/layout.tsx`

- [ ] **Step 1: Update `globals.css` with the new "Modern Intelligence" dark theme variables.**

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));

:root {
  --background: 240 10% 3.9%;    /* zinc-950 */
  --foreground: 0 0% 98%;        /* zinc-50 */
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
  --radius: 0.5rem;
  
  /* Custom accents */
  --emerald-accent: 142 70% 50%; /* emerald-500 */
}

@theme inline {
  --font-sans: 'Inter', 'Inter Fallback', system-ui, sans-serif;
  --font-serif: 'Playfair Display', 'Georgia', serif;
  --font-mono: 'JetBrains Mono', 'Geist Mono', monospace;
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  
  --color-emerald-accent: hsl(var(--emerald-accent));
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground antialiased;
  }
}
```

- [ ] **Step 2: Update `RootLayout` in `app/layout.tsx` to force dark mode.**

```tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-zinc-950 text-zinc-50`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit.**

```bash
git add app/globals.css app/layout.tsx
git commit -m "style: set global dark theme and base variables"
```

### Task 2: Navbar Restyling

**Files:**
- Modify: `newsroom-virlo/components/navbar.tsx`

- [ ] **Step 1: Refactor `Navbar` for glassmorphism and premium links.**

```tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                VIRLO
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              {['News', 'Search', 'Deep Dives', 'Trends'].map((item) => (
                <Link 
                  key={item}
                  href={`/${item.toLowerCase().replace(' ', '-')}`}
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-white px-4 py-2 border border-white/10 rounded-sm hover:bg-white hover:text-black transition-all">
              Connect
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit.**

```bash
git add components/navbar.tsx
git commit -m "style: refactor navbar with premium glassmorphism design"
```

### Task 3: Hero Section Transformation

**Files:**
- Modify: `newsroom-virlo/components/landing/hero.tsx`

- [ ] **Step 1: Redesign the `Hero` with shimmer text and radial glow background.**

```tsx
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Radial Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Intelligence Engine v2.1
          </span>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-white mb-8">
            News without <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-white/30 animate-shimmer">
              the noise.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-zinc-400 leading-relaxed mb-12">
            Real-time news from 30+ trusted sources. BBC, Reuters, AP, The Guardian, NYT and more — surfaced, deduplicated, and ready to read.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/news"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-sm hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Start Reading
            </Link>
            <Link 
              href="/search"
              className="w-full sm:w-auto px-8 py-4 border border-white/10 text-white font-semibold rounded-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              Search Intelligence
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit.**

```bash
git add components/landing/hero.tsx
git commit -m "style: transform hero section with high-end editorial feel"
```

### Task 4: Intelligence Engine (Steps) Grid

**Files:**
- Modify: `newsroom-virlo/components/landing/intelligence-engine.tsx`

- [ ] **Step 1: Restyle the `IntelligenceEngine` with module cards and hover glows.**

```tsx
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { IntelligenceStats } from "./intelligence-stats"

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, delay },
})

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Collect",
    body: "Pulls articles in real time from 30+ sources — newswires, broadsheets, and specialist outlets.",
  },
  {
    step: "02",
    title: "Deduplicate",
    body: "Strips out repeated stories and low-signal rewrites. You see the original reporting, not the echo.",
  },
  {
    step: "03",
    title: "Categorise",
    body: "Automatically assigns topic, region, and sentiment so you can filter to what you care about.",
  },
  {
    step: "04",
    title: "Surface",
    body: "Presents articles newest-first with source credibility ratings and direct links to the original publication.",
  },
]

export function IntelligenceEngine() {
  return (
    <section id="intelligence-engine" className="py-24 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 mb-20 items-end">
          <motion.div {...fade(0)}>
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.2em] mb-4">
              Our Methodology
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-white leading-tight">
              Real sources.<br />No algorithmic feed.
            </h2>
          </motion.div>
          <motion.p {...fade(0.08)} className="text-zinc-400 leading-relaxed md:pb-1 text-lg">
            Virlo doesn't generate articles or rewrite them. Every result links directly to the original
            publication. The pipeline just makes discovery faster and filtering smarter.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div 
              key={item.step} 
              {...fade(i * 0.06)}
              className="group relative p-8 bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all"
            >
              <div className="absolute -top-4 -right-4 text-8xl font-serif font-bold text-white/[0.03] select-none">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-4 relative z-10">{item.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed relative z-10">{item.body}</p>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
            </motion.div>
          ))}
        </div>

        <motion.div {...fade(0.2)}>
          <IntelligenceStats />
        </motion.div>

        <motion.div {...fade(0.26)} className="mt-16 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Browse the live feed
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit.**

```bash
git add components/landing/intelligence-engine.tsx
git commit -m "style: restyle intelligence engine grid with high-tech cards"
```

### Task 5: Live Stats Restyling

**Files:**
- Modify: `newsroom-virlo/components/landing/intelligence-stats.tsx`

- [ ] **Step 1: Refactor `IntelligenceStats` for a terminal/ticker look.**

```tsx
"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getArticleCount } from "@/lib/db"

export function IntelligenceStats() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function load() {
      const c = await getArticleCount()
      setCount(c)
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 border-y border-white/10 py-12 bg-white/[0.01]">
      <div className="text-center md:border-r border-white/10 last:border-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Live Articles</p>
        <p className="font-mono text-3xl font-bold text-white tabular-nums tracking-tighter">
          {count.toLocaleString()}
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-500/80 uppercase">Streaming</span>
        </div>
      </div>

      <div className="text-center md:border-r border-white/10 last:border-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Sources</p>
        <p className="font-mono text-3xl font-bold text-white tracking-tighter">52</p>
        <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase">Verified Newswires</p>
      </div>

      <div className="text-center md:border-r border-white/10 last:border-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Ingestion Rate</p>
        <p className="font-mono text-3xl font-bold text-white tracking-tighter">8.4<span className="text-lg text-zinc-500 ml-1">avg</span></p>
        <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase">Articles / Min</p>
      </div>

      <div className="text-center md:border-r border-white/10 last:border-0">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Quality Score</p>
        <p className="font-mono text-3xl font-bold text-emerald-400 tracking-tighter">98.2<span className="text-lg opacity-50 ml-1">%</span></p>
        <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase">System Confidence</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit.**

```bash
git add components/landing/intelligence-stats.tsx
git commit -m "style: refactor stats with high-tech monospace design"
```

### Task 6: Virlo Features & CTA

**Files:**
- Modify: `newsroom-virlo/components/landing/virlo-features.tsx`
- Modify: `newsroom-virlo/components/landing/cta.tsx`

- [ ] **Step 1: Update `VirloFeatures` to match the grid aesthetic.**

- [ ] **Step 2: Update `CTA` section for final conversion.**

- [ ] **Step 3: Commit.**

```bash
git add components/landing/virlo-features.tsx components/landing/cta.tsx
git commit -m "style: finish landing page feature grid and final cta"
```

### Task 7: Footer Refinement

**Files:**
- Modify: `newsroom-virlo/components/footer.tsx`

- [ ] **Step 1: Restyle the `Footer` for ultra-minimalist premium look.**

```tsx
"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-20 border-t border-white/10 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-white">VIRLO</span>
            <p className="mt-4 text-sm text-zinc-500 max-w-xs leading-relaxed">
              Synthesizing the world's information with artificial intelligence. No noise, just signal.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              {['Live Feed', 'Search', 'Deep Dives', 'Trends'].map(item => (
                <li key={item}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-6">Connect</h4>
            <ul className="space-y-4">
              {['Twitter', 'GitHub', 'LinkedIn', 'Support'].map(item => (
                <li key={item}>
                  <Link href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-zinc-600">
            © 2026 Virlo AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-zinc-600 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-zinc-600 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit.**

```bash
git add components/footer.tsx
git commit -m "style: finalize minimalist footer design"
```

---

### Verification Strategy

- [ ] **Manual UI Audit:** Visually verify the landing page at `http://localhost:3000`.
- [ ] **Contrast Check:** Ensure all text is legible against the dark background.
- [ ] **Responsiveness:** Test mobile and tablet layouts for the new grid components.
- [ ] **Animation Review:** Ensure Framer Motion transitions are smooth and professional.
