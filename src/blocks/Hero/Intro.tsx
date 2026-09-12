'use client'

import React, { useEffect } from 'react'

export const INTRO_KEY = 'indicate:intro'

/**
 * Marks the hero for the one-per-session entrance. Whether it plays is decided before paint by
 * the tiny script in the root layout (it sets `data-intro-seen` on <html>); this component only
 * records that the visitor has now seen it.
 */
export const HeroIntro: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // storage unavailable (private mode); the intro simply plays again
    }
  }, [])
  return (
    <div className="relative" data-intro="play">
      {children}
    </div>
  )
}
