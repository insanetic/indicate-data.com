'use client'

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

export type TabData = {
  id: string
  label: string
  icon: React.ReactNode
  content: React.ReactNode
  visual: React.ReactNode
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * Accessible tabs (roving focus, arrow keys). The indicator slides with `transform`;
 * the panel remounts so its crossfade plays.
 */
export const FeatureTabsClient: React.FC<{ tabs: TabData[] }> = ({ tabs }) => {
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null)
  const baseId = useId()

  useIsoLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const update = () => {
      const el = list.querySelector<HTMLElement>(`[data-tab-index="${active}"]`)
      if (!el) return
      setIndicator({ x: el.offsetLeft, w: el.offsetWidth })
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(list)
    return () => ro.disconnect()
  }, [active])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: tabs.length - 1,
    }
    if (!(e.key in keys)) return
    e.preventDefault()
    const next = (keys[e.key] + tabs.length) % tabs.length
    setActive(next)
    listRef.current?.querySelector<HTMLElement>(`[data-tab-index="${next}"]`)?.focus()
  }

  const tab = tabs[active]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <div
          aria-orientation="horizontal"
          className="relative flex max-w-full gap-1 overflow-x-auto rounded-pill border border-line bg-surface-2 p-1 [scrollbar-width:none]"
          onKeyDown={onKeyDown}
          ref={listRef}
          role="tablist"
        >
          {indicator && (
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 left-0 rounded-btn bg-surface-3 border border-line-strong transition-[transform,width] duration-250 ease-out-quart"
              style={{ transform: `translateX(${indicator.x}px)`, width: indicator.w }}
            />
          )}
          {tabs.map((t, i) => (
            <button
              aria-controls={`${baseId}-panel-${i}`}
              aria-selected={i === active}
              className={cn(
                'relative z-10 flex h-10 shrink-0 items-center gap-2 rounded-btn px-4 text-[0.9375rem] font-medium transition-colors duration-150',
                i === active ? 'text-ink' : 'text-ink-3 hover:text-ink',
              )}
              data-tab-index={i}
              id={`${baseId}-tab-${i}`}
              key={t.id}
              onClick={() => setActive(i)}
              role="tab"
              tabIndex={i === active ? 0 : -1}
              type="button"
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div
        aria-labelledby={`${baseId}-tab-${active}`}
        className="card-surface grid items-center gap-8 p-6 md:p-10 lg:grid-cols-12 lg:gap-12"
        id={`${baseId}-panel-${active}`}
        key={tab.id}
        role="tabpanel"
      >
        <div className="panel-enter lg:col-span-5">{tab.content}</div>
        <div className="panel-enter lg:col-span-7" style={{ animationDelay: '40ms' }}>
          {tab.visual}
        </div>
      </div>

      {/* Inactive panels stay in the document for crawlers, hidden from everyone else. */}
      <div hidden>
        {tabs.map((t, i) =>
          i === active ? null : (
            <div id={`${baseId}-panel-${i}`} key={t.id} role="tabpanel">
              {t.content}
            </div>
          ),
        )}
      </div>
    </div>
  )
}
