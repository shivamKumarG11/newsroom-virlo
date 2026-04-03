import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Clock, ArrowRight, BookOpen } from "lucide-react"
import { articles } from "@/lib/mock-data"

export const metadata: Metadata = {
  title: "Deep Dives | Pulse - AI Newsroom",
  description: "Long-form investigative journalism and in-depth analysis powered by AI and Virlo intelligence.",
}

// Filter for longer, more in-depth articles
const deepDives = articles.filter(a => a.readingTime >= 6)

export default function DeepDivesPage() {
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="border-b border-border bg-gradient-to-b from-secondary/50 to-transparent">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
              <BookOpen className="h-5 w-5 text-background" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Long-form journalism</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-2">
            Deep Dives
          </h1>
          <p className="text-muted-foreground max-w-lg">
            In-depth reporting and analysis on the stories that shape our world. Backed by comprehensive 
            research and Virlo social intelligence.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {deepDives.map((article, index) => (
            <article 
              key={article.id}
              className="group grid md:grid-cols-[400px_1fr] gap-8 items-start"
            >
              {/* Image */}
              <Link href={`/news/${article.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              {/* Content */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-accent">{article.category}</span>
                  {article.virloData && (
                    <span className="text-xs text-muted-foreground">
                      {article.virloData.trendScore}% trending
                    </span>
                  )}
                </div>

                <Link href={`/news/${article.slug}`}>
                  <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground leading-tight text-balance mb-3 group-hover:text-accent transition-colors">
                    {article.title}
                  </h2>
                </Link>

                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {article.subtitle}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>{article.author.name}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {article.readingTime} min read
                  </span>
                </div>

                <Link 
                  href={`/news/${article.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                >
                  Read full story
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {deepDives.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Deep dives coming soon
            </h2>
            <p className="text-muted-foreground">
              Our team is working on in-depth investigative pieces. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
