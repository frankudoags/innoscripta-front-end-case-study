import { registry } from './provider/registry'
import type { Article, ArticleFilters, Paginated } from './types'

export async function fetchAll(
  filters: ArticleFilters,
  page = 1,
): Promise<Paginated<Article>> {
  const activeProviders = registry.filterByIds(filters.sources)

  const settled = await Promise.allSettled(
    activeProviders.map((p) => p.search(filters, page)),
  )

  const results = settled
    .filter((r): r is PromiseFulfilledResult<Paginated<Article>> => r.status === 'fulfilled')
    .map((r) => r.value)

  if (results.length === 0) {
    const first = settled.find((r) => r.status === 'rejected')
    if (first && first.status === 'rejected') throw first.reason
    return { items: [], totalPages: 1 }
  }

  let items = results.flatMap((r) => r.items)

  if (filters.authors?.length) {
    items = items.filter((a) => filters.authors?.includes(a.author))
  }

  items.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))

  const totalPages = filters.authors?.length
    ? 1
    : Math.max(1, ...results.map((r) => r.totalPages))

  return {
    items,
    totalPages,
  }
}
