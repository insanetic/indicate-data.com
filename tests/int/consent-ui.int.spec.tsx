import { act, cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }))

import { ConsentBanner } from '@/consent/components/ConsentBanner'
import { ConsentProvider, useConsent } from '@/consent/components/ConsentProvider'
import { ConsentSettings } from '@/consent/components/ConsentSettings'
import { TagManager } from '@/consent/components/TagManager'
import { defaults, resolveConsent } from '@/consent/defaults'
import { readRecord, writeRecord } from '@/consent/store'
import { isTrackingEnabled } from '@/consent/track'
import { CMSLink } from '@/components/Link'
import type { Consent } from '@/payload-types'

describe('resolveConsent', () => {
  it('falls back to the code defaults when the global is empty', () => {
    const resolved = resolveConsent(null, 'de')
    expect(resolved.revision).toBe(1)
    expect(resolved.texts.bannerTitle).toBe(defaults.de.bannerTitle)
    expect(resolved.texts.categories.map((c) => c.key)).toEqual(['necessary', 'analytics', 'marketing'])
    expect(resolved.privacyHref).toBeNull()
  })

  it('prefers CMS texts and services field by field', () => {
    const global = {
      enabled: true,
      revision: 3,
      privacyPage: { id: 1, slug: 'privacy-policy' },
      banner: { title: 'Cookies?', text: null },
      categories: [
        {
          key: 'analytics',
          label: 'Statistik',
          services: [{ name: 'Google Analytics 4', provider: 'Google Ireland Limited', purpose: 'Reichweite' }],
        },
      ],
    } as unknown as Consent
    const resolved = resolveConsent(global, 'de')
    expect(resolved.revision).toBe(3)
    expect(resolved.texts.bannerTitle).toBe('Cookies?')
    expect(resolved.texts.bannerText).toBe(defaults.de.bannerText)
    expect(resolved.privacyHref).toBe('/de/privacy-policy')
    const analytics = resolved.texts.categories.find((c) => c.key === 'analytics')!
    expect(analytics.label).toBe('Statistik')
    expect(analytics.description).toBe(defaults.de.categories.analytics.description)
    expect(analytics.services[0].name).toBe('Google Analytics 4')
  })

  it('uses English for an unknown locale', () => {
    expect(resolveConsent(null, 'xx' as never).texts.acceptAll).toBe(defaults.en.acceptAll)
  })
})

const clearConsentCookie = () => {
  document.cookie = 'consent=; Max-Age=0; Path=/'
}

const Probe = () => {
  const c = useConsent()
  return (
    <div>
      <span data-testid="status">{c.status}</span>
      <span data-testid="enabled">{String(c.enabled)}</span>
      <button onClick={c.acceptAll}>accept</button>
    </div>
  )
}

describe('ConsentProvider', () => {
  afterEach(cleanup)

  it('is pending without a cookie and decided after acceptAll', async () => {
    clearConsentCookie()
    render(
      <ConsentProvider gtmId="GTM-TEST" settings={null}>
        <Probe />
      </ConsentProvider>,
    )
    expect(await screen.findByText('pending')).toBeTruthy()
    expect(isTrackingEnabled()).toBe(true)
    await act(async () => screen.getByText('accept').click())
    expect(screen.getByTestId('status').textContent).toBe('decided')
    expect(document.cookie).toContain('consent=')
  })

  it('is decided when a current cookie exists', async () => {
    writeRecord({ v: 1, t: new Date().toISOString(), c: { analytics: false, marketing: false } })
    render(
      <ConsentProvider gtmId="GTM-TEST" settings={null}>
        <Probe />
      </ConsentProvider>,
    )
    expect(await screen.findByText('decided')).toBeTruthy()
  })

  it('is disabled without a container id', async () => {
    clearConsentCookie()
    render(
      <ConsentProvider settings={null}>
        <Probe />
      </ConsentProvider>,
    )
    expect(await screen.findByText('false')).toBeTruthy()
    expect(isTrackingEnabled()).toBe(false)
  })
})

describe('ConsentBanner', () => {
  afterEach(cleanup)

  it('shows when pending, accept all grants both categories', async () => {
    clearConsentCookie()
    render(
      <ConsentProvider gtmId="GTM-TEST" settings={null}>
        <ConsentBanner />
      </ConsentProvider>,
    )
    const region = await screen.findByRole('region', { name: defaults.de.bannerTitle })
    expect(region).toBeTruthy()
    await act(async () => screen.getByRole('button', { name: defaults.de.acceptAll }).click())
    expect(readRecord()?.c).toEqual({ analytics: true, marketing: true })
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('reject writes both categories as false', async () => {
    clearConsentCookie()
    render(
      <ConsentProvider gtmId="GTM-TEST" settings={null}>
        <ConsentBanner />
      </ConsentProvider>,
    )
    await screen.findByRole('region')
    await act(async () => screen.getByRole('button', { name: defaults.de.rejectAll }).click())
    expect(readRecord()?.c).toEqual({ analytics: false, marketing: false })
  })

  it('renders nothing when disabled', () => {
    clearConsentCookie()
    render(
      <ConsentProvider settings={null}>
        <ConsentBanner />
      </ConsentProvider>,
    )
    expect(screen.queryByRole('region')).toBeNull()
  })
})

// jsdom has no showModal; give <dialog> a minimal one so the component's open path runs.
const ensureDialogSupport = () => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & { showModal?: () => void; close?: () => void }
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function () {
      this.setAttribute('open', '')
    }
    proto.close = function () {
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }
}

const OpenSettings = () => {
  const { openSettings } = useConsent()
  return <button onClick={openSettings}>open</button>
}

describe('ConsentSettings', () => {
  afterEach(cleanup)

  it('locks necessary, toggles analytics and saves the selection', async () => {
    ensureDialogSupport()
    clearConsentCookie()
    render(
      <ConsentProvider gtmId="GTM-TEST" settings={null}>
        <OpenSettings />
        <ConsentSettings />
      </ConsentProvider>,
    )
    await screen.findByText('open')
    await act(async () => screen.getByText('open').click())
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog.hasAttribute('open')).toBe(true)
    const switches = screen.getAllByRole('switch', { hidden: true })
    expect(switches).toHaveLength(3)
    expect(switches[0].getAttribute('aria-checked')).toBe('true')
    expect(switches[0].getAttribute('aria-disabled')).toBe('true')
    await act(async () => switches[0].click())
    expect(switches[0].getAttribute('aria-checked')).toBe('true')
    await act(async () => switches[1].click())
    expect(switches[1].getAttribute('aria-checked')).toBe('true')
    await act(async () => screen.getByRole('button', { name: defaults.de.saveSelection, hidden: true }).click())
    expect(readRecord()?.c).toEqual({ analytics: true, marketing: false })
    expect(dialog.hasAttribute('open')).toBe(false)
  })

  it('lists services under their category', async () => {
    ensureDialogSupport()
    clearConsentCookie()
    const settings = {
      enabled: true,
      revision: 1,
      categories: [{ key: 'analytics', services: [{ name: 'Google Analytics 4', provider: 'Google Ireland Limited' }] }],
    } as unknown as Consent
    render(
      <ConsentProvider gtmId="GTM-TEST" settings={settings}>
        <OpenSettings />
        <ConsentSettings />
      </ConsentProvider>,
    )
    await screen.findByText('open')
    await act(async () => screen.getByText('open').click())
    expect(screen.getByText('Google Analytics 4', { exact: false })).toBeTruthy()
  })
})

describe('TagManager', () => {
  afterEach(cleanup)

  beforeEach(() => {
    ;(window as unknown as { dataLayer: unknown[] }).dataLayer = []
    document.querySelectorAll('script[data-gtm]').forEach((s) => s.remove())
  })

  it('loads GTM and pushes a page view once analytics is granted', async () => {
    clearConsentCookie()
    render(
      <ConsentProvider gtmId="GTM-TEST" settings={null}>
        <Probe />
        <TagManager />
      </ConsentProvider>,
    )
    await screen.findByText('pending')
    expect(document.querySelector('script[data-gtm]')).toBeNull()
    await act(async () => screen.getByText('accept').click())
    expect(document.querySelector('script[data-gtm]')?.getAttribute('data-gtm')).toBe('GTM-TEST')
    const dl = (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer
    expect(dl.some((e) => e.event === 'page_view' && e.page_path === '/de')).toBe(true)
  })

  it('never loads GTM after reject', async () => {
    writeRecord({ v: 1, t: new Date().toISOString(), c: { analytics: false, marketing: false } })
    render(
      <ConsentProvider gtmId="GTM-TEST" settings={null}>
        <Probe />
        <TagManager />
      </ConsentProvider>,
    )
    await screen.findByText('decided')
    expect(document.querySelector('script[data-gtm]')).toBeNull()
  })
})

describe('CMSLink track prop', () => {
  afterEach(cleanup)

  it('renders data-track attributes', () => {
    const { container } = render(
      <CMSLink label="Demo buchen" track={{ location: 'hero' }} type="custom" url="/demo" />,
    )
    const a = container.querySelector('a')!
    expect(a.getAttribute('data-track')).toBe('cta_click')
    expect(a.getAttribute('data-track-location')).toBe('hero')
    expect(a.getAttribute('data-track-label')).toBe('Demo buchen')
  })
})
