'use client'

import { Check } from 'lucide-react'
import React from 'react'

import type { FamilyModel, PlanModel } from '@subneo/payload-pricing'

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

/** The simple view: one card per plan with price, the highlighted entitlements and a button. */
export const PlanCards: React.FC<Props> = ({ family, currency, period, labels: t, locale }) => {
  const plans = family.plans
  if (plans.length === 0) return null
  return (
    <ul
      className={cn(
        'reveal-stagger grid gap-5',
        plans.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : plans.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2',
      )}
      data-family={family.code}
    >
      {plans.map((plan, i) => (
        <PlanCard currency={currency} index={i} key={plan.code} labels={t} locale={locale} period={period} plan={plan} unit={family.unit} />
      ))}
    </ul>
  )
}

const PlanCard: React.FC<{ plan: PlanModel; unit?: string; currency: string | undefined; period: string; labels: Labels; locale: Locale; index: number }> = ({
  plan,
  unit,
  currency,
  period,
  labels: t,
  locale,
  index,
}) => {
  const price = pickPrice(plan, currency, period)
  const lines = plan.highlights
    .map((h) => ({ code: h.featureCode, line: highlightLine(h, price?.overages.find((o) => o.featureCode === h.featureCode), t, locale) }))
    .filter((x): x is { code: string; line: NonNullable<ReturnType<typeof highlightLine>> } => Boolean(x.line))
  const href = price?.href || plan.cta.href
  const label = plan.cta.label || (plan.contact ? t.contact : fill(t.choose, { plan: plan.name }))
  const badge = plan.badge || (plan.featured ? t.popular : undefined)

  return (
    <li
      className={cn(
        'card-surface relative flex flex-col gap-6 p-7 transition-colors duration-150 md:p-8',
        plan.featured ? 'resi-ring ring-accent border-transparent shadow-card' : 'hover:border-line-strong',
      )}
      data-plan={plan.code}
      style={{ '--i': index, ...(plan.featured ? { '--resi-ring-width': '1.5px' } : {}) } as React.CSSProperties}
    >
      {badge && (
        <span className="absolute -top-3 left-7 z-[2] rounded-[calc(var(--radius-btn)-1px)] bg-brand-yellow px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-accent-ink md:left-8">
          {badge}
        </span>
      )}
      <div className="flex flex-col gap-1">
        <h3 className="type-h4 text-ink">{withResi(plan.name)}</h3>
        {plan.tagline && <p className="type-small text-ink-3 pretty">{withResi(plan.tagline)}</p>}
      </div>
      <Price contact={plan.contact} labels={t} locale={locale} price={price} unit={unit} />
      {lines.length > 0 && (
        <ul className="flex flex-col gap-2.5 border-t border-line pt-6">
          {lines.map(({ code, line }) => (
            <li className="flex items-start gap-2 type-small text-ink-2" key={code}>
              <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-blue-deep" strokeWidth={2} />
              <span>
                {line.value && <strong className="font-semibold text-ink tnum">{line.value} </strong>}
                {withResi(line.label)}
                {line.suffix && <span className="text-ink-3"> {line.suffix}</span>}
                {line.hint && <span className="block type-caption text-ink-3">{line.hint}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {href && (
        <div className="mt-auto pt-2">
          <CtaLink className="w-full" href={href} variant={plan.featured ? 'primary' : 'secondary'}>
            {/* Yellow primary buttons keep plain labels; the gradient name only goes on outlined ones. */}
            {plan.featured ? label : withResi(label)}
          </CtaLink>
        </div>
      )}
    </li>
  )
}
