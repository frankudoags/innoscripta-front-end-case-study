import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { registry } from '@/lib/provider/registry'
import type { ProviderId } from '@/lib/types'
import type { Preferences } from '@/hooks/use-preferences'
import { RotateCcw, X } from 'lucide-react'

interface FeedSettingsProps {
  prefs: Preferences
  authors: string[]
  onToggleSource: (value: string) => void
  onToggleCategory: (value: string) => void
  onToggleAuthor: (value: string) => void
  onReset: () => void
}

export function FeedSettings({
  prefs,
  authors,
  onToggleSource,
  onToggleCategory,
  onToggleAuthor,
  onReset,
}: FeedSettingsProps) {
  const [sourceToAdd, setSourceToAdd] = useState('')
  const [categoryToAdd, setCategoryToAdd] = useState('')
  const [authorToAdd, setAuthorToAdd] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      for (const p of registry.all()) {
        const cats = await p.getCategories?.()
        if (cats) return cats
      }
      return []
    },
    staleTime: Infinity,
  })

  const uniqueAuthors = Array.from(new Set(authors)).filter(Boolean)

  const sourceItems = Object.fromEntries(
    registry.all().map((p) => [p.id, p.name]),
  )
  const categoryItems = Object.fromEntries(
    categories.map((c) => [c.id, c.name]),
  )
  const authorItems = Object.fromEntries(uniqueAuthors.map((a) => [a, a]))

  const availableCategories = categories.filter(
    (c) => !prefs.categories.includes(c.id),
  )

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-base font-semibold">Personalize your feed</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={
            prefs.sources.length === 0 &&
            prefs.categories.length === 0 &&
            prefs.authors.length === 0
          }
          onClick={onReset}
        >
          <RotateCcw />
          Reset
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium text-muted-foreground">Preferred sources</p>
        <div className="flex flex-wrap gap-2">
          {prefs.sources.length === 0 && (
            <span className="text-xs text-muted-foreground">None selected</span>
          )}
          {prefs.sources.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
            >
              {registry.get(s as ProviderId)?.name ?? s}
              <button
                type="button"
                onClick={() => onToggleSource(s)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${s}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Select value={sourceToAdd} items={sourceItems} onValueChange={(v) => setSourceToAdd(v ?? '')}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Add a source" />
              </SelectTrigger>
              <SelectContent>
                {registry.all().map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={prefs.sources.includes(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0"
            disabled={!sourceToAdd}
            onClick={() => {
              onToggleSource(sourceToAdd)
              setSourceToAdd('')
            }}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium text-muted-foreground">Preferred categories</p>
        <div className="flex flex-wrap gap-2">
          {prefs.categories.length === 0 && (
            <span className="text-xs text-muted-foreground">None selected</span>
          )}
          {prefs.categories.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
            >
              {categories.find((x) => x.id === c)?.name ?? c}
              <button
                type="button"
                onClick={() => onToggleCategory(c)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${c}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Select value={categoryToAdd} items={categoryItems} onValueChange={(v) => setCategoryToAdd(v ?? '')}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Add a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0"
            disabled={!categoryToAdd}
            onClick={() => {
              onToggleCategory(categoryToAdd)
              setCategoryToAdd('')
            }}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-medium text-muted-foreground">Preferred authors</p>
        <div className="flex flex-wrap gap-2">
          {prefs.authors.length === 0 && (
            <span className="text-xs text-muted-foreground">None selected</span>
          )}
          {prefs.authors.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
            >
              {a}
              <button
                type="button"
                onClick={() => onToggleAuthor(a)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${a}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <Select value={authorToAdd} items={authorItems} onValueChange={(v) => setAuthorToAdd(v ?? '')}>
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Add an author" />
              </SelectTrigger>
              <SelectContent>
                {uniqueAuthors
                  .filter((a) => !prefs.authors.includes(a))
                  .map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0"
            disabled={!authorToAdd}
            onClick={() => {
              onToggleAuthor(authorToAdd)
              setAuthorToAdd('')
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
