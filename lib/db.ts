let supabase: any = null

try {
  const { createClient } = require('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey)
  }
} catch (error) {
  console.log('[v0] Supabase client not available - using mock data')
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

export interface NewsSource {
  id: string
  name: string
  type: 'newsapi' | 'gnews' | 'rss'
  api_key?: string
  rss_url?: string
  is_active: boolean
  created_at: string
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

// Article operations
export async function getArticles(
  limit: number = 50,
  offset: number = 0,
  category?: string
): Promise<Article[]> {
  if (!supabase) {
    console.log('[v0] Supabase not available, returning empty array')
    return []
  }

  try {
    let query = supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching articles:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Database error:', error)
    return []
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching article:', error)
    return null
  }

  return data
}

export async function searchArticles(
  query: string,
  limit: number = 50
): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .or(
      `title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`
    )
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching articles:', error)
    return []
  }

  return data || []
}

export async function upsertArticle(article: Partial<Article>): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .upsert({
      ...article,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting article:', error)
    return null
  }

  return data
}

export async function upsertArticles(articles: Partial<Article>[]): Promise<Article[]> {
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

// News source operations
export async function getNewsSources(): Promise<NewsSource[]> {
  const { data, error } = await supabase
    .from('news_sources')
    .select('*')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching news sources:', error)
    return []
  }

  return data || []
}

export async function createNewsSource(source: Partial<NewsSource>): Promise<NewsSource | null> {
  const { data, error } = await supabase
    .from('news_sources')
    .insert([source])
    .select()
    .single()

  if (error) {
    console.error('Error creating news source:', error)
    return null
  }

  return data
}

// Pipeline operations
export async function savePipelineExecution(execution: Partial<PipelineExecution>): Promise<PipelineExecution | null> {
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

export async function getPipelineExecutions(articleId: string): Promise<PipelineExecution[]> {
  const { data, error } = await supabase
    .from('pipeline_executions')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pipeline executions:', error)
    return []
  }

  return data || []
}

// Check for duplicate articles
export async function articleExists(url: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .eq('url', url)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows found" which is expected
    console.error('Error checking article existence:', error)
  }

  return !!data
}

export async function getArticleCount(): Promise<number> {
  if (!supabase) {
    console.log('[v0] Supabase not available, returning 0')
    return 0
  }

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
