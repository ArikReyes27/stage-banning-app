import { useCallback, useEffect, useState, type SetStateAction } from 'react'

type UseLocalStorageOptions<T> = {
  validate?: (value: unknown) => value is T
}

const readStoredValue = <T,>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
) => {
  try {
    const rawValue = window.localStorage.getItem(key)

    if (rawValue === null) return initialValue

    const parsedValue: unknown = JSON.parse(rawValue)
    return !validate || validate(parsedValue) ? (parsedValue as T) : initialValue
  } catch {
    return initialValue
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {},
) {
  const { validate } = options
  const [storedValue, setStoredValue] = useState<T>(() =>
    readStoredValue(key, initialValue, validate),
  )

  useEffect(() => {
    const syncStorage = (event: StorageEvent) => {
      if (event.key === key) {
        setStoredValue(readStoredValue(key, initialValue, validate))
      }
    }

    window.addEventListener('storage', syncStorage)
    return () => window.removeEventListener('storage', syncStorage)
  }, [initialValue, key, validate])

  const setValue = useCallback(
    (value: SetStateAction<T>) => {
      const nextValue =
        typeof value === 'function'
          ? (value as (previousValue: T) => T)(storedValue)
          : value

      try {
        window.localStorage.setItem(key, JSON.stringify(nextValue))
      } catch {
        // Keep the in-memory value usable when storage is unavailable.
      }

      setStoredValue(nextValue)
    },
    [key, storedValue],
  )

  return [storedValue, setValue] as const
}
