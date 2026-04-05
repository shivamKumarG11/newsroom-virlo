/**
 * GET /api/image-proxy?url=...
 * Fetches an image server-side (no CORS restriction) and returns it
 * as a base64 data URL so jsPDF can embed it in PDFs.
 */

import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_PROTOCOLS = ['http:', 'https:']
const TIMEOUT_MS = 8000

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw) return NextResponse.json({ error: 'url required' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 })
  }

  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    return NextResponse.json({ error: 'disallowed protocol' }, { status: 400 })
  }

  try {
    const res = await fetch(raw, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Vantage/1.0)',
        Accept: 'image/*',
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `upstream ${res.status}` }, { status: 502 })
    }

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'not an image' }, { status: 400 })
    }

    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${contentType.split(';')[0]};base64,${base64}`

    return NextResponse.json({ dataUrl }, {
      headers: {
        'Cache-Control': 'public, max-age=86400', // cache 24h
      },
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'fetch failed' }, { status: 502 })
  }
}
