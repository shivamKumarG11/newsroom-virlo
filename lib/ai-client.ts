/**
 * lib/ai-client.ts
 * Unified AI text generation with exhaustive rate-limit fallback.
 *
 * Strategy (per provider):
 *   For each API key → try each fallback model in order
 *   429 / quota error → next model on same key → next key → next provider
 *   Error only when every key × model × provider is exhausted.
 *
 * Priority: Groq → OpenRouter → Gemini → Anthropic
 */

export interface GenerateOptions {
  system?: string
  maxTokens?: number
}

export interface GenerateResult {
  text: string
  model: string      // human-readable e.g. "llama-3.1-8b-instant (Groq)"
  provider: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getKeys(prefix: string): string[] {
  const keys: string[] = []
  const bare = process.env[prefix]
  if (bare) keys.push(bare)
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`${prefix}_${i}`]
    if (k) keys.push(k)
  }
  // Shuffle so load spreads across keys naturally
  return keys.sort(() => Math.random() - 0.5)
}

/** True when the error looks like a rate-limit / quota exhaustion */
function isRateLimit(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')
    || msg.includes('too many') || msg.includes('capacity') || msg.includes('529')
    || msg.includes('tokens per minute') || msg.includes('tpm') || msg.includes('rpm')
    || msg.includes('requests per minute') || msg.includes('overloaded')
}

// ── Groq ──────────────────────────────────────────────────────────────────────
// Models listed from fastest/smallest → larger (different quota buckets)

const GROQ_MODELS = [
  'llama-3.1-8b-instant',       // primary — very fast, small TPM
  'llama-3.2-3b-preview',       // 3B — tiny quota usage
  'llama-3.2-1b-preview',       // 1B — lowest quota usage
  'gemma2-9b-it',               // Google model, separate quota bucket
  'llama3-8b-8192',             // older alias, different bucket
  'llama-3.3-70b-versatile',    // 70B — high quota but worth trying
  'llama-3.1-70b-versatile',    // 70B alt
  'mixtral-8x7b-32768',         // Mixtral, separate bucket
  'gemma-7b-it',                // older Gemma
  'whisper-large-v3-turbo',     // Not a chat model, skip gracefully
]

async function groqOne(key: string, model: string, prompt: string, opts: GenerateOptions): Promise<GenerateResult> {
  const messages: { role: string; content: string }[] = []
  if (opts.system) messages.push({ role: 'system', content: opts.system })
  messages.push({ role: 'user', content: prompt })

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: opts.maxTokens ?? 1024 }),
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq: empty response')
  return { text, model: `${model} (Groq)`, provider: 'groq' }
}

async function groqGenerate(prompt: string, opts: GenerateOptions): Promise<GenerateResult> {
  const keys = getKeys('GROQ_API_KEY')
  if (!keys.length) throw new Error('No Groq key configured')

  // Override model list if GROQ_MODEL is set — still keep fallbacks below it
  const preferredModel = process.env.GROQ_MODEL
  const models = preferredModel
    ? [preferredModel, ...GROQ_MODELS.filter(m => m !== preferredModel)]
    : GROQ_MODELS

  const errors: string[] = []

  for (const key of keys) {
    for (const model of models) {
      try {
        return await groqOne(key, model, prompt, opts)
      } catch (e) {
        const msg = `Groq[${model}]: ${e instanceof Error ? e.message : e}`
        errors.push(msg)
        if (!isRateLimit(e)) break  // non-rate-limit error on this key → skip remaining models, try next key
        // rate-limit → try next model on same key
      }
    }
  }

  throw new Error(errors.join(' | '))
}

// ── OpenRouter ────────────────────────────────────────────────────────────────
// Free models — all in :free tier so no cost, just quota limits

const OPENROUTER_MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemma-2-9b-it:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'nousresearch/nous-capybara-7b:free',
  'openchat/openchat-7b:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'meta-llama/llama-3.2-1b-instruct:free',
  'qwen/qwen-2-7b-instruct:free',
  'google/gemma-2-2b-it:free',
]

async function openrouterOne(key: string, model: string, prompt: string, opts: GenerateOptions): Promise<GenerateResult> {
  const messages: { role: string; content: string }[] = []
  if (opts.system) messages.push({ role: 'system', content: opts.system })
  messages.push({ role: 'user', content: prompt })

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://virlo.news',
      'X-Title': 'AI-Vantage',
    },
    body: JSON.stringify({ model, messages, max_tokens: opts.maxTokens ?? 1024 }),
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenRouter: empty response')
  return { text, model: `${model} (OpenRouter)`, provider: 'openrouter' }
}

async function openrouterGenerate(prompt: string, opts: GenerateOptions): Promise<GenerateResult> {
  const keys = getKeys('OPENROUTER_API_KEY')
  if (!keys.length) throw new Error('No OpenRouter key configured')

  const preferredModel = process.env.OPENROUTER_MODEL
  const models = preferredModel
    ? [preferredModel, ...OPENROUTER_MODELS.filter(m => m !== preferredModel)]
    : OPENROUTER_MODELS

  const errors: string[] = []

  for (const key of keys) {
    for (const model of models) {
      try {
        return await openrouterOne(key, model, prompt, opts)
      } catch (e) {
        errors.push(`OpenRouter[${model}]: ${e instanceof Error ? e.message : e}`)
        if (!isRateLimit(e)) break
      }
    }
  }

  throw new Error(errors.join(' | '))
}

// ── Gemini ────────────────────────────────────────────────────────────────────
// Models from smallest quota usage to largest

const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',        // smaller, separate quota
  'gemini-2.0-flash-lite',      // very fast, low quota usage
  'gemini-2.0-flash',
  'gemini-1.5-pro',             // higher quota but different bucket
  'gemini-1.0-pro',             // legacy, sometimes has quota when others don't
]

async function geminiOne(key: string, model: string, prompt: string, opts: GenerateOptions): Promise<GenerateResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
  const fullPrompt = opts.system ? `${opts.system}\n\n${prompt}` : prompt

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: opts.maxTokens ?? 1024 },
    }),
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini: empty response')
  return { text, model: `${model} (Gemini)`, provider: 'gemini' }
}

async function geminiGenerate(prompt: string, opts: GenerateOptions): Promise<GenerateResult> {
  const keys = getKeys('GEMINI_API_KEY')
  if (!keys.length) throw new Error('No Gemini key configured')

  const preferredModel = process.env.GEMINI_MODEL
  const models = preferredModel
    ? [preferredModel, ...GEMINI_MODELS.filter(m => m !== preferredModel)]
    : GEMINI_MODELS

  const errors: string[] = []

  for (const key of keys) {
    for (const model of models) {
      try {
        return await geminiOne(key, model, prompt, opts)
      } catch (e) {
        errors.push(`Gemini[${model}]: ${e instanceof Error ? e.message : e}`)
        if (!isRateLimit(e)) break
      }
    }
  }

  throw new Error(errors.join(' | '))
}

// ── Anthropic ─────────────────────────────────────────────────────────────────
// Only one key supported; fallback through available Haiku models

const ANTHROPIC_MODELS = [
  'claude-haiku-4-5-20251001',
  'claude-haiku-3-5-20241022',  // older haiku, separate quota
  'claude-3-haiku-20240307',    // original haiku
]

async function anthropicGenerate(prompt: string, opts: GenerateOptions): Promise<GenerateResult> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('No Anthropic key configured')

  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const client = new Anthropic({ apiKey: key })
  const errors: string[] = []

  for (const modelId of ANTHROPIC_MODELS) {
    try {
      const msg = await client.messages.create({
        model: modelId,
        max_tokens: opts.maxTokens ?? 1024,
        system: opts.system,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
      if (!text) throw new Error('empty response')
      return { text, model: `${modelId} (Anthropic)`, provider: 'anthropic' }
    } catch (e) {
      errors.push(`Anthropic[${modelId}]: ${e instanceof Error ? e.message : e}`)
      if (!isRateLimit(e)) break
    }
  }

  throw new Error(errors.join(' | '))
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function hasAIProvider(): Promise<boolean> {
  return !!(
    getKeys('GROQ_API_KEY').length ||
    getKeys('OPENROUTER_API_KEY').length ||
    getKeys('GEMINI_API_KEY').length ||
    process.env.ANTHROPIC_API_KEY
  )
}

/**
 * Generate text with full fallback:
 *   Groq (all keys × all models) → OpenRouter (all keys × all models)
 *   → Gemini (all keys × all models) → Anthropic (all models)
 * Error only when everything is exhausted.
 */
export async function generate(prompt: string, opts: GenerateOptions = {}): Promise<GenerateResult> {
  const errors: string[] = []

  if (getKeys('GROQ_API_KEY').length) {
    try { return await groqGenerate(prompt, opts) }
    catch (e) { errors.push(`Groq: ${e instanceof Error ? e.message : e}`) }
  }

  if (getKeys('OPENROUTER_API_KEY').length) {
    try { return await openrouterGenerate(prompt, opts) }
    catch (e) { errors.push(`OpenRouter: ${e instanceof Error ? e.message : e}`) }
  }

  if (getKeys('GEMINI_API_KEY').length) {
    try { return await geminiGenerate(prompt, opts) }
    catch (e) { errors.push(`Gemini: ${e instanceof Error ? e.message : e}`) }
  }

  if (process.env.ANTHROPIC_API_KEY) {
    try { return await anthropicGenerate(prompt, opts) }
    catch (e) { errors.push(`Anthropic: ${e instanceof Error ? e.message : e}`) }
  }

  throw new Error(`All AI providers exhausted:\n${errors.join('\n')}`)
}
