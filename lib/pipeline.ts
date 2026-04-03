// Multi-Agent Processing Pipeline
// A 6-step pipeline that transforms raw data into intelligence

export type PipelineStepStatus = 'pending' | 'processing' | 'completed' | 'error'

export interface PipelineStep {
  id: string
  name: string
  description: string
  status: PipelineStepStatus
  duration?: number
  output?: unknown
  startedAt?: number
  completedAt?: number
}

export interface PipelineState {
  id: string
  type: 'search' | 'article' | 'analysis'
  input: string
  steps: PipelineStep[]
  currentStepIndex: number
  isComplete: boolean
  startedAt: number
  completedAt?: number
  finalOutput?: unknown
}

// Define the 6 pipeline layers
export const PIPELINE_STEPS = [
  {
    id: 'ingestion',
    name: 'Ingestion Layer',
    description: 'Collecting raw data from multiple sources'
  },
  {
    id: 'filtering',
    name: 'Filtering Layer', 
    description: 'Removing noise, deduplicating, ranking relevance'
  },
  {
    id: 'enrichment',
    name: 'Enrichment Layer',
    description: 'Adding metadata, tags, and entities'
  },
  {
    id: 'virlo',
    name: 'Virlo Intelligence',
    description: 'Attaching trends, creator signals, viral content'
  },
  {
    id: 'reasoning',
    name: 'Reasoning Layer',
    description: 'AI synthesizes summary, insights, viewpoints'
  },
  {
    id: 'output',
    name: 'Output Layer',
    description: 'Final structured result with confidence scores'
  }
]

// Create a new pipeline state
export function createPipeline(type: PipelineState['type'], input: string): PipelineState {
  return {
    id: `pipeline-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    input,
    steps: PIPELINE_STEPS.map(step => ({
      ...step,
      status: 'pending' as PipelineStepStatus
    })),
    currentStepIndex: -1,
    isComplete: false,
    startedAt: Date.now()
  }
}

// Simulate step processing with realistic outputs
async function processStep(
  step: PipelineStep, 
  type: PipelineState['type'],
  input: string,
  previousOutput: unknown
): Promise<unknown> {
  // Simulate processing time (300-800ms per step)
  const processingTime = 300 + Math.random() * 500
  await new Promise(resolve => setTimeout(resolve, processingTime))
  
  // Import and use realistic output generator
  const { generateStepOutput } = await import('./pipeline-tracker')
  
  // Generate realistic outputs for each step
  return generateStepOutput(step.id, type, input, previousOutput)
}

// Run the full pipeline with callbacks for state updates
export async function runPipeline(
  pipeline: PipelineState,
  onUpdate: (state: PipelineState) => void
): Promise<PipelineState> {
  let state = { ...pipeline }
  
  for (let i = 0; i < state.steps.length; i++) {
    state.currentStepIndex = i
    state.steps[i] = {
      ...state.steps[i],
      status: 'processing',
      startedAt: Date.now()
    }
    onUpdate({ ...state })
    
    try {
      const previousOutput = i > 0 ? state.steps[i - 1].output : null
      const output = await processStep(state.steps[i], state.type, state.input, previousOutput)
      
      state.steps[i] = {
        ...state.steps[i],
        status: 'completed',
        completedAt: Date.now(),
        duration: Date.now() - (state.steps[i].startedAt || Date.now()),
        output
      }
      onUpdate({ ...state })
    } catch (error) {
      state.steps[i] = {
        ...state.steps[i],
        status: 'error',
        completedAt: Date.now()
      }
      onUpdate({ ...state })
      break
    }
  }
  
  state.isComplete = state.steps.every(s => s.status === 'completed')
  state.completedAt = Date.now()
  state.finalOutput = state.steps[state.steps.length - 1]?.output
  onUpdate({ ...state })
  
  return state
}

// Get estimated time for remaining steps
export function getEstimatedTimeRemaining(state: PipelineState): number {
  const remainingSteps = state.steps.filter(s => s.status === 'pending' || s.status === 'processing').length
  return remainingSteps * 500 // ~500ms per step average
}

// Get progress percentage
export function getPipelineProgress(state: PipelineState): number {
  const completedSteps = state.steps.filter(s => s.status === 'completed').length
  return (completedSteps / state.steps.length) * 100
}
