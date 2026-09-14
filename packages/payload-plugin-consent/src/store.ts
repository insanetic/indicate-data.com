import type { Choices, ResolvedSetup } from './setup'

/** What the visitor decided: record id, CMS revision, ISO timestamp, one boolean per optional category. */
export type ConsentRecord = { id?: string; v: number; t: string; c: Choices }

const DAY = 24 * 60 * 60 * 1000

export const allChoices = (setup: ResolvedSetup, value: boolean): Choices =>
  Object.fromEntries(setup.optionalKeys.map((key) => [key, value]))

export function parseRecord(setup: ResolvedSetup, value: string | undefined | null): ConsentRecord | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<ConsentRecord>
    if (typeof parsed.v !== 'number' || typeof parsed.t !== 'string' || typeof parsed.c !== 'object' || !parsed.c)
      return null
    const c = allChoices(setup, false)
    for (const key of setup.optionalKeys) c[key] = parsed.c[key] === true
    return { id: typeof parsed.id === 'string' ? parsed.id : undefined, v: parsed.v, t: parsed.t, c }
  } catch {
    return null
  }
}

export function serializeRecord(record: ConsentRecord): string {
  return encodeURIComponent(JSON.stringify(record))
}

function cookieValue(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : undefined
}

export function readRecord(setup: ResolvedSetup): ConsentRecord | null {
  return parseRecord(setup, cookieValue(setup.cookieName))
}

const secure = () => (typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '')

export function writeRecord(setup: ResolvedSetup, record: ConsentRecord): void {
  if (typeof document === 'undefined') return
  const maxAge = (setup.maxAgeDays * DAY) / 1000
  document.cookie = `${setup.cookieName}=${serializeRecord(record)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure()}`
}

/** True when the visitor must (re)decide: no record, older CMS revision, or older than maxAgeDays. */
export function needsDecision(
  setup: ResolvedSetup,
  record: ConsentRecord | null,
  revision: number,
  now = Date.now(),
): boolean {
  if (!record) return true
  if (record.v < revision) return true
  const decided = Date.parse(record.t)
  if (Number.isNaN(decided)) return true
  return now - decided > setup.maxAgeDays * DAY
}

/** Random, url-safe id that links the cookie to server-side log rows. */
export function newRecordId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

/**
 * Registrable parent of a host: two labels, or three when the last two look like a short public
 * suffix (`co.uk`, `com.au`). Good enough for cookie deletion without a public suffix list.
 */
export function registrableDomain(host: string): string {
  const labels = host.split('.')
  if (labels.length < 3) return host
  const [second, top] = labels.slice(-2)
  const keep = second.length <= 3 && top.length <= 3 ? 3 : 2
  return labels.slice(-keep).join('.')
}

/** Deletes every cookie whose name matches one of the patterns, on this host and its parent domain. */
export function purgeCookies(patterns: readonly RegExp[]): void {
  if (typeof document === 'undefined' || patterns.length === 0) return
  const host = location.hostname
  const parent = registrableDomain(host)
  for (const part of document.cookie.split('; ')) {
    const name = part.split('=')[0]
    if (!name || !patterns.some((p) => p.test(name))) continue
    for (const domain of ['', `; Domain=${host}`, `; Domain=.${host}`, `; Domain=.${parent}`]) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain}`
    }
  }
}
