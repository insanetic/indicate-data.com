import React from 'react'

import { Eyebrow } from '@/components/Eyebrow'
import { cn } from '@/utilities/ui'
import { withResi } from '@/components/Resi'

type HeaderData = {
  eyebrow?: string | null
  heading?: string | null
  lead?: string | null
  align?: 'left' | 'center' | 'right' | null
}

type Props = {
  header?: HeaderData | null
  as?: 'h1' | 'h2' | 'h3'
  size?: 'display-xl' | 'display' | 'h2' | 'h3'
  className?: string
  /** Forces alignment regardless of the CMS setting. */
  align?: 'left' | 'center' | 'right'
  leadClassName?: string
}

/** Eyebrow + heading + lead, shared by every block so sections read alike. */
export const SectionHeading: React.FC<Props> = ({
  header,
  as: Tag = 'h2',
  size = 'h2',
  className,
  align,
  leadClassName,
}) => {
  if (!header?.heading && !header?.lead) return null
  const alignment = align || header.align || 'left'
  const sizeClass = {
    'display-xl': 'type-display-xl',
    display: 'type-display',
    h2: 'type-h2',
    h3: 'type-h3',
  }[size]

  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        alignment === 'center'
          ? 'items-center text-center'
          : alignment === 'right'
            ? 'items-start lg:items-end lg:text-right'
            : 'items-start',
        className,
      )}
    >
      {header.eyebrow && <Eyebrow>{withResi(header.eyebrow)}</Eyebrow>}
      {header.heading && (
        <Tag className={cn(sizeClass, 'max-w-[20ch] text-ink')}>{withResi(header.heading)}</Tag>
      )}
      {header.lead && (
        <p className={cn('type-lead max-w-[58ch] text-ink-2', leadClassName)}>{withResi(header.lead)}</p>
      )}
    </div>
  )
}
