import { useCallback, useState } from 'react'

export interface Preferences {
  sources: string[]
  categories: string[]
  authors: string[]
}

const STORAGE_KEY = 'news-feed-preferences'
const EMPTY: Preferences = { sources: [], categories: [], authors: [] }

function read(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return {
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      authors: Array.isArray(parsed.authors) ? parsed.authors : [],
    }
  } catch {
    return EMPTY
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(read)

  const update = useCallback((updater: (prev: Preferences) => Preferences) => {
    setPrefs((prev) => {
      const next = updater(prev)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const toggle = useCallback(
    (group: keyof Preferences, value: string) => {
      update((prev) => {
        const current = prev[group]
        return {
          ...prev,
          [group]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        }
      })
    },
    [update],
  )

  const reset = useCallback(() => update(() => EMPTY), [update])

  return { prefs, update, toggle, reset }
}
