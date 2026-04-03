const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample news articles with good content for pipeline processing
const sampleArticles = [
  {
    title: "OpenAI Announces GPT-5 with Unprecedented Reasoning Capabilities",
    description: "The latest iteration of OpenAI's language model demonstrates significant improvements in logical reasoning and multi-step problem solving.",
    content: `OpenAI has unveiled GPT-5, marking a significant leap in artificial intelligence capabilities. The new model demonstrates unprecedented abilities in complex reasoning, mathematical problem-solving, and multi-step planning tasks. According to internal benchmarks shared during the announcement, GPT-5 achieves 92% accuracy on graduate-level science questions, compared to 78% for its predecessor. The model also shows remarkable improvements in code generation, with a 40% reduction in bugs for complex programming tasks.`,
    url: "https://example.com/openai-gpt5-announcement",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=800&fit=crop",
    published_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    source: "TechCrunch",
    source_id: "newsapi",
    category: "AI"
  },
  {
    title: "Federal Reserve Signals Potential Rate Cuts Amid Cooling Inflation",
    description: "Fed Chair Powell's testimony suggests the central bank may begin easing monetary policy as inflation trends toward target.",
    content: `Federal Reserve Chair Jerome Powell indicated in Congressional testimony that the central bank is increasingly confident inflation is moving sustainably toward its 2% target, opening the door for potential interest rate cuts in the coming months. Markets responded positively to the news, with the S&P 500 rising 1.2% and bond yields falling.`,
    url: "https://example.com/fed-rate-cuts",
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=800&fit=crop",
    published_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    source: "Reuters",
    source_id: "newsapi",
    category: "Finance"
  },
  {
    title: "Breakthrough in Solid-State Battery Technology Could Revolutionize EVs",
    description: "Toyota announces production-ready solid-state batteries with 900-mile range and 10-minute charging.",
    content: `Toyota Motor Corporation has announced a major breakthrough in solid-state battery technology that could dramatically accelerate electric vehicle adoption. The company unveiled production-ready batteries offering 900 miles of range on a single charge with a recharging time of just 10 minutes. The new batteries use a proprietary sulfide-based solid electrolyte that Toyota has been developing for over 15 years.`,
    url: "https://example.com/toyota-solid-state",
    image_url: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&h=800&fit=crop",
    published_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    source: "The Verge",
    source_id: "gnews",
    category: "Technology"
  },
  {
    title: "Tech Giants Form Coalition to Address AI Safety Concerns",
    description: "Microsoft, Google, OpenAI, and Anthropic establish joint framework for responsible AI development.",
    content: `The world's leading artificial intelligence companies have announced the formation of the Frontier AI Safety Coalition, a joint initiative to address growing concerns about the risks posed by increasingly powerful AI systems. The coalition includes Microsoft, Google, OpenAI, Anthropic, and Meta.`,
    url: "https://example.com/ai-safety-coalition",
    image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=800&fit=crop",
    published_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    source: "Axios",
    source_id: "newsapi",
    category: "Technology"
  },
  {
    title: "SpaceX Starship Completes First Successful Orbital Flight",
    description: "After years of testing, SpaceX's massive rocket system achieves full orbital capability.",
    content: `SpaceX's Starship rocket system has successfully completed its first full orbital flight, marking a historic milestone in commercial space exploration. The Super Heavy booster successfully returned to the launch site for a catch landing, while the Starship upper stage completed a full orbit before splashing down in the Pacific Ocean.`,
    url: "https://example.com/spacex-starship-orbital",
    image_url: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1200&h=800&fit=crop",
    published_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    source: "Space.com",
    source_id: "gnews",
    category: "Space"
  },
  {
    title: "Global Semiconductor Shortage Shows Signs of Easing",
    description: "New fab capacity coming online as industry adjusts to post-pandemic demand patterns.",
    content: `The global semiconductor shortage that disrupted industries worldwide is finally showing signs of abating, according to industry analysts. TSMC, the world's largest contract chipmaker, reported that lead times for advanced chips have decreased from 52 weeks to 26 weeks over the past quarter.`,
    url: "https://example.com/chip-shortage-easing",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop",
    published_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    source: "WSJ",
    source_id: "newsapi",
    category: "Technology"
  },
  {
    title: "Major Clinical Trial Shows Promise for Universal Flu Vaccine",
    description: "NIH-backed vaccine demonstrates broad protection against multiple influenza strains.",
    content: `A universal flu vaccine developed by researchers at the National Institutes of Health has shown promising results in a large-scale clinical trial. The vaccine, which targets a conserved region of the influenza virus that rarely mutates, induced robust immune responses against 20 different flu strains in phase 2 trials involving 4,000 participants.`,
    url: "https://example.com/universal-flu-vaccine",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&h=800&fit=crop",
    published_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    source: "Nature",
    source_id: "newsapi",
    category: "Health"
  },
  {
    title: "Renewable Energy Surpasses Coal in Global Electricity Generation",
    description: "Wind and solar now produce more electricity worldwide than coal for the first time in history.",
    content: `Renewable energy sources have overtaken coal in global electricity generation for the first time in history, according to new data from the International Energy Agency. Wind and solar power alone now account for 28% of global electricity production, up from just 5% a decade ago.`,
    url: "https://example.com/renewables-surpass-coal",
    image_url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=800&fit=crop",
    published_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    source: "IEA",
    source_id: "gnews",
    category: "Climate"
  }
];

async function seedNews() {
  try {
    console.log('Starting news seed process...');

    // Convert articles to database format
    const articlesToInsert = sampleArticles.map((article) => ({
      id: uuidv4(),
      ...article,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Insert articles with upsert to avoid duplicates
    const { data, error } = await supabase
      .from('articles')
      .upsert(articlesToInsert, { onConflict: 'url' })
      .select();

    if (error) {
      console.error('Error seeding articles:', error);
      process.exit(1);
    }

    console.log(`✓ Successfully seeded ${data.length} articles`);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
}

seedNews();
