import { NextRequest, NextResponse } from 'next/server'
import { createUser, createSession } from '@/lib/db-sqlite'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const result = await createUser(email.toLowerCase().trim(), password)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    const token = await createSession(result.id)
    const res = NextResponse.json({ user: result }, { status: 201 })
    res.cookies.set('virlo_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
