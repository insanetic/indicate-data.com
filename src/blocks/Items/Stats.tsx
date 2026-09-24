import React from 'react'

import { CMSLink } from '@/components/Link'
import { CountUp } from '@/components/CountUp'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import type { StyleProps } from './Component'

/**
 * Numbers that count up, with a label, an optional note and link. An entry without a number
 * shows its label large (the "For hotel groups" tiles). In a panel: bordered tiles.
 */
export const Stats: React.FC<StyleProps> = ({ items, grid, panel }) => (
  <ul className={cn('grid', grid, panel ? '' : 'reveal-stagger gap-8')}>
    {items.map((stat, i) => {
      const link = (stat.links || []).find((l) => l.link?.label)?.link
      return (
        <li
          className={cn(
            'flex flex-col gap-2',
            panel
              ? 'reveal border-b border-line p-6 sm:[&:nth-child(2n)]:border-l lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:nth-child(2n)]:border-l'
              : 'border-l border-line pl-5',
          )}
          key={stat.id || i}
          style={{ '--i': i } as React.CSSProperties}
        >
          {stat.value ? (
            <p className="type-stat text-ink">
              <CountUp value={stat.value} />
              {stat.suffix && <span className={panel ? 'text-accent' : 'text-brand-blue-deep'}>{stat.suffix}</span>}
            </p>
          ) : null}
          <p className={cn(!stat.value ? 'type-h4 text-ink' : panel ? 'type-small text-ink-2' : 'type-body font-medium text-ink')}>
            {withResi(stat.title)}
          </p>
          {stat.text && <p className="type-caption text-ink-3">{withResi(stat.text)}</p>}
          {link && <CMSLink {...link} appearance="inline" className="link-arrow mt-auto type-small" />}
        </li>
      )
    })}
  </ul>
)
