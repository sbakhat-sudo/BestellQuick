import { useEffect, useRef, useState } from 'react'

/** Flips `data-revealed="true"` on once the element scrolls into view, driving the [data-reveal] CSS transition in index.css. */
export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, revealed }
}
