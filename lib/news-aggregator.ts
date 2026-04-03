import { v4 as uuidv4 } from 'uuid'
import { Article, articleExists, upsertArticles } from './db'

interface NewsAPIArticle {
  title: string
  description: string
  content: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    name: string
  }
}

interface GNewsArticle {
  title: string
  description: string
  content: string
  url: string
  image: string | null
  publishedAt: string
  source: {
    name: string
  }
}

export class NewsAggregator {
  private newsApiKey = process.env.NEWS_API_KEY
  private gNewsApiKey = process.env.GNEWS_API_KEY

  async aggregateNews(category: string = 'technology'): Promise<Article[]> {
    const articles: Article[] = []

    try {
      // Fetch from NewsAPI
      if (this.newsApiKey) {
        const newsApiArticles = await this.fetchFromNewsAPI(category)
        articles.push(...newsApiArticles)
      }

      // Fetch from GNews
      if (this.gNewsApiKey) {
        const gNewsArticles = await this.fetchFromGNews(category)
        articles.push(...gNewsArticles)
      }

      // Deduplicate by URL
      const uniqueArticles = this.deduplicateArticles(articles)

      // Save to database
      if (uniqueArticles.length > 0) {
        await upsertArticles(uniqueArticles)
      }

      return uniqueArticles
    } catch (error) {
      console.error('Error aggregating news:', error)
      return []
    }
  }

  private async fetchFromNewsAPI(category: string): Promise<Article[]> {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${category}&sortBy=publishedAt&language=en&pageSize=50`,
        {
          headers: {
            'X-API-KEY': this.newsApiKey!,
          },
        }
      )

      if (!response.ok) {
        console.error('NewsAPI response error:', response.status)
        return []
      }

      const data = await response.json()
      const articles: NewsAPIArticle[] = data.articles || []

      return articles
        .filter((article) => article.url && article.title)
        .map((article) => ({
          id: uuidv4(),
          title: article.title,
          description: article.description || '',
          content: article.content || '',
          url: article.url,
          source: article.source.name,
          image_url: article.urlToImage,
          published_at: article.publishedAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source_id: 'newsapi',
          category,
        }))
    } catch (error) {
      console.error('Error fetching from NewsAPI:', error)
      return []
    }
  }

  private async fetchFromGNews(category: string): Promise<Article[]> {
    try {
      const response = await fetch(
        `https://gnewsapi.io/api/search?q=${category}&lang=en&max=50&apikey=${this.gNewsApiKey}`
      )

      if (!response.ok) {
        console.error('GNews response error:', response.status)
        return []
      }

      const data = await response.json()
      const articles: GNewsArticle[] = data.articles || []

      return articles
        .filter((article) => article.url && article.title)
        .map((article) => ({
          id: uuidv4(),
          title: article.title,
          description: article.description || '',
          content: article.content || '',
          url: article.url,
          source: article.source.name,
          image_url: article.image,
          published_at: article.publishedAt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source_id: 'gnews',
          category,
        }))
    } catch (error) {
      console.error('Error fetching from GNews:', error)
      return []
    }
  }

  private deduplicateArticles(articles: Article[]): Article[] {
    const seen = new Set<string>()
    const deduplicated: Article[] = []

    for (const article of articles) {
      // Normalize URL for comparison
      const normalizedUrl = article.url.toLowerCase().trim()

      if (!seen.has(normalizedUrl)) {
        seen.add(normalizedUrl)
        deduplicated.push(article)
      }
    }

    return deduplicated
  }

  // Normalize content for pipeline processing
  normalizeArticle(article: Article): Article {
    return {
      ...article,
      title: article.title.trim(),
      description: article.description.trim(),
      content: article.content.trim(),
    }
  }
}

export const newsAggregator = new NewsAggregator()
