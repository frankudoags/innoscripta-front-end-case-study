import { useCallback, useMemo, useState } from 'react'
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'nuqs'
import { useArticles } from '@/hooks/use-articles'
import { usePreferences } from '@/hooks/use-preferences'
import type { ArticleFilters } from '@/lib/types'

// nuqs parsers describing how each filter is serialized to/from the URL query string
const filterParsers = {
  keyword: parseAsString.withDefault(''),
  fromDate: parseAsString.withDefault(''),
  toDate: parseAsString.withDefault(''),
  sources: parseAsArrayOf(parseAsString).withDefault([]),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  authors: parseAsArrayOf(parseAsString).withDefault([]),
}

export function useFeed() {
  // Personalization preferences (sources, categories, authors) persisted in localStorage
  const { prefs, toggle, reset } = usePreferences()

  // Feed filters + pagination, synced to the URL query string via nuqs
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: 'push',
  })
  const [page, setPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions({ history: 'push' }),
  )

  // Mobile-only dialogs: filters bar and personalization panel
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)

  // Merge explicit URL filters with personalization prefs so prefs act as
  // fallbacks when no explicit filter is set (explicit filters win)
  const effectiveFilters: ArticleFilters = useMemo(
    () => ({
      ...filters,
      sources:
        filters.sources && filters.sources.length
          ? filters.sources
          : prefs.sources,
      categories:
        filters.categories && filters.categories.length
          ? filters.categories
          : prefs.categories,
      authors: prefs.authors.length ? prefs.authors : filters.authors,
    }),
    [filters, prefs],
  )

  // aggregated articles list here
  const { data, isLoading, isError } = useArticles(effectiveFilters, page)

  const articles = useMemo(() => data?.items ?? [], [data])

  // to get filters for authors, we extract the authors and send the remaining filters
  const authorSourceFilters: ArticleFilters = useMemo(() => {
    const { authors: _authors, ...rest } = effectiveFilters
    return rest
  }, [effectiveFilters])

  // we fetch articles just for authors as there is no direct api to call authors from the providers as of today
  const authorQuery = useArticles(authorSourceFilters, 1)

  //we extract the authors name from the articles
  const authors = useMemo(
    () =>
      Array.from(
        new Set(
          (authorQuery.data?.items ?? []).map((a) => a.author).filter(Boolean),
        ),
      ),
    [authorQuery.data],
  )

  const totalPages = useMemo(() => (data ? data.totalPages : 1), [data])

  // Persist the submitted filter values to the URL and reset to the first page
  const applyFilters = useCallback(
    (f: ArticleFilters) => {
      setFilters({
        keyword: f.keyword ?? '',
        fromDate: f.fromDate ?? '',
        toDate: f.toDate ?? '',
        sources: f.sources ?? [],
        categories: f.categories ?? [],
        authors: f.authors ?? [],
      })
      setPage(1)
    },
    [setFilters, setPage],
  )

  const onToggleSource = useCallback(
    (v: string) => toggle('sources', v),
    [toggle],
  )
  const onToggleCategory = useCallback(
    (v: string) => toggle('categories', v),
    [toggle],
  )
  const onToggleAuthor = useCallback(
    (v: string) => toggle('authors', v),
    [toggle],
  )

  const openFilters = useCallback(() => setFiltersOpen(true), [])
  const openPrefs = useCallback(() => setPrefsOpen(true), [])

  // Pagination helpers clamped to the valid page range
  const goPrev = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    [setPage],
  )
  const goNext = useCallback(
    () => setPage((p) => Math.min(totalPages, p + 1)),
    [setPage, totalPages],
  )

  // Mobile: apply filters from the dialog, then close it
  const handleMobileApply = useCallback(
    (f: ArticleFilters) => {
      applyFilters(f)
      setFiltersOpen(false)
    },
    [applyFilters],
  )

  return {
    filters,
    page,
    prefs,
    reset,
    effectiveFilters,
    articles,
    isLoading,
    isError,
    authors,
    totalPages,
    filtersOpen,
    setFiltersOpen,
    prefsOpen,
    setPrefsOpen,
    applyFilters,
    onToggleSource,
    onToggleCategory,
    onToggleAuthor,
    openFilters,
    openPrefs,
    goPrev,
    goNext,
    handleMobileApply,
  }
}