import React from 'react'

import { CMSLink } from '@/components/Link'
import { CountUp } from '@/components/CountUp'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { statSpan } from './columns'
import type { StyleProps } from './Component'

/**
 * Numbers that count up, with a label, an optional note and link. A word can stand in for the
 * number at the same size; an entry with neither shows its label large (the "For hotel groups" tiles). Each entry can set its own width.
 * In a panel every tile draws a hairline to its right and below; the panel clips the outer
 * ones, so the dividers hold for any number of rows and a short last row.
 */
export const Stats: React.FC<StyleProps> = ({ items, grid, panel, columns }) => (
  <ul className={cn('grid', grid, panel ? '' : 'reveal-stagger gap-8')}>
    {items.map((stat, i) => {
      const link = (stat.links || []).find((l) => l.link?.label)?.link
      return (
        <li
          className={cn(
            'flex flex-col gap-2',
            statSpan(stat.width, columns),
            panel ? 'reveal p-6 shadow-[1px_0_0_var(--line),0_1px_0_var(--line)]' : 'border-l border-line pl-5',
          )}
          key={stat.id || i}
          style={{ '--i': i } as React.CSSProperties}
        >
          {stat.value ? (
            <p className="type-stat text-ink">
              <CountUp value={stat.value} />
              {stat.unit && <span className={panel ? 'text-accent' : 'text-brand-blue-deep'}>{stat.unit}</span>}
            </p>
          ) : stat.word ? (
            <p className="type-stat text-ink">{withResi(stat.word)}</p>
          ) : null}
          <p className={cn(!(stat.value || stat.word) ? 'type-h4 text-ink' : panel ? 'type-small text-ink-2' : 'type-body font-medium text-ink')}>
            {withResi(stat.title)}
          </p>
          {stat.text && <p className="type-caption text-ink-3">{withResi(stat.text)}</p>}
          {link && <CMSLink {...link} appearance="inline" className="link-arrow mt-auto type-small" />}
        </li>
      )
    })}
  </ul>
)
