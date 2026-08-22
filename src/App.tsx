import { useCallback, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { NuqsAdapter } from "nuqs/adapters/react";
import { FiltersBar } from "@/components/filters-bar";
import { FeedSettings } from "@/components/feed-settings";
import { ArticleList } from "@/components/article-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useArticles } from "@/hooks/use-articles";
import { usePreferences } from "@/hooks/use-preferences";
import type { ArticleFilters } from "@/lib/types";
import { Settings2, SlidersHorizontal } from "lucide-react";

const queryClient = new QueryClient();

const filterParsers = {
  keyword: parseAsString.withDefault(""),
  fromDate: parseAsString.withDefault(""),
  toDate: parseAsString.withDefault(""),
  sources: parseAsArrayOf(parseAsString).withDefault([]),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  authors: parseAsArrayOf(parseAsString).withDefault([]),
};

export default function App() {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <Feed />
      </QueryClientProvider>
    </NuqsAdapter>
  );
}

function Feed() {
  const { prefs, toggle, reset } = usePreferences();
  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: "push",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

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
  );

  const { data, isLoading, isError } = useArticles(effectiveFilters, page);
  
  // aggregated articles list here
  const articles = useMemo(() => data?.items ?? [], [data]);

  // to get filters for authors, we extract the authors and send the remaining filters
  const authorSourceFilters: ArticleFilters = useMemo(() => {
    const { authors: _authors, ...rest } = effectiveFilters;
    return rest;
  }, [effectiveFilters]);

  // we fetch articles just for authors as there is no direct api to call authors from the providers as of today
  const authorQuery = useArticles(authorSourceFilters, 1);

  //we extract the authors name from the articles
  const authors = useMemo(
    () =>
      Array.from(
        new Set(
          (authorQuery.data?.items ?? [])
            .map((a) => a.author)
            .filter(Boolean),
        ),
      ),
    [authorQuery.data],
  );

  const totalPages = useMemo(() => (data ? data.totalPages : 1), [data]);

  const applyFilters = useCallback(
    (f: ArticleFilters) => {
      setFilters({
        keyword: f.keyword ?? "",
        fromDate: f.fromDate ?? "",
        toDate: f.toDate ?? "",
        sources: f.sources ?? [],
        categories: f.categories ?? [],
        authors: f.authors ?? [],
      });
      setPage(1);
    },
    [setFilters, setPage],
  );

  const onToggleSource = useCallback(
    (v: string) => toggle("sources", v),
    [toggle],
  );
  const onToggleCategory = useCallback(
    (v: string) => toggle("categories", v),
    [toggle],
  );
  const onToggleAuthor = useCallback(
    (v: string) => toggle("authors", v),
    [toggle],
  );

  const openFilters = useCallback(() => setFiltersOpen(true), []);
  const openPrefs = useCallback(() => setPrefsOpen(true), []);

  const goPrev = useCallback(
    () => setPage((p) => Math.max(1, p - 1)),
    [setPage],
  );
  const goNext = useCallback(
    () => setPage((p) => Math.min(totalPages, p + 1)),
    [setPage, totalPages],
  );

  const handleMobileApply = useCallback(
    (f: ArticleFilters) => {
      applyFilters(f);
      setFiltersOpen(false);
    },
    [applyFilters],
  );

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="font-heading text-xl font-bold tracking-tight">
            ClusterNews
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={openFilters}
            >
              <SlidersHorizontal />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={openPrefs}
            >
              <Settings2 />
              Personalize
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="hidden w-72 shrink-0 flex-col gap-6 lg:sticky lg:top-20 lg:flex lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto">
          <FiltersBar filters={filters} onApply={applyFilters} />
          <FeedSettings
            prefs={prefs}
            authors={authors}
            onToggleSource={onToggleSource}
            onToggleCategory={onToggleCategory}
            onToggleAuthor={onToggleAuthor}
            onReset={reset}
          />
        </aside>

        <section className="min-w-0 flex-1">
          <ArticleList
            articles={articles}
            filters={effectiveFilters}
            isLoading={isLoading}
            isError={isError}
          />

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={goPrev}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={goNext}
              >
                Next
              </Button>
            </div>
          )}
        </section>
      </main>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <FiltersBar filters={filters} onApply={handleMobileApply} />
        </DialogContent>
      </Dialog>

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Personalize your feed</DialogTitle>
          </DialogHeader>
          <FeedSettings
            prefs={prefs}
            authors={authors}
            onToggleSource={onToggleSource}
            onToggleCategory={onToggleCategory}
            onToggleAuthor={onToggleAuthor}
            onReset={reset}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Done</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
