import * as React from 'react'

import { cn } from '@/utilities/ui'

/**
 * A field's share of the row, as set in the form builder. Fields sit in a wrapping flex row with a
 * 1rem gap, so each one gives up its part of the gaps; on phones every field takes the full row.
 */
export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string | null
}> = ({ children, className, width }) => {
  const share = Math.min(Math.max(Number(width) || 100, 1), 100)

  return (
    <div
      className={cn('min-w-0 basis-full sm:basis-[var(--field-basis)]', className)}
      style={{ '--field-basis': `calc(${share}% - ${(100 - share) / 100}rem)` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
