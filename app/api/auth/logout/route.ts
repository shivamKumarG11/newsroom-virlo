import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/db-sqlite'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('virlo_session')?.value
  if (token) await deleteSession(token)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('virlo_session', '', { maxAge: 0, path: '/' })
  return res
}
