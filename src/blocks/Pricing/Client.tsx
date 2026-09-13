'use client'

import { ArrowDown } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import type { PricingModel } from '@subneo/payload-pricing'

import { LocaleLink } from '@/components/LocaleLink'
import { withResi } from '@/components/Resi'
import type { Locale } from '@/i18n/config'

import { AddonCards } from './AddonCards'
import { Comparison } from './Comparison'
import { Controls } from './Controls'
import { PlanCards } from './PlanCards'
import { bestSavings, type Labels } from './format'

export type Heading = { heading?: string | null; lead?: string | null } | null | undefined

type Props = {
  model: PricingModel
  labels: Labels
  locale: Locale
  show: { cards: boolean; addons: boolean; comparison: boolean }
  addonsHeader?: Heading
  comparisonHeader?: Heading
  footnote?: string | null
}

/** Client shell: holds billing period and currency, renders cards, add-ons and the comparison. */
export const PricingClient: React.FC<Props> = ({ model, labels: t, locale, show, addonsHeader, comparisonHeader, footnote }) => {
  const [period, setPeriod] = useState(model.periods.includes('month') ? 'month' : model.periods[0] || 'month')
  const [currency, setCurrency] = useState(model.defaultCurrency)

  const appFamilies = model.families.filter((f) => f.role === 'app')
  const addonFamilies = model.families.filter((f) => f.role === 'addon')
  const appPlans = useMemo(() => appFamilies.flatMap((f) => f.plans), [appFamilies])
  const savings = useMemo(
    () => Object.fromEntries(model.periods.map((p) => [p, bestSavings(appPlans, currency, p)])),
    [appPlans, currency, model.periods],
  )

  if (model.status === 'unavailable' || model.status === 'unconfigured' || appPlans.length === 0) {
    return (
      <div className="card-surface mx-auto max-w-xl p-7 text-center" data-pricing-status={model.status}>
        <p className="type-body text-ink-2">{t.unavailable}</p>
        <LocaleLink className="link-arrow mt-4 inline-flex type-small font-medium text-ink" href="/contact">
          {t.contact}
        </LocaleLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-16 md:gap-24" data-pricing-source={model.source} data-pricing-status={model.status}>
      {show.cards && (
        <div className="flex flex-col gap-8 md:gap-10">
          <div className="reveal">
            <Controls
              currencies={model.currencies}
              currency={currency}
              labels={t}
              locale={locale}
              onCurrency={setCurrency}
              onPeriod={setPeriod}
              period={period}
              periods={model.periods}
              savings={savings}
            />
          </div>
          {appFamilies.map((family) => (
            <PlanCards currency={currency} family={family} key={family.code} labels={t} locale={locale} period={period} />
          ))}
          <div className="flex flex-col items-center gap-3 text-center">
            {footnote && <p className="type-caption text-ink-3">{withResi(footnote)}</p>}
            {show.comparison && appFamilies.some((f) => f.comparison) && (
              <a className="pressable inline-flex items-center gap-1.5 type-small font-medium text-ink transition-colors duration-150 hover:text-accent" href="#comparison">
                {t.compareAll}
                <ArrowDown aria-hidden="true" className="size-4" strokeWidth={2} />
              </a>
            )}
          </div>
        </div>
      )}

      {show.addons && addonFamilies.some((f) => f.plans.length > 0) && (
        <div className="flex flex-col gap-8">
          {(addonsHeader?.heading || addonsHeader?.lead) && (
            <div className="reveal flex flex-col gap-3">
              {addonsHeader?.heading && <h3 className="type-h3 max-w-[24ch] text-ink">{withResi(addonsHeader.heading)}</h3>}
              {addonsHeader?.lead && <p className="type-lead max-w-[58ch] text-ink-2">{withResi(addonsHeader.lead)}</p>}
            </div>
          )}
          {addonFamilies.map((family) => (
            <div className="flex flex-col gap-4" key={family.code}>
              {family.label && appFamilies.length + addonFamilies.length > 2 && <h4 className="type-eyebrow text-ink">{withResi(family.label)}</h4>}
              <AddonCards currency={currency} family={family} labels={t} locale={locale} period={period} />
            </div>
          ))}
        </div>
      )}

      {show.comparison &&
        appFamilies
          .filter((f) => f.comparison)
          .map((family, i) => (
            <div className="flex flex-col gap-8 scroll-mt-24" id={i === 0 ? 'comparison' : undefined} key={family.code}>
              {(comparisonHeader?.heading || comparisonHeader?.lead) && (
                <div className="reveal flex flex-col gap-3">
                  {comparisonHeader?.heading && <h3 className="type-h3 max-w-[24ch] text-ink">{withResi(comparisonHeader.heading)}</h3>}
                  {comparisonHeader?.lead && <p className="type-lead max-w-[58ch] text-ink-2">{withResi(comparisonHeader.lead)}</p>}
                </div>
              )}
              <Comparison comparison={family.comparison!} currency={currency} family={family} labels={t} locale={locale} period={period} />
            </div>
          ))}
    </div>
  )
}
