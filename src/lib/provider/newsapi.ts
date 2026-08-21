import type { NewsProvider } from './registry'
import type { Article } from '../types'
import {
  newsapiEverythingResponseSchema,
  newsapiSourcesResponseSchema,
  newsapiTopHeadlinesResponseSchema,
} from '../validation'

const NEWSAPI_BASE = import.meta.env.VITE_PUBLIC_NEWSAPI_BASE_URL
const NEWSAPI_KEY = import.meta.env.VITE_PUBLIC_NEWSAPI_KEY

const PAGE_SIZE = 20

const CATEGORIES = [
  { id: 'business', name: 'Business' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'general', name: 'General' },
  { id: 'health', name: 'Health' },
  { id: 'science', name: 'Science' },
  { id: 'sports', name: 'Sports' },
  { id: 'technology', name: 'Technology' },
]

async function resolveSourceIds(categories: string[]): Promise<string[]> {
  const ids = new Set<string>()
  for (const cat of categories) {
    const res = await fetch(
      `${NEWSAPI_BASE}/sources?category=${encodeURIComponent(cat)}&language=en&apiKey=${NEWSAPI_KEY ?? ''}`,
    )
    if (!res.ok) continue
    const json = newsapiSourcesResponseSchema.parse(await res.json())
    for (const s of json.sources ?? []) ids.add(s.id)
  }
  return [...ids].slice(0, 20)
}

function toArticle(a: {
  source: { id: string | null; name: string }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage?: string | null
  publishedAt: string
}): Article {
  return {
    id: `newsapi-${a.url}`,
    source: 'newsapi',
    title: a.title,
    description: a.description ?? '',
    author: a.author ?? '',
    category: '',
    publishedAt: a.publishedAt,
    url: a.url,
    imageUrl: a.urlToImage ?? null,
  }
}

export const newsapiProvider: NewsProvider = {
  id: 'newsapi',
  name: 'NewsAPI.org',

  async search(filters, page) {
    const params = new URLSearchParams({
      apiKey: NEWSAPI_KEY ?? '',
      pageSize: String(PAGE_SIZE),
      page: String(page),
      language: 'en',
    })

    const endpoint =
      filters.keyword || filters.fromDate || filters.toDate
        ? 'everything'
        : 'top-headlines'

    if (filters.keyword) params.set('q', filters.keyword)
    if (filters.fromDate) params.set('from', filters.fromDate)
    if (filters.toDate) params.set('to', filters.toDate)

    if (filters.categories?.length) {
      if (endpoint === 'top-headlines') {
        params.set('category', filters.categories[0])
      } else {
        const sourceIds = await resolveSourceIds(filters.categories)
        if (sourceIds.length) params.set('sources', sourceIds.join(','))
      }
    }

    if (endpoint === 'everything') {
      params.set('sortBy', 'publishedAt')
    }

    const res = await fetch(`${NEWSAPI_BASE}/${endpoint}?${params}`)
    if (!res.ok) throw new Error(`NewsAPI ${endpoint} failed (${res.status})`)

    const schema =
      endpoint === 'top-headlines'
        ? newsapiTopHeadlinesResponseSchema
        : newsapiEverythingResponseSchema
    const json = schema.parse(await res.json())

    return {
      items: (json.articles ?? []).map(toArticle),
      totalPages: Math.max(1, Math.ceil(json.totalResults / PAGE_SIZE)),
    }
  },

  async getCategories() {
    return CATEGORIES
  },

  async getSources() {
    return [{ id: 'newsapi', name: 'NewsAPI.org' }]
  },
}