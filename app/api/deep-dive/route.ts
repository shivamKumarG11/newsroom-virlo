/**
 * GET /api/deep-dive?topic=...
 * Generates a long-form AI analysis on a specific topic from real news sources.
 */

import { NextRequest, NextResponse } from 'next/server'
import { generate, hasAIProvider } from '@/lib/ai-client'
import type { NormalizedNewsItem } from '@/app/api/news/route'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const topic = searchParams.get('topic') ?? ''

  if (!topic.trim()) {
    return NextResponse.json({ error: 'Topic required' }, { status: 400 })
  }

  if (!(await hasAIProvider())) {
    return NextResponse.json({ error: 'No AI provider configured. Set GROQ_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY in .env.local', needsKey: true }, { status: 503 })
  }

  // Fetch articles for this topic
  const newsUrl = new URL('/api/news', req.nextUrl.origin)
  newsUrl.searchParams.set('q', topic)
  let articles: NormalizedNewsItem[] = []
  try {
    const res = await fetch(newsUrl.toString(), { next: { revalidate: 0 } })
    if (res.ok) {
      const data = await res.json()
      articles = data.articles ?? []
    }
  } catch { /* proceed empty */ }

  const articleBlock = articles.length
    ? articles.slice(0, 10).map((a, i) =>
        `[${i + 1}] ${a.title} (${a.source}, ${a.publishedAt?.slice(0, 10) ?? 'recent'})\n${a.description ?? ''}`
      ).join('\n\n')
    : `No specific articles found. Write based on general knowledge of "${topic}".`

  const prompt = `You are a senior analyst at a premium intelligence publication. Write a ~450-word deep-dive analysis on the topic: "${topic}".

${articles.length ? `Draw on these ${articles.length} current news sources:\n\n${articleBlock}\n\n` : ''}Structure the piece as:
1. A one-sentence **lede** — the sharpest, most important insight
2. **The situation** — what is happening and why it matters (2-3 paragraphs)
3. **Key dynamics** — 3 bullet-pointed factors shaping the story
4. **What to watch** — 2 forward-looking signals

Write with journalistic authority. Reference specific events or actors where possible. No filler phrases.`

  try {
    const content = await generate(prompt, {
      system: 'You are a senior intelligence analyst writing for a premium editorial publication. Your writing is direct, precise, and deeply informed.',
      maxTokens: 700,
    })

    return NextResponse.json({
      topic,
      content,
      sources: articles.slice(0, 5).map(a => ({ title: a.title, source: a.source, url: a.url })),
      articleCount: articles.length,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
