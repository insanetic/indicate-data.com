import React from 'react'

import type { PillarsBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { CountUp } from '@/components/CountUp'
import { Icon } from '@/components/Icon'
import { SectionHeading } from '@/components/SectionHeading'
import { cn } from '@/utilities/ui'

/** One rounded container: three pillars with hairline dividers, then a row of tiles. */
export const PillarsBlock: React.FC<Props> = ({ header, pillars, tiles }) => {
  const list = (pillars || []).filter((p) => p.title)
  const tileList = (tiles || []).filter((t) => t.label)
  if (list.length === 0 && tileList.length === 0) return null

  return (
    <div className="container">
      <div className="relative overflow-hidden rounded-[1.25rem] border border-line bg-surface-2">
        <div aria-hidden="true" className="glow-accent pointer-events-none absolute inset-x-0 top-0 h-64" />
        <div className="relative px-6 pt-12 md:px-12 md:pt-16">
          <SectionHeading align="center" className="mx-auto reveal" header={header} />
        </div>
        {list.length > 0 && (
          <ul
            className={cn(
              'relative mt-10 grid divide-y divide-line md:mt-14 md:divide-x md:divide-y-0',
              list.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3',
            )}
          >
            {list.map((p, i) => (
              <li className="reveal flex flex-col gap-4 px-6 py-8 md:px-10 md:py-10" key={p.id || i} style={{ '--i': i } as React.CSSProperties}>
                {p.icon && <Icon className="text-accent" name={p.icon} size={26} />}
                <h3 className="type-h4 text-ink">{p.title}</h3>
                <p className="type-small text-ink-2 pretty">{p.text}</p>
              </li>
            ))}
          </ul>
        )}
        {tileList.length > 0 && (
          <ul
            className={cn(
              'grid border-t border-line sm:grid-cols-2',
              tileList.length >= 5 ? 'lg:grid-cols-5' : tileList.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
            )}
          >
            {tileList.map((t, i) => {
              const link = (t.links || []).find((l) => l.link?.label)?.link
              return (
                <li
                  className="reveal flex flex-col gap-2 border-b border-line p-6 sm:[&:nth-child(2n)]:border-l lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:nth-child(2n)]:border-l"
                  key={t.id || i}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {t.value ? (
                    <p className="type-stat text-ink">
                      <CountUp value={t.value} />
                      {t.suffix && <span className="text-accent">{t.suffix}</span>}
                    </p>
                  ) : null}
                  <p className={cn(t.value ? 'type-small text-ink-2' : 'type-h4 text-ink')}>{t.label}</p>
                  {link && (
                    <CMSLink {...link} appearance="inline" className="link-arrow mt-auto type-small">
                      {link.label}
                    </CMSLink>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
