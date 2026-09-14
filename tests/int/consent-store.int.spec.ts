import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  allChoices,
  defineConsent,
  needsDecision,
  newRecordId,
  parseRecord,
  purgeCookies,
  readRecord,
  registrableDomain,
  serializeRecord,
  writeRecord,
  type ConsentRecord,
} from '@subneo/payload-consent'

const setup = defineConsent({
  categories: [
    { key: 'necessary', required: true, texts: { en: { label: 'Necessary', description: '' } } },
    { key: 'analytics', texts: { en: { label: 'Statistics', description: '' } } },
    { key: 'marketing', texts: { en: { label: 'Marketing', description: '' } } },
  ],
  integrations: [
    { key: 'gtm', category: 'analytics', cookies: [/^_ga($|_)/, /^_gid$/], load: () => {}, service: { name: 'GTM' } },
  ],
})

const clearCookies = () => {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`
  }
}

describe('consent record', () => {
  beforeEach(clearCookies)

  const record: ConsentRecord = {
    id: 'abc-123',
    v: 2,
    t: '2026-09-13T10:00:00.000Z',
    c: { analytics: true, marketing: false },
  }

  it('round-trips through the cookie string', () => {
    expect(parseRecord(setup, serializeRecord(record))).toEqual(record)
  })

  it('accepts records without an id (written by the previous module)', () => {
    const legacy = { v: 1, t: record.t, c: { analytics: true, marketing: true } }
    expect(parseRecord(setup, encodeURIComponent(JSON.stringify(legacy)))).toEqual({ ...legacy, id: undefined })
  })

  it('returns null for missing or malformed values and drops unknown keys', () => {
    expect(parseRecord(setup, undefined)).toBeNull()
    expect(parseRecord(setup, '')).toBeNull()
    expect(parseRecord(setup, 'not json')).toBeNull()
    expect(parseRecord(setup, encodeURIComponent(JSON.stringify({ v: 'x' })))).toBeNull()
    const extra = { v: 1, t: record.t, c: { analytics: true, bogus: true } }
    expect(parseRecord(setup, encodeURIComponent(JSON.stringify(extra)))?.c).toEqual({ analytics: true, marketing: false })
  })

  it('writes and reads document.cookie', () => {
    expect(readRecord(setup)).toBeNull()
    writeRecord(setup, record)
    expect(document.cookie).toContain('consent=')
    expect(readRecord(setup)).toEqual(record)
  })

  it('sets path, lifetime and SameSite attributes', () => {
    const setter = vi.spyOn(document, 'cookie', 'set')
    writeRecord(setup, record)
    const raw = setter.mock.calls[0][0]
    expect(raw).toContain('Path=/')
    expect(raw).toContain('Max-Age=31536000')
    expect(raw).toContain('SameSite=Lax')
    expect(raw).not.toContain('Secure')
    setter.mockRestore()
  })

  it('needs a decision when missing, outdated, or expired', () => {
    const now = Date.parse('2026-09-13T12:00:00.000Z')
    expect(needsDecision(setup, null, 1, now)).toBe(true)
    expect(needsDecision(setup, record, 2, now)).toBe(false)
    expect(needsDecision(setup, record, 3, now)).toBe(true)
    expect(needsDecision(setup, { ...record, t: '2025-01-01T00:00:00.000Z' }, 2, now)).toBe(true)
    expect(needsDecision(setup, { ...record, t: 'garbage' }, 2, now)).toBe(true)
  })

  it('builds uniform choices', () => {
    expect(allChoices(setup, true)).toEqual({ analytics: true, marketing: true })
    expect(allChoices(setup, false)).toEqual({ analytics: false, marketing: false })
  })

  it('creates url-safe record ids', () => {
    const id = newRecordId()
    expect(id).toMatch(/^[A-Za-z0-9-]{16,64}$/)
    expect(newRecordId()).not.toBe(id)
  })

  it('purges cookies matching the given patterns', () => {
    document.cookie = '_ga=GA1.1.1; Path=/'
    document.cookie = '_ga_ABC=1; Path=/'
    document.cookie = 'keep=1; Path=/'
    purgeCookies(setup.purgePatternsFor('analytics'))
    expect(document.cookie).not.toContain('_ga=')
    expect(document.cookie).not.toContain('_ga_ABC=')
    expect(document.cookie).toContain('keep=1')
  })
})

describe('registrableDomain', () => {
  it('keeps two labels for ordinary hosts and three for short public suffixes', () => {
    expect(registrableDomain('www.indicate-data.com')).toBe('indicate-data.com')
    expect(registrableDomain('indicate-data.com')).toBe('indicate-data.com')
    expect(registrableDomain('localhost')).toBe('localhost')
    expect(registrableDomain('www.example.co.uk')).toBe('example.co.uk')
    expect(registrableDomain('shop.example.com.au')).toBe('example.com.au')
  })
})
