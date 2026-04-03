"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Article } from "@/lib/mock-data"

interface ArticleCardProps {
  article: Article
  variant?: "default" | "featured" | "compact"
  index?: number
}

export function ArticleCard({ article, variant = "default", index = 0 }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <Link href={`/news/${article.slug}`} className="block">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  {article.category}
                </span>
                {article.virloData && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                    <TrendingUp className="h-3 w-3" />
                    {article.virloData.trendScore}% trending
                  </span>
                )}
              </div>
              
              <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-medium text-white text-balance leading-tight mb-3">
                {article.title}
              </h2>
              
              <p className="text-white/80 text-sm md:text-base line-clamp-2 mb-4 max-w-3xl">
                {article.excerpt}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>{article.author.name}</span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span>{formattedDate}</span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readingTime} min read
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.article>
    )
  }

  if (variant === "compact") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group"
      >
        <Link href={`/news/${article.slug}`} className="flex gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-accent">{article.category}</span>
            <h3 className="font-serif text-base font-medium text-foreground line-clamp-2 mt-1 group-hover:text-accent transition-colors">
              {article.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
          </div>
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/news/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted mb-4">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-medium text-accent">{article.category}</span>
          {article.virloData && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {article.virloData.trendScore}%
            </span>
          )}
        </div>
        
        <h3 className="font-serif text-xl font-medium text-foreground text-balance leading-tight mb-2 group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
          {article.excerpt}
        </p>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{article.author.name}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.readingTime} min
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
