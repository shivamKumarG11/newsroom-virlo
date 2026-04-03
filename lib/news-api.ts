// News Ingestion System - Multi-source aggregation with deduplication
// Supports GNews, NewsAPI, and fallback to high-quality mock data

export interface NewsSource {
  id: string
  name: string
  type: 'api' | 'rss' | 'mock'
}

export interface RawNewsArticle {
  source: NewsSource
  title: string
  description: string
  content: string
  url: string
  urlToImage: string
  publishedAt: string
  author?: string
}

export interface NormalizedArticle {
  id: string
  slug: string
  title: string
  subtitle: string
  excerpt: string
  content: string
  source: string
  sourceUrl: string
  publishedAt: string
  author: {
    name: string
    role: string
  }
  imageUrl: string
  tags: string[]
  category: string
  readingTime: number
}

// Simulated news feed with realistic articles that refresh
const NEWS_FEED: RawNewsArticle[] = [
  {
    source: { id: 'gnews', name: 'GNews', type: 'api' },
    title: "OpenAI Announces GPT-5 with Unprecedented Reasoning Capabilities",
    description: "The latest iteration of OpenAI's language model demonstrates significant improvements in logical reasoning and multi-step problem solving.",
    content: `OpenAI has unveiled GPT-5, marking a significant leap in artificial intelligence capabilities. The new model demonstrates unprecedented abilities in complex reasoning, mathematical problem-solving, and multi-step planning tasks.

According to internal benchmarks shared during the announcement, GPT-5 achieves 92% accuracy on graduate-level science questions, compared to 78% for its predecessor. The model also shows remarkable improvements in code generation, with a 40% reduction in bugs for complex programming tasks.

"This represents a fundamental shift in what AI systems can accomplish," said OpenAI CEO Sam Altman during the keynote. "We're seeing emergent capabilities in planning and reasoning that we didn't explicitly train for."

Industry analysts are closely watching how this development will impact enterprise adoption. Early access partners, including Microsoft and several Fortune 500 companies, report significant productivity gains in pilot programs.

The release comes amid intense competition in the AI space, with Anthropic, Google, and Meta all racing to develop more capable systems. Experts suggest this announcement could accelerate the timeline for artificial general intelligence research.`,
    url: "https://example.com/gpt5-announcement",
    urlToImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    author: "Sarah Chen"
  },
  {
    source: { id: 'newsapi', name: 'NewsAPI', type: 'api' },
    title: "Federal Reserve Signals Potential Rate Cuts Amid Cooling Inflation",
    description: "Fed Chair Powell's testimony suggests the central bank may begin easing monetary policy as inflation trends toward target.",
    content: `Federal Reserve Chair Jerome Powell indicated in Congressional testimony today that the central bank is increasingly confident inflation is moving sustainably toward its 2% target, opening the door for potential interest rate cuts in the coming months.

"The labor market has come into better balance, and inflation has made considerable progress toward our target," Powell told the Senate Banking Committee. "If that progress continues, we will be in a position to begin normalizing policy."

Markets responded positively to the news, with the S&P 500 rising 1.2% and bond yields falling. Investors are now pricing in a 75% probability of a rate cut at the Fed's September meeting.

The shift in tone marks a significant evolution from the Fed's hawkish stance over the past two years, during which it raised rates to their highest level in over two decades to combat surging prices.

Economists caution that the path forward remains uncertain. "The Fed is navigating a delicate balance," noted Goldman Sachs chief economist Jan Hatzius. "They want to avoid cutting too soon and reigniting inflation, but also don't want to keep policy too tight for too long and risk a recession."`,
    url: "https://example.com/fed-rate-cuts",
    urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    author: "Michael Torres"
  },
  {
    source: { id: 'gnews', name: 'GNews', type: 'api' },
    title: "Breakthrough in Solid-State Battery Technology Could Revolutionize EVs",
    description: "Toyota announces production-ready solid-state batteries with 900-mile range and 10-minute charging.",
    content: `Toyota Motor Corporation has announced a major breakthrough in solid-state battery technology that could dramatically accelerate electric vehicle adoption. The company unveiled production-ready batteries offering 900 miles of range on a single charge with a recharging time of just 10 minutes.

"This is the holy grail of battery technology," said Toyota Chief Technology Officer Hiroki Nakajima. "We've solved the fundamental challenges that have held back solid-state batteries for decades."

The new batteries use a proprietary sulfide-based solid electrolyte that Toyota has been developing for over 15 years. Unlike traditional lithium-ion batteries that use liquid electrolytes, solid-state batteries are safer, more energy-dense, and can charge faster.

Industry experts are cautiously optimistic about the announcement. "If Toyota can deliver on these specifications at scale, it would be transformative," said BloombergNEF analyst Victoria Setyawan. "The question is whether they can manufacture these batteries economically."

Toyota plans to begin mass production in 2027, with initial deployment in their luxury Lexus brand. The technology could eventually trickle down to more affordable models, potentially making EVs competitive with internal combustion vehicles on both range and refueling convenience.`,
    url: "https://example.com/toyota-solid-state",
    urlToImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    author: "Yuki Tanaka"
  },
  {
    source: { id: 'newsapi', name: 'NewsAPI', type: 'api' },
    title: "Tech Giants Form Coalition to Address AI Safety Concerns",
    description: "Microsoft, Google, OpenAI, and Anthropic establish joint framework for responsible AI development.",
    content: `The world's leading artificial intelligence companies have announced the formation of the Frontier AI Safety Coalition, a joint initiative to address growing concerns about the risks posed by increasingly powerful AI systems.

The coalition, which includes Microsoft, Google, OpenAI, Anthropic, and Meta, will develop shared safety standards, conduct joint research on AI alignment, and create an early warning system for potentially dangerous capabilities.

"We recognize that AI safety is not a competitive advantage—it's a shared responsibility," said Microsoft President Brad Smith. "By working together, we can ensure that AI development benefits humanity while managing its risks."

The announcement comes amid mounting pressure from governments worldwide to regulate AI development. The European Union recently passed the AI Act, and the United States is considering similar legislation.

Critics have questioned whether industry self-regulation is sufficient. "This is a positive step, but we need independent oversight," said AI ethics researcher Timnit Gebru. "The companies developing these systems shouldn't be the sole arbiters of what's safe."

The coalition plans to publish its first set of safety guidelines by year's end, with independent auditing mechanisms to follow.`,
    url: "https://example.com/ai-safety-coalition",
    urlToImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    author: "Jennifer Walsh"
  },
  {
    source: { id: 'gnews', name: 'GNews', type: 'api' },
    title: "SpaceX Starship Completes First Successful Orbital Flight",
    description: "After years of testing, SpaceX's massive rocket system achieves full orbital capability.",
    content: `SpaceX's Starship rocket system has successfully completed its first full orbital flight, marking a historic milestone in commercial space exploration and bringing Elon Musk's vision of Mars colonization one step closer to reality.

The mission launched from SpaceX's Starbase facility in Boca Chica, Texas, with the Super Heavy booster successfully returning to the launch site for a catch landing, while the Starship upper stage completed a full orbit before splashing down in the Pacific Ocean.

"This is what we've been working toward for years," Musk said in a post-flight briefing. "Starship is the key to making life multiplanetary. Today's success shows that our architecture works."

The flight validates SpaceX's innovative approach to rocket design, which prioritizes rapid reusability over the traditional expendable rocket model. The company aims to eventually achieve aircraft-like operations, with rockets launching and landing multiple times per day.

NASA, which has contracted SpaceX to develop a Starship variant for the Artemis moon landing program, congratulated the company on the achievement. "This success brings us closer to returning humans to the lunar surface," said NASA Administrator Bill Nelson.

SpaceX plans to conduct additional orbital flights in the coming months, with the goal of demonstrating full reusability of both stages by year's end.`,
    url: "https://example.com/starship-orbital",
    urlToImage: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    author: "David Park"
  },
  {
    source: { id: 'newsapi', name: 'NewsAPI', type: 'api' },
    title: "Global Semiconductor Shortage Shows Signs of Easing",
    description: "New fab capacity coming online as industry adjusts to post-pandemic demand patterns.",
    content: `The global semiconductor shortage that disrupted industries worldwide is finally showing signs of abating, according to industry analysts, as new manufacturing capacity comes online and demand patterns normalize following pandemic-era distortions.

TSMC, the world's largest contract chipmaker, reported that lead times for advanced chips have decreased from 52 weeks to 26 weeks over the past quarter. Intel and Samsung have similarly noted improvements in their ability to meet customer orders.

"We're entering a new equilibrium," said Gartner analyst Alan Priestley. "The panic buying and double-ordering that exacerbated the shortage has largely subsided, and the capacity investments made over the past three years are beginning to pay off."

The automotive industry, which was particularly hard hit by the shortage, has seen production recover to near pre-pandemic levels. General Motors and Ford both reported that chip constraints are no longer limiting their manufacturing output.

However, analysts caution that the industry remains vulnerable to future disruptions. Geopolitical tensions, particularly concerning Taiwan, continue to pose risks to the semiconductor supply chain. The US CHIPS Act and similar initiatives in Europe and Asia are aimed at diversifying production, but new fabs take years to build.

"We've learned the hard way how dependent the global economy is on semiconductors," noted Commerce Secretary Gina Raimondo. "Building resilience in this sector remains a top priority."`,
    url: "https://example.com/chip-shortage-easing",
    urlToImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
    author: "Lisa Wong"
  },
  {
    source: { id: 'gnews', name: 'GNews', type: 'api' },
    title: "Major Clinical Trial Shows Promise for Universal Flu Vaccine",
    description: "NIH-backed vaccine demonstrates broad protection against multiple influenza strains.",
    content: `A universal flu vaccine developed by researchers at the National Institutes of Health has shown promising results in a large-scale clinical trial, potentially paving the way for a single shot that provides long-lasting protection against multiple influenza strains.

The vaccine, which targets a conserved region of the influenza virus that rarely mutates, induced robust immune responses against 20 different flu strains in phase 2 trials involving 4,000 participants. Side effects were comparable to existing seasonal flu vaccines.

"This could be a game-changer for public health," said Dr. Anthony Fauci, who has long advocated for universal flu vaccine research. "Instead of annual shots that vary in effectiveness, we could offer durable protection with a single vaccine course."

The current seasonal flu vaccine must be reformulated each year based on predictions about which strains will circulate, resulting in varying effectiveness—sometimes as low as 20% in poorly matched years. A universal vaccine could eliminate this guesswork.

If phase 3 trials are successful, the vaccine could receive FDA approval as early as 2028. Researchers estimate that a universal flu vaccine could prevent up to 500,000 hospitalizations and 50,000 deaths annually in the United States alone.

Several pharmaceutical companies have expressed interest in partnering on manufacturing and distribution.`,
    url: "https://example.com/universal-flu-vaccine",
    urlToImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5 hours ago
    author: "Dr. Emma Rodriguez"
  },
  {
    source: { id: 'newsapi', name: 'NewsAPI', type: 'api' },
    title: "Renewable Energy Surpasses Coal in Global Electricity Generation",
    description: "Wind and solar now produce more electricity worldwide than coal for the first time in history.",
    content: `Renewable energy sources have overtaken coal in global electricity generation for the first time in history, according to new data from the International Energy Agency, marking a watershed moment in the world's energy transition.

Wind and solar power alone now account for 28% of global electricity production, up from just 5% a decade ago. When combined with hydroelectric and other renewables, clean energy sources now generate 42% of the world's electricity.

"This is a historic turning point," said IEA Executive Director Fatih Birol. "The energy transition is no longer a future scenario—it's happening now, faster than many predicted."

The shift has been driven by dramatic cost reductions in renewable technology. Solar panel costs have fallen 90% since 2010, while wind turbine costs have dropped 70%. In many markets, new renewable capacity is now cheaper than operating existing coal plants.

China, despite being the world's largest coal consumer, has also become the largest installer of renewable energy, adding more wind and solar capacity last year than the rest of the world combined.

However, experts caution that much work remains. "Generation is one thing, but we still need to solve storage and grid integration," noted Columbia University energy researcher Jesse Jenkins. "The next decade will be about building the infrastructure to support a renewable-dominated grid."`,
    url: "https://example.com/renewables-surpass-coal",
    urlToImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
    author: "Marcus Green"
  },
  {
    source: { id: 'gnews', name: 'GNews', type: 'api' },
    title: "Apple Unveils Revolutionary AR Glasses at WWDC",
    description: "Next-generation wearable promises seamless integration of digital and physical worlds.",
    content: `Apple has unveiled its long-rumored augmented reality glasses at its annual Worldwide Developers Conference, promising a revolutionary new computing paradigm that seamlessly blends digital content with the physical world.

The device, called Apple Vision, weighs just 150 grams—dramatically lighter than the company's previous Vision Pro headset—and looks nearly indistinguishable from regular glasses. It projects high-resolution content directly into the user's field of view using a proprietary micro-LED display system.

"This is the most ambitious product we've ever created," said Apple CEO Tim Cook. "Vision represents the next chapter of personal computing—technology that enhances your world without removing you from it."

Key features include all-day battery life, real-time translation of foreign languages appearing as subtitles in the user's vision, navigation arrows overlaid on streets, and the ability to identify people and objects in real-time.

The glasses will integrate tightly with the Apple ecosystem, displaying iPhone notifications, enabling FaceTime calls with holographic participants, and allowing users to place virtual objects in their environment.

Apple Vision will launch at $999—significantly more accessible than the $3,499 Vision Pro—though some analysts question whether mainstream consumers are ready for always-on AR. The device ships in September.`,
    url: "https://example.com/apple-ar-glasses",
    urlToImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(), // 7 hours ago
    author: "Jessica Liu"
  },
  {
    source: { id: 'newsapi', name: 'NewsAPI', type: 'api' },
    title: "Historic Bipartisan Infrastructure Bill Clears Senate",
    description: "Trillion-dollar package includes funding for roads, bridges, broadband, and clean energy.",
    content: `The United States Senate has passed a historic bipartisan infrastructure bill, sending over $1.2 trillion in funding to states and localities for roads, bridges, public transit, broadband expansion, and clean energy projects.

The bill passed 72-28, with significant Republican support, marking a rare moment of bipartisan cooperation in an increasingly polarized Congress. President Biden is expected to sign the legislation into law next week.

"This proves that we can still come together to address the big challenges facing our country," said Senate Majority Leader Chuck Schumer. "This investment will create millions of jobs and upgrade our infrastructure for the 21st century."

Key provisions include $110 billion for roads and bridges, $66 billion for passenger and freight rail, $65 billion for broadband expansion, $55 billion for clean water infrastructure, and $7.5 billion for electric vehicle charging stations.

The bill has drawn praise from both business groups and labor unions. "This is exactly the kind of investment American companies need to compete globally," said US Chamber of Commerce CEO Suzanne Clark.

Critics on the left argue the bill doesn't go far enough on climate change, while some on the right contend it spends too much. Despite these objections, the legislation's passage represents a significant political achievement for the Biden administration.`,
    url: "https://example.com/infrastructure-bill",
    urlToImage: "https://images.unsplash.com/photo-1569561422614-72e422f28a92?w=1200&h=800&fit=crop",
    publishedAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(), // 8 hours ago
    author: "Robert Washington"
  }
]

// Generate a unique slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

// Estimate reading time from content
function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

// Extract category from content using simple keyword matching
function extractCategory(content: string, title: string): string {
  const text = `${title} ${content}`.toLowerCase()
  
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('machine learning')) {
    return 'Technology'
  }
  if (text.includes('stock') || text.includes('fed') || text.includes('economy') || text.includes('bank')) {
    return 'Finance'
  }
  if (text.includes('climate') || text.includes('renewable') || text.includes('solar') || text.includes('energy')) {
    return 'Climate'
  }
  if (text.includes('space') || text.includes('nasa') || text.includes('rocket')) {
    return 'Space'
  }
  if (text.includes('health') || text.includes('vaccine') || text.includes('medical')) {
    return 'Health'
  }
  if (text.includes('apple') || text.includes('google') || text.includes('microsoft') || text.includes('meta')) {
    return 'Tech Companies'
  }
  if (text.includes('congress') || text.includes('senate') || text.includes('president')) {
    return 'Politics'
  }
  if (text.includes('semiconductor') || text.includes('chip') || text.includes('processor')) {
    return 'Semiconductors'
  }
  if (text.includes('electric') || text.includes('battery') || text.includes('ev')) {
    return 'Electric Vehicles'
  }
  
  return 'General'
}

// Extract tags from content
function extractTags(content: string, title: string): string[] {
  const text = `${title} ${content}`.toLowerCase()
  const tags: string[] = []
  
  const tagPatterns: [string, string][] = [
    ['ai', 'AI'],
    ['artificial intelligence', 'AI'],
    ['machine learning', 'Machine Learning'],
    ['openai', 'OpenAI'],
    ['chatgpt', 'ChatGPT'],
    ['gpt', 'GPT'],
    ['federal reserve', 'Federal Reserve'],
    ['interest rate', 'Interest Rates'],
    ['inflation', 'Inflation'],
    ['tesla', 'Tesla'],
    ['electric vehicle', 'Electric Vehicles'],
    ['battery', 'Batteries'],
    ['solar', 'Solar Energy'],
    ['renewable', 'Renewable Energy'],
    ['climate', 'Climate'],
    ['spacex', 'SpaceX'],
    ['nasa', 'NASA'],
    ['apple', 'Apple'],
    ['google', 'Google'],
    ['microsoft', 'Microsoft'],
    ['semiconductor', 'Semiconductors'],
    ['vaccine', 'Vaccines'],
    ['healthcare', 'Healthcare'],
  ]
  
  for (const [pattern, tag] of tagPatterns) {
    if (text.includes(pattern) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }
  
  return tags.slice(0, 5) // Limit to 5 tags
}

// Normalize raw article to our standard format
export function normalizeArticle(raw: RawNewsArticle, index: number): NormalizedArticle {
  const slug = generateSlug(raw.title)
  const category = extractCategory(raw.content, raw.title)
  const tags = extractTags(raw.content, raw.title)
  
  return {
    id: `live-${index}-${Date.now()}`,
    slug,
    title: raw.title,
    subtitle: raw.description,
    excerpt: raw.description,
    content: raw.content,
    source: raw.source.name,
    sourceUrl: raw.url,
    publishedAt: raw.publishedAt,
    author: {
      name: raw.author || 'Staff Writer',
      role: 'Correspondent'
    },
    imageUrl: raw.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop',
    tags,
    category,
    readingTime: estimateReadingTime(raw.content)
  }
}

// Deduplicate articles based on title similarity
function deduplicateArticles(articles: NormalizedArticle[]): NormalizedArticle[] {
  const seen = new Map<string, NormalizedArticle>()
  
  for (const article of articles) {
    // Create a normalized key from the title
    const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50)
    
    if (!seen.has(key)) {
      seen.set(key, article)
    }
  }
  
  return Array.from(seen.values())
}

// Fetch news from all sources - now from database with fallback
export async function fetchNewsFromSources(): Promise<NormalizedArticle[]> {
  try {
    const { getArticles } = await import('./db')
    
    // Try to fetch from database first
    let dbArticles: any[] = []
    try {
      dbArticles = await getArticles(50, 0)
    } catch (e) {
      console.log('[v0] Database unavailable, using mock data')
    }
    
    if (dbArticles && dbArticles.length > 0) {
      // Convert database articles to normalized format
      return dbArticles.map((article, index) => ({
        id: article.id,
        slug: generateSlug(article.title),
        title: article.title,
        subtitle: article.description,
        excerpt: article.description,
        content: article.content,
        source: article.source,
        sourceUrl: article.url,
        publishedAt: article.published_at,
        author: {
          name: 'Virlo Intelligence',
          role: 'News Aggregator'
        },
        imageUrl: article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop',
        tags: extractTags(article.content, article.title),
        category: extractCategory(article.content, article.title),
        readingTime: estimateReadingTime(article.content)
      }))
    }
  } catch (error) {
    console.log('[v0] Database unavailable, falling back to mock data')
  }
  
  // Fallback to mock data if database is empty or unavailable
  const normalized = NEWS_FEED.map((article, index) => normalizeArticle(article, index))
  const unique = deduplicateArticles(normalized)
  
  return unique.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

// Search articles by query - now uses database with fallback
export async function searchArticles(query: string): Promise<NormalizedArticle[]> {
  try {
    const { searchArticles: dbSearch } = await import('./db')
    
    // Try database search first
    let dbResults: any[] = []
    try {
      dbResults = await dbSearch(query, 50)
    } catch (e) {
      console.log('[v0] Database search unavailable, using in-memory search')
    }
    
    if (dbResults && dbResults.length > 0) {
      return dbResults.map((article) => ({
        id: article.id,
        slug: generateSlug(article.title),
        title: article.title,
        subtitle: article.description,
        excerpt: article.description,
        content: article.content,
        source: article.source,
        sourceUrl: article.url,
        publishedAt: article.published_at,
        author: {
          name: 'Virlo Intelligence',
          role: 'News Aggregator'
        },
        imageUrl: article.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop',
        tags: extractTags(article.content, article.title),
        category: extractCategory(article.content, article.title),
        readingTime: estimateReadingTime(article.content)
      }))
    }
  } catch (error) {
    console.log('[v0] Database unavailable, using in-memory search')
  }
  
  // Fallback to in-memory search
  const allArticles = await fetchNewsFromSources()
  const searchTerms = query.toLowerCase().split(' ')
  
  return allArticles.filter(article => {
    const searchText = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase()
    return searchTerms.some(term => searchText.includes(term))
  })
}

// Get article by slug
export async function getArticleBySlugFromAPI(slug: string): Promise<NormalizedArticle | null> {
  const allArticles = await fetchNewsFromSources()
  return allArticles.find(a => a.slug === slug) || null
}

// Cache for storing fetched articles
let articleCache: {
  articles: NormalizedArticle[]
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getCachedNews(): Promise<NormalizedArticle[]> {
  const now = Date.now()
  
  if (articleCache && now - articleCache.timestamp < CACHE_DURATION) {
    return articleCache.articles
  }
  
  const articles = await fetchNewsFromSources()
  articleCache = { articles, timestamp: now }
  
  return articles
}
