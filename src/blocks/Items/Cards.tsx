import { Check } from 'lucide-react'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Icon, IconTile } from '@/components/Icon'
import { findMcpClient } from '@/integrations/clients'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import type { StyleProps } from './Component'

const tones = ['blue', 'yellow', 'coral', 'neutral'] as const

/**
 * Without a frame: separate cards (icon tile, title, text, bullet points, link). In a panel:
 * the "Warum Indicate" pillars, open cells divided by hairlines.
 */
export const Cards: React.FC<StyleProps> = ({ items, grid, panel }) => {
  if (panel) {
    return (
      <ul className={cn('grid divide-y divide-line lg:divide-x lg:divide-y-0', grid)}>
        {items.map((card, i) => (
          <li className="reveal flex flex-col gap-4 px-6 py-8 md:px-10 md:py-10" key={card.id || i} style={{ '--i': i } as React.CSSProperties}>
            {card.icon && <Icon className="text-accent" name={card.icon} size={26} />}
            <h3 className="type-h4 text-ink">{withResi(card.title)}</h3>
            {card.text && <p className="type-small text-ink-2 pretty">{withResi(card.text)}</p>}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className={cn('reveal-stagger grid gap-4 md:gap-5', grid)}>
      {items.map((card, i) => {
        const link = (card.links || []).find((l) => l.link?.label)?.link
        // A card named after an AI assistant shows the vendor's mark instead of an icon.
        const client = findMcpClient(card.title)
        return (
          <li
            className={cn(
              'card-surface flex flex-col gap-4 p-6 md:p-7',
              card.size === 'lg' && 'sm:col-span-2',
              link && 'transition-colors duration-150 hover:border-line-strong',
            )}
            key={card.id || i}
            style={{ '--i': i } as React.CSSProperties}
          >
            {client?.logo ? (
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-btn border border-line bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element -- static vendor mark */}
                <img alt="" className="size-5" height={20} src={client.logo} width={20} />
              </span>
            ) : card.icon ? (
              <IconTile name={card.icon} tone={tones[i % tones.length]} />
            ) : null}
            <div className="flex flex-col gap-2">
              <h3 className="type-h4 text-ink">{withResi(card.title)}</h3>
              {card.text && <p className="type-small text-ink-2 pretty">{withResi(card.text)}</p>}
            </div>
            {(card.points || []).length > 0 && (
              <ul className="flex flex-col gap-2">
                {card.points!.map((p, pi) => (
                  <li className="flex items-start gap-2 type-small text-ink-2" key={p.id || pi}>
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-blue-deep" strokeWidth={2} />
                    <span>{withResi(p.text)}</span>
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
  )
}
