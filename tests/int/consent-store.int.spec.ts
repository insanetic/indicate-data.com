import { beforeEach, describe, expect, it } from 'vitest'

import { consentConfig } from '@/consent/config'
import {
  allChoices,
  needsDecision,
  parseRecord,
  purgeCookies,
  readRecord,
  serializeRecord,
  writeRecord,
  type ConsentRecord,
} from '@/consent/store'

const clearCookies = () => {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim()
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`
  }
}

describe('consent record', () => {
  beforeEach(clearCookies)

  const record: ConsentRecord = { v: 2, t: '2026-09-13T10:00:00.000Z', c: { analytics: true, marketing: false } }

  it('round-trips through the cookie string', () => {
    expect(parseRecord(serializeRecord(record))).toEqual(record)
  })

  it('returns null for missing or malformed values', () => {
    expect(parseRecord(undefined)).toBeNull()
    expect(parseRecord('')).toBeNull()
    expect(parseRecord('not json')).toBeNull()
    expect(parseRecord(encodeURIComponent(JSON.stringify({ v: 'x' })))).toBeNull()
  })

  it('writes and reads document.cookie', () => {
    expect(readRecord()).toBeNull()
    writeRecord(record)
    expect(document.cookie).toContain(`${consentConfig.cookieName}=`)
    expect(readRecord()).toEqual(record)
  })

  it('needs a decision when missing, outdated, or expired', () => {
    const now = Date.parse('2026-09-13T12:00:00.000Z')
    expect(needsDecision(null, 1, now)).toBe(true)
    expect(needsDecision(record, 2, now)).toBe(false)
    expect(needsDecision(record, 3, now)).toBe(true)
    const old = { ...record, t: '2025-01-01T00:00:00.000Z' }
    expect(needsDecision(old, 2, now)).toBe(true)
  })

  it('builds uniform choices', () => {
    expect(allChoices(true)).toEqual({ analytics: true, marketing: true })
    expect(allChoices(false)).toEqual({ analytics: false, marketing: false })
  })

  it('purges the cookies of a category', () => {
    document.cookie = '_ga=GA1.1.1; Path=/'
    document.cookie = '_ga_ABC=1; Path=/'
    document.cookie = 'keep=1; Path=/'
    purgeCookies('analytics')
    expect(document.cookie).not.toContain('_ga=')
    expect(document.cookie).not.toContain('_ga_ABC=')
    expect(document.cookie).toContain('keep=1')
  })
})
