import { NextRequest, NextResponse } from 'next/server'
import { getSession, saveUserApiKey, getUserApiKey, deleteUserApiKey } from '@/lib/db-sqlite'

async function getUser(req: NextRequest) {
  const token = req.cookies.get('virlo_session')?.value
  if (!token) return null
  return getSession(token)
}

export async function POST(req: NextRequest) {
  const session = await getUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { claudeKey } = await req.json()
  if (!claudeKey?.startsWith('sk-ant-')) {
    return NextResponse.json({ error: 'Invalid Claude API key format' }, { status: 400 })
  }

  await saveUserApiKey(session.user.id, claudeKey)
  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const session = await getUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const key = await getUserApiKey(session.user.id)
  const masked = key ? `sk-ant-...${key.slice(-6)}` : null
  return NextResponse.json({ hasKey: !!key, masked })
}

export async function DELETE(req: NextRequest) {
  const session = await getUser(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await deleteUserApiKey(session.user.id)
  return NextResponse.json({ ok: true })
}
