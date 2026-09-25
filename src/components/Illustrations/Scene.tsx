'use client'

import React, { useEffect, useRef } from 'react'

import { cn } from '@/utilities/ui'

import { BUILD } from './stage'

/**
 * Frame for the hero scenes. The scene builds itself once, then its 12 s clock runs. Until
 * hydration it simply plays (a hero is in view from the first paint); after that an observer
 * pauses every animation inside while the scene is offscreen, so a scene further down the
 * page builds when it arrives and the clock never runs unseen.
 */
export const Scene: React.FC<{
  label: string
  className?: string
  style?: React.CSSProperties
  /** Seconds of the first exchange to skip when it opens quietly, so the first cycle starts on its first move. */
  lead?: number
  children: React.ReactNode
}> = ({ label, className, style, lead = 0, children }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return
    // From here on the observer decides when the clock runs (`scenes/stage.css`).
    el.setAttribute('data-io', '')
    let first = true
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.setAttribute('data-run', '')
        else el.removeAttribute('data-run')
        // A scene below the fold has been playing unseen since the first paint: rewind it,
        // so it builds when it arrives.
        if (first && !entry.isIntersecting) {
          for (const a of el.getAnimations({ subtree: true })) a.currentTime = 0
        }
        first = false
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      aria-label={label}
      className={cn('scene loop relative select-none pointer-events-none text-left', className)}
      ref={ref}
      role="img"
      style={{ '--t0': `calc(${(BUILD - lead).toFixed(2)}s + var(--intro, 0s))`, ...style } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
