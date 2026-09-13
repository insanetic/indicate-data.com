import { Check } from 'lucide-react'
import React from 'react'

import type { PricingTeaserBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { SectionHeading } from '@/components/SectionHeading'
import { cn } from '@/utilities/ui'

export const PricingTeaserBlock: React.FC<Props> = ({ header, plans, footnote, links }) => {
  const list = (plans || []).filter((p) => p.name && p.price)
  if (list.length === 0) return null
  const link = (links || []).find((l) => l.link?.label)?.link

  return (
    <div className="container">
      <SectionHeading align="center" className="mx-auto mb-10 md:mb-14 reveal" header={header} />
      <ul className={cn('reveal-stagger grid gap-5', list.length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2')}>
        {list.map((plan, i) => {
          const button = (plan.links || []).find((l) => l.link?.label)?.link
          return (
            <li
              className={cn(
                'card-surface flex flex-col gap-6 p-7 md:p-8',
                plan.highlighted && 'border-ink shadow-card ring-1 ring-ink',
              )}
              key={plan.id || i}
              style={{ '--i': i } as React.CSSProperties}
            >
              <div className="flex flex-col gap-1">
                <h3 className="type-h4 text-ink">{plan.name}</h3>
                {plan.description && <p className="type-small text-ink-3 pretty">{plan.description}</p>}
              </div>
              <p className="flex items-baseline gap-2">
                <span className="font-display text-[2.5rem] font-medium leading-none tracking-tight tnum text-ink">{plan.price}</span>
                {plan.period && <span className="type-small text-ink-3">{plan.period}</span>}
              </p>
              {(plan.points || []).length > 0 && (
                <ul className="flex flex-col gap-2.5">
                  {plan.points!.map((p, pi) => (
                    <li className="flex items-start gap-2 type-small text-ink-2" key={p.id || pi}>
                      <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-blue-deep" strokeWidth={2} />
                      <span>{p.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {button && (
                <div className="mt-auto pt-2">
                  <CMSLink
                    {...button}
                    appearance={plan.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                    track={{ location: 'pricing-teaser' }}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {(footnote || link) && (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          {footnote && <p className="type-caption text-ink-3">{footnote}</p>}
          {link && <CMSLink {...link} appearance={link.appearance === 'outline' ? 'secondary' : 'link'} size="sm" />}
        </div>
      )}
    </div>
  )
}
