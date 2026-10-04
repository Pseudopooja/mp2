import axios from 'axios'
import type { Meal } from '../types'

const client = axios.create({
  baseURL: 'https://www.themealdb.com/api/json/v1/1',
  timeout: 15000,
})

type RawMeal = Record<string, string | null | undefined>

interface SearchResponse {
  meals: RawMeal[] | null
}

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('')
const CACHE_KEY = 'mealbook-meals-v1'
const MAX_INGREDIENTS = 20

function text(value: string | null | undefined): string {
  return (value ?? '').trim()
}

function normalize(raw: RawMeal): Meal {
  const ingredients = []
  for (let i = 1; i <= MAX_INGREDIENTS; i += 1) {
    const name = text(raw[`strIngredient${i}`])
    if (name) {
      ingredients.push({ name, measure: text(raw[`strMeasure${i}`]) })
    }
  }

  return {
    id: text(raw.idMeal),
    name: text(raw.strMeal),
    category: text(raw.strCategory) || 'Uncategorized',
    area: text(raw.strArea) || 'Unknown',
    instructions: text(raw.strInstructions),
    thumb: text(raw.strMealThumb),
    tags: text(raw.strTags)
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    youtube: text(raw.strYoutube),
    source: text(raw.strSource),
    ingredients,
  }
}

function readCache(): Meal[] | null {
  try {
    const stored = sessionStorage.getItem(CACHE_KEY)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Meal[]) : null
  } catch {
    return null
  }
}

function writeCache(meals: Meal[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(meals))
  } catch {
    // Storage may be full or disabled; the app still works without a cache.
  }
}

let inFlight: Promise<Meal[]> | null = null

async function loadFromApi(): Promise<Meal[]> {
  // TheMealDB has no "list everything" endpoint, so we fetch each letter once
  // and do all searching, sorting and filtering on the client.
  const results = await Promise.allSettled(
    LETTERS.map((letter) => client.get<SearchResponse>('/search.php', { params: { f: letter } })),
  )

  const byId = new Map<string, Meal>()
  let failures = 0
  for (const result of results) {
    if (result.status === 'rejected') {
      failures += 1
      continue
    }
    for (const raw of result.value.data.meals ?? []) {
      const meal = normalize(raw)
      if (meal.id && meal.name) byId.set(meal.id, meal)
    }
  }

  if (byId.size === 0) {
    throw new Error('Could not reach TheMealDB. Check your connection and try again.')
  }

  const meals = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
  // Only cache a complete result so a partial load is retried next time.
  if (failures === 0) writeCache(meals)
  return meals
}

/** Fetches every meal once, reusing an in-memory request and a session cache to avoid rate limits. */
export function fetchAllMeals(): Promise<Meal[]> {
  const cached = readCache()
  if (cached) return Promise.resolve(cached)

  if (!inFlight) {
    inFlight = loadFromApi().finally(() => {
      inFlight = null
    })
  }
  return inFlight
}
