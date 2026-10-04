import { useEffect, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import MealImage from '../components/MealImage'
import { useMeals } from '../context/MealsContext'
import type { SortDirection, SortKey } from '../types'
import { isSortKey, SORT_OPTIONS, sortMeals } from '../utils/sorting'
import styles from './ListView.module.css'

export default function ListView() {
  const { meals, setBrowse } = useMeals()
  const [params, setParams] = useSearchParams()
  const location = useLocation()

  // Search, sort key and direction live in the URL so the view survives a refresh
  // and the detail page can send the user back to exactly where they were.
  const query = params.get('q') ?? ''
  const sortParam = params.get('sort')
  const sortKey: SortKey = isSortKey(sortParam) ? sortParam : 'name'
  const direction: SortDirection = params.get('dir') === 'desc' ? 'desc' : 'asc'

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = needle ? meals.filter((meal) => meal.name.toLowerCase().includes(needle)) : meals
    return sortMeals(matches, sortKey, direction)
  }, [meals, query, sortKey, direction])

  const backPath = `${location.pathname}${location.search}`
  useEffect(() => {
    setBrowse({ ids: visible.map((meal) => meal.id), backPath, backLabel: 'Back to list' })
  }, [visible, backPath, setBrowse])

  function updateParam(key: string, value: string, fallback: string) {
    const next = new URLSearchParams(params)
    if (value === fallback) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  function onSearch(event: ChangeEvent<HTMLInputElement>) {
    updateParam('q', event.target.value, '')
  }

  function onSortKey(event: ChangeEvent<HTMLSelectElement>) {
    updateParam('sort', event.target.value, 'name')
  }

  return (
    <section aria-labelledby="list-heading">
      <h1 id="list-heading" className={styles.heading}>
        All meals
      </h1>

      <div className={styles.controls}>
        <div className={styles.field}>
          <label htmlFor="meal-search">Search by name</label>
          <input
            id="meal-search"
            type="search"
            className={styles.input}
            value={query}
            onChange={onSearch}
            placeholder="Try chicken, pie or curry"
            autoComplete="off"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="meal-sort">Sort by</label>
          <select id="meal-sort" className={styles.input} value={sortKey} onChange={onSortKey}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field} role="group" aria-labelledby="order-label">
          <span id="order-label" className={styles.label}>
            Order
          </span>
          <div className={styles.segmented}>
            <button
              type="button"
              className={direction === 'asc' ? `${styles.segment} ${styles.selected}` : styles.segment}
              aria-pressed={direction === 'asc'}
              onClick={() => updateParam('dir', 'asc', 'asc')}
            >
              Ascending
            </button>
            <button
              type="button"
              className={direction === 'desc' ? `${styles.segment} ${styles.selected}` : styles.segment}
              aria-pressed={direction === 'desc'}
              onClick={() => updateParam('dir', 'desc', 'asc')}
            >
              Descending
            </button>
          </div>
        </div>
      </div>

      <p className={styles.count} aria-live="polite">
        {visible.length === meals.length
          ? `${meals.length} meals`
          : `${visible.length} of ${meals.length} meals`}
      </p>

      {visible.length === 0 ? (
        <p className={styles.empty}>
          No meals match &ldquo;{query}&rdquo;. Try a shorter word or clear the search.
        </p>
      ) : (
        <ul className={styles.list}>
          {visible.map((meal) => (
            <li key={meal.id}>
              <Link to={`/meal/${meal.id}`} className={styles.row}>
                <span className={styles.thumb}>
                  <MealImage src={meal.thumb} alt="" size="small" />
                </span>
                <span className={styles.name}>{meal.name}</span>
                <span className={styles.meta}>
                  <span className={styles.metaItem}>{meal.category}</span>
                  <span className={styles.metaItem}>{meal.area}</span>
                  <span className={styles.metaItem}>{meal.ingredients.length} ingredients</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
