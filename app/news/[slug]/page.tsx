import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, Calendar, TrendingUp } from "lucide-react"
import { getArticleBySlug, getRelatedArticles } from "@/lib/mock-data"
import { ReadingProgress } from "@/components/article/reading-progress"
import { VirloInsights } from "@/components/article/virlo-insights"
import { AIAssistant } from "@/components/article/ai-assistant"
import { ArticleCard } from "@/components/news/article-card"
import { ArticleActions } from "@/components/article/article-actions"
import { ArticleWrapper } from "@/components/article/article-wrapper"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  
  if (!article) {
    return { title: "Article Not Found | Pulse" }
  }

  return {
    title: `${article.title} | Pulse`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.imageUrl],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = getRelatedArticles(slug, 3)
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Convert markdown-style content to paragraphs
  const contentSections = article.content.split('\n\n').filter(Boolean)

  return (
    <ArticleWrapper articleTitle={article.title}>
      <ReadingProgress />
      
      <article className="min-h-screen">
        {/* Article Header */}
        <header className="border-b border-border">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 py-8">
            {/* Back Link */}
            <Link 
              href="/news" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Link>

            {/* Category & Trend */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-accent">{article.category}</span>
              {article.virloData && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {article.virloData.trendScore}% trending
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-foreground leading-tight text-balance mb-4">
              {article.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground text-balance mb-6">
              {article.subtitle}
            </p>

            {/* Meta */}
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

            {/* Actions */}
            <ArticleActions slug={article.slug} title={article.title} />
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative w-full aspect-[21/9] bg-muted">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Content */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-[1fr_320px] gap-12">
            {/* Main Content */}
            <div className="max-w-3xl">
              {/* Article Body */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {contentSections.map((section, index) => {
                  // Handle headers
                  if (section.startsWith('## ')) {
                    return (
                      <h2 key={index} className="font-serif text-2xl font-medium text-foreground mt-10 mb-4">
                        {section.replace('## ', '')}
                      </h2>
                    )
                  }
                  if (section.startsWith('### ')) {
                    return (
                      <h3 key={index} className="font-serif text-xl font-medium text-foreground mt-8 mb-3">
                        {section.replace('### ', '')}
                      </h3>
                    )
                  }
                  // Handle lists
                  if (section.includes('\n- ') || section.startsWith('- ')) {
                    const items = section.split('\n').filter(item => item.startsWith('- '))
                    return (
                      <ul key={index} className="my-6 space-y-2">
                        {items.map((item, i) => (
                          <li key={i} className="text-foreground leading-relaxed">
                            {item.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                          </li>
                        ))}
                      </ul>
                    )
                  }
                  if (section.includes('\n1. ') || section.match(/^\d\./)) {
                    const items = section.split('\n').filter(item => item.match(/^\d\./))
                    return (
                      <ol key={index} className="my-6 space-y-2 list-decimal list-inside">
                        {items.map((item, i) => (
                          <li key={i} className="text-foreground leading-relaxed">
                            {item.replace(/^\d\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
                          </li>
                        ))}
                      </ol>
                    )
                  }
                  // Handle quotes
                  if (section.startsWith('"') && section.includes('" ')) {
                    const parts = section.split('" ')
                    return (
                      <blockquote key={index} className="border-l-4 border-accent pl-6 my-8 italic text-muted-foreground">
                        <p>{parts[0]}&quot;</p>
                        {parts[1] && <cite className="text-sm not-italic">— {parts[1]}</cite>}
                      </blockquote>
                    )
                  }
                  // Regular paragraphs
                  return (
                    <p 
                      key={index} 
                      className="text-foreground leading-relaxed my-6 font-serif"
                      dangerouslySetInnerHTML={{
                        __html: section
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }}
                    />
                  )
                })}
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-border">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
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

              {/* AI Assistant */}
              <div className="mt-8">
                <AIAssistant article={article} />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="lg:sticky lg:top-24">
                {article.virloData && <VirloInsights data={article.virloData} />}
              </div>
            </aside>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="border-t border-border bg-secondary/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
              <h2 className="font-serif text-2xl font-medium text-foreground mb-8">
                Related Stories
              </h2>
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
