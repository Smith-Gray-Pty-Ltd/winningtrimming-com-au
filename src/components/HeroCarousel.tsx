'use client'

import NextImage from 'next/image'
import React, { useEffect, useState } from 'react'

type Slide = {
  url: string
  alt: string
}

/**
 * Slow cross-fading background image carousel.
 * Used in the home hero to showcase recent project photos.
 */
export const HeroCarousel: React.FC<{ slides: Slide[]; interval?: number }> = ({
  slides,
  interval = 5000,
}) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, interval)
    return () => clearInterval(timer)
  }, [slides.length, interval])

  if (slides.length === 0) {
    // Fallback gradient
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1a2e0a] via-black to-[#0a1a05]"
        aria-hidden="true"
      />
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((slide, i) => (
        <NextImage
          key={i}
          src={slide.url}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {/* Gradient tint — darker on the left so left-aligned text stays legible */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"
        aria-hidden="true"
      />
    </div>
  )
}