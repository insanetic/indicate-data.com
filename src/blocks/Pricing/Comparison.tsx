'use client'

import { Check, Minus } from 'lucide-react'
import React, { useState } from 'react'

import type { ComparisonModel, FamilyModel } from '@subneo/payload-pricing'

import type { Locale } from '@/i18n/config'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { CtaLink } from './CtaLink'
import { Price } from './Price'
import { Segmented } from './Segmented'
import { cellFor, fill, pickPrice, type Cell, type Labels } from './format'

type Props = {
  family: FamilyModel
  comparison: ComparisonModel
  currency: string | undefined
  period: string
  labels: Labels
  locale: Locale
}

/**
 * Every entitlement, grouped. From `md` up a table with a sticky plan header; below, a plan
 * switcher and a two-column list for the chosen plan.
 */
export const Comparison: React.FC<Props> = ({ family, comparison, currency, period, labels: t, locale }) => {
  const plans = family.plans
  const [selected, setSelected] = useState(family.featuredPlanCode && plans.some((p) => p.code === family.featuredPlanCode) ? family.featuredPlanCode : plans[0]?.code)
  if (plans.length === 0) return null

  const cta = (plan: (typeof plans)[number], size: 'sm' | 'default' = 'sm') => {
    const price = pickPrice(plan, currency, period)
    const href = price?.href || plan.cta.href
    if (!href) return null
    const label = plan.cta.label || (plan.contact ? t.contact : fill(t.choose, { plan: plan.name }))
    return (
      <CtaLink className="w-full" href={href} size={size} variant={plan.featured ? 'primary' : 'secondary'}>
        {plan.featured ? label : withResi(label)}
      </CtaLink>
    )
  }

  const cell = (planCode: string, featureCode: string, row: ComparisonModel['groups'][number]['rows'][number]) => {
    const plan = plans.find((p) => p.code === planCode)
    const price = plan ? pickPrice(plan, currency, period) : undefined
    return cellFor(row.cells[planCode], price?.overages.find((o) => o.featureCode === featureCode), t, locale)
  }

  return (
    <div className="reveal" data-comparison={family.code}>
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full border-separate border-spacing-0 text-left">
          <caption className="sr-only">{t.comparisonCaption}</caption>
          <thead className="sticky top-16 z-10 bg-surface lg:top-[4.25rem]">
            <tr>
              <th className="w-[34%] border-b border-line py-4 pr-4 align-bottom type-small font-medium text-ink-3" scope="col">
                {t.feature}
              </th>
              {plans.map((plan) => (
                <th className="border-b border-line px-3 py-4 align-bottom" key={plan.code} scope="col">
                  <div className="flex flex-col gap-2">
                    <span className={cn('type-body font-medium', plan.featured ? 'text-brand-yellow' : 'text-ink')}>{withResi(plan.name)}</span>
                    <Price contact={plan.contact} labels={t} locale={locale} price={pickPrice(plan, currency, period)} size="md" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.groups.map((group) => (
              <React.Fragment key={group.code}>
                <tr>
                  <th className="pb-3 pt-10 type-eyebrow text-ink" colSpan={plans.length + 1} scope="colgroup">
                    {withResi(group.label)}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr className="group transition-colors duration-150 hover:bg-surface-2/40" data-feature={row.featureCode} key={row.featureCode}>
                    <th className="border-b border-line py-3.5 pr-4 align-top font-normal" scope="row">
                      <span className="type-small text-ink">{withResi(row.label)}</span>
                      {row.description && <span className="block type-caption text-ink-3">{withResi(row.description)}</span>}
                    </th>
                    {plans.map((plan) => (
                      <td className={cn('border-b border-line px-3 py-3.5 align-top type-small', plan.featured && 'bg-surface-2/60')} key={plan.code}>
                        <CellView cell={cell(plan.code, row.featureCode, row)} labels={t} />
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-8" />
              {plans.map((plan) => (
                <td className={cn('px-3 pb-5 pt-8 align-top', plan.featured && 'rounded-b-card-inner bg-surface-2/60')} key={plan.code}>
                  <div className="flex flex-col gap-3">
                    <span className={cn('type-small font-medium', plan.featured ? 'text-brand-yellow' : 'text-ink')}>{withResi(plan.name)}</span>
                    <Price contact={plan.contact} labels={t} locale={locale} price={pickPrice(plan, currency, period)} size="md" />
                    {cta(plan)}
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Mobile: one plan at a time */}
      <div className="md:hidden">
        <div className="sticky top-16 z-10 -mx-5 bg-surface px-5 py-3">
          <Segmented
            ariaLabel={t.selectPlan}
            fill
            onChange={setSelected}
            options={plans.map((plan) => ({ value: plan.code, label: plan.name }))}
            role="tablist"
            value={selected}
          />
        </div>
        {selected && (
          <div className="flex flex-col" role="tabpanel">
            {comparison.groups.map((group) => (
              <section className="reveal pt-8" key={group.code}>
                <h4 className="type-eyebrow mb-2 text-ink">{withResi(group.label)}</h4>
                <ul>
                  {group.rows.map((row) => (
                    <li className="flex items-start justify-between gap-4 border-b border-line py-3" data-feature={row.featureCode} key={row.featureCode}>
                      <span className="min-w-0">
                        <span className="type-small text-ink">{withResi(row.label)}</span>
                        {row.description && <span className="block type-caption text-ink-3">{withResi(row.description)}</span>}
                      </span>
                      <span className="shrink-0 text-right type-small">
                        <CellView cell={cell(selected, row.featureCode, row)} labels={t} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {(() => {
              const plan = plans.find((p) => p.code === selected)
              if (!plan) return null
              return (
                <div className="card-surface mt-8 flex flex-col gap-4 p-5" data-comparison-cta={plan.code}>
                  <div className="flex flex-col gap-1">
                    <span className="type-caption text-ink-3">{t.yourChoice}</span>
                    <span className="type-body font-medium text-ink">{withResi(plan.name)}</span>
                  </div>
                  <Price contact={plan.contact} labels={t} locale={locale} price={pickPrice(plan, currency, period)} size="md" unit={family.unit} />
                  {cta(plan, 'default')}
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

const CellView: React.FC<{ cell: Cell; labels: Labels }> = ({ cell, labels: t }) => {
  if (cell.kind === 'check') {
    return (
      <span className="inline-flex items-center text-brand-blue-deep">
        <Check aria-hidden="true" className="size-4" strokeWidth={2.25} />
        <span className="sr-only">{t.included}</span>
      </span>
    )
  }
  if (cell.kind === 'dash') {
    return (
      <span className="inline-flex items-center text-ink-3">
        <Minus aria-hidden="true" className="size-4" strokeWidth={2} />
        <span className="sr-only">{t.notIncluded}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex flex-col">
      <span className="tnum text-ink">{cell.text}</span>
      {cell.hint && <span className="type-caption text-ink-3">{cell.hint}</span>}
    </span>
  )
}
