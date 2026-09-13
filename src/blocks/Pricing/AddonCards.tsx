'use client'

import { Check } from 'lucide-react'
import React from 'react'

import type { FamilyModel } from '@subneo/payload-pricing'

import type { Locale } from '@/i18n/config'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { CtaLink } from './CtaLink'
import { Price } from './Price'
import { fill, highlightLine, pickPrice, type Labels } from './format'

type Props = {
  family: FamilyModel
  currency: string | undefined
  period: string
  labels: Labels
  locale: Locale
}

/** Add-on plans (agent tokens, credit packs) as compact cards in a row. */
export const AddonCards: React.FC<Props> = ({ family, currency, period, labels: t, locale }) => {
  if (family.plans.length === 0) return null
  return (
    <ul
      className={cn('reveal-stagger grid gap-4', family.plans.length >= 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3')}
      data-family={family.code}
    >
      {family.plans.map((plan, i) => {
        const price = pickPrice(plan, currency, period)
        const lines = plan.highlights
          .map((h) => ({ code: h.featureCode, line: highlightLine(h, price?.overages.find((o) => o.featureCode === h.featureCode), t, locale) }))
          .filter((x): x is { code: string; line: NonNullable<ReturnType<typeof highlightLine>> } => Boolean(x.line))
        const href = price?.href || plan.cta.href
        return (
          <li className="card-surface flex flex-col gap-4 p-6 transition-colors duration-150 hover:border-line-strong" data-plan={plan.code} key={plan.code} style={{ '--i': i } as React.CSSProperties}>
            <div className="flex flex-col gap-1">
              <h3 className="type-body font-medium text-ink">{withResi(plan.name)}</h3>
              {plan.tagline && <p className="type-small text-ink-3 pretty">{withResi(plan.tagline)}</p>}
            </div>
            <Price contact={plan.contact} labels={t} locale={locale} price={price} size="md" unit={family.unit} />
            {lines.length > 0 && (
              <ul className="flex flex-col gap-2">
                {lines.map(({ code, line }) => (
                  <li className="flex items-start gap-2 type-small text-ink-2" key={code}>
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-blue-deep" strokeWidth={2} />
                    <span>
                      {line.value && <strong className="font-semibold text-ink tnum">{line.value} </strong>}
                      {withResi(line.label)}
                      {line.suffix && <span className="text-ink-3"> {line.suffix}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {href && (
              <div className="mt-auto pt-1">
                <CtaLink className="w-full" href={href} size="sm" variant="secondary">
                  {withResi(plan.cta.label || (plan.contact ? t.contact : fill(t.choose, { plan: plan.name })))}
                </CtaLink>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
