// src/consent/components/Switch.tsx
'use client'

import React from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  'aria-labelledby'?: string
  className?: string
}

/** Minimal accessible switch (role="switch"); locked when disabled. */
export const Switch: React.FC<Props> = ({ checked, onChange, disabled, className, ...aria }) => (
  <button
    aria-checked={checked}
    aria-disabled={disabled || undefined}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border border-line-strong transition-colors duration-150',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]',
      checked ? 'bg-[var(--btn-primary-bg)]' : 'bg-surface-2',
      disabled && 'cursor-not-allowed opacity-60',
      className,
    )}
    onClick={() => {
      if (!disabled) onChange?.(!checked)
    }}
    role="switch"
    type="button"
    {...aria}
  >
    <span
      aria-hidden
      className={cn(
        'block size-4 rounded-pill bg-surface shadow-card transition-transform duration-150 motion-reduce:transition-none',
        checked ? 'translate-x-6' : 'translate-x-1',
      )}
    />
  </button>
)
