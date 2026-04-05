"use client"

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  email: string
  created_at: number
}

interface AuthState {
  user: AuthUser | null
  hasClaudeKey: boolean
  loading: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  saveClaudeKey: (key: string) => Promise<{ error?: string }>
  refresh: () => Promise<void>
}

export type AuthContext = AuthState & AuthActions

import React from 'react'

const Ctx = createContext<AuthContext | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, hasClaudeKey: false, loading: true })

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setState({ user: data.user ?? null, hasClaudeKey: !!data.hasClaudeKey, loading: false })
    } catch {
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? 'Login failed' }
    setState({ user: data.user, hasClaudeKey: false, loading: false })
    await refresh()
    return {}
  }, [refresh])

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? 'Registration failed' }
    setState({ user: data.user, hasClaudeKey: false, loading: false })
    return {}
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setState({ user: null, hasClaudeKey: false, loading: false })
  }, [])

  const saveClaudeKey = useCallback(async (key: string) => {
    const res = await fetch('/api/auth/api-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claudeKey: key }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error ?? 'Failed to save key' }
    setState(s => ({ ...s, hasClaudeKey: true }))
    return {}
  }, [])

  return React.createElement(Ctx.Provider, { value: { ...state, login, register, logout, saveClaudeKey, refresh } }, children)
}

export function useAuth(): AuthContext {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
