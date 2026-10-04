export interface Ingredient {
  name: string
  measure: string
}

export interface Meal {
  id: string
  name: string
  category: string
  area: string
  instructions: string
  thumb: string
  tags: string[]
  youtube: string
  source: string
  ingredients: Ingredient[]
}

export type SortKey = 'name' | 'category' | 'area' | 'ingredients'
export type SortDirection = 'asc' | 'desc'

/** The ordered list of meals the user was browsing, used by the detail view's previous/next buttons. */
export interface BrowseOrder {
  ids: string[]
  backPath: string
  backLabel: string
}
