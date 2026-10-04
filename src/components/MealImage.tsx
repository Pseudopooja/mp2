import { useState } from 'react'
import styles from './MealImage.module.css'

interface Props {
  src: string
  alt: string
  size?: 'small' | 'medium' | 'full'
  className?: string
}

/** TheMealDB serves resized thumbnails by appending /small or /medium to the image URL. */
function sized(src: string, size: Props['size']): string {
  if (!src || size === 'full' || !size) return src
  return `${src}/${size}`
}

export default function MealImage({ src, alt, size = 'medium', className }: Props) {
  const [failed, setFailed] = useState(false)
  const classes = className ? `${styles.image} ${className}` : styles.image

  if (!src || failed) {
    return (
      <div className={`${styles.placeholder} ${className ?? ''}`} role="img" aria-label={alt}>
        {alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return <img className={classes} src={sized(src, size)} alt={alt} loading="lazy" onError={() => setFailed(true)} />
}
