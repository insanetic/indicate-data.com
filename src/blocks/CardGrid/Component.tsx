import { Check } from 'lucide-react'
import React from 'react'

import type { CardGridBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { IconTile } from '@/components/Icon'
import { SectionHeading } from '@/components/SectionHeading'
import { cn } from '@/utilities/ui'

export const CardGridBlock: React.FC<Props> = ({ header, layout, cards }) => {
  const list = (cards || []).filter((c) => c.title)
  if (list.length === 0) return null
  const tones = ['blue', 'yellow', 'coral', 'neutral'] as const

  return (
    <div className="container">
      <SectionHeading className="mb-10 md:mb-14 reveal" header={header} />
      <ul
        className={cn(
          'reveal-stagger grid gap-4 md:gap-5',
          layout === 'grid-3' && 'md:grid-cols-3',
          layout === 'grid-4' && 'sm:grid-cols-2 lg:grid-cols-4',
          layout === 'bento' && 'md:grid-cols-2 lg:grid-cols-4',
        )}
      >
        {list.map((card, i) => {
          const link = (card.links || []).find((l) => l.link?.label)?.link
          return (
            <li
              className={cn(
                'card-surface flex flex-col gap-4 p-6 md:p-7',
                layout === 'bento' && card.size === 'lg' && 'md:col-span-2',
                link && 'transition-colors duration-150 hover:border-line-strong',
              )}
              key={card.id || i}
              style={{ '--i': i } as React.CSSProperties}
            >
              {card.icon && <IconTile name={card.icon} tone={tones[i % tones.length]} />}
              <div className="flex flex-col gap-2">
                <h3 className="type-h4 text-ink">{card.title}</h3>
                {card.text && <p className="type-small text-ink-2 pretty">{card.text}</p>}
              </div>
              {(card.points || []).length > 0 && (
                <ul className="flex flex-col gap-2">
                  {card.points!.map((p, pi) => (
                    <li className="flex items-start gap-2 type-small text-ink-2" key={p.id || pi}>
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-blue-deep" strokeWidth={2} />
                      <span>{p.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {link && (
                <div className="mt-auto pt-2">
                  <CMSLink {...link} appearance="link" className="type-small font-medium" size="sm" />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
