import React from 'react'

import type { TestimonialsBlock as Props } from '@/payload-types'

import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { Avatar } from '@/components/Illustrations/primitives'
import { cn } from '@/utilities/ui'

/**
 * Editorial quotes: heading on the left, each quote set large with a yellow opening mark and
 * a hairline between them. No cards, no grid of equal boxes.
 */
export const TestimonialsBlock: React.FC<Props> = ({ header, items }) => {
  const list = (items || []).filter((t) => t.quote && t.name)
  if (list.length === 0) return null

  return (
    <div className="container">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <SectionHeading className="reveal lg:col-span-4 lg:sticky lg:top-28 lg:self-start" header={header} />
        <ul className="reveal-stagger flex flex-col divide-y divide-line border-y border-line lg:col-span-8">
          {list.map((t, i) => {
            const initials = t.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
            return (
              <li className="grid gap-6 py-10 md:grid-cols-[3rem_1fr] md:gap-8 md:py-12" key={t.id || i} style={{ '--i': i } as React.CSSProperties}>
                <span aria-hidden="true" className="font-display text-[3.5rem] leading-[0.7] text-accent select-none">
                  „
                </span>
                <figure className="flex flex-col gap-7">
                  <blockquote className={cn('font-display text-ink pretty', i === 0 ? 'type-h3 md:text-[1.9rem] md:leading-[1.3]' : 'type-h3')}>
                    {t.quote}
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    {t.avatar && typeof t.avatar === 'object' ? (
                      <Media htmlElement={null} imgClassName="size-10 rounded-full object-cover" resource={t.avatar} />
                    ) : (
                      <Avatar className="size-10 type-small" initials={initials} tone={(['blue', 'yellow', 'coral'] as const)[i % 3]} />
                    )}
                    <div className="flex flex-col">
                      <span className="type-small font-medium text-ink">{t.name}</span>
                      <span className="type-caption text-ink-3">{[t.role, t.company].filter(Boolean).join(', ')}</span>
                    </div>
                    {t.logo && typeof t.logo === 'object' && (
                      <Media htmlElement={null} imgClassName="ml-auto h-6 w-auto opacity-70" resource={t.logo} />
                    )}
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
