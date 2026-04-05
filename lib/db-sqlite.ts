/**
 * lib/db-sqlite.ts  (now backed by Supabase — filename kept for import compatibility)
 * Handles users, sessions, and per-user API keys.
 * Uses service role key — bypasses RLS, server-only.
 */

import { supabase } from './supabase'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  created_at: number  // Unix epoch seconds
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function createUser(email: string, password: string): Promise<User | { error: string }> {
  if (!supabase) return { error: 'Database not configured' }
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existing) return { error: 'Email already registered' }

  const id = crypto.randomUUID()
  const password_hash = await bcrypt.hash(password, 12)
  const created_at = Math.floor(Date.now() / 1000)

  const { error } = await supabase.from('users').insert({ id, email, password_hash, created_at })
  if (error) return { error: 'Registration failed' }

  return { id, email, created_at }
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('users')
    .select('id, email, password_hash, created_at')
    .eq('email', email)
    .maybeSingle()

  if (!data) return null
  const ok = await bcrypt.compare(password, data.password_hash)
  if (!ok) return null
  return { id: data.id, email: data.email, created_at: Number(data.created_at) }
}

export async function getUserById(id: string): Promise<User | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('users')
    .select('id, email, created_at')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null
  return { id: data.id, email: data.email, created_at: Number(data.created_at) }
}

// ── Sessions ──────────────────────────────────────────────────────────────────

const SESSION_TTL_DAYS = 30

export async function createSession(userId: string): Promise<string> {
  if (!supabase) return ''
  const id = crypto.randomBytes(32).toString('hex')
  const expires_at = Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 86400
  const { error } = await supabase.from('sessions').insert({ id, user_id: userId, expires_at })
  if (error) throw new Error(`createSession: ${error.message}`)
  return id
}

export async function getSession(token: string): Promise<{ user: User; sessionId: string } | null> {
  if (!supabase) return null
  const now = Math.floor(Date.now() / 1000)
  const { data } = await supabase
    .from('sessions')
    .select('id, expires_at, users!inner(id, email, created_at)')
    .eq('id', token)
    .gt('expires_at', now)
    .maybeSingle()

  if (!data) return null
  const u = (data as { id: string; expires_at: number; users: { id: string; email: string; created_at: number } }).users
  return {
    sessionId: data.id,
    user: { id: u.id, email: u.email, created_at: Number(u.created_at) },
  }
}

export async function deleteSession(token: string): Promise<void> {
  if (!supabase) return
  await supabase.from('sessions').delete().eq('id', token)
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('sessions').delete().eq('user_id', userId)
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export async function saveUserApiKey(userId: string, claudeKey: string): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('user_api_keys').upsert(
    { user_id: userId, claude_key: claudeKey, updated_at: Math.floor(Date.now() / 1000) },
    { onConflict: 'user_id' }
  )
  if (error) throw new Error(`saveUserApiKey: ${error.message}`)
}

export async function getUserApiKey(userId: string): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase
    .from('user_api_keys')
    .select('claude_key')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.claude_key ?? null
}

export async function deleteUserApiKey(userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('user_api_keys').delete().eq('user_id', userId)
}
