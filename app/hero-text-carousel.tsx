'use client'

import { useState, useEffect } from 'react'

export default function HeroTextCarousel({ className }: { className?: string }) {
  const texts = ['bridal fit', 'outdoor venue', 'bespoke stationery', 'seasonal florals', 'table setting hire']
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <h1 className={className}>
        <span className="block">Find your local</span>
        <span className="block">{texts[currentIndex]}</span>
      </h1>
    </>
  )
}
