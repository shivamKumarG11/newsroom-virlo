import { NextRequest, NextResponse } from 'next/server'
import { getSession, getUserApiKey } from '@/lib/db-sqlite'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('virlo_session')?.value
  if (!token) return NextResponse.json({ user: null })

  const session = await getSession(token)
  if (!session) return NextResponse.json({ user: null })

  const claudeKey = await getUserApiKey(session.user.id)
  return NextResponse.json({ user: session.user, hasClaudeKey: !!claudeKey })
}
