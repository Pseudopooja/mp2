import { useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MealImage from '../components/MealImage'
import { useMeals } from '../context/MealsContext'
import styles from './DetailView.module.css'

export default function DetailView() {
  const { id } = useParams<{ id: string }>()
  const { meals, browse } = useMeals()
  const navigate = useNavigate()

  const meal = meals.find((item) => item.id === id)

  // Previous/next cycle through the list the user came from (filtered and sorted).
  // When the page is opened directly by URL, fall back to every meal A to Z.
  const { ids, backPath, backLabel } = useMemo(() => {
    if (browse && id && browse.ids.includes(id)) return browse
    return { ids: meals.map((item) => item.id), backPath: '/', backLabel: 'Back to list' }
  }, [browse, id, meals])

  const index = id ? ids.indexOf(id) : -1
  const total = ids.length
  const previousId = index >= 0 ? ids[(index - 1 + total) % total] : null
  const nextId = index >= 0 ? ids[(index + 1) % total] : null
  const previousMeal = meals.find((item) => item.id === previousId)
  const nextMeal = meals.find((item) => item.id === nextId)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Left and right arrow keys mirror the previous and next buttons.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) return
      if (event.key === 'ArrowLeft' && previousId) navigate(`/meal/${previousId}`)
      if (event.key === 'ArrowRight' && nextId) navigate(`/meal/${nextId}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previousId, nextId, navigate])

  if (!meal) {
    return (
      <div>
        <h1>Meal not found</h1>
        <p>
          There is no meal with the id &ldquo;{id}&rdquo;. <Link to="/">Browse all meals</Link>.
        </p>
      </div>
    )
  }

  const steps = meal.instructions
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <article aria-labelledby="meal-title">
      <div className={styles.toolbar}>
        <Link to={backPath} className={styles.back}>
          &larr; {backLabel}
        </Link>
        <nav className={styles.pager} aria-label="Meal navigation">
          <Link
            to={`/meal/${previousId}`}
            className={styles.pagerButton}
            aria-label={`Previous meal: ${previousMeal?.name ?? ''}`}
            rel="prev"
          >
            <span aria-hidden="true">&larr;</span> Previous
          </Link>
          <span className={styles.position}>
            {index + 1} of {total}
          </span>
          <Link
            to={`/meal/${nextId}`}
            className={styles.pagerButton}
            aria-label={`Next meal: ${nextMeal?.name ?? ''}`}
            rel="next"
          >
            Next <span aria-hidden="true">&rarr;</span>
          </Link>
        </nav>
      </div>

      <div className={styles.layout}>
        <div className={styles.photo}>
          <MealImage src={meal.thumb} alt={meal.name} size="full" />
        </div>

        <div className={styles.content}>
          <h1 id="meal-title" className={styles.title}>
            {meal.name}
          </h1>

          <dl className={styles.facts}>
            <div>
              <dt>Category</dt>
              <dd>{meal.category}</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>{meal.area}</dd>
            </div>
            <div>
              <dt>Ingredients</dt>
              <dd>{meal.ingredients.length}</dd>
            </div>
          </dl>

          {meal.tags.length > 0 && (
            <ul className={styles.tags} aria-label="Tags">
              {meal.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}

          <h2 className={styles.sectionTitle}>Ingredients</h2>
          <ul className={styles.ingredients}>
            {meal.ingredients.map((ingredient) => (
              <li key={ingredient.name}>
                <span className={styles.measure}>{ingredient.measure || 'To taste'}</span>
                <span>{ingredient.name}</span>
              </li>
            ))}
          </ul>

          <h2 className={styles.sectionTitle}>Method</h2>
          <div className={styles.method}>
            {steps.map((step, position) => (
              <p key={position}>{step}</p>
            ))}
          </div>

          {(meal.youtube || meal.source) && (
            <p className={styles.links}>
              {meal.youtube && (
                <a href={meal.youtube} target="_blank" rel="noreferrer">
                  Watch on YouTube
                </a>
              )}
              {meal.source && (
                <a href={meal.source} target="_blank" rel="noreferrer">
                  Original recipe
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
