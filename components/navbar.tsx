"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Menu, X, ArrowRight, Search, Activity, Globe, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { label: "Search", href: "/search", icon: Search },
  { label: "Latest News", href: "/news", icon: Activity },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  
  // Dominant Background - Always visible white
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.98)"]
  )
  
  const paddingTop = useTransform(scrollY, [0, 50], ["20px", "10px"])
  const maxWidth = useTransform(scrollY, [0, 50], ["100%", "98%"])
  const borderRadius = useTransform(scrollY, [0, 50], ["0px", "20px"])

  return (
    <>
      {/* Top Gradient Blur - Light Mode */}
      <div className="nav-blur" />

      <motion.nav
        style={{ 
          paddingTop,
          width: maxWidth,
          left: "50%",
          transform: "translateX(-50%)",
        }}
        className="fixed top-0 z-50 px-4 transition-all duration-500"
      >
        <motion.div
          style={{ 
            backgroundColor,
            borderRadius,
            borderWidth: "1px",
            borderColor: "rgba(0, 0, 0, 0.08)",
          }}
          className={cn(
            "mx-auto max-w-7xl px-8 transition-all duration-300 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
            scrollY.get() > 20 ? "py-3" : "py-4"
          )}
        >
          <div className="flex items-center justify-between">
            {/* Logo Section - Larger & Professional */}
            <div className="flex items-center gap-12">
              <Link href="/" className="group flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-xl shadow-amber-500/10 transition-all duration-300 group-hover:shadow-amber-500/20">
                  <span className="font-serif text-3xl font-bold text-white italic">V</span>
                  <div className="absolute -inset-1 rounded-2xl bg-amber-500/10 blur opacity-0" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-serif text-2xl font-bold tracking-tight text-zinc-950 group-hover:text-amber-700 transition-colors">
                    VIRLO
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">
                    <Sparkles className="h-3 w-3 text-amber-500" /> Intelligence
                  </span>
                </div>
              </Link>

              {/* Desktop Nav links */}
              <div className="hidden lg:flex items-center gap-2">
                {NAV_LINKS.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "relative px-5 py-2.5 text-xs uppercase tracking-widest font-black transition-all group",
                        active ? "text-amber-700" : "text-zinc-600 hover:text-zinc-950"
                      )}
                    >
                      <span className="relative z-10">{item.label}</span>
                      {active && (
                        <motion.div
                          layoutId="nav-active"
                          className="absolute inset-0 bg-amber-500/5 rounded-xl border border-amber-500/10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className={cn(
                        "absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] bg-amber-500 transition-all duration-300 rounded-full",
                        active ? "w-6" : "w-0 group-hover:w-3 opacity-50"
                      )} />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <Button 
                asChild
                variant="default"
                className="hidden md:flex btn-premium h-12 px-8 rounded-full text-xs font-black uppercase tracking-[0.15em] border-none"
              >
                <Link href="/search" className="flex items-center gap-2 text-white">
                  Launch Terminal <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex lg:hidden h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-900 transition-all hover:bg-zinc-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[48] lg:hidden"
          >
            <div className="absolute inset-0 bg-white/98 backdrop-blur-3xl" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative pt-36 px-8">
              <div className="space-y-5">
                {NAV_LINKS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-3xl border transition-all",
                        pathname === item.href 
                          ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm shadow-amber-500/5" 
                          : "bg-zinc-50 border-zinc-100 text-zinc-600"
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <item.icon className="h-6 w-6" />
                        <span className="text-base font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <ArrowRight className="h-5 w-5 opacity-50" />
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-10"
                >
                  <Button 
                    asChild
                    className="w-full btn-premium h-16 rounded-3xl text-sm font-black uppercase tracking-widest text-white"
                  >
                    <Link href="/search" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
