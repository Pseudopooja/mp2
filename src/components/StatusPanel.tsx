import styles from './StatusPanel.module.css'

interface Props {
  status: 'loading' | 'error'
  message?: string | null
  onRetry?: () => void
}

export default function StatusPanel({ status, message, onRetry }: Props) {
  if (status === 'loading') {
    return (
      <div className={styles.panel} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p className={styles.title}>Loading meals</p>
        <p className={styles.detail}>Fetching the full recipe index. This takes a few seconds on the first visit.</p>
      </div>
    )
  }

  return (
    <div className={styles.panel} role="alert">
      <p className={styles.title}>Meals did not load</p>
      <p className={styles.detail}>{message ?? 'Check your connection and try again.'}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
