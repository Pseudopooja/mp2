import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchAllMeals } from '../api/meals'
import type { BrowseOrder, Meal } from '../types'
import { MealsContext } from './MealsContext'
import type { LoadStatus, MealsContextValue } from './MealsContext'

interface Props {
  children: ReactNode
}

export default function MealsProvider({ children }: Props) {
  const [meals, setMeals] = useState<Meal[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [browse, setBrowseState] = useState<BrowseOrder | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAllMeals()
      .then((loaded) => {
        if (cancelled) return
        setMeals(loaded)
        setError(null)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Something went wrong while loading meals.')
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setStatus('loading')
    setAttempt((n) => n + 1)
  }, [])
  const setBrowse = useCallback((order: BrowseOrder) => setBrowseState(order), [])

  const value = useMemo<MealsContextValue>(
    () => ({ meals, status, error, reload, browse, setBrowse }),
    [meals, status, error, reload, browse, setBrowse],
  )

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>
}
