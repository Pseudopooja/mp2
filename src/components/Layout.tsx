import { NavLink, Outlet } from 'react-router-dom'
import { useMeals } from '../context/MealsContext'
import StatusPanel from './StatusPanel'
import styles from './Layout.module.css'

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
}

export default function Layout() {
  const { status, error, reload } = useMeals()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/" className={styles.brand}>
            Mealbook
          </NavLink>
          <nav aria-label="Primary" className={styles.nav}>
            <NavLink to="/" end className={navClass}>
              List
            </NavLink>
            <NavLink to="/gallery" className={navClass}>
              Gallery
            </NavLink>
          </nav>
        </div>
      </header>
      <main className={styles.main}>
        {status === 'ready' ? <Outlet /> : <StatusPanel status={status} message={error} onRetry={reload} />}
      </main>
      <footer className={styles.footer}>
        Recipe data from{' '}
        <a href="https://www.themealdb.com/" target="_blank" rel="noreferrer">
          TheMealDB
        </a>
      </footer>
    </div>
  )
}
