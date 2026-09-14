import { act, cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }))

import {
  createIntegration,
  defaults,
  defineConsent,
  gtag,
  readRecord,
  resolveConsent,
  signalsFor,
  writeRecord,
  type ConsentGlobalDoc,
  type ConsentIntegration,
  type ResolvedSetup,
} from '@subneo/payload-consent'
import { bootstrapSnippet, ConsentBanner, ConsentGate, ConsentProvider, ConsentRunner, ConsentSettings, ConsentTrigger, FloatingTrigger, useConsent } from '@subneo/payload-consent/react'

import { CMSLink } from '@/components/Link'

/* ------------------------------------------------------------------ */
/* Shared fixtures                                                       */
/* ------------------------------------------------------------------ */

export const categories = [
  { key: 'necessary', required: true, texts: { de: { label: 'Notwendig', description: 'Nötig.' }, en: { label: 'Necessary', description: 'Needed.' } } },
  { key: 'analytics', signals: ['analytics_storage' as const], texts: { de: { label: 'Statistik', description: 'Zählt.' }, en: { label: 'Statistics', description: 'Counts.' } } },
  { key: 'marketing', texts: { de: { label: 'Marketing', description: 'Wirbt.' }, en: { label: 'Marketing', description: 'Ads.' } } },
]

export const fakeIntegration = (overrides: Partial<ConsentIntegration> = {}): ConsentIntegration =>
  createIntegration({
    key: 'fake',
    category: 'analytics',
    cookies: [/^_fake/],
    bootstrap: 'window.dataLayer=window.dataLayer||[];',
    load: vi.fn(),
    update: vi.fn(),
    service: { name: 'Fake' },
    ...overrides,
  })

export const makeSetup = (integrations: ConsentIntegration[] = [fakeIntegration()]): ResolvedSetup =>
  defineConsent({ categories, integrations, logging: true })

export const clearCookies = () => {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`
  }
}

type RenderOptions = {
  setup?: ResolvedSetup
  global?: ConsentGlobalDoc | null
  locale?: string
  disabled?: boolean
  logEndpoint?: string | null
}

export const renderWith = (ui: React.ReactNode, { setup = makeSetup(), global = null, locale = 'de', disabled, logEndpoint }: RenderOptions = {}) =>
  render(
    <ConsentProvider disabled={disabled} locale={locale} logEndpoint={logEndpoint} settings={resolveConsent(global, locale, setup)} setup={setup}>
      {ui}
    </ConsentProvider>,
  )

export const Probe = () => {
  const c = useConsent()
  return (
    <div>
      <span data-testid="status">{c.status}</span>
      <span data-testid="enabled">{String(c.enabled)}</span>
      <span data-testid="dialog">{String(c.dialogOpen)}</span>
      <button onClick={c.acceptAll}>accept</button>
      <button onClick={c.rejectAll}>reject</button>
      <button onClick={c.openSettings}>open</button>
      <button onClick={c.closeSettings}>close</button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Provider                                                              */
/* ------------------------------------------------------------------ */

describe('ConsentProvider', () => {
  beforeEach(() => {
    clearCookies()
    window.location.hash = ''
  })
  afterEach(cleanup)

  it('is pending without a cookie and decided after acceptAll, writing a record with an id', async () => {
    renderWith(<Probe />)
    expect(await screen.findByText('pending')).toBeTruthy()
    await act(async () => screen.getByText('accept').click())
    expect(screen.getByTestId('status').textContent).toBe('decided')
    const record = readRecord(makeSetup())
    expect(record?.c).toEqual({ analytics: true, marketing: true })
    expect(record?.id).toMatch(/^[A-Za-z0-9-]{16,64}$/)
  })

  it('is decided when a current cookie exists and keeps its id on the next decision', async () => {
    const setup = makeSetup()
    writeRecord(setup, { id: 'keep-me-0000000000', v: 1, t: new Date().toISOString(), c: { analytics: false, marketing: false } })
    renderWith(<Probe />, { setup })
    expect(await screen.findByText('decided')).toBeTruthy()
    await act(async () => screen.getByText('accept').click())
    expect(readRecord(setup)?.id).toBe('keep-me-0000000000')
  })

  it('is disabled by the prop or the global', async () => {
    renderWith(<Probe />, { disabled: true })
    expect((await screen.findByTestId('enabled')).textContent).toBe('false')
    cleanup()
    renderWith(<Probe />, { global: { enabled: false } })
    expect((await screen.findByTestId('enabled')).textContent).toBe('false')
  })

  it('purges optional cookies and asks again after a revision bump', async () => {
    const setup = makeSetup()
    writeRecord(setup, { id: 'old-record-00000000', v: 1, t: new Date().toISOString(), c: { analytics: true, marketing: false } })
    document.cookie = '_fake_id=1; Path=/'
    renderWith(<Probe />, { setup, global: { revision: 2 } })
    expect(await screen.findByText('pending')).toBeTruthy()
    expect(document.cookie).not.toContain('_fake_id=')
    expect(document.cookie).toContain('consent=')
  })

  it('posts every decision to the log endpoint when configured', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    try {
      renderWith(<Probe />, { logEndpoint: '/api/consent/log' })
      await screen.findByText('pending')
      await act(async () => screen.getByText('reject').click())
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
      expect(url).toBe('/api/consent/log')
      expect(init.method).toBe('POST')
      expect(init.keepalive).toBe(true)
      const body = JSON.parse(String(init.body))
      expect(body.c).toEqual({ analytics: false, marketing: false })
      expect(body.v).toBe(1)
      expect(body.l).toBe('de')
      expect(body.h).toMatch(/^[0-9a-f]{8}$/)
      expect(body.id).toBe(readRecord(makeSetup())?.id)
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('does not call fetch without a log endpoint', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    try {
      renderWith(<Probe />)
      await screen.findByText('pending')
      await act(async () => screen.getByText('accept').click())
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('opens the dialog for #cookie-settings and clears the hash on close', async () => {
    window.location.hash = '#cookie-settings'
    renderWith(<Probe />)
    expect(await screen.findByText('pending')).toBeTruthy()
    expect(screen.getByTestId('dialog').textContent).toBe('true')
    await act(async () => screen.getByText('close').click())
    expect(screen.getByTestId('dialog').textContent).toBe('false')
    expect(window.location.hash).toBe('')
    await act(async () => {
      window.location.hash = '#cookie-settings'
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(screen.getByTestId('dialog').textContent).toBe('true')
  })
})

/* ------------------------------------------------------------------ */
/* Banner                                                                */
/* ------------------------------------------------------------------ */

describe('ConsentBanner', () => {
  beforeEach(() => {
    clearCookies()
    // The provider describe leaves the settings hash set; it would keep the dialog open here.
    window.location.hash = ''
  })
  afterEach(cleanup)

  it('shows when pending with purposes and withdrawal named, accept all grants both categories', async () => {
    renderWith(<ConsentBanner />)
    const region = await screen.findByRole('region', { name: defaults.de.bannerTitle })
    expect(region.getAttribute('aria-describedby')).toBeTruthy()
    expect(region.textContent).toContain('Statistik und Marketing')
    expect(region.textContent).toContain('widerrufen')
    expect(region.querySelector('h1, h2, h3')).toBeNull()
    await act(async () => screen.getByRole('button', { name: defaults.de.acceptAll }).click())
    expect(readRecord(makeSetup())?.c).toEqual({ analytics: true, marketing: true })
    expect(screen.queryByRole('region')).toBeNull()
  })

  it('reject writes both categories as false', async () => {
    renderWith(<ConsentBanner />)
    await screen.findByRole('region')
    await act(async () => screen.getByRole('button', { name: defaults.de.rejectAll }).click())
    expect(readRecord(makeSetup())?.c).toEqual({ analytics: false, marketing: false })
  })

  it('gives accept and reject the same variant and classes', async () => {
    renderWith(<ConsentBanner />)
    await screen.findByRole('region')
    const accept = screen.getByRole('button', { name: defaults.de.acceptAll })
    const reject = screen.getByRole('button', { name: defaults.de.rejectAll })
    expect(accept.getAttribute('data-variant')).toBe('secondary')
    expect(reject.getAttribute('data-variant')).toBe('secondary')
    expect(accept.className).toBe(reject.className)
  })

  it('renders nothing when disabled or while the dialog is open', async () => {
    renderWith(<ConsentBanner />, { disabled: true })
    expect(screen.queryByRole('region')).toBeNull()
    cleanup()
    window.location.hash = '#cookie-settings'
    renderWith(<><Probe /><ConsentBanner /></>)
    await screen.findByText('pending')
    expect(screen.queryByRole('region')).toBeNull()
    window.location.hash = ''
  })
})

/* ------------------------------------------------------------------ */
/* Settings dialog                                                       */
/* ------------------------------------------------------------------ */

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

describe('ConsentSettings', () => {
  beforeEach(() => {
    ensureDialogSupport()
    clearCookies()
    window.location.hash = ''
  })
  afterEach(cleanup)

  it('locks necessary, toggles analytics and saves the selection', async () => {
    renderWith(<><Probe /><ConsentSettings /></>)
    await screen.findByText('pending')
    await act(async () => screen.getByText('open').click())
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog.hasAttribute('open')).toBe(true)
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    const switches = screen.getAllByRole('switch', { hidden: true })
    expect(switches).toHaveLength(3)
    expect(switches[0].getAttribute('aria-checked')).toBe('true')
    expect(switches[0].getAttribute('aria-disabled')).toBe('true')
    await act(async () => switches[0].click())
    expect(switches[0].getAttribute('aria-checked')).toBe('true')
    await act(async () => switches[1].click())
    expect(switches[1].getAttribute('aria-checked')).toBe('true')
    expect(switches[1].getAttribute('data-state')).toBe('checked')
    await act(async () => screen.getByRole('button', { name: defaults.de.saveSelection, hidden: true }).click())
    expect(readRecord(makeSetup())?.c).toEqual({ analytics: true, marketing: false })
    expect(dialog.hasAttribute('open')).toBe(false)
  })

  it('starts all off while pending even when an old record exists, and from the record when decided', async () => {
    const setup = makeSetup()
    writeRecord(setup, { id: 'old-record-00000000', v: 1, t: new Date().toISOString(), c: { analytics: true, marketing: true } })
    renderWith(<><Probe /><ConsentSettings /></>, { setup, global: { revision: 2 } })
    await screen.findByText('pending')
    await act(async () => screen.getByText('open').click())
    let switches = screen.getAllByRole('switch', { hidden: true })
    expect(switches[1].getAttribute('aria-checked')).toBe('false')
    expect(switches[2].getAttribute('aria-checked')).toBe('false')
    await act(async () => screen.getByText('accept').click())
    await act(async () => screen.getByText('open').click())
    switches = screen.getAllByRole('switch', { hidden: true })
    expect(switches[1].getAttribute('aria-checked')).toBe('true')
    expect(switches[2].getAttribute('aria-checked')).toBe('true')
  })

  it('has a close button and closes on backdrop click without deciding', async () => {
    renderWith(<><Probe /><ConsentSettings /></>)
    await screen.findByText('pending')
    await act(async () => screen.getByText('open').click())
    const dialog = screen.getByRole('dialog', { hidden: true })
    await act(async () => screen.getByRole('button', { name: defaults.de.close, hidden: true }).click())
    expect(dialog.hasAttribute('open')).toBe(false)
    expect(screen.getByTestId('status').textContent).toBe('pending')
    await act(async () => screen.getByText('open').click())
    await act(async () => dialog.dispatchEvent(new MouseEvent('click', { bubbles: true })))
    expect(dialog.hasAttribute('open')).toBe(false)
    expect(readRecord(makeSetup())).toBeNull()
  })

  it('lists services with provider, cookies and privacy link under their category', async () => {
    const global: ConsentGlobalDoc = {
      categories: [
        {
          key: 'analytics',
          services: [{ name: 'Google Analytics 4', provider: 'Google Ireland Limited', cookies: '_ga · 2 Jahre', privacyUrl: 'https://policies.google.com/privacy' }],
        },
      ],
    }
    renderWith(<><Probe /><ConsentSettings /></>, { global })
    await screen.findByText('pending')
    await act(async () => screen.getByText('open').click())
    expect(screen.getByText('Google Analytics 4', { exact: false })).toBeTruthy()
    expect(screen.getByText('Google Ireland Limited', { exact: false })).toBeTruthy()
    expect(screen.getByText('_ga · 2 Jahre', { exact: false })).toBeTruthy()
    const link = screen.getByRole('link', { name: defaults.de.privacyLink, hidden: true })
    expect(link.getAttribute('rel')).toContain('noopener')
  })
})

/* ------------------------------------------------------------------ */
/* Triggers                                                              */
/* ------------------------------------------------------------------ */

describe('ConsentTrigger', () => {
  beforeEach(clearCookies)
  afterEach(cleanup)

  it('renders a button with the settings label that opens the dialog', async () => {
    renderWith(<><Probe /><ConsentTrigger className="footer-link" /></>)
    await screen.findByText('pending')
    const button = screen.getByRole('button', { name: defaults.de.cookieSettings })
    expect(button.className).toContain('footer-link')
    await act(async () => button.click())
    expect(screen.getByTestId('dialog').textContent).toBe('true')
  })

  it('asChild attaches the opener to its child and keeps the child handler', async () => {
    const onClick = vi.fn()
    renderWith(
      <>
        <Probe />
        <ConsentTrigger asChild>
          <a href="#x" onClick={onClick}>Meine Cookies</a>
        </ConsentTrigger>
      </>,
    )
    await screen.findByText('pending')
    await act(async () => screen.getByText('Meine Cookies').click())
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('dialog').textContent).toBe('true')
  })

  it('renders nothing when disabled', () => {
    renderWith(<ConsentTrigger />, { disabled: true })
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('FloatingTrigger', () => {
  beforeEach(clearCookies)
  afterEach(cleanup)

  it('shows only after a decision in floating mode, at the configured corner', async () => {
    renderWith(<><Probe /><FloatingTrigger /></>, { global: { trigger: { mode: 'floating', position: 'bottom-right' } } })
    await screen.findByText('pending')
    expect(screen.queryByRole('button', { name: defaults.de.cookieSettings })).toBeNull()
    await act(async () => screen.getByText('reject').click())
    const button = screen.getByRole('button', { name: defaults.de.cookieSettings })
    expect(button.getAttribute('data-position')).toBe('bottom-right')
    expect(button.style.position).toBe('fixed')
    expect(button.style.zIndex).toBe('50')
    // jsdom's CSS parser discards every `env()`/`max()` value, so the safe-area insets the component
    // sets for the corner are not readable here; `data-position` above is the assertable part.
    await act(async () => button.click())
    expect(screen.getByTestId('dialog').textContent).toBe('true')
    expect(screen.queryByRole('button', { name: defaults.de.cookieSettings })).toBeNull()
  })

  it('renders nothing in link mode', async () => {
    renderWith(<><Probe /><FloatingTrigger /></>)
    await screen.findByText('pending')
    await act(async () => screen.getByText('reject').click())
    expect(screen.queryByRole('button', { name: defaults.de.cookieSettings })).toBeNull()
  })
})

/* ------------------------------------------------------------------ */
/* Gate                                                                  */
/* ------------------------------------------------------------------ */

describe('ConsentGate', () => {
  beforeEach(clearCookies)
  afterEach(cleanup)

  it('blocks the embed until the category is granted and grants it from the placeholder', async () => {
    renderWith(
      <>
        <Probe />
        <ConsentGate category="marketing" service="YouTube">
          <iframe title="video" />
        </ConsentGate>
      </>,
    )
    await screen.findByText('pending')
    expect(screen.queryByTitle('video')).toBeNull()
    const gate = screen.getByRole('group', { name: 'Marketing' })
    expect(gate.textContent).toContain('YouTube')
    expect(gate.textContent).toContain('„Marketing“')
    await act(async () => screen.getByRole('button', { name: 'Laden und Marketing erlauben' }).click())
    expect(screen.getByTitle('video')).toBeTruthy()
    expect(readRecord(makeSetup())?.c).toEqual({ analytics: false, marketing: true })
  })

  it('does not re-grant the categories of an invalidated record', async () => {
    const setup = makeSetup()
    writeRecord(setup, { id: 'stale-record-000000', v: 1, t: new Date().toISOString(), c: { analytics: true, marketing: false } })
    renderWith(
      <>
        <Probe />
        <ConsentGate category="marketing" service="YouTube">
          <iframe title="video" />
        </ConsentGate>
      </>,
      { setup, global: { revision: 2 } },
    )
    await screen.findByText('pending')
    await act(async () => screen.getByRole('button', { name: 'Laden und Marketing erlauben' }).click())
    expect(readRecord(setup)?.c).toEqual({ analytics: false, marketing: true })
  })

  it('renders children directly when the layer is disabled or the category is required', () => {
    renderWith(<ConsentGate category="marketing" service="YouTube"><iframe title="video" /></ConsentGate>, { disabled: true })
    expect(screen.getByTitle('video')).toBeTruthy()
    cleanup()
    renderWith(<ConsentGate category="necessary" service="Self"><iframe title="video" /></ConsentGate>)
    expect(screen.getByTitle('video')).toBeTruthy()
  })
})

/* ------------------------------------------------------------------ */
/* Head bootstrap                                                        */
/* ------------------------------------------------------------------ */

describe('bootstrapSnippet', () => {
  it('emits an identical bootstrap only once', () => {
    const setup = makeSetup([fakeIntegration(), fakeIntegration({ key: 'fake-two' })])
    expect(bootstrapSnippet(setup)).toBe('window.dataLayer=window.dataLayer||[];')
  })

  it('leaves out the bootstrap of a disabled integration', () => {
    const setup = makeSetup([
      fakeIntegration({ bootstrap: 'window.active=1;' }),
      fakeIntegration({ key: 'off', bootstrap: 'window.off=1;', enabled: false }),
    ])
    expect(bootstrapSnippet(setup)).toBe('window.active=1;')
  })

  it('is empty when no integration has a bootstrap', () => {
    expect(bootstrapSnippet(makeSetup([fakeIntegration({ bootstrap: undefined })]))).toBe('')
  })
})

/* ------------------------------------------------------------------ */
/* Runner                                                                */
/* ------------------------------------------------------------------ */

describe('ConsentRunner', () => {
  beforeEach(() => {
    clearCookies()
    ;(window as unknown as { dataLayer: unknown[] }).dataLayer = []
  })
  afterEach(cleanup)

  it('loads a granted integration once, updates on every decision and pushes a page view', async () => {
    const integration = fakeIntegration()
    const setup = makeSetup([integration])
    renderWith(<><Probe /><ConsentRunner /></>, { setup })
    await screen.findByText('pending')
    expect(integration.load).not.toHaveBeenCalled()
    await act(async () => screen.getByText('accept').click())
    expect(integration.load).toHaveBeenCalledTimes(1)
    expect(integration.update).toHaveBeenCalledTimes(1)
    const ctx = (integration.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(ctx.locale).toBe('de')
    expect(ctx.signals).toEqual(signalsFor(setup, { analytics: true, marketing: true }))
    await act(async () => screen.getByText('accept').click())
    expect(integration.load).toHaveBeenCalledTimes(1)
    expect(integration.update).toHaveBeenCalledTimes(2)
    const dl = (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer
    expect(dl.some((e) => e.event === 'page_view' && e.page_path === '/de' && e.page_locale === 'de')).toBe(true)
  })

  it('never loads after reject but still forwards the denied update', async () => {
    const integration = fakeIntegration()
    const setup = makeSetup([integration])
    writeRecord(setup, { id: 'rejected-0000000000', v: 1, t: new Date().toISOString(), c: { analytics: false, marketing: false } })
    renderWith(<><Probe /><ConsentRunner /></>, { setup })
    await screen.findByText('decided')
    expect(integration.load).not.toHaveBeenCalled()
    expect(integration.update).toHaveBeenCalledTimes(1)
  })

  it('skips disabled integrations', async () => {
    const integration = fakeIntegration({ enabled: false })
    renderWith(<><Probe /><ConsentRunner /></>, { setup: makeSetup([integration]) })
    await screen.findByText('pending')
    await act(async () => screen.getByText('accept').click())
    expect(integration.load).not.toHaveBeenCalled()
    expect(integration.update).not.toHaveBeenCalled()
  })

  it('purges cookies and reloads on withdrawal', async () => {
    const integration = fakeIntegration()
    const setup = makeSetup([integration])
    writeRecord(setup, { id: 'granted-00000000000', v: 1, t: new Date().toISOString(), c: { analytics: true, marketing: false } })
    document.cookie = '_fake_id=1; Path=/'
    const reload = vi.fn()
    const original = window.location
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload, hostname: 'localhost', protocol: 'http:', hash: '', pathname: '/', search: '' },
      writable: true,
      configurable: true,
    })
    try {
      renderWith(<><Probe /><ConsentRunner /></>, { setup })
      await screen.findByText('decided')
      expect(integration.load).toHaveBeenCalledTimes(1)
      await act(async () => screen.getByText('reject').click())
      expect(document.cookie).not.toContain('_fake_id=')
      expect(reload).toHaveBeenCalledTimes(1)
      expect(integration.update).toHaveBeenCalledTimes(2)
    } finally {
      Object.defineProperty(window, 'location', { value: original, writable: true, configurable: true })
    }
  })

  it('pushes the consent update before the entry page view', async () => {
    const integration = fakeIntegration({ update: (ctx) => gtag('consent', 'update', ctx.signals) })
    const setup = makeSetup([integration])
    writeRecord(setup, { id: 'granted-00000000001', v: 1, t: new Date().toISOString(), c: { analytics: true, marketing: false } })
    renderWith(<><Probe /><ConsentRunner /></>, { setup })
    await screen.findByText('decided')
    // gtag pushes its `arguments` object, a page view a plain object.
    const dl = (window as unknown as { dataLayer: unknown[] }).dataLayer
    const update = dl.findIndex((entry) => Array.from(entry as ArrayLike<unknown>)[0] === 'consent')
    const pageView = dl.findIndex((entry) => (entry as { event?: string }).event === 'page_view')
    expect(update).toBeGreaterThanOrEqual(0)
    expect(pageView).toBeGreaterThanOrEqual(0)
    expect(update).toBeLessThan(pageView)
  })

  it('installs the capture-phase click listener while enabled', async () => {
    // Valueless JSX attributes render as "true", which would become the event name; an empty
    // data-track is what real markup carries when it wants the default cta_click event.
    renderWith(<><Probe /><ConsentRunner /><a data-track="" data-track-location="hero" href="#">CTA</a></>)
    await screen.findByText('pending')
    await act(async () => screen.getByText('CTA').click())
    const dl = (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer
    expect(dl.some((e) => e.event === 'cta_click' && e.location === 'hero')).toBe(true)
  })
})

describe('CMSLink track prop', () => {
  afterEach(cleanup)

  it('renders data-track attributes', () => {
    const { container } = render(<CMSLink label="Demo buchen" track={{ location: 'hero' }} type="custom" url="/demo" />)
    const a = container.querySelector('a')!
    expect(a.getAttribute('data-track')).toBe('cta_click')
    expect(a.getAttribute('data-track-location')).toBe('hero')
    expect(a.getAttribute('data-track-label')).toBe('Demo buchen')
  })
})
