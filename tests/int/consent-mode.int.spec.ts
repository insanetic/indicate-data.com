import { beforeEach, describe, expect, it } from 'vitest'

import { anyGranted, applyConsent, isGtmLoaded, loadGtm, signalsFor } from '@/consent/consent-mode'
import { installClickTracking, setTrackingEnabled, track } from '@/consent/track'

type DL = Record<string, unknown>[]
const dl = () => (window as unknown as { dataLayer: DL }).dataLayer

beforeEach(() => {
  ;(window as unknown as { dataLayer: DL }).dataLayer = []
  document.querySelectorAll('script[data-gtm]').forEach((s) => s.remove())
  setTrackingEnabled(true)
})

describe('signalsFor', () => {
  it('maps categories to Consent Mode signals', () => {
    expect(signalsFor({ analytics: true, marketing: false })).toEqual({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    expect(signalsFor({ analytics: false, marketing: true }).ad_storage).toBe('granted')
    expect(anyGranted({ analytics: false, marketing: false })).toBe(false)
    expect(anyGranted({ analytics: false, marketing: true })).toBe(true)
  })
})

describe('applyConsent', () => {
  it('pushes a consent update through gtag', () => {
    applyConsent({ analytics: true, marketing: false })
    const last = dl().at(-1) as unknown as ArrayLike<unknown>
    expect(Array.from(last)).toEqual(['consent', 'update', signalsFor({ analytics: true, marketing: false })])
  })
})

describe('loadGtm', () => {
  it('appends the script once and marks the start', () => {
    expect(isGtmLoaded()).toBe(false)
    loadGtm('GTM-TEST')
    loadGtm('GTM-TEST')
    const scripts = document.querySelectorAll('script[data-gtm]')
    expect(scripts).toHaveLength(1)
    expect(scripts[0].getAttribute('src')).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-TEST')
    expect(dl().some((e) => e.event === 'gtm.js')).toBe(true)
    expect(isGtmLoaded()).toBe(true)
  })
})

describe('track', () => {
  it('pushes the event with its params', () => {
    track({ name: 'cta_click', params: { label: 'Demo', location: 'hero' } })
    expect(dl().at(-1)).toEqual({ event: 'cta_click', label: 'Demo', location: 'hero' })
  })

  it('is a no-op when tracking is disabled', () => {
    setTrackingEnabled(false)
    track({ name: 'page_view', params: { page_path: '/', page_title: 'Home', page_locale: 'de' } })
    expect(dl()).toHaveLength(0)
  })

  it('tracks clicks on elements marked with data-track', () => {
    document.body.innerHTML =
      '<a href="/demo" data-track data-track-location="hero"><span>Demo buchen</span></a>' +
      '<button data-track="outbound_click" data-track-label="Docs">Docs</button>'
    const stop = installClickTracking()
    document.querySelector('span')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(dl().at(-1)).toEqual({ event: 'cta_click', label: 'Demo buchen', location: 'hero', href: '/demo' })
    document.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(dl().at(-1)).toEqual({ event: 'outbound_click', label: 'Docs' })
    stop()
  })
})
