export type ProviderId = 'guardian' | 'newsapi' | 'nyt'

export interface Article {
  id: string
  source: ProviderId
  title: string
  description: string
  author: string
  category: string
  publishedAt: string
  url: string
  imageUrl: string | null
}

export interface ArticleFilters {
  keyword?: string
  fromDate?: string
  toDate?: string
  categories?: string[]
  sources?: string[]
  authors?: string[]
}

export interface Paginated<T> {
  items: T[]
  totalPages: number
}