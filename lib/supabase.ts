/**
 * lib/supabase.ts
 * Server-side Supabase client using the service role key.
 * Only import this in server-side code (API routes, server components).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Accept both SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL (the latter is set in .env.local)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Export null when not configured — callers must guard with `if (!supabase) return`
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
    : null
