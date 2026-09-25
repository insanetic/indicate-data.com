'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

export type Slide = {
  id: string
  quote: string
  /** Avatar, name and role, rendered on the server (the company may be a CMS link). */
  author: React.ReactNode
}

export type SliderLabels = {
  carousel: string
  /** `{n}` and `{total}` are filled in. */
  slide: string
  prev: string
  next: string
  /** Quote marks for the locale, e.g. „ and “. */
  open: string
  close: string
}

/** How long a quote stays before autoplay moves on (ms). The progress line runs on this clock. */
const HOLD = 7000

/**
 * One quote at a time. Autoplay is driven by the progress line's CSS animation: when it ends the
 * next quote shows, so pausing the animation (hover, keyboard focus, off screen, hidden tab)
 * pauses the slider too. Every quote sits in the same grid cell, so the height is that of the
 * longest one and nothing jumps.
 */
export const TestimonialSlider: React.FC<{ slides: Slide[]; labels: SliderLabels }> = ({ slides, labels }) => {
  const [active, setActive] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [inView, setInView] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(false)
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  const total = slides.length
  const multiple = total > 1
  const autoplay = multiple && !reduced
  const paused = !inView || hovered || focused || hidden

  const go = (index: number) => {
    setActive((index + total) % total)
    setCycle((c) => c + 1)
  }

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 })
    io.observe(el)
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(active - 1)
    else if (e.key === 'ArrowRight') go(active + 1)
    else return
    e.preventDefault()
  }

  // Horizontal swipe on touch; vertical movement is left to the page scroll (touch-action: pan-y).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipe.current
    swipe.current = null
    if (!start) return
    const dx = e.clientX - start.x
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(active + (dx < 0 ? 1 : -1))
  }

  return (
    <div
      aria-label={labels.carousel}
      aria-roledescription="carousel"
      className="relative border-b border-line"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
      // Only keyboard focus pauses: a mouse click leaves focus on the arrow, and that should not stop autoplay for good.
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onKeyDown={multiple ? onKeyDown : undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      ref={rootRef}
      role="region"
    >
      <div
        aria-live={autoplay && !paused ? 'off' : 'polite'}
        className="grid touch-pan-y"
        onPointerCancel={() => (swipe.current = null)}
        onPointerDown={multiple ? onPointerDown : undefined}
        onPointerUp={multiple ? onPointerUp : undefined}
      >
        {slides.map((s, i) => {
          const on = i === active
          return (
            <figure
              aria-label={multiple ? labels.slide.replace('{n}', String(i + 1)).replace('{total}', String(total)) : undefined}
              aria-roledescription={multiple ? 'slide' : undefined}
              className={cn(
                'col-start-1 row-start-1 flex flex-col gap-8 pb-6 sm:pb-10 md:gap-10 md:pb-12',
                'transition-[opacity,translate,visibility] motion-reduce:translate-y-0',
                on
                  ? 'visible translate-y-0 opacity-100 duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]'
                  : 'invisible translate-y-2 opacity-0 duration-200 ease-out',
              )}
              inert={!on}
              key={s.id}
              role={multiple ? 'group' : undefined}
            >
              {/* The opening mark hangs into the margin, so the first letter lines up with the author below. */}
              <blockquote className="relative max-w-[34ch] font-display text-ink pretty type-h3 md:text-[1.9rem] md:leading-[1.3]">
                <span aria-hidden="true" className="absolute right-full pr-[0.06em] text-accent in-data-[theme=accent]:text-ink">
                  {labels.open}
                </span>
                {s.quote}
                <span aria-hidden="true" className="text-accent in-data-[theme=accent]:text-ink">
                  {labels.close}
                </span>
              </blockquote>
              {/* From sm up the navigation sits in this row, on the right. */}
              <figcaption className={cn('mt-auto', multiple && 'sm:pr-48')}>{s.author}</figcaption>
            </figure>
          )
        })}
      </div>

      {multiple && (
        // Phones: its own row under the author. From sm up: beside the author.
        <div className="flex items-center justify-between pb-8 sm:absolute sm:bottom-10 sm:right-0 sm:pb-0 md:bottom-12">
          {/* One dash per quote; the active one fills while it is shown and is the autoplay clock. */}
          <span aria-hidden="true" className="flex items-center gap-1.5 sm:mr-4">
            {slides.map((s, i) => (
              <span className="h-0.5 w-5 overflow-hidden rounded-full bg-line" key={s.id}>
                {i === active && (
                  <span
                    className={cn('block h-full rounded-full bg-ink-2', autoplay && 'chat-progress')}
                    key={cycle}
                    onAnimationEnd={autoplay ? () => go(active + 1) : undefined}
                    // Inline: the unlayered `.chat-progress` shorthand would beat a utility class.
                    style={{ '--hold': `${HOLD}ms`, animationPlayState: paused ? 'paused' : 'running' } as React.CSSProperties}
                  />
                )}
              </span>
            ))}
          </span>
          <div className="flex gap-1">
            <NavButton label={labels.prev} onClick={() => go(active - 1)}>
              <ArrowLeft aria-hidden="true" className="size-4" />
            </NavButton>
            <NavButton label={labels.next} onClick={() => go(active + 1)}>
              <ArrowRight aria-hidden="true" className="size-4" />
            </NavButton>
          </div>
        </div>
      )}
    </div>
  )
}

const NavButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({ label, onClick, children }) => (
  <button
    aria-label={label}
    className="pressable inline-flex size-11 touch-manipulation items-center justify-center rounded-full border border-line text-ink hover:border-line-strong hover:bg-surface-2/60"
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
)

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}
