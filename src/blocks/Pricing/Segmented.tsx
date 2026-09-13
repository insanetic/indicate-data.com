'use client'

import React from 'react'

import { cn } from '@/utilities/ui'

export type SegmentedOption = { value: string; label: React.ReactNode; tag?: React.ReactNode }

type Props = {
  options: SegmentedOption[]
  value: string | undefined
  onChange: (value: string) => void
  /** Radio semantics for a setting, tab semantics for switching a panel. */
  role: 'radiogroup' | 'tablist'
  ariaLabel: string
  className?: string
  /** Stretches options to equal widths (plan switcher); default hugs the content. */
  fill?: boolean
}

/**
 * Button-shaped segmented control with a sliding ink thumb. Same radius as the buttons so it
 * reads as one family of controls.
 */
export const Segmented: React.FC<Props> = ({ options, value, onChange, role, ariaLabel, className, fill = false }) => {
  const index = Math.max(0, options.findIndex((o) => o.value === value))
  const n = options.length
  const optionRole = role === 'tablist' ? 'tab' : 'radio'
  return (
    <div
      aria-label={ariaLabel}
      className={cn('relative grid rounded-btn border border-line bg-surface-2 p-1', fill ? 'w-full' : 'inline-grid', className)}
      role={role}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="segmented-thumb absolute inset-y-1 left-1 rounded-[calc(var(--radius-btn)-2px)] bg-ink"
        style={{ width: `calc((100% - 0.5rem) / ${n})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            aria-checked={optionRole === 'radio' ? active : undefined}
            aria-selected={optionRole === 'tab' ? active : undefined}
            className={cn(
              'relative z-[1] inline-flex h-9 items-center justify-center gap-2 truncate rounded-[calc(var(--radius-btn)-2px)] px-4 type-small font-medium transition-colors duration-200',
              active ? 'text-surface' : 'text-ink-2 hover:text-ink',
            )}
            key={o.value}
            onClick={() => onChange(o.value)}
            role={optionRole}
            type="button"
          >
            {o.label}
            {o.tag}
          </button>
        )
      })}
    </div>
  )
}
