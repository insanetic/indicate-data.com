'use client'

import React, { useEffect, useRef, useState } from 'react'

type Props = {
  /** Display value, e.g. "40", "1.200", "13". Non-numeric strings render as-is. */
  value: string
  className?: string
  duration?: number
}

/** Counts a number up from zero once it scrolls into view. Reduced motion: shows the value. */
export const CountUp: React.FC<Props> = ({ value, className, duration = 1400 }) => {
  const target = Number(value.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'))
  const numeric = value.trim() !== '' && !Number.isNaN(target)
  const decimals = (value.split(',')[1] || '').length
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)
  const [ready, setReady] = useState(!numeric)

  useEffect(() => {
    if (!numeric || !ref.current) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const id = requestAnimationFrame(() => setReady(true))
      return () => cancelAnimationFrame(id)
    }
    const el = ref.current
    let frame = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 4)
          const current = target * eased
          setDisplay(
            current.toLocaleString('de-DE', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }),
          )
          if (t < 1) frame = requestAnimationFrame(tick)
          else setReady(true)
        }
        setDisplay((0).toLocaleString('de-DE', { minimumFractionDigits: decimals }))
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.6 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [numeric, target, decimals, duration])

  return (
    <span className={className} data-ready={ready || undefined} ref={ref}>
      {numeric ? display : value}
    </span>
  )
}
