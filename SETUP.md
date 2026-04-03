# Virlo AI Intelligence Platform - Setup Guide

## Overview

Virlo is a proprietary AI-powered news intelligence platform featuring:
- **Multi-source news aggregation** from NewsAPI, GNews, and RSS feeds
- **6-layer intelligence pipeline** with real-time processing visualization
- **Advanced semantic search** with database-backed results
- **Live statistics dashboard** showing real-time system metrics
- **Database persistence** using Supabase PostgreSQL

## Quick Start

### Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- Supabase account (free tier works)
- (Optional) NewsAPI and GNews API keys for real news

### 1. Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**Optional Variables:**
- `NEWS_API_KEY` - For real NewsAPI data (get from https://newsapi.org)
- `GNEWS_API_KEY` - For GNews data (get from https://gnews.io)
- `INGEST_API_KEY` - Secure key for /api/ingest endpoint

### 2. Database Setup

The database schema is created automatically via SQL migration:

```bash
# Already executed during project setup
# Tables created:
# - articles (news articles with full text)
# - news_sources (configured data sources)
# - pipeline_executions (pipeline run history)
# - search_cache (cached search results)
```

### 3. Installation & Running

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Populate with News Data

#### Option A: Using Mock Data (Recommended for Testing)

The application automatically falls back to high-quality mock data if the database is empty. No action needed.

#### Option B: Real News Data

Seed the database with real articles:

```bash
# Using Node.js
node scripts/seed-news.js
```

Or via API:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INGEST_API_KEY" \
  -d '{"category":"technology","force":true}'
```

## Architecture

### 6-Layer Intelligence Pipeline

1. **Ingestion** - Aggregates articles from 50+ trusted sources
2. **Filtering** - Removes duplicates and low-relevance content
3. **Enrichment** - Adds entities, tags, and semantic metadata
4. **Virlo Intelligence** - Calculates trend scores and social signals
5. **Reasoning** - AI synthesizes insights and analysis
6. **Output** - Delivers structured, verified intelligence

### Key Components

- `/lib/db.ts` - Supabase database operations
- `/lib/news-aggregator.ts` - Multi-source news fetching
- `/lib/pipeline.ts` - Pipeline orchestration
- `/lib/pipeline-tracker.ts` - Real-time pipeline state management
- `/lib/search.ts` - Semantic search with keyword expansion
- `/app/api/ingest/route.ts` - News ingestion endpoint
- `/app/api/search/route.ts` - Server-side search with pipeline execution
- `/components/landing/intelligence-engine.tsx` - Homepage showcase
- `/components/pipeline/pipeline-visualization.tsx` - Real-time step visualization

## API Endpoints

### GET /api/ingest
Check database population status

```bash
curl http://localhost:3000/api/ingest
# Returns: { status: 'populated', articleCount: 150, ... }
```

### POST /api/ingest
Manually trigger news ingestion

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"category":"technology","force":true}'
```

### GET /api/search?q=query
Server-side search with pipeline execution

```bash
curl http://localhost:3000/api/search?q=artificial%20intelligence
```

## Key Features

### Real News Data
- Fetches from NewsAPI, GNews, and database
- Automatic deduplication by URL and content hash
- Fallback to mock data if sources unavailable

### Advanced Search
- Semantic query expansion (e.g., "ai" → artificial intelligence, machine learning, etc.)
- Keyword and semantic scoring
- Search highlights with relevant excerpts
- Related topics recommendations

### Live Pipeline Visualization
- Real-time step progression display
- Processing time tracking
- Detailed step outputs (articles processed, entities extracted, etc.)
- Confidence scores per layer

### Intelligence Statistics
- Live article count from database
- Active source count
- Pipeline execution counter
- Average processing time
- System accuracy metrics

## Performance Optimization

### Caching Strategy

1. **Database Queries** - Cached via Supabase connection pooling
2. **News Articles** - 5-minute in-memory cache
3. **Search Results** - Database cache table (optional)
4. **Pipeline Executions** - Saved to database for analytics

### Database Indexes

```sql
-- Recommended indexes for performance
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_url ON articles(url);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_pipeline_article_id ON pipeline_executions(article_id);
```

### Background Tasks

For production, implement:
- Scheduled news ingestion (every 1-2 hours)
- Old article cleanup (beyond 30 days)
- Pipeline execution archival
- Search cache invalidation

Example with cron:

```typescript
// app/api/cron/ingest/route.ts
export async function GET() {
  // Called by external cron service
  await newsAggregator.aggregateNews('technology')
  return Response.json({ success: true })
}
```

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy - Vercel automatically builds and optimizes

```bash
# Vercel automatically detects Next.js
# Just push to main branch
git push origin main
```

### Other Platforms

Works with any Node.js 18+ host:
- Heroku, Railway, Fly.io
- Docker deployment supported
- Serverless functions compatible

## Troubleshooting

### Database Connection Issues

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Verify connection in browser console
import { supabase } from '@/lib/db'
await supabase.from('articles').select('count(*)')
```

### No Articles Showing

1. Check database status: `GET /api/ingest`
2. If empty, seed data: `npm run seed` or use API
3. Verify environment variables are set
4. Check browser console for errors

### Pipeline Not Visualizing

1. Ensure `/api/search` endpoint is accessible
2. Check browser Network tab for failed requests
3. Verify Supabase connection with `GET /api/ingest`

### Slow Search Results

1. Add database indexes (see Performance Optimization)
2. Check network tab for slow API responses
3. Verify Supabase query performance in dashboard
4. Consider increasing connection pool size

## Development Tips

### Testing Search
```bash
# Visit search page with query
http://localhost:3000/search?q=artificial+intelligence

# Watch pipeline visualize in real-time
# Check browser console for search API responses
```

### Testing News Ingestion
```bash
# Check current database status
curl http://localhost:3000/api/ingest

# Seed real data if needed
node scripts/seed-news.js

# Monitor pipeline executions
# They're saved to database_executions table
```

### Monitoring Pipelines
```typescript
// Check saved pipelines in Supabase
const { data: pipelines } = await supabase
  .from('pipeline_executions')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)
```

## Next Steps for Production

1. **Analytics** - Track pipeline performance, search queries, user engagement
2. **Caching** - Implement Redis for distributed caching
3. **Rate Limiting** - Add API rate limiting on ingest/search endpoints
4. **Authentication** - Add user accounts for personalized feeds
5. **Webhooks** - Send alerts for trending topics
6. **Real-time Updates** - WebSocket support for live feeds
7. **Multi-language** - Support international news sources
8. **Advanced Filtering** - Date range, source, sentiment filters

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check browser console for error messages
4. Verify environment variables
5. Review Supabase logs in dashboard
