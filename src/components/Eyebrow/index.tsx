import React from 'react'

import { cn } from '@/utilities/ui'

/** Small tracked label above a heading, in the accent colour. */
export const Eyebrow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <p className={cn('type-eyebrow', className)}>{children}</p>
