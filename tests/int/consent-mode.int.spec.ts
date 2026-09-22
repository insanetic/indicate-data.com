import { beforeEach, describe, expect, it } from 'vitest'

import { consentModeBootstrap, defineConsent, gtag, installClickTracking, signalsFor, track } from '@subneo/payload-consent'
import { gtm, isGtmLoaded, loadGtm } from '@subneo/payload-consent/integrations/gtm'

type DL = Record<string, unknown>[]
const win = window as unknown as { dataLayer?: DL; gtag?: unknown }
const dl = () => win.dataLayer as DL

const setup = defineConsent({
  categories: [
    { key: 'necessary', required: true, texts: { en: { label: 'Necessary', description: '' } } },
    { key: 'analytics', signals: ['analytics_storage'], texts: { en: { label: 'Statistics', description: '' } } },
    {
      key: 'marketing',
      signals: ['ad_storage', 'ad_user_data', 'ad_personalization'],
      texts: { en: { label: 'Marketing', description: '' } },
    },
  ],
  integrations: [gtm({ containerId: 'GTM-TEST' })],
})

beforeEach(() => {
  win.dataLayer = []
  document.querySelectorAll('script[data-gtm]').forEach((s) => s.remove())
})

describe('consentModeBootstrap', () => {
  it('denies every signal except functionality and security storage', () => {
    delete win.gtag
    win.dataLayer = []
    new Function(consentModeBootstrap())()
    const calls = dl().map((entry) => Array.from(entry as unknown as ArrayLike<unknown>))
    expect(calls[0]).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        personalization_storage: 'denied',
        functionality_storage: 'granted',
        security_storage: 'granted',
        wait_for_update: 0,
      },
    ])
    expect(calls[1]).toEqual(['set', 'ads_data_redaction', true])
    expect(consentModeBootstrap()).not.toContain('url_passthrough')
    expect(typeof win.gtag).toBe('function')
  })
})

describe('signalsFor', () => {
  it('maps granted categories to their signals', () => {
    expect(signalsFor(setup, { analytics: true, marketing: false })).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    expect(signalsFor(setup, { analytics: false, marketing: true }).ad_storage).toBe('granted')
  })
})

describe('gtag fallback', () => {
  it('pushes through window.gtag or creates it', () => {
    delete win.gtag
    gtag('consent', 'update', { analytics_storage: 'granted' })
    const last = dl().at(-1) as unknown as ArrayLike<unknown>
    expect(Array.from(last)).toEqual(['consent', 'update', { analytics_storage: 'granted' }])
  })
})

describe('gtm integration', () => {
  it('is disabled with an empty container id and enabled with one', () => {
    expect(gtm({ containerId: '' }).enabled).toBe(false)
    expect(gtm({ containerId: null }).enabled).toBe(false)
    const active = gtm({ containerId: 'GTM-TEST' })
    expect(active.enabled).toBe(true)
    expect(active.key).toBe('gtm')
    expect(active.category).toBe('analytics')
    expect(active.resolve?.({})).toEqual({ enabled: true, options: { id: 'GTM-TEST' } })
  })

  it('reads the container id from the server environment at runtime when none is given', () => {
    const runtime = gtm()
    expect(runtime.enabled).toBe(true)
    expect(runtime.resolve?.({})).toEqual({ enabled: false, options: { id: '' } })
    expect(runtime.resolve?.({ GTM_ID: 'GTM-ENV' })).toEqual({ enabled: true, options: { id: 'GTM-ENV' } })
    expect(gtm({ envKey: 'TAG_MANAGER' }).resolve?.({ TAG_MANAGER: 'GTM-X' })?.options.id).toBe('GTM-X')
  })

  it('loads the container id it was resolved with', () => {
    const ctx = { choices: { analytics: true }, locale: 'de', signals: signalsFor(setup, { analytics: true }), options: { id: 'GTM-RUNTIME' } }
    gtm().load(ctx)
    expect(document.querySelector('script[data-gtm]')?.getAttribute('src')).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-RUNTIME')
  })

  it('loads the script once and updates consent mode', () => {
    const integration = gtm({ containerId: 'GTM-TEST' })
    const ctx = { choices: { analytics: true, marketing: false }, locale: 'de', signals: signalsFor(setup, { analytics: true, marketing: false }), options: { id: 'GTM-TEST' } }
    expect(isGtmLoaded()).toBe(false)
    integration.load(ctx)
    integration.load(ctx)
    const scripts = document.querySelectorAll('script[data-gtm]')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].getAttribute('src')).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-TEST')
    expect(dl().some((e) => e.event === 'gtm.js')).toBe(true)
    expect(isGtmLoaded()).toBe(true)
    integration.update?.(ctx)
    const last = dl().at(-1) as unknown as ArrayLike<unknown>
    expect(Array.from(last)).toEqual(['consent', 'update', ctx.signals])
  })

  it('loadGtm is idempotent by marker attribute', () => {
    loadGtm('GTM-A')
    loadGtm('GTM-B')
    expect(document.querySelectorAll('script[data-gtm]')).toHaveLength(1)
  })
})

describe('track', () => {
  it('pushes the event with its params', () => {
    track({ name: 'cta_click', params: { label: 'Demo', location: 'hero', href: undefined } })
    expect(dl().at(-1)).toEqual({ event: 'cta_click', label: 'Demo', location: 'hero' })
  })

  it('is a no-op without a dataLayer (no integration bootstrapped)', () => {
    delete win.dataLayer
    track({ name: 'page_view', params: { page_path: '/', page_title: 'Home', page_locale: 'de' } })
    expect(win.dataLayer).toBeUndefined()
  })

  it('tracks clicks on elements marked with data-track, even when propagation is stopped', () => {
    document.body.innerHTML =
      '<a href="/demo" data-track data-track-location="hero"><span>Demo buchen</span></a>' +
      '<button data-track="outbound_click" data-track-label="Docs">Docs</button>' +
      '<a href="/x" data-track="true">Bool</a>'
    const preventNavigation = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('click', preventNavigation, { capture: true })
    const stopBubbling = (e: Event) => e.stopPropagation()
    document.querySelector('span')!.addEventListener('click', stopBubbling)
    const stop = installClickTracking()
    try {
      document.querySelector('span')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      expect(dl().at(-1)).toEqual({ event: 'cta_click', label: 'Demo buchen', location: 'hero', href: '/demo' })
      document.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      expect(dl().at(-1)).toEqual({ event: 'outbound_click', label: 'Docs' })
      // React renders the JSX boolean form `<a data-track>` as data-track="true".
      document.querySelector('a[data-track="true"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      expect(dl().at(-1)).toEqual({ event: 'cta_click', label: 'Bool', href: '/x' })
    } finally {
      stop()
      document.removeEventListener('click', preventNavigation, { capture: true })
      document.body.innerHTML = ''
    }
  })
})
