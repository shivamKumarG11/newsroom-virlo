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
  placeholder = "Search news, topics, or ask a question...",
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
    <div ref={containerRef} className={cn("relative", className)}>
      <div className={cn(
        "relative flex items-center transition-all",
        isHero && "bg-card border border-border rounded-2xl shadow-lg",
        !isHero && !isCompact && "bg-secondary/50 border border-border rounded-xl",
        isCompact && "bg-secondary/30 border border-border rounded-lg"
      )}>
        <Search className={cn(
          "absolute left-4 text-muted-foreground",
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
            "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
            isHero ? "pl-12 pr-24 py-6 text-lg" : isCompact ? "pl-10 pr-12 py-2 text-sm" : "pl-10 pr-20 py-3"
          )}
        />
        
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute text-muted-foreground hover:text-foreground",
              isHero ? "right-20" : isCompact ? "right-10" : "right-14"
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
          className={cn(
            "absolute",
            isHero ? "right-3 px-6" : isCompact ? "right-1 h-7 w-7 p-0" : "right-2 px-4"
          )}
          size={isCompact ? "icon" : "default"}
        >
          {isCompact ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>
      
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length > 0 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={cn(
              "absolute left-0 right-0 z-50 mt-2",
              "bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            )}
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Suggestions
                </p>
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion)
                      handleSearch(suggestion)
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-secondary rounded-lg transition-colors flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{suggestion}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Trending */}
            {!query && (
              <div className="p-2 border-t border-border">
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Trending Searches
                </p>
                <div className="flex flex-wrap gap-2 px-3 py-2">
                  {TRENDING_SEARCHES.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(term)
                        handleSearch(term)
                      }}
                      className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* AI hint */}
            <div className="px-4 py-3 bg-secondary/30 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-accent" />
                Powered by AI - try asking questions like &quot;What are the implications of AI regulation?&quot;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
