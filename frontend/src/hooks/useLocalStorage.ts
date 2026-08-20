import { useCallback, useState } from 'react'

/**
 * useState persisted to localStorage. Tolerates unavailable storage
 * (private mode, SSR) and corrupted JSON by falling back to the initial value.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // storage full/unavailable — keep in-memory state only
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set] as const
}
