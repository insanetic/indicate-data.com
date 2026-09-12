import React from 'react'

import type { StatsBlock as Props } from '@/payload-types'

import { SectionHeading } from '@/components/SectionHeading'
import { cn } from '@/utilities/ui'

export const StatsBlock: React.FC<Props> = ({ header, items }) => {
  const list = (items || []).filter((s) => s.value && s.label)
  if (list.length === 0) return null

  return (
    <div className="container">
      <SectionHeading align="center" className="mx-auto mb-10 md:mb-14 reveal" header={header} />
      <dl
        className={cn(
          'reveal-stagger grid gap-8 sm:grid-cols-2',
          list.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
        )}
      >
        {list.map((stat, i) => (
          <div
            className="flex flex-col gap-2 border-l border-line pl-5"
            key={stat.id || i}
            style={{ '--i': i } as React.CSSProperties}
          >
            <dd className="type-stat text-ink">
              {stat.value}
              {stat.suffix && <span className="text-brand-blue-deep">{stat.suffix}</span>}
            </dd>
            <dt className="type-body font-medium text-ink">{stat.label}</dt>
            {stat.note && <p className="type-caption text-ink-3">{stat.note}</p>}
          </div>
        ))}
      </dl>
    </div>
  )
}
