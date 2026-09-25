'use client'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

export type StepRow = { id: string; title: React.ReactNode; text: React.ReactNode; scene: number; ownScene: React.ReactNode | null }

/** `false` on the server and through hydration (matches the SSR markup), then the real preference. */
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

type Props = {
  steps: StepRow[]
  scenes: React.ReactNode[]
  pinned: boolean
  mediaLeft: boolean
  showTopScene: boolean
  header: React.ReactNode
  actions: React.ReactNode
}

/**
 * Numbered steps beside a scene. From lg the step crossing the viewport's centre line is active and
 * the pinned scene shows its layer; below lg every step with its own scene shows it inline.
 */
export const StepsScroller: React.FC<Props> = ({ steps, scenes, pinned, mediaLeft, showTopScene, header, actions }) => {
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const items = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    // A zero-height band at the vertical centre: whichever step crosses it is active.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = items.current.indexOf(e.target as HTMLLIElement)
          if (i !== -1) setActive(i)
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    items.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [steps.length])

  const visibleScene = steps[active]?.scene ?? 0

  return (
    <div className="container">
      <div className={cn('grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16', pinned ? 'items-start' : 'items-center')}>
        <div className={cn('lg:col-span-7', mediaLeft ? 'lg:order-1' : 'lg:order-2', pinned && 'lg:self-stretch')} data-part="media">
          {showTopScene && (
            <div className="lg:hidden" data-mobile-top-scene>
              {scenes[0]}
            </div>
          )}
          <div className={cn('relative hidden lg:grid', pinned && 'lg:sticky lg:top-28')} data-pinned={pinned ? '' : undefined}>
            {scenes.map((scene, i) => (
              <div
                className={cn('[grid-area:1/1]', !reduced && 'transition-opacity duration-200 ease-out', i === visibleScene ? 'opacity-100' : 'opacity-0')}
                data-paused={i === visibleScene ? undefined : ''}
                data-scene-layer
                data-visible={i === visibleScene ? 'true' : 'false'}
                inert={i !== visibleScene}
                key={i}
              >
                {scene}
              </div>
            ))}
          </div>
        </div>
        <div className={cn('reveal flex flex-col gap-8 lg:col-span-5', mediaLeft ? 'lg:order-2' : 'lg:order-1')} data-part="text">
          {header}
          <ol className="relative flex flex-col">
            <span aria-hidden="true" className="absolute bottom-3 left-[1.125rem] top-3 w-px bg-line" />
            {steps.map((s, i) => (
              <li
                className={cn('relative flex flex-col gap-4 pb-8 last:pb-0', pinned && 'lg:min-h-[50vh]')}
                data-active={i === active ? 'true' : 'false'}
                key={s.id}
                ref={(el) => {
                  items.current[i] = el
                }}
              >
                {s.ownScene && (
                  <div className="lg:hidden" data-step-scene>
                    {s.ownScene}
                  </div>
                )}
                <div className="flex gap-5">
                  <button
                    aria-label={`${String(i + 1).padStart(2, '0')}`}
                    className={cn(
                      'relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface font-display text-sm font-medium tnum text-accent transition-colors duration-150',
                      // Below lg every number reads the same; only from lg does the active one get the ring.
                      i === active ? 'lg:border-accent' : 'lg:text-ink-2',
                    )}
                    onClick={(e) => e.currentTarget.closest('li')?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })}
                    type="button"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                  <div className="flex flex-col gap-2 pt-1.5">
                    <h3 className="type-h4 text-ink">{s.title}</h3>
                    {s.text && <p className="type-small text-ink-2 pretty max-w-[44ch]">{s.text}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          {actions}
        </div>
      </div>
    </div>
  )
}
