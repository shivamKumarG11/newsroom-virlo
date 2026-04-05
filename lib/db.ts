let supabase: any = null

try {
  const { createClient } = require('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey)
  }
} catch (error) {
  console.log('[db] Supabase client not available - using mock data')
}

export { supabase }

export interface Article {
  id: string
  title: string
  description: string
  content: string
  url: string
  source: string
  image_url: string | null
  published_at: string
  created_at: string
  updated_at: string
  source_id: string
  category?: string
  relevance_score?: number
}

export interface PipelineExecution {
  id: string
  article_id: string
  pipeline_type: string
  steps: Record<string, any>
  status: 'running' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export async function upsertArticles(articles: Partial<Article>[]): Promise<Article[]> {
  if (!supabase) return []

  const now = new Date().toISOString()
  const articlesWithTimestamp = articles.map((a) => ({
    ...a,
    updated_at: now,
  }))

  const { data, error } = await supabase
    .from('articles')
    .upsert(articlesWithTimestamp)
    .select()

  if (error) {
    console.error('Error upserting articles:', error)
    return []
  }

  return data || []
}

export async function savePipelineExecution(execution: Partial<PipelineExecution>): Promise<PipelineExecution | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('pipeline_executions')
    .insert([{
      ...execution,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) {
    console.error('Error saving pipeline execution:', error)
    return null
  }

  return data
}

export async function articleExists(url: string): Promise<boolean> {
  if (!supabase) return false

  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .eq('url', url)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking article existence:', error)
  }

  return !!data
}

export async function getArticleCount(): Promise<number> {
  if (!supabase) return 0

  try {
    const { count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error getting article count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Database error:', error)
    return 0
  }
}
