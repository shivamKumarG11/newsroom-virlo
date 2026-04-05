/**
 * lib/reports-db.ts
 * Supabase-backed archive of generated intelligence reports.
 */

import { supabase } from './supabase'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ArchiveReport {
  id: string
  title: string
  topic: string | null
  digest: string | null
  editorial: string | null
  qa: { q: string; a: string }[]
  sources: { title: string; source: string; url: string }[]
  model: string | null
  provider: string | null
  created_at: string
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function saveReport(report: Omit<ArchiveReport, 'created_at'>): Promise<void> {
  if (!supabase) return  // Supabase not configured — skip silently
  const { error } = await supabase.from('reports').upsert({
    id: report.id,
    title: report.title,
    topic: report.topic ?? null,
    digest: report.digest ?? null,
    editorial: report.editorial ?? null,
    qa: report.qa ?? [],
    sources: report.sources ?? [],
    model: report.model ?? null,
    provider: report.provider ?? null,
  })
  if (error) console.warn(`saveReport: ${error.message}`)
}

export async function getReports(limit = 20): Promise<ArchiveReport[]> {
  if (!supabase) return []  // Supabase not configured
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) { console.warn(`getReports: ${error.message}`); return [] }
  return (data ?? []) as ArchiveReport[]
}

export async function getReport(id: string): Promise<ArchiveReport | null> {
  if (!supabase) return null  // Supabase not configured
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data as ArchiveReport
}
