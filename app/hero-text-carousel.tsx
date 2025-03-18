'use client'

import { useState, useEffect } from 'react'

const CAROUSEL_TEXTS = ['bridal fit', 'outdoor venue', 'bespoke stationery', 'seasonal florals', 'table setting hire']

export default function HeroTextCarousel({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_TEXTS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <h1 className={className}>
        <span className="block">Find your local</span>
        <span className="block">{CAROUSEL_TEXTS[currentIndex]}</span>
      </h1>
    </>
  )
}
