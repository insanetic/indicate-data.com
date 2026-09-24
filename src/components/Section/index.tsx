import React from 'react'

import type { ResolvedGap } from '@/sections/rhythm'
import { cn } from '@/utilities/ui'

export type SectionBackground = 'default' | 'tinted' | 'dark' | 'accent'

type Props = {
  as?: 'section' | 'div' | 'header' | 'footer'
  background?: SectionBackground | null
  top?: ResolvedGap
  bottom?: ResolvedGap
  /** First / last block of its group: only there does a tinted band draw its hairline. */
  groupStart?: boolean
  groupEnd?: boolean
  id?: string | null
  className?: string
  children: React.ReactNode
}

const backgrounds: Record<SectionBackground, string> = {
  default: 'bg-surface text-ink',
  tinted: 'bg-surface-2 text-ink border-line',
  dark: 'bg-surface text-ink',
  accent: 'bg-surface text-ink',
}

const tops: Record<ResolvedGap, string> = {
  none: '',
  tight: 'pt-10 md:pt-12',
  normal: 'pt-20 md:pt-28',
  large: 'pt-28 md:pt-40',
}

const bottoms: Record<ResolvedGap, string> = {
  none: '',
  tight: 'pb-10 md:pb-12',
  normal: 'pb-20 md:pb-28',
  large: 'pb-28 md:pb-40',
}

/** Wraps every marketing block: background, vertical gaps, anchor id and token remap. */
export const Section: React.FC<Props> = ({
  as: Tag = 'section',
  background,
  top = 'normal',
  bottom = 'normal',
  groupStart = true,
  groupEnd = true,
  id,
  className,
  children,
}) => {
  const bg = background || 'default'
  const theme = bg === 'accent' ? 'accent' : bg === 'dark' ? 'dark' : undefined
  return (
    <Tag
      id={id || undefined}
      data-theme={theme}
      data-group-start={groupStart || undefined}
      className={cn(
        'relative overflow-x-clip',
        backgrounds[bg],
        bg === 'tinted' && groupStart && 'border-t',
        bg === 'tinted' && groupEnd && 'border-b',
        tops[top],
        bottoms[bottom],
        className,
      )}
    >
      {children}
    </Tag>
  )
}
