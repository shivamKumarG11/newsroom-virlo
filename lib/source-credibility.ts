/**
 * Source Credibility System
 * Maps news outlets to credibility tiers with visual indicators
 */

export type CredibilityTier = 'tier1' | 'tier2' | 'tier3'

export interface SourceCredibility {
  tier: CredibilityTier
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: string // emoji or abbreviation
  description: string
}

// Tier 1: Premier global news organizations with strong editorial standards
const TIER1_SOURCES = new Set([
  'bbc',
  'bbc news',
  'bbc technology',
  'bbc business',
  'bbc science',
  'bbc world',
  'reuters',
  'reuters technology',
  'associated press',
  'ap news',
  'ap',
  'the new york times',
  'nytimes',
  'the guardian',
  'guardian',
  'the guardian technology',
  'financial times',
  'ft',
  'the wall street journal',
  'wsj',
  'bloomberg',
  'npr',
  'the economist',
  'al jazeera',
  'deutsche welle',
  'dw',
  'france 24',
  'the washington post',
])

// Tier 2: Reputable specialist and tech publications
const TIER2_SOURCES = new Set([
  'techcrunch',
  'wired',
  'ars technica',
  'the verge',
  'engadget',
  'mit technology review',
  'ieee spectrum',
  'nature',
  'science',
  'hacker news',
  'arstechnica',
  'quartz',
  'axios',
  'politico',
  'statista',
  'cnbc',
  'cnn',
  'abc news',
  'nbc news',
  'cbs news',
  'sky news',
  'der spiegel',
  'le monde',
  'time',
  'the atlantic',
  'new scientist',
  'scientific american',
])

export function getSourceCredibility(sourceName: string): SourceCredibility {
  const normalized = sourceName.toLowerCase().trim()

  if (TIER1_SOURCES.has(normalized)) {
    return {
      tier: 'tier1',
      label: 'Verified',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      icon: '✓',
      description: 'Tier 1 global news organization with established editorial standards',
    }
  }

  if (TIER2_SOURCES.has(normalized)) {
    return {
      tier: 'tier2',
      label: 'Trusted',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: '●',
      description: 'Reputable specialist publication',
    }
  }

  // Check for partial matches (e.g., "BBC News – Science" → tier1)
  for (const tier1 of TIER1_SOURCES) {
    if (normalized.includes(tier1) || tier1.includes(normalized.split(' ')[0])) {
      return {
        tier: 'tier1',
        label: 'Verified',
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        borderColor: 'border-emerald-200 dark:border-emerald-800',
        icon: '✓',
        description: 'Tier 1 global news organization',
      }
    }
  }
  for (const tier2 of TIER2_SOURCES) {
    if (normalized.includes(tier2) || tier2.includes(normalized.split(' ')[0])) {
      return {
        tier: 'tier2',
        label: 'Trusted',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        icon: '●',
        description: 'Reputable specialist publication',
      }
    }
  }

  return {
    tier: 'tier3',
    label: 'Source',
    color: 'text-slate-500 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-900/30',
    borderColor: 'border-slate-200 dark:border-slate-700',
    icon: '○',
    description: 'News source',
  }
}

/** Get a short display abbreviation for a source */
export function getSourceAbbreviation(sourceName: string): string {
  const abbrevMap: Record<string, string> = {
    'bbc news': 'BBC',
    'bbc': 'BBC',
    'reuters': 'Reuters',
    'associated press': 'AP',
    'ap news': 'AP',
    'the new york times': 'NYT',
    'nytimes': 'NYT',
    'the guardian': 'Guardian',
    'the wall street journal': 'WSJ',
    'financial times': 'FT',
    'techcrunch': 'TC',
    'mit technology review': 'MIT TR',
    'bloomberg': 'Bloomberg',
    'hacker news': 'HN',
    'the verge': 'Verge',
    'ars technica': 'Ars',
  }

  const normalized = sourceName.toLowerCase().trim()
  return abbrevMap[normalized] || sourceName
}
