/**
 * POST /api/report/generate
 *
 * Returns THREE parallel outputs from the selected articles:
 *   1. digest      — deep synthesis (~800-1000 words)
 *   2. editorial   — newsroom-quality editorial report (~600 words)
 *   3. qa          — 5-6 sharp Q&A pairs as JSON array
 *   4. model       — which model generated this
 */

import { NextRequest, NextResponse } from 'next/server'
import { generate, hasAIProvider } from '@/lib/ai-client'

const SYSTEM = `You are a senior intelligence analyst and award-winning journalist at a premier news publication.
Your writing is authoritative, precise, and sourced. You never use filler phrases.
You cite specific actors, dates, and events. You write for a sophisticated, informed readership.`

interface ArticleInput {
  title: string
  description?: string
  content?: string
  source?: string
  publishedAt?: string
  url?: string
}

function buildArticleBlock(articles: ArticleInput[]): string {
  return articles.map((a, i) => {
    const body = a.content ?? a.description ?? ''
    return `[${i + 1}] "${a.title}"
Source: ${a.source ?? 'Unknown'} | Published: ${a.publishedAt?.slice(0, 10) ?? 'recent'}
${body ? `Content: ${body.slice(0, 600)}` : ''}
URL: ${a.url ?? ''}`
  }).join('\n\n---\n\n')
}

// ── Digest ────────────────────────────────────────────────────────────────────

async function generateDigest(articles: ArticleInput[], topic: string | undefined) {
  const block = buildArticleBlock(articles)
  const prompt = `You have ${articles.length} news articles${topic ? ` on the topic: "${topic}"` : ''}.

${block}

Write an intelligence digest in EXACTLY 200 words — no more, no less. Count carefully.

This is NOT a summary. It is a tight synthesis that:
- Identifies the underlying forces driving these events
- Connects threads across sources
- Surfaces what the headlines are NOT saying
- Ends with one forward-looking sentence

Write in flowing prose, no bullet points, no headers. Authoritative tone. Stop at 200 words.`

  return generate(prompt, { system: SYSTEM, maxTokens: 400 })
}

// ── Editorial Report ──────────────────────────────────────────────────────────

async function generateEditorial(articles: ArticleInput[], topic: string | undefined) {
  const block = buildArticleBlock(articles)
  const prompt = `Based on these ${articles.length} news articles${topic ? ` about "${topic}"` : ''}:

${block}

Write a structured editorial report at newsroom quality — think Reuters Analysis, FT Intelligence Brief, or NYT editorial board standard.

Use this exact format:

## The Situation
One sharp paragraph establishing what is happening and why it matters now.

## Key Developments
3-4 bullet points of the most important concrete facts, each attributed to a specific source [N].

## Competing Perspectives
Two or three distinct angles on this story. What do different actors want? Where is the tension?

## Deeper Context
One paragraph of essential background. What history or structural factors explain this moment?

## Signal to Watch
2-3 specific, actionable forward indicators. Not vague — name the actor, the event, the date if possible.

---
*Analysis based on ${articles.length} source${articles.length !== 1 ? 's' : ''}.*`

  return generate(prompt, { system: SYSTEM, maxTokens: 1000 })
}

// ── Q&A parser (robust against all LLM output quirks) ────────────────────────

function tryJsonParse(raw: string): { q: string; a: string }[] | null {
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr) || arr.length === 0) return null
    const clean = arr
      .filter((x: unknown) => x && typeof (x as { q: unknown }).q === 'string' && typeof (x as { a: unknown }).a === 'string')
      .map((x: { q: string; a: string }) => ({ q: x.q.trim(), a: x.a.trim() }))
      .filter((x: { q: string; a: string }) => x.q && x.a)
    return clean.length > 0 ? clean : null
  } catch {
    return null
  }
}

function parseQA(raw: string): { q: string; a: string }[] {
  let text = raw.trim()

  // 1. Strip markdown code fences (``` or ```json)
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  // 2. Try parsing the whole thing directly
  const direct = tryJsonParse(text)
  if (direct) return direct

  // 3. Extract first [...] block and try that
  const arrayMatch = text.match(/\[[\s\S]*?\](?=\s*$|\s*[\[{])/)?.[0] ?? text.match(/\[[\s\S]*\]/)?.[0]
  if (arrayMatch) {
    const fromArray = tryJsonParse(arrayMatch)
    if (fromArray) return fromArray

    // 4. Fix common JSON issues in the extracted block:
    //    - single quotes → double quotes
    //    - trailing commas before ] or }
    //    - unescaped newlines inside strings
    let fixed = arrayMatch
      .replace(/'/g, '"')
      .replace(/,\s*([\]}])/g, '$1')
      .replace(/[\r\n]+/g, ' ')
    const fromFixed = tryJsonParse(fixed)
    if (fromFixed) return fromFixed
  }

  // 5. Extract individual {"q":...,"a":...} objects and build array manually
  const objMatches = [...text.matchAll(/\{\s*"q"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"a"\s*:\s*"((?:[^"\\]|\\.)*)"\s*\}/g)]
  if (objMatches.length > 0) {
    return objMatches.map(m => ({ q: m[1].trim(), a: m[2].trim() })).filter(x => x.q && x.a)
  }

  // 6. Numbered Q/A pattern: "1. Question\nAnswer text" or "Q1: ...\nA1: ..."
  const numbered = [...text.matchAll(/(?:Q\d+[.:]\s*|^\d+[.)]\s*)(.+?)(?:\n(?:A\d+[.:]\s*|\s{2,})(.+?)(?=\n\d+[.)]|\nQ\d+|$))/gims)]
  if (numbered.length > 0) {
    return numbered.map(m => ({ q: m[1].trim(), a: m[2]?.trim() ?? '' })).filter(x => x.q && x.a)
  }

  // 7. Bold question pattern: **Question?**\nAnswer
  const bold = [...text.matchAll(/\*\*(.+?\??)\*\*\s*\n+([\s\S]+?)(?=\n\*\*|\n\d+\.|\n-{3,}|$)/g)]
  if (bold.length > 0) {
    return bold.map(m => ({ q: m[1].trim(), a: m[2].trim() })).filter(x => x.q && x.a)
  }

  // 8. Last resort: alternate non-empty lines as Q / A pairs
  const lines = text.split(/\n+/).map(l => l.replace(/^[-*•\d.):]+\s*/, '').trim()).filter(Boolean)
  const pairs: { q: string; a: string }[] = []
  for (let i = 0; i < lines.length - 1; i += 2) {
    if (lines[i] && lines[i + 1]) pairs.push({ q: lines[i], a: lines[i + 1] })
  }
  if (pairs.length > 0) return pairs

  return [{ q: 'Analysis', a: text }]
}

// ── Q&A ───────────────────────────────────────────────────────────────────────

async function generateQA(articles: ArticleInput[], topic: string | undefined) {
  const block = buildArticleBlock(articles)
  const prompt = `Based on these articles${topic ? ` about "${topic}"` : ''}:

${block}

Generate exactly 5 questions and answers. Each question must be:
- Specific to THIS story (not generic journalism 101)
- Something an intelligent reader genuinely wants to know
- Revealing of something non-obvious

CRITICAL: Your entire response must be ONLY the JSON array below. No markdown code fences, no backticks, no preamble, no trailing text. Start your response with [ and end with ].

[
  {"q": "question text", "a": "answer in 2-4 sentences, grounded in the articles above"},
  {"q": "...", "a": "..."},
  {"q": "...", "a": "..."},
  {"q": "...", "a": "..."},
  {"q": "...", "a": "..."}
]`

  const result = await generate(prompt, { system: SYSTEM, maxTokens: 1200 })
  const parsed = parseQA(result.text)

  // Ensure we always return valid Q&A pairs — never an empty array
  const valid = parsed.filter(item => item?.q?.trim() && item?.a?.trim())
  const safe = valid.length > 0 ? valid : [{ q: 'What are the key takeaways from these articles?', a: result.text.slice(0, 400) }]

  return { ...result, parsed: safe }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { articles, topic, mode, question, articleContext } = body as {
    articles: ArticleInput[]
    topic?: string
    mode?: 'report' | 'qa'
    question?: string
    articleContext?: string
  }

  if (!articles?.length) {
    return NextResponse.json({ error: 'No articles provided' }, { status: 400 })
  }
  if (articles.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 articles per report' }, { status: 400 })
  }
  if (!(await hasAIProvider())) {
    return NextResponse.json({ error: 'No AI provider configured. Set GROQ_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY in .env.local' }, { status: 503 })
  }

  // ── Single-article Q&A (Story Q&A drawer) ──────────────────────────────────
  if (mode === 'qa' && question) {
    const context = articleContext ?? `${articles[0]?.title}\n${articles[0]?.description ?? ''}`
    const result = await generate(
      `Article: ${context}\n\nQuestion: ${question}`,
      { system: 'You are a precise news analyst. Answer questions about news articles directly and accurately. 3-4 sentences maximum.', maxTokens: 300 }
    )
    return NextResponse.json({ report: result.text, model: result.model })
  }

  // ── Full 3-part report (parallel generation) ───────────────────────────────
  try {
    const [digestResult, editorialResult, qaResult] = await Promise.all([
      generateDigest(articles, topic),
      generateEditorial(articles, topic),
      generateQA(articles, topic),
    ])

    return NextResponse.json({
      digest: digestResult.text ?? '',
      editorial: editorialResult.text ?? '',
      qa: qaResult.parsed ?? [],
      model: digestResult.model ?? 'AI',
      provider: digestResult.provider ?? 'unknown',
      imageUrls: [],
      sources: [],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
