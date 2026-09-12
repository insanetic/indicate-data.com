import React from 'react'

import { cn } from '@/utilities/ui'

export const Container: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cn('container', className)}>{children}</div>
