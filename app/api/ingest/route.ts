import { NextRequest, NextResponse } from 'next/server'
import { newsAggregator } from '@/lib/news-aggregator'
import { getArticleCount } from '@/lib/db'

export const maxDuration = 300 // 5 minutes for ingestion

export async function POST(request: NextRequest) {
  try {
    // Verify API key if provided
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader !== `Bearer ${process.env.INGEST_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category = 'technology', force = false } = body

    // Get current article count
    const currentCount = await getArticleCount()
    
    // If we already have articles and force is false, return existing count
    if (currentCount > 100 && !force) {
      return NextResponse.json({
        success: true,
        message: 'Database already populated',
        articleCount: currentCount,
      })
    }

    // Aggregate news from multiple sources
    const articles = await newsAggregator.aggregateNews(category)

    // Get updated count
    const updatedCount = await getArticleCount()

    return NextResponse.json({
      success: true,
      ingestedCount: articles.length,
      totalArticles: updatedCount,
      message: `Successfully ingested ${articles.length} articles. Total articles in database: ${updatedCount}`,
    })
  } catch (error) {
    console.error('Ingestion error:', error)
    return NextResponse.json(
      {
        error: 'Failed to ingest news',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check database status
    const articleCount = await getArticleCount()

    if (articleCount === 0) {
      return NextResponse.json({
        status: 'empty',
        articleCount: 0,
        message: 'Database is empty. POST to /api/ingest to populate with news.',
      })
    }

    return NextResponse.json({
      status: 'populated',
      articleCount,
      message: 'Database is populated with articles.',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
