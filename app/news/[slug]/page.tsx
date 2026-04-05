import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, TrendingUp, ExternalLink } from "lucide-react"

// Mock data — used only if the slug matches a curated article
import { getArticleBySlug, getRelatedArticles } from "@/lib/mock-data"
import { ReadingProgress } from "@/components/article/reading-progress"
import { VirloInsights } from "@/components/article/virlo-insights"
import { AIAssistant } from "@/components/article/ai-assistant"
import { ArticleCard } from "@/components/news/article-card"
import { ArticleActions } from "@/components/article/article-actions"
import { ArticleWrapper } from "@/components/article/article-wrapper"
import { PrimarySourcesCompact } from "@/components/news/primary-sources"
import { SourceBadge } from "@/components/news/source-badge"
import { getSourceCredibility } from "@/lib/source-credibility"

// Real news article lookup (server-side)
import type { NormalizedNewsItem } from "@/app/api/news/route"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

/**
 * Try to find a real/live article from /api/news by matching the slug.
 * Falls back to mock articles if not found.
 */
async function fetchRealArticle(slug: string): Promise<NormalizedNewsItem | null> {
  try {
    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${host}/api/news`, {
      next: { revalidate: 300 }, // revalidate every 5 min
    })

    if (!response.ok) return null

    const data = await response.json()
    const articles: NormalizedNewsItem[] = data.articles || []

    // Match by generating slugs from real article titles
    const toSlug = (t: string) =>
      t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70)

    return articles.find(a => toSlug(a.title) === slug) || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const mockArticle = getArticleBySlug(slug)

  if (mockArticle) {
    return {
      title: `${mockArticle.title} | AI-Vantage`,
      description: mockArticle.excerpt,
      openGraph: {
        title: mockArticle.title,
        description: mockArticle.excerpt,
        images: [mockArticle.imageUrl],
      },
    }
  }

  return { title: "Article | AI-Vantage Intelligence" }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params

  // Priority: mock curated articles first, then live articles
  const mockArticle = getArticleBySlug(slug)
  const liveArticle = mockArticle ? null : await fetchRealArticle(slug)

  if (!mockArticle && !liveArticle) {
    notFound()
  }

  // ─── Render live article ─────────────────────────────────────────────────
  if (liveArticle) {
    const cred = getSourceCredibility(liveArticle.source)
    const formattedDate = new Date(liveArticle.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    // Simulate related sources for the Primary Sources compact view
    const relatedSourceArticles: NormalizedNewsItem[] = [liveArticle]

    return (
      <ArticleWrapper articleTitle={liveArticle.title}>
        <ReadingProgress />
        <article className="min-h-screen">
          {/* Header */}
          <header className="border-b border-border">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 py-8">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to News
              </Link>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-accent">{liveArticle.category}</span>
                <SourceBadge source={liveArticle.source} url={liveArticle.url} />
              </div>

              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-tight text-balance mb-4">
                {liveArticle.title}
              </h1>

              {liveArticle.description && (
                <p className="text-lg md:text-xl text-muted-foreground text-balance mb-6">
                  {liveArticle.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <a
                  href={liveArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-accent transition-colors font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read original on {liveArticle.source}
                </a>
              </div>

              <ArticleActions slug={slug} title={liveArticle.title} />
            </div>
          </header>

          {/* Hero image */}
          {liveArticle.imageUrl && (
            <div className="relative w-full aspect-[21/9] bg-muted">
              <Image
                src={liveArticle.imageUrl}
                alt={liveArticle.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
            <div className="grid lg:grid-cols-[1fr_320px] gap-12">
              {/* Main body */}
              <div className="max-w-3xl">
                {/* Source attribution box */}
                <div className="mb-8 p-4 rounded-xl border border-border bg-secondary/30 flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-foreground font-medium">Original Source</p>
                    <a
                      href={liveArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline break-all"
                    >
                      {liveArticle.url}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      Published by {liveArticle.source} · {formattedDate}
                    </p>
                  </div>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {(liveArticle.content || liveArticle.description)
                    .split('\n\n')
                    .filter(Boolean)
                    .map((para, i) => (
                      <p key={i} className="text-foreground leading-relaxed my-6 font-serif">
                        {para}
                      </p>
                    ))}
                </div>

                {/* Read original CTA */}
                <div className="mt-12 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    This article is sourced from {liveArticle.source}. Read the full piece at the original publication.
                  </p>
                  <a
                    href={liveArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read full article on {liveArticle.source}
                  </a>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Source credibility card */}
                  <div className="rounded-xl border border-border p-4 bg-card">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      Source
                    </p>
                    <div className="flex items-center gap-3">
                      <SourceBadge source={liveArticle.source} url={liveArticle.url} size="md" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{liveArticle.source}</p>
                        <p className="text-[10px] text-muted-foreground">{cred.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Primary sources compact */}
                  <div className="rounded-xl border border-border p-4 bg-card">
                    <PrimarySourcesCompact articles={relatedSourceArticles} />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </article>
      </ArticleWrapper>
    )
  }

  // ─── Render mock/curated article (original behavior preserved) ────────────
  const article = mockArticle!
  const relatedArticles = getRelatedArticles(slug, 3)
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const contentSections = article.content.split('\n\n').filter(Boolean)

  return (
    <ArticleWrapper articleTitle={article.title}>
      <ReadingProgress />

      <article className="min-h-screen">
        <header className="border-b border-border">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 py-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-accent">{article.category}</span>
              {article.virloData && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {article.virloData.trendScore}% trending
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-tight text-balance mb-4">
              {article.title}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground text-balance mb-6">
              {article.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                  <span className="font-serif font-bold text-foreground">
                    {article.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{article.author.name}</p>
                  <p className="text-xs">{article.author.role}</p>
                </div>
              </div>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readingTime} min read
              </span>
            </div>

            <ArticleActions slug={article.slug} title={article.title} />
          </div>
        </header>

        <div className="relative w-full aspect-[21/9] bg-muted">
          <Image src={article.imageUrl} alt={article.title} fill className="object-cover" priority />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            <div className="max-w-3xl">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {contentSections.map((section, index) => {
                  if (section.startsWith('## ')) return (
                    <h2 key={index} className="font-serif text-2xl font-medium text-foreground mt-10 mb-4">
                      {section.replace('## ', '')}
                    </h2>
                  )
                  if (section.startsWith('### ')) return (
                    <h3 key={index} className="font-serif text-xl font-medium text-foreground mt-8 mb-3">
                      {section.replace('### ', '')}
                    </h3>
                  )
                  if (section.includes('\n- ') || section.startsWith('- ')) {
                    const items = section.split('\n').filter(i => i.startsWith('- '))
                    return (
                      <ul key={index} className="my-6 space-y-2">
                        {items.map((item, i) => (
                          <li key={i} className="text-foreground leading-relaxed">
                            {item.replace('- ', '')}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  if (section.startsWith('"') && section.includes('" ')) {
                    const parts = section.split('" ')
                    return (
                      <blockquote key={index} className="border-l-4 border-accent pl-6 my-8 italic text-muted-foreground">
                        <p>{parts[0]}&quot;</p>
                        {parts[1] && <cite className="text-sm not-italic">— {parts[1]}</cite>}
                      </blockquote>
                    )
                  }
                  return (
                    <p
                      key={index}
                      className="text-foreground leading-relaxed my-6 font-serif"
                      dangerouslySetInnerHTML={{
                        __html: section
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>'),
                      }}
                    />
                  )
                })}
              </div>

              <div className="mt-12 pt-8 border-t border-border">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/trends?topic=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center rounded-full border border-border bg-secondary/30 px-3 py-1 text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <AIAssistant article={article} />
              </div>
            </div>

            <aside className="space-y-6">
              <div className="lg:sticky lg:top-24 space-y-6">
                {article.virloData && <VirloInsights data={article.virloData} />}
              </div>
            </aside>
          </div>
        </div>

        {relatedArticles.length > 0 && (
          <section className="border-t border-border bg-secondary/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
              <h2 className="font-serif text-2xl font-medium text-foreground mb-8">Related Stories</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {relatedArticles.map((related, index) => (
                  <ArticleCard key={related.id} article={related} index={index} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </ArticleWrapper>
  )
}
