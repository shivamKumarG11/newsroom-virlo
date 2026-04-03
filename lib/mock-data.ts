// Mock data for the newsroom - high-quality realistic articles

export interface Article {
  id: string
  slug: string
  title: string
  subtitle: string
  excerpt: string
  content: string
  category: string
  author: {
    name: string
    role: string
    avatar?: string
  }
  publishedAt: string
  readingTime: number
  imageUrl: string
  featured: boolean
  tags: string[]
  virloData?: {
    trendScore: number
    sentiment: 'positive' | 'negative' | 'neutral'
    relatedTopics: string[]
    viralContent: { title: string; platform: string; views: string }[]
  }
}

export interface TrendingTopic {
  id: string
  title: string
  category: string
  growth: number
  volume: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

export interface DailyBrief {
  date: string
  summary: string
  keyPoints: string[]
  topStories: string[]
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "ai-revolution-reshaping-creative-industries",
    title: "The AI Revolution Is Reshaping Creative Industries Faster Than Anyone Predicted",
    subtitle: "From Hollywood to Madison Avenue, artificial intelligence is transforming how content is conceived, created, and distributed",
    excerpt: "A comprehensive analysis reveals that AI adoption in creative fields has accelerated 340% in the past year alone, with major implications for employment, copyright, and the future of human creativity.",
    content: `The transformation happening in creative industries isn't just about automation—it's about a fundamental reimagining of the creative process itself.

## The Numbers Tell a Story

According to data analyzed through Virlo's trend intelligence, mentions of AI in creative contexts have increased by 847% since January. More tellingly, sentiment analysis shows a shift from predominantly skeptical to cautiously optimistic among creative professionals.

"We're not seeing AI replace creatives," explains Dr. Sarah Chen, Director of the Creative Futures Lab at MIT. "We're seeing it become an extension of the creative toolkit—like the transition from traditional to digital art, but compressed into months rather than decades."

## Industry by Industry

### Advertising
Major agencies report that AI now assists in 67% of initial concept development. The key word is "assists"—human creative directors remain essential for strategic direction and emotional resonance.

### Film and Television  
Pre-visualization, script analysis, and even early-stage VFX are increasingly AI-assisted. Warner Bros. recently disclosed that their latest blockbuster used AI to generate 40% of background elements, cutting post-production time by six weeks.

### Music
Generative AI tools for music composition have seen 500% growth in user adoption. Interestingly, professional musicians are among the most enthusiastic adopters, using AI for demo creation and collaborative ideation.

## The Human Element

Despite fears of replacement, employment in creative roles has actually increased 12% year-over-year. The emerging pattern suggests AI is creating new roles—AI creative coordinators, prompt engineers with artistic backgrounds, and human-AI collaboration specialists.

"The creatives who thrive will be those who learn to dance with the machine," notes veteran ad executive Marcus Thompson. "Pure technical skill becomes less differentiating. Vision, taste, and emotional intelligence become more valuable than ever."

## Looking Forward

Industry analysts project that by 2027, AI will be involved in some capacity in 90% of commercial creative work. The question isn't whether AI will transform creative industries—it's whether the transformation will ultimately expand or constrain human creative expression.

Based on current trends tracked by Virlo, the answer appears to be: it depends entirely on the choices we make now.`,
    category: "Technology",
    author: {
      name: "Alexandra Reid",
      role: "Senior Tech Correspondent"
    },
    publishedAt: "2026-04-03T08:00:00Z",
    readingTime: 8,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
    featured: true,
    tags: ["AI", "Creative Industry", "Future of Work", "Technology"],
    virloData: {
      trendScore: 94,
      sentiment: "neutral",
      relatedTopics: ["Generative AI", "Future of Work", "Digital Art", "Content Creation"],
      viralContent: [
        { title: "AI Art Goes Mainstream", platform: "TikTok", views: "12.4M" },
        { title: "Creator Reactions to AI Tools", platform: "YouTube", views: "3.2M" }
      ]
    }
  },
  {
    id: "2",
    slug: "global-climate-summit-breakthrough",
    title: "Historic Climate Summit Yields Unprecedented Agreement on Carbon Markets",
    subtitle: "196 nations commit to unified carbon pricing framework in what observers call a watershed moment",
    excerpt: "After two weeks of intense negotiations, world leaders have agreed to a global carbon market framework that could redirect trillions toward clean energy transition.",
    content: `In a development that climate advocates are calling a turning point, representatives from 196 nations have signed onto a unified carbon pricing framework that establishes the first truly global approach to emissions reduction.

## The Agreement

The framework, dubbed the "Geneva Accord," establishes three key mechanisms:

1. **Universal Carbon Floor Price**: A minimum price of $85 per ton of CO2, adjusted annually for inflation and economic development indicators
2. **Cross-Border Adjustment Mechanism**: Tariffs on goods from non-compliant nations, creating economic incentive for universal adoption
3. **Climate Finance Pool**: A $500 billion fund for developing nations' clean energy transition

## Market Reaction

Global markets responded immediately. Clean energy stocks surged an average of 12% in after-hours trading, while traditional oil and gas companies saw modest declines of 3-5%.

"This is the policy framework that green investment has been waiting for," said Jennifer Walsh, Chief Sustainability Officer at Goldman Sachs. "We're revising our clean energy projections upward significantly."

## The Path Forward

Implementation will occur in phases, with developed nations adopting the full framework by 2028 and developing nations receiving extended timelines based on economic capacity.

Social media sentiment tracked by Virlo shows 73% positive response globally, with particularly strong support among younger demographics. Climate content engagement has increased 400% in the past 48 hours.`,
    category: "Climate",
    author: {
      name: "Marcus Chen",
      role: "Environmental Affairs Editor"
    },
    publishedAt: "2026-04-02T14:30:00Z",
    readingTime: 6,
    imageUrl: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=1200&h=800&fit=crop",
    featured: false,
    tags: ["Climate", "Policy", "Global Affairs", "Carbon Markets"],
    virloData: {
      trendScore: 88,
      sentiment: "positive",
      relatedTopics: ["Climate Policy", "Green Investment", "Carbon Credits", "Sustainability"],
      viralContent: [
        { title: "What the Geneva Accord Means", platform: "Twitter", views: "8.1M" },
        { title: "Climate Win Explained", platform: "Instagram", views: "2.7M" }
      ]
    }
  },
  {
    id: "3",
    slug: "fintech-disruption-traditional-banking",
    title: "The Great Banking Shift: How Fintech Finally Cracked the Mainstream",
    subtitle: "New data shows digital-first banks now hold 28% of consumer deposits in major markets",
    excerpt: "A decade after the first challenger banks emerged, fintech has reached a tipping point that's forcing traditional institutions to fundamentally rethink their business models.",
    content: `The numbers are in, and they tell a story that would have seemed impossible just five years ago: digital-native financial institutions now control more than a quarter of consumer deposits in the United States, United Kingdom, and European Union.

## The Tipping Point

Several factors converged to accelerate this shift:

- **Generational Transfer**: Millennials and Gen Z now control the majority of new household formation
- **COVID Catalyst**: The pandemic normalized fully digital banking for demographics that previously resisted it  
- **Feature Parity**: Modern fintech apps now match or exceed traditional banks on core functionality

## What's Working

Virlo trend data identifies three key differentiators driving fintech adoption:

1. **Instant Everything**: Real-time transfers, instant credit decisions, immediate customer support
2. **Transparent Pricing**: No hidden fees, clear exchange rates, straightforward terms
3. **Design Excellence**: Interfaces built for mobile-first users rather than adapted from legacy systems

## Traditional Banks Respond

Legacy institutions aren't standing still. JPMorgan Chase has committed $12 billion to digital transformation. Bank of America's Erica AI assistant now handles 1 billion customer interactions annually. But the question remains whether these efforts are enough.

"The challenge for traditional banks isn't technology—it's culture," observes fintech analyst Rebecca Park. "They're trying to innovate while protecting existing revenue streams. That's like trying to steer a ship while anchoring it in place."`,
    category: "Finance",
    author: {
      name: "David Okonkwo",
      role: "Finance Correspondent"
    },
    publishedAt: "2026-04-01T10:00:00Z",
    readingTime: 7,
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=800&fit=crop",
    featured: false,
    tags: ["Fintech", "Banking", "Digital Transformation", "Finance"],
    virloData: {
      trendScore: 76,
      sentiment: "positive",
      relatedTopics: ["Digital Banking", "Neobanks", "Financial Technology", "Consumer Finance"],
      viralContent: [
        { title: "I Ditched My Bank for an App", platform: "TikTok", views: "5.3M" },
        { title: "Fintech vs Banks Comparison", platform: "YouTube", views: "1.8M" }
      ]
    }
  },
  {
    id: "4",
    slug: "remote-work-cities-transformation",
    title: "The Remote Work Migration Is Redrawing America's Economic Map",
    subtitle: "Smaller cities see unprecedented growth as knowledge workers flee expensive metros",
    excerpt: "Three years of sustained remote work has triggered the largest internal migration in American history, fundamentally altering which cities thrive and which struggle.",
    content: `Boise, Idaho. Asheville, North Carolina. Bozeman, Montana. These aren't the cities that traditionally anchored America's knowledge economy. But they're increasingly where that economy is relocating.

## The Data

Census Bureau figures released this week confirm what real estate markets have been signaling: Americans are redistributing themselves at unprecedented rates.

- **Net Migration from Top 10 Metros**: -1.2 million people since 2023
- **Fastest Growing Cities**: All have populations under 500,000
- **Remote Work Adoption**: 42% of knowledge workers now work remotely at least 3 days per week

## Economic Implications

The shift is creating winners and losers in ways that defy traditional economic logic:

**Winners:**
- Mid-sized cities with quality of life advantages
- Rural areas with broadband infrastructure
- States with no income tax

**Losers:**
- Commercial real estate in major metros
- Public transit systems dependent on commuter revenue
- Service industries in downtown cores

## Social Dynamics

Virlo sentiment analysis reveals complex community reactions. In destination cities, longtime residents express mixed feelings—appreciation for economic growth alongside concerns about affordability and cultural change.

"We moved here to escape the Bay Area rat race," notes one Boise resident whose comments typify the sentiment. "Now we're worried we're bringing it with us."`,
    category: "Society",
    author: {
      name: "Jennifer Walsh",
      role: "National Correspondent"
    },
    publishedAt: "2026-03-31T09:00:00Z",
    readingTime: 6,
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop",
    featured: false,
    tags: ["Remote Work", "Migration", "Real Estate", "Economy"],
    virloData: {
      trendScore: 71,
      sentiment: "neutral",
      relatedTopics: ["Work From Home", "Real Estate", "Urban Development", "Cost of Living"],
      viralContent: [
        { title: "Why I Left NYC for Montana", platform: "YouTube", views: "4.1M" },
        { title: "Remote Work Changed My Life", platform: "TikTok", views: "7.8M" }
      ]
    }
  },
  {
    id: "5",
    slug: "quantum-computing-practical-applications",
    title: "Quantum Computing Exits the Lab: First Commercial Applications Go Live",
    subtitle: "After decades of theoretical promise, quantum computers are finally solving real-world problems",
    excerpt: "IBM and Google have announced the first commercially deployed quantum computing services, marking a transition from research curiosity to practical business tool.",
    content: `The quantum computing revolution that researchers have promised for decades is finally, quietly, becoming reality. This week marks a milestone: the first deployment of quantum computing for commercial applications at meaningful scale.

## What's Now Possible

IBM's Quantum Network now offers cloud-based quantum computing services to enterprise clients solving problems in:

- **Drug Discovery**: Simulating molecular interactions with unprecedented accuracy
- **Financial Modeling**: Portfolio optimization that accounts for thousands of variables simultaneously
- **Logistics**: Route optimization across global supply chains
- **Materials Science**: Designing new materials with specific properties

## The Technical Breakthrough

The key advancement isn't raw qubit count—it's error correction. IBM's latest systems achieve error rates low enough for practical computation, a threshold that researchers have been pursuing for over two decades.

"We've moved from asking 'will quantum computers work?' to asking 'what should we use them for?'" explains Dr. Jay Gambetta, IBM's VP of Quantum Computing. "That's a fundamentally different conversation."

## Market Implications

Venture capital has responded. Quantum computing startups raised $2.1 billion in Q1 2026, more than the entire previous year. Virlo tracking shows "quantum computing" mentions in business contexts up 340% year-over-year.

The technology won't replace classical computers—the two are complementary. But for specific problem types, quantum offers advantages that no amount of classical computing power can match.`,
    category: "Technology",
    author: {
      name: "Dr. Sarah Mitchell",
      role: "Science & Technology Editor"
    },
    publishedAt: "2026-03-30T11:00:00Z",
    readingTime: 7,
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=800&fit=crop",
    featured: false,
    tags: ["Quantum Computing", "Technology", "Innovation", "Enterprise"],
    virloData: {
      trendScore: 82,
      sentiment: "positive",
      relatedTopics: ["Quantum Technology", "Enterprise Computing", "IBM", "Google"],
      viralContent: [
        { title: "Quantum Computing Explained Simply", platform: "YouTube", views: "2.9M" },
        { title: "The Quantum Future Is Here", platform: "Twitter", views: "1.4M" }
      ]
    }
  }
]

export const trendingTopics: TrendingTopic[] = [
  { id: "1", title: "AI Creative Tools", category: "Technology", growth: 847, volume: "2.4M", sentiment: "positive" },
  { id: "2", title: "Geneva Climate Accord", category: "Climate", growth: 523, volume: "1.8M", sentiment: "positive" },
  { id: "3", title: "Digital Banking Adoption", category: "Finance", growth: 234, volume: "890K", sentiment: "positive" },
  { id: "4", title: "Remote Work Migration", category: "Society", growth: 178, volume: "1.2M", sentiment: "neutral" },
  { id: "5", title: "Quantum Computing", category: "Technology", growth: 340, volume: "670K", sentiment: "positive" },
  { id: "6", title: "Electric Vehicle Sales", category: "Auto", growth: 156, volume: "980K", sentiment: "positive" },
]

export const dailyBrief: DailyBrief = {
  date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  summary: "Today's news cycle is dominated by the ongoing AI transformation in creative industries, with major implications for employment and intellectual property. Climate policy continues to generate optimistic sentiment following the Geneva Accord, while fintech's disruption of traditional banking reaches new milestones.",
  keyPoints: [
    "AI adoption in creative fields accelerated 340% in the past year",
    "196 nations signed onto global carbon pricing framework",
    "Digital banks now hold 28% of consumer deposits in major markets",
    "Remote work migration reshaping American economic geography",
    "Quantum computing transitions from research to commercial deployment"
  ],
  topStories: [
    "ai-revolution-reshaping-creative-industries",
    "global-climate-summit-breakthrough",
    "fintech-disruption-traditional-banking"
  ]
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(article => article.slug === slug)
}

export function getFeaturedArticle(): Article | undefined {
  return articles.find(article => article.featured)
}

export function getRecentArticles(limit: number = 5): Article[] {
  return articles.slice(0, limit)
}

export function getRelatedArticles(currentSlug: string, limit: number = 3): Article[] {
  const current = getArticleBySlug(currentSlug)
  if (!current) return []
  
  return articles
    .filter(a => a.slug !== currentSlug && a.tags.some(tag => current.tags.includes(tag)))
    .slice(0, limit)
}
