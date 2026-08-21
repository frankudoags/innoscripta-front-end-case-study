import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { registry } from '@/lib/provider/registry'
import type { ArticleFilters } from '@/lib/types'

const categoryQueryKey = ['categories']

interface FiltersBarProps {
  filters: ArticleFilters
  onApply: (filters: ArticleFilters) => void
}

export function FiltersBar({ filters, onApply }: FiltersBarProps) {
  const [keyword, setKeyword] = useState(filters.keyword ?? '')
  const [fromDate, setFromDate] = useState(filters.fromDate ?? '')
  const [toDate, setToDate] = useState(filters.toDate ?? '')
  const [category, setCategory] = useState(filters.categories?.[0] ?? 'all')
  const [source, setSource] = useState(filters.sources?.[0] ?? 'all')

  const sourceOptions = registry.all().map((p) => ({ id: p.id, name: p.name }))

  const { data: categories = [] } = useQuery({
    queryKey: categoryQueryKey,
    queryFn: async () => {
      for (const p of registry.all()) {
        const cats = await p.getCategories?.()
        if (cats) return cats
      }
      return []
    },
    staleTime: Infinity,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onApply({
      keyword: keyword.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      categories: category && category !== 'all' ? [category] : undefined,
      sources: source && source !== 'all' ? [source] : undefined,
    })
  }

  const handleReset = () => {
    setKeyword('')
    setFromDate('')
    setToDate('')
    setCategory('all')
    setSource('all')
    onApply({})
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4"
    >
      <h2 className="font-heading text-base font-semibold">Filters</h2>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="keyword">Keyword</Label>
          <Input
            id="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search articles…"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Label>Source</Label>
          <Select value={source} onValueChange={(v) => setSource(v ?? '')}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {sourceOptions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <Label>Category</Label>
          <Select value={category} onValueChange={(v) => setCategory(v ?? '')}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" className="flex-1">
            Apply
          </Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>
    </form>
  )
}
