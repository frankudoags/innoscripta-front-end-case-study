import type { Article, ArticleFilters, Paginated, ProviderId } from '../types'
import { guardianProvider } from './guardian'
import { newsapiProvider } from './newsapi'
import { nytProvider } from './nyt'

export interface NewsProvider {
  id: ProviderId
  name: string
  search(filters: ArticleFilters, page: number): Promise<Paginated<Article>>
  getCategories?(): Promise<{ id: string; name: string }[]>
  getSources?(): Promise<{ id: string; name: string }[]>
  getAuthors?(): Promise<string[]>
}

export class ProviderRegistry {
  private providers: NewsProvider[]

  constructor(initial: NewsProvider[] = []) {
    this.providers = initial
  }

  register(provider: NewsProvider): void {
    this.providers.push(provider)
  }

  get(id: ProviderId): NewsProvider | undefined {
    return this.providers.find((p) => p.id === id)
  }

  all(): NewsProvider[] {
    return this.providers
  }

  activeIds(): ProviderId[] {
    return this.providers.map((p) => p.id)
  }

  filterByIds(ids?: string[]): NewsProvider[] {
    return ids?.length
      ? this.providers.filter((p) => ids.includes(p.id))
      : this.providers
  }
}

export const registry = new ProviderRegistry([
  guardianProvider,
  newsapiProvider,
  nytProvider,
])