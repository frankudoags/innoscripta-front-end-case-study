import type { NewsProvider } from './registry'
import type { Article } from '../types'
import { stripBy } from '../utils'
import {
  guardianSearchResponseSchema,
  guardianSectionsResponseSchema,
  guardianTagsResponseSchema,
} from './../validation'

const GUARDIAN_BASE = import.meta.env.VITE_PUBLIC_GUARDIAN_BASE_URL
const GUARDIAN_KEY = import.meta.env.VITE_PUBLIC_GUARDIAN_KEY


export const guardianProvider: NewsProvider = {
  id: 'guardian',
  name: 'The Guardian',

  async search(filters, page) {
    const params = new URLSearchParams({
      'api-key': GUARDIAN_KEY ?? '',
      'page-size': '20',
      page: String(page),
      'order-by': 'newest',
      'show-fields': 'thumbnail,byline',
    })
    if (filters.keyword) params.set('q', filters.keyword)
    if (filters.fromDate) params.set('from-date', filters.fromDate)
    if (filters.toDate) params.set('to-date', filters.toDate)
    if (filters.categories?.length) params.set('section', filters.categories.join(','))

    const res = await fetch(`${GUARDIAN_BASE}/search?${params}`)
    if (!res.ok) throw new Error(`Guardian search failed (${res.status})`)
    const json = guardianSearchResponseSchema.parse(await res.json())

    const items: Article[] = json.response.results.map((a) => ({
      id: `guardian-${a.id}`,
      source: 'guardian',
      title: a.webTitle,
      description: '',
      author: stripBy(a.fields?.byline),
      category: a.sectionName,
      publishedAt: a.webPublicationDate,
      url: a.webUrl,
      imageUrl: a.fields?.thumbnail ?? null,
    }))
    return { items, totalPages: json.response.pages ?? 1 }
  },

  async getCategories() {
    const res = await fetch(`${GUARDIAN_BASE}/sections?api-key=${GUARDIAN_KEY ?? ''}`)
    if (!res.ok) throw new Error(`Guardian sections failed (${res.status})`)
    const json = guardianSectionsResponseSchema.parse(await res.json())
    return json.response.results.map((s) => ({ id: s.id, name: s.webTitle }))
  },

  async getAuthors() {
    const res = await fetch(
      `${GUARDIAN_BASE}/tags?type=contributor&page-size=50&api-key=${GUARDIAN_KEY ?? ''}`,
    )
    if (!res.ok) throw new Error(`Guardian tags failed (${res.status})`)
    const json = guardianTagsResponseSchema.parse(await res.json())
    return json.response.results.map((t) => t.webTitle.trim())
  },
}