"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, TrendingUp, Clock, ArrowRight, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { quickSearch } from "@/lib/search"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  variant?: 'default' | 'hero' | 'compact'
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

const TRENDING_SEARCHES = [
  "AI regulation",
  "climate policy",
  "tech layoffs",
  "interest rates",
  "quantum computing",
  "electric vehicles"
]

export function SearchBar({ 
  variant = 'default', 
  placeholder = "Search intelligence...",
  className,
  onSearch 
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Handle search
  const handleSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    if (onSearch) {
      onSearch(searchQuery)
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
    setIsOpen(false)
  }, [onSearch, router])
  
  // Fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    
    setIsLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const results = await quickSearch(query)
        setSuggestions(results)
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 200)
    
    return () => clearTimeout(timeout)
  }, [query])
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }
  
  const isHero = variant === 'hero'
  const isCompact = variant === 'compact'
  
  return (
    <div ref={containerRef} className={cn("relative group/search", className)}>
      <div className={cn(
        "relative flex items-center transition-all duration-500 glass border-white/5",
        "focus-within:border-primary/40 focus-within:shadow-emerald/10 focus-within:ring-1 focus-within:ring-primary/20",
        isHero && "rounded-sm shadow-2xl",
        !isHero && !isCompact && "rounded-sm",
        isCompact && "rounded-full bg-black/40"
      )}>
        <Search className={cn(
          "absolute left-5 text-zinc-500 transition-colors group-focus-within/search:text-primary",
          isHero ? "w-5 h-5" : "w-4 h-4"
        )} />
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-600 placeholder:font-medium",
            isHero ? "pl-14 pr-32 py-8 text-xl font-medium tracking-tight" : isCompact ? "pl-12 pr-12 py-3 text-xs uppercase tracking-widest font-bold" : "pl-12 pr-28 py-4 font-medium"
          )}
        />
        
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute text-zinc-500 hover:text-white transition-all",
              isHero ? "right-24" : isCompact ? "right-10" : "right-16"
            )}
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          onClick={() => handleSearch(query)}
          variant={isHero ? "default" : "cyber"}
          className={cn(
            "absolute",
            isHero ? "right-4 px-8 rounded-sm h-12" : isCompact ? "right-1.5 h-8 w-8 p-0 rounded-full" : "right-2 px-6 rounded-sm h-10"
          )}
          size={isCompact ? "icon" : "default"}
        >
          {isCompact ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length > 0 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className={cn(
              "absolute left-0 right-0 z-50 mt-4",
              "glass border-white/5 rounded-sm shadow-2xl overflow-hidden p-2"
            )}
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                  Search Results
                </p>
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion)
                      handleSearch(suggestion)
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.03] rounded-sm transition-all flex items-center gap-4 group/item"
                  >
                    <Search className="w-4 h-4 text-zinc-600 group-hover/item:text-primary transition-colors" />
                    <span className="flex-1 truncate tracking-tight">{suggestion}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-700 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Trending */}
            {!query && (
              <div className="space-y-3">
                <p className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 flex items-center gap-3">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  Market Intelligence
                </p>
                <div className="flex flex-wrap gap-2 px-4 pb-4">
                  {TRENDING_SEARCHES.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(term)
                        handleSearch(term)
                      }}
                      className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-zinc-900/50 hover:bg-primary/10 hover:text-primary border border-white/5 rounded-full transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* AI hint */}
            <div className="px-5 py-4 bg-emerald-500/[0.02] border-t border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 flex items-center gap-3">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                Neural Intelligence Powered — Try asking complex industry questions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
