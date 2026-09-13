import { consentConfig, optionalKeys, type OptionalCategoryKey } from './config'

export type Choices = Record<OptionalCategoryKey, boolean>

/** What the visitor decided: CMS revision, ISO timestamp, one boolean per optional category. */
export type ConsentRecord = { v: number; t: string; c: Choices }

const DAY = 24 * 60 * 60 * 1000

export const allChoices = (value: boolean): Choices =>
  Object.fromEntries(optionalKeys.map((k) => [k, value])) as Choices

export function parseRecord(value: string | undefined | null): ConsentRecord | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<ConsentRecord>
    if (typeof parsed.v !== 'number' || typeof parsed.t !== 'string' || typeof parsed.c !== 'object' || !parsed.c) return null
    const c = allChoices(false)
    for (const key of optionalKeys) c[key] = parsed.c[key] === true
    return { v: parsed.v, t: parsed.t, c }
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

export function readRecord(): ConsentRecord | null {
  return parseRecord(cookieValue(consentConfig.cookieName))
}

const secure = () => (typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '')

export function writeRecord(record: ConsentRecord): void {
  if (typeof document === 'undefined') return
  const maxAge = consentConfig.maxAgeDays * 24 * 60 * 60
  document.cookie = `${consentConfig.cookieName}=${serializeRecord(record)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure()}`
}

/** True when the visitor must (re)decide: no record, older CMS revision, or older than maxAgeDays. */
export function needsDecision(record: ConsentRecord | null, revision: number, now = Date.now()): boolean {
  if (!record) return true
  if (record.v < revision) return true
  const decided = Date.parse(record.t)
  if (Number.isNaN(decided)) return true
  return now - decided > consentConfig.maxAgeDays * DAY
}

/** Deletes known cookies of a category on this host and its parent domain. */
export function purgeCookies(category: OptionalCategoryKey): void {
  if (typeof document === 'undefined') return
  const patterns = consentConfig.categories.find((c) => c.key === category)?.purge || []
  const host = location.hostname
  const parent = host.split('.').slice(-2).join('.')
  for (const part of document.cookie.split('; ')) {
    const name = part.split('=')[0]
    if (!name || !patterns.some((p) => p.test(name))) continue
    for (const domain of ['', `; Domain=${host}`, `; Domain=.${parent}`]) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain}`
    }
  }
}
