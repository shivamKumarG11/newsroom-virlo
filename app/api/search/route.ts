import { NextRequest, NextResponse } from 'next/server'
import { search, SearchResponse } from '@/lib/search'
import { createPipeline, runPipeline, PipelineState } from '@/lib/pipeline'
import { savePipelineExecution } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // Create and run pipeline for search
    const pipeline = createPipeline('search', query)
    
    let finalPipeline: PipelineState = pipeline
    await runPipeline(pipeline, (state) => {
      finalPipeline = state
    })

    // Execute actual search
    const searchResults: SearchResponse = await search(query)

    // Save pipeline execution to database
    if (searchResults.results.length > 0) {
      try {
        await savePipelineExecution({
          article_id: `search-${Date.now()}`,
          pipeline_type: 'search',
          steps: finalPipeline.steps.map(s => ({
            id: s.id,
            name: s.name,
            status: s.status,
            duration: s.duration,
            output: s.output
          })),
          status: finalPipeline.isComplete ? 'completed' : 'error'
        })
      } catch (dbError) {
        console.error('Error saving pipeline execution:', dbError)
        // Don't fail the search if we can't save the pipeline
      }
    }

    return NextResponse.json({
      success: true,
      query,
      results: searchResults.results,
      suggestions: searchResults.suggestions,
      relatedTopics: searchResults.relatedTopics,
      totalResults: searchResults.totalResults,
      processingTime: searchResults.processingTime,
      pipeline: {
        steps: finalPipeline.steps,
        isComplete: finalPipeline.isComplete,
        totalDuration: finalPipeline.completedAt 
          ? finalPipeline.completedAt - finalPipeline.startedAt
          : 0
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        error: 'Failed to perform search',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
