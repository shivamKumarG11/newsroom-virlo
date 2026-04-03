-- Virlo News Intelligence System - Database Schema
-- Phase 1: Real news ingestion and deduplication

-- Articles table - stores all news articles from multiple sources
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subtitle TEXT,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT,
  author_role TEXT,
  source TEXT NOT NULL,
  source_url TEXT UNIQUE NOT NULL,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ingested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_time INTEGER,
  
  -- Deduplication and quality control
  normalized_hash TEXT UNIQUE,
  duplicate_of UUID REFERENCES articles(id) ON DELETE SET NULL,
  quality_score FLOAT,
  is_duplicate BOOLEAN DEFAULT FALSE,
  
  -- Indexing for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_score CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1))
);

-- News sources table - tracks sources and ingestion status
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('api', 'rss', 'mock')),
  api_key_env VARCHAR(100),
  feed_url TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  last_ingested_at TIMESTAMP WITH TIME ZONE,
  total_articles_ingested INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pipeline execution logs - tracks pipeline runs for debugging/visualization
CREATE TABLE IF NOT EXISTS pipeline_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  search_query TEXT,
  pipeline_type TEXT CHECK (pipeline_type IN ('search', 'article', 'analysis')),
  steps_data JSONB,
  total_duration_ms INTEGER,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search cache for performance
CREATE TABLE IF NOT EXISTS search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results JSONB NOT NULL,
  result_count INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_normalized_hash ON articles(normalized_hash);
CREATE INDEX IF NOT EXISTS idx_articles_ingested_at ON articles(ingested_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_cache_query_expires ON search_cache(query, expires_at);
CREATE INDEX IF NOT EXISTS idx_pipeline_executions_article ON pipeline_executions(article_id);

-- Initial news sources
INSERT INTO news_sources (name, type, api_key_env, enabled) VALUES
  ('NewsAPI', 'api', 'NEWSAPI_KEY', TRUE),
  ('GNews', 'api', 'GNEWS_KEY', TRUE),
  ('Mock Data', 'mock', NULL, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS for security (optional but recommended)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access for articles
CREATE POLICY "Articles are public" ON articles FOR SELECT USING (TRUE);
CREATE POLICY "Articles insert by service role" ON articles FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Articles update by service role" ON articles FOR UPDATE USING (TRUE);
