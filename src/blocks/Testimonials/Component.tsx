import React from 'react'

import type { TestimonialsBlock as Props } from '@/payload-types'

import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { Avatar } from '@/components/Illustrations/primitives'
import { cn } from '@/utilities/ui'

export const TestimonialsBlock: React.FC<Props> = ({ header, items }) => {
  const list = (items || []).filter((t) => t.quote && t.name)
  if (list.length === 0) return null
  const single = list.length === 1

  return (
    <div className="container">
      <SectionHeading align="center" className="mx-auto mb-10 md:mb-14 reveal" header={header} />
      <ul
        className={cn(
          'reveal-stagger grid gap-5',
          single ? 'max-w-[52rem] mx-auto' : list.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {list.map((t, i) => {
          const initials = t.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
          return (
            <li
              className={cn('card-surface flex flex-col justify-between gap-8 p-7 md:p-9', single && 'md:p-12 text-center items-center')}
              key={t.id || i}
              style={{ '--i': i } as React.CSSProperties}
            >
              <blockquote className={cn('font-display text-ink pretty', single ? 'type-h3' : 'text-[1.25rem] leading-[1.4]')}>
                „{t.quote}“
              </blockquote>
              <figcaption className={cn('flex items-center gap-3', single && 'justify-center')}>
                {t.avatar && typeof t.avatar === 'object' ? (
                  <Media htmlElement={null} imgClassName="size-10 rounded-full object-cover" resource={t.avatar} />
                ) : (
                  <Avatar className="size-10 type-small" initials={initials} tone={(['blue', 'yellow', 'coral'] as const)[i % 3]} />
                )}
                <div className={cn('flex flex-col', single && 'text-left')}>
                  <span className="type-small font-medium text-ink">{t.name}</span>
                  <span className="type-caption text-ink-3">
                    {[t.role, t.company].filter(Boolean).join(', ')}
                  </span>
                </div>
                {t.logo && typeof t.logo === 'object' && (
                  <Media htmlElement={null} imgClassName="ml-auto h-6 w-auto opacity-70" resource={t.logo} />
                )}
              </figcaption>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
