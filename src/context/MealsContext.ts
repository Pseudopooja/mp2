import { createContext, useContext } from 'react'
import type { BrowseOrder, Meal } from '../types'

export type LoadStatus = 'loading' | 'ready' | 'error'

export interface MealsContextValue {
  meals: Meal[]
  status: LoadStatus
  error: string | null
  reload: () => void
  browse: BrowseOrder | null
  setBrowse: (order: BrowseOrder) => void
}

export const MealsContext = createContext<MealsContextValue | null>(null)

export function useMeals(): MealsContextValue {
  const value = useContext(MealsContext)
  if (!value) throw new Error('useMeals must be used inside <MealsProvider>')
  return value
}
