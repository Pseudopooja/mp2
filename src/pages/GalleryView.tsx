import { useEffect, useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import MealImage from '../components/MealImage'
import { useMeals } from '../context/MealsContext'
import type { Meal } from '../types'
import styles from './GalleryView.module.css'

const CATEGORY_PARAM = 'category'
const AREA_PARAM = 'area'

function countBy(meals: Meal[], pick: (meal: Meal) => string): [string, number][] {
  const counts = new Map<string, number>()
  for (const meal of meals) {
    const key = pick(meal)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}

export default function GalleryView() {
  const { meals, setBrowse } = useMeals()
  const [params, setParams] = useSearchParams()
  const location = useLocation()

  // Selected filters are kept in the URL (?category=Dessert&category=Beef&area=Italian).
  const selectedCategories = params.getAll(CATEGORY_PARAM)
  const selectedAreas = params.getAll(AREA_PARAM)

  const categories = useMemo(() => countBy(meals, (meal) => meal.category), [meals])
  const areas = useMemo(() => countBy(meals, (meal) => meal.area), [meals])

  // A meal must match one of the selected categories AND one of the selected regions,
  // but an empty group means "no restriction".
  const visible = useMemo(
    () =>
      meals.filter(
        (meal) =>
          (selectedCategories.length === 0 || selectedCategories.includes(meal.category)) &&
          (selectedAreas.length === 0 || selectedAreas.includes(meal.area)),
      ),
    // The arrays are rebuilt from params each render, so depend on their joined values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [meals, selectedCategories.join('|'), selectedAreas.join('|')],
  )

  const backPath = `${location.pathname}${location.search}`
  useEffect(() => {
    setBrowse({ ids: visible.map((meal) => meal.id), backPath, backLabel: 'Back to gallery' })
  }, [visible, backPath, setBrowse])

  function toggle(key: string, value: string) {
    const current = params.getAll(key)
    const next = new URLSearchParams(params)
    next.delete(key)
    const updated = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    for (const item of updated) next.append(key, item)
    setParams(next, { replace: true })
  }

  function clearFilters() {
    setParams(new URLSearchParams(), { replace: true })
  }

  const hasFilters = selectedCategories.length > 0 || selectedAreas.length > 0

  function renderGroup(title: string, key: string, options: [string, number][], selected: string[]) {
    return (
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{title}</legend>
        <div className={styles.chips}>
          {options.map(([value, count]) => {
            const checked = selected.includes(value)
            return (
              <label key={value} className={checked ? `${styles.chip} ${styles.chipOn}` : styles.chip}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checked}
                  onChange={() => toggle(key, value)}
                />
                {value}
                <span className={styles.chipCount}>{count}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }

  return (
    <section aria-labelledby="gallery-heading">
      <h1 id="gallery-heading" className={styles.heading}>
        Gallery
      </h1>

      <div className={styles.filters}>
        {renderGroup('Category', CATEGORY_PARAM, categories, selectedCategories)}
        {renderGroup('Region', AREA_PARAM, areas, selectedAreas)}
        <div className={styles.filterFooter}>
          <p className={styles.count} aria-live="polite">
            Showing {visible.length} of {meals.length} meals
          </p>
          {hasFilters && (
            <button type="button" className={styles.clear} onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>No meals combine those filters. Remove a category or region to see more.</p>
      ) : (
        <ul className={styles.grid}>
          {visible.map((meal) => (
            <li key={meal.id}>
              <Link to={`/meal/${meal.id}`} className={styles.card}>
                <span className={styles.photo}>
                  <MealImage src={meal.thumb} alt={meal.name} size="medium" />
                </span>
                <span className={styles.caption}>
                  <span className={styles.name}>{meal.name}</span>
                  <span className={styles.sub}>
                    {meal.category} &middot; {meal.area}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
