import type { NewsProvider } from './registry'
import { stripBy } from '../utils'
import type { Article } from './../types'
import {
  nytSearchResponseSchema,
} from './../validation'

const NYT_BASE = import.meta.env.VITE_PUBLIC_NYT_BASE_URL
const NYT_KEY = import.meta.env.VITE_PUBLIC_NYT_KEY

export const nytProvider: NewsProvider = {
  id: 'nyt',
  name: 'The New York Times',

  async search(filters, page) {
    const fq: string[] = []
    if (filters.categories?.length)
      fq.push(`section_name:(${filters.categories.map((c) => `"${c}"`).join(' OR ')})`)

    const params = new URLSearchParams({
      'api-key': NYT_KEY ?? '',
      page: String(Math.max(0, page - 1)),
      sort: 'newest',
    })
    if (filters.keyword) params.set('q', filters.keyword)
    if (filters.fromDate) params.set('begin_date', filters.fromDate.replace(/-/g, ''))
    if (filters.toDate) params.set('end_date', filters.toDate.replace(/-/g, ''))
    if (fq.length) params.set('fq', fq.join(' AND '))

    const res = await fetch(`${NYT_BASE}/articlesearch.json?${params}`)
    if (!res.ok) throw new Error(`NYT search failed (${res.status})`)
    const json = nytSearchResponseSchema.parse(await res.json())

    const items: Article[] = (json.response.docs ?? []).map((d) => ({
      id: `nyt-${d._id}`,
      source: 'nyt',
      title: d.headline.main,
      description: d.abstract,
      author: stripBy(d.byline?.original),
      category: d.section_name,
      publishedAt: d.pub_date,
      url: d.web_url,
      imageUrl: d.multimedia?.default?.url ?? d.multimedia?.thumbnail?.url ?? null,
    }))
    return { items, totalPages: 1 }
  },

  async getSources() {
    return [{ id: 'The New York Times', name: 'The New York Times' }]
  },
}