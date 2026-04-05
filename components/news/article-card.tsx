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
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="group relative"
      >
        <Link href={`/news/${article.slug}`} className="block">
          <div className="relative aspect-[21/9] overflow-hidden rounded-sm bg-black border border-white/5">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16">
              <div className="flex items-center gap-4 mb-8">
                <span className="inline-flex items-center rounded-full glass-emerald px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-primary shadow-emerald/20">
                  {article.category}
                </span>
                {article.virloData && (
                  <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white/70">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    {article.virloData.trendScore}% Trending
                  </span>
                )}
              </div>
              
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-white text-balance leading-[0.9] tracking-tighter mb-6 group-hover:text-primary transition-colors duration-500">
                {article.title}
              </h2>
              
              <p className="text-zinc-400 text-lg md:text-xl line-clamp-2 mb-8 max-w-3xl font-medium leading-relaxed">
                {article.excerpt}
              </p>
              
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                <span className="text-zinc-300">{article.author.name}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span>{formattedDate}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary/60" />
                  {article.readingTime} MIN READ
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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group"
      >
        <Link href={`/news/${article.slug}`} className="flex gap-6 items-center p-4 rounded-sm hover:bg-white/[0.02] transition-colors">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-zinc-900 border border-white/5">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-80"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{article.category}</span>
            <h3 className="font-serif text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">{formattedDate}</p>
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
        <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-black border border-white/5 mb-6">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{article.category}</span>
          {article.virloData && (
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              {article.virloData.trendScore}%
            </span>
          )}
        </div>
        
        <h3 className="font-serif text-2xl font-bold text-white text-balance leading-[1.1] tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">
          {article.title}
        </h3>
        
        <p className="text-zinc-400 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
          {article.excerpt}
        </p>
        
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          <span className="text-zinc-300">{article.author.name}</span>
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          <span className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary/60" />
            {article.readingTime} MIN
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
