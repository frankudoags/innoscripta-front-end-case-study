import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import { useFeed } from "@/hooks/use-feed";
import { Settings2, SlidersHorizontal } from "lucide-react";

const queryClient = new QueryClient();

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
  const {
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
  } = useFeed();

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