'use client'

import { useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  onIntersect: () => void
  disabled?: boolean
}

export function useInfiniteScroll({ onIntersect, disabled = false }: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const onIntersectRef = useRef(onIntersect)

  // Keep callback ref in sync
  useEffect(() => {
    onIntersectRef.current = onIntersect
  }, [onIntersect])

  useEffect(() => {
    if (disabled || !sentinelRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          onIntersectRef.current()
        }
      },
      {
        threshold: 0.1,
      }
    )

    const currentSentinel = sentinelRef.current
    observer.observe(currentSentinel)

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel)
      }
    }
  }, [disabled])

  return { sentinelRef }
}
