import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { getPricing } from '@subneo/payload-pricing'

import type { PricingBlock as Props } from '@/payload-types'

import { SectionHeading } from '@/components/SectionHeading'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'
import { pricingFixtures } from '@/pricing/fixture'

import { PricingClient } from './Client'

/**
 * Loads the plans (Subneo or example data, per the `subneo-pricing` global) on the server and
 * hands the locale-formatted labels to the client shell.
 */
export const PricingBlock: React.FC<Props & { locale: Locale }> = async ({
  header,
  families,
  show,
  addonsHeader,
  comparisonHeader,
  footnote,
  locale,
}) => {
  const payload = await getPayload({ config: configPromise })
  const model = await getPricing({
    payload,
    locale,
    familyCodes: (families || []).map((f) => f.code).filter((c): c is string => Boolean(c)),
    fixtures: pricingFixtures,
  })

  return (
    <div className="container">
      <SectionHeading align="center" className="mx-auto mb-10 md:mb-14 reveal" header={header} />
      <PricingClient
        addonsHeader={addonsHeader}
        comparisonHeader={comparisonHeader}
        footnote={footnote}
        labels={getDictionary(locale).pricing}
        locale={locale}
        model={model}
        show={{ cards: show?.cards !== false, addons: show?.addons !== false, comparison: show?.comparison !== false }}
      />
    </div>
  )
}
