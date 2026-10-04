import type { Meal, SortDirection, SortKey } from '../types'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'area', label: 'Region' },
  { key: 'ingredients', label: 'Ingredient count' },
]

export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value)
}

export function sortMeals(meals: Meal[], key: SortKey, direction: SortDirection): Meal[] {
  const factor = direction === 'asc' ? 1 : -1
  return [...meals].sort((a, b) => {
    let result: number
    if (key === 'ingredients') {
      result = a.ingredients.length - b.ingredients.length
    } else {
      result = a[key].localeCompare(b[key])
    }
    // Break ties by name so the order is stable and predictable.
    if (result === 0) result = a.name.localeCompare(b.name)
    return result * factor
  })
}
