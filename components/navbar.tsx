"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Search", href: "/search" },
  { label: "Latest News", href: "/news" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="AI-VANTAGE"
                className="h-8 w-auto object-contain hidden"
                onLoad={e => {
                  const img = e.target as HTMLImageElement
                  img.classList.remove('hidden')
                  img.nextElementSibling?.classList.add('hidden')
                }}
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors duration-300">
                AI-VANTAGE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-emerald" />
            </Link>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "text-xs uppercase tracking-widest font-semibold transition-all relative group",
                      active ? "text-primary" : "text-zinc-400 hover:text-white"
                    )}
                  >
                    {item.label}
                    <span className={cn(
                      "absolute -bottom-1 left-1/2 -translate-x-1/2 h-[1px] bg-primary transition-all duration-300",
                      active ? "w-full" : "w-0 group-hover:w-full"
                    )} />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side — auth or future actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-sm hover:opacity-90 transition-all hover:-translate-y-0.5"
            >
              Search Intelligence
            </Link>
          </div>

        </div>
      </div>
    </nav>
  )
}
