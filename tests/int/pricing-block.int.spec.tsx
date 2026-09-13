import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { buildPricingModel, type SubneoPricingSettings } from '@subneo/payload-pricing'

import { PricingClient } from '@/blocks/Pricing/Client'
import { cellFor, highlightLine } from '@/blocks/Pricing/format'
import { pick } from '@/endpoints/seed/content'
import { pricingSettings } from '@/endpoints/seed/pricing'
import { getDictionary } from '@/i18n/dictionaries'
import { LocaleProvider } from '@/providers/Locale'
import { pricingFixtures } from '@/pricing/fixture'

const model = (locale: 'de' | 'en') =>
  buildPricingModel({ settings: pricingSettings(pick(locale)) as SubneoPricingSettings, plansByFamily: pricingFixtures, source: 'fixture' })

const renderBlock = (locale: 'de' | 'en' = 'de') =>
  render(
    <LocaleProvider locale={locale}>
      <PricingClient
        addonsHeader={{ heading: 'Resi wächst mit.' }}
        comparisonHeader={{ heading: 'Alles im Vergleich' }}
        footnote="Alle Preise zzgl. MwSt."
        labels={getDictionary(locale).pricing}
        locale={locale}
        model={model(locale)}
        show={{ cards: true, addons: true, comparison: true }}
      />
    </LocaleProvider>,
  )

describe('PricingClient', () => {
  afterEach(cleanup)

  it('renders the plan cards with monthly prices, the featured badge and buttons', () => {
    const { container } = renderBlock()
    const cards = container.querySelectorAll('[data-family="indicate-app"] > li')
    expect(cards).toHaveLength(3)
    expect(within(cards[0] as HTMLElement).getByText('100 €')).toBeTruthy()
    expect(within(cards[1] as HTMLElement).getByText('500 €')).toBeTruthy()
    expect(within(cards[1] as HTMLElement).getByText('Beliebt')).toBeTruthy()
    expect(within(cards[2] as HTMLElement).getByText('Individuell')).toBeTruthy()
    expect(within(cards[1] as HTMLElement).getByRole('link', { name: 'Pro wählen' }).getAttribute('href')).toContain('rate=monthly_eur')
    expect(within(cards[2] as HTMLElement).getByRole('link', { name: 'Kontakt aufnehmen' }).getAttribute('href')).toBe('/de/contact')
    expect(container.querySelectorAll('[data-family="indicate-agent"] > li')).toHaveLength(4)
  })

  it('switches to yearly billing: per-month equivalent, yearly total and the saving tag', () => {
    const { container } = renderBlock()
    const yearly = screen.getByRole('radio', { name: /Jährlich/ })
    expect(yearly.textContent).toContain('−10 %')
    fireEvent.click(yearly)
    expect(yearly.getAttribute('aria-checked')).toBe('true')
    const core = container.querySelector('[data-plan="core"]') as HTMLElement
    expect(within(core).getByText('90 €')).toBeTruthy()
    expect(core.textContent?.replace(/\u00a0/g, ' ')).toContain('1.080 €')
    expect(within(core).getByRole('link', { name: 'Core wählen' }).getAttribute('href')).toContain('rate=yearly_eur')
    // Add-ons have no yearly rate and keep their monthly price.
    expect(within(container.querySelector('[data-plan="agent-single"]') as HTMLElement).getByText('20 €')).toBeTruthy()
  })

  it('renders the comparison table with groups, quantities, checks and a mobile plan switcher', () => {
    const { container } = renderBlock()
    const table = container.querySelector('table') as HTMLElement
    expect(within(table).getAllByRole('columnheader').map((th) => th.textContent)).toEqual(
      expect.arrayContaining([expect.stringContaining('Core'), expect.stringContaining('Pro'), expect.stringContaining('Enterprise')]),
    )
    expect(within(table).getByText('Daten & Integrationen')).toBeTruthy()
    const resiGroup = Array.from(table.querySelectorAll('th[scope="colgroup"]')).find((th) => th.textContent === 'Resi, Ihre KI-Agentin')
    expect(resiGroup?.querySelector('.resi-name')).toBeTruthy()
    const credits = table.querySelector('tr[data-feature="resi_credits"]') as HTMLElement
    const creditsText = credits.textContent?.replace(/\u00a0/g, ' ')
    expect(creditsText).toContain('Resi-Credits')
    expect(creditsText).toContain('500 pro Monat')
    expect(creditsText).toContain('weitere 5 € je 100')
    expect(within(table).getAllByText('inklusive').length).toBeGreaterThan(10)
    expect(within(table).getAllByText('Nicht enthalten').length).toBeGreaterThan(3)

    const tabs = screen.getByRole('tablist', { name: 'Paket wählen' })
    expect(within(tabs).getByRole('tab', { name: 'Pro' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.click(within(tabs).getByRole('tab', { name: 'Enterprise' }))
    expect(within(tabs).getByRole('tab', { name: 'Enterprise' }).getAttribute('aria-selected')).toBe('true')
  })

  it('shows the contact notice when nothing could be loaded', () => {
    const empty = buildPricingModel({ settings: { families: [] }, plansByFamily: {}, source: 'subneo' })
    const { container } = render(
      <LocaleProvider locale="en">
        <PricingClient labels={getDictionary('en').pricing} locale="en" model={empty} show={{ cards: true, addons: true, comparison: true }} />
      </LocaleProvider>,
    )
    expect(container.querySelector('[data-pricing-status="unconfigured"]')).toBeTruthy()
    expect(container.textContent).toContain('Prices are not available right now')
  })
})

describe('format helpers', () => {
  const t = getDictionary('en').pricing
  it('describes cells for every entitlement kind', () => {
    expect(cellFor({ kind: 'boolean', enabled: true }, undefined, t, 'en')).toEqual({ kind: 'check' })
    expect(cellFor({ kind: 'boolean', enabled: false }, undefined, t, 'en')).toEqual({ kind: 'dash' })
    expect(cellFor({ kind: 'string', text: 'Priority e-mail' }, undefined, t, 'en')).toEqual({ kind: 'text', text: 'Priority e-mail' })
    expect(cellFor({ kind: 'number', value: 2500 }, undefined, t, 'en')).toEqual({ kind: 'text', text: '2,500' })
    expect(cellFor({ kind: 'allocation', included: { infinite: true } }, undefined, t, 'en')).toEqual({ kind: 'text', text: 'Unlimited' })
    expect(cellFor({ kind: 'allocation', included: { infinite: false, value: 0 }, max: { infinite: false, value: 0 } }, undefined, t, 'en')).toEqual({ kind: 'dash' })
    expect(
      cellFor(undefined, { featureCode: 'x', label: 'X', pricingModel: 'flat', currency: 'EUR', amount: 20 }, t, 'en'),
    ).toEqual({ kind: 'text', text: 'Add-on', hint: 'extra €20 each' })
  })

  it('formats card lines', () => {
    expect(highlightLine({ featureCode: 'a', label: 'Flying KPIs', granted: true, value: { kind: 'boolean', enabled: true } }, undefined, t, 'en')).toEqual({ label: 'Flying KPIs' })
    expect(highlightLine({ featureCode: 'a', label: 'Off', granted: false, value: { kind: 'boolean', enabled: false } }, undefined, t, 'en')).toBeUndefined()
    expect(
      highlightLine(
        { featureCode: 'a', label: 'Resi credits', granted: true, value: { kind: 'consumable', included: { infinite: false, value: 500 }, reset: { period: 'month', count: 1 } } },
        undefined,
        t,
        'en',
      ),
    ).toEqual({ value: '500', label: 'Resi credits', suffix: 'per month', hint: undefined })
  })
})
