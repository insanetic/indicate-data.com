import { act, cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }))

import {
  createIntegration,
  defineConsent,
  readRecord,
  resolveConsent,
  writeRecord,
  type ConsentGlobalDoc,
  type ConsentIntegration,
  type ResolvedSetup,
} from '@subneo/payload-consent'
import { ConsentProvider, useConsent } from '@subneo/payload-consent/react'

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
