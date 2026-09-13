import { describe, expect, it } from 'vitest'

import { formatDate, isoDate } from '@/components/DocumentLayout/DocumentMeta'

describe('isoDate', () => {
  it('renders the Europe/Berlin calendar day, not the UTC one', () => {
    // 22:00 UTC on Aug 16 is already Aug 17 in Berlin (UTC+2 in August).
    expect(isoDate('2026-08-16T22:00:00.000Z')).toBe('2026-08-17')
    expect(isoDate('2026-08-17T00:00:00.000Z')).toBe('2026-08-17')
  })
})

describe('formatDate', () => {
  it('formats the Europe/Berlin calendar day per locale', () => {
    expect(formatDate('2026-08-17T00:00:00.000Z', 'de')).toBe('17. August 2026')
    expect(formatDate('2026-08-17T00:00:00.000Z', 'en')).toBe('August 17, 2026')
  })
})
