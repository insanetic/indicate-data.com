import React from 'react'

import { cn } from '@/utilities/ui'

export type SectionBackground = 'default' | 'tinted' | 'dark'
export type SectionSpacing = 'default' | 'compact' | 'none'

type Props = {
  as?: 'section' | 'div' | 'header' | 'footer'
  background?: SectionBackground | null
  spacing?: SectionSpacing | null
  id?: string | null
  className?: string
  children: React.ReactNode
}

const backgrounds: Record<SectionBackground, string> = {
  default: 'bg-surface text-ink',
  tinted: 'bg-surface-2 text-ink',
  dark: 'bg-night text-ink',
}

const spacings: Record<SectionSpacing, string> = {
  default: 'py-20 md:py-28',
  compact: 'py-12 md:py-16',
  none: '',
}

/** Wraps every marketing block: background, vertical rhythm, anchor id and dark remap. */
export const Section: React.FC<Props> = ({
  as: Tag = 'section',
  background,
  spacing,
  id,
  className,
  children,
}) => {
  const bg = background || 'default'
  return (
    <Tag
      id={id || undefined}
      data-theme={bg === 'dark' ? 'dark' : undefined}
      className={cn('relative overflow-x-clip', backgrounds[bg], spacings[spacing || 'default'], className)}
    >
      {children}
    </Tag>
  )
}
