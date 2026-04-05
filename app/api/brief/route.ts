/**
 * GET /api/brief
 * Generates an AI daily brief from real news articles using the server-side AI provider.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generate, hasAIProvider } from '@/lib/ai-client'
import type { NormalizedNewsItem } from '@/app/api/news/route'

function fallbackBrief(articles: NormalizedNewsItem[]): string {
  const top = articles.slice(0, 5)
  const sources = [...new Set(top.map(a => a.source))].slice(0, 3).join(', ')
  return `Today's coverage includes stories from ${sources} and others. Leading story: ${top[0]?.title ?? 'Multiple stories developing.'}`
}

export async function GET(req: NextRequest) {
  // Fetch real articles
  const newsUrl = new URL('/api/news', req.nextUrl.origin)
  let articles: NormalizedNewsItem[] = []
  try {
    const res = await fetch(newsUrl.toString(), { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      articles = data.articles ?? []
    }
  } catch { /* fallback */ }

  if (!articles.length) {
    return NextResponse.json({ brief: null, articleCount: 0, aiGenerated: false })
  }

  const aiAvailable = await hasAIProvider()
  if (!aiAvailable) {
    return NextResponse.json({ brief: fallbackBrief(articles), articleCount: articles.length, aiGenerated: false })
  }

  const headlines = articles
    .slice(0, 12)
    .map((a, i) => `${i + 1}. "${a.title}" — ${a.source}`)
    .join('\n')

  try {
    const brief = await generate(
      `Write a 2-sentence intelligence brief summarising the most important stories from these headlines. Be direct and journalistically sharp:\n\n${headlines}`,
      {
        system: 'You are a senior news editor writing the opening brief for a morning intelligence digest. Be authoritative, direct, and precise. No filler.',
        maxTokens: 180,
      }
    )
    return NextResponse.json({ brief: brief.text, articleCount: articles.length, aiGenerated: true })
  } catch {
    return NextResponse.json({ brief: fallbackBrief(articles), articleCount: articles.length, aiGenerated: false })
  }
}
