import { ArticleCard } from '@/components/article-card'
import type { Article, ArticleFilters } from '@/lib/types'
import { registry } from '@/lib/provider/registry'
import type { ProviderId } from '@/lib/types'
import { Filter, Newspaper, SearchX } from 'lucide-react'

function describeFilters(filters: ArticleFilters) {
  const out: { label: string; value: string }[] = []

  if (filters.keyword) out.push({ label: 'Keyword', value: filters.keyword })
  if (filters.fromDate || filters.toDate)
    out.push({
      label: 'Date range',
      value: `${filters.fromDate ?? '…'} → ${filters.toDate ?? '…'}`,
    })
  if (filters.sources?.length)
    out.push({
      label: 'Sources',
      value: filters.sources
        .map((s) => registry.get(s as ProviderId)?.name ?? s)
        .join(', '),
    })
  if (filters.categories?.length)
    out.push({ label: 'Categories', value: filters.categories.join(', ') })
  if (filters.authors?.length)
    out.push({ label: 'Authors', value: filters.authors.join(', ') })

  return out
}

export function ArticleList({
  articles,
  filters,
  isLoading,
  isError,
}: {
  articles: Article[]
  filters: ArticleFilters
  isLoading: boolean
  isError: boolean
}) {
  if (isError) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        Something went wrong loading articles. Please try again.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex aspect-[3/4] animate-pulse flex-col gap-3 rounded-xl bg-muted/70 p-4"
          >
            <div className="aspect-[16/9] w-full rounded-lg bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    const params = describeFilters(filters)
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <SearchX className="size-6" />
        </div>
        <h3 className="font-heading text-base font-semibold">No articles found</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Nothing matched your current feed. Here&apos;s what you can try:
        </p>
        <ul className="max-w-sm list-inside list-disc space-y-1 text-left text-sm text-muted-foreground">
          <li>Broaden your filters or clear the keyword</li>
          <li>Pick additional sources in Personalize</li>
          <li>Widen the date range</li>
        </ul>
        <div className="mt-1 w-full max-w-sm rounded-lg border bg-card p-3 text-left">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Filter className="size-3.5" />
            <span>What led to this</span>
          </div>
          {params.length > 0 ? (
            <dl className="mt-2 space-y-1 text-sm">
              {params.map((p) => (
                <div key={p.label} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">{p.label}</dt>
                  <dd className="min-w-0 truncate text-right font-medium">
                    {p.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No filters or preferences are set — your sources may simply have
              no matching articles right now.
            </p>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Newspaper className="size-3.5" />
          <span>Articles appear here once they match your feed</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </div>
  )
}
