import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

/** Sentence-case section label with the brand mark in front. Not uppercase, not tracked. */
export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <p
    className={cn(
      'inline-flex items-center gap-2 type-small font-medium text-brand-blue-deep',
      className,
    )}
  >
    <BrandBars size={13} />
    <span>{children}</span>
  </p>
)
