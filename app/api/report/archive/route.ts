import { NextRequest, NextResponse } from 'next/server'
import { getReports, getReport, saveReport } from '@/lib/reports-db'
import { v4 as uuid } from 'uuid'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (id) {
    const report = await getReport(id)
    if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ report })
  }
  const reports = await getReports(50)
  return NextResponse.json({ reports })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, topic, digest, editorial, qa, sources, model, provider } = body

  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const id = uuid()
  await saveReport({ id, title, topic: topic ?? null, digest: digest ?? null, editorial: editorial ?? null, qa: qa ?? [], sources: sources ?? [], model: model ?? null, provider: provider ?? null })

  return NextResponse.json({ id })
}
