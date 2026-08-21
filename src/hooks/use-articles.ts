import { useQuery } from '@tanstack/react-query'
import { fetchAll } from '@/lib/fetch'
import type { ArticleFilters } from '@/lib/types'

export function useArticles(filters: ArticleFilters, page = 1) {
  return useQuery({
    queryKey: ['articles', filters, page],
    queryFn: () => fetchAll(filters, page),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  })
}
