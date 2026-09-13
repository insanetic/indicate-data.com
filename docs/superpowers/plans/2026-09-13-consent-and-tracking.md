# Cookie consent and tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A self-contained `src/consent` module: GDPR-compliant consent banner and settings dialog, Google Consent Mode v2, GTM loaded only after consent, a typed event helper, editable texts in a Payload global, reusable across Payload projects.

**Architecture:** Pure functions (config, cookie store, consent mode, track) with unit tests; a client `ConsentProvider` holding state; three UI components (banner, dialog, footer trigger) built from the site's tokens; a headless `TagManager` that applies consent, loads GTM, tracks page views and clicks. A Payload global supplies texts and the service list with code fallbacks. Container id comes from `NEXT_PUBLIC_GTM_ID`.

**Tech Stack:** Next.js 16 App Router, React 19, Payload 3.89, Tailwind 4, Vitest + Testing Library (jsdom), Playwright.

**Spec:** `docs/superpowers/specs/2026-09-13-consent-and-tracking-design.md`

## Global Constraints

- GTM (`gtm.js`) must never load before a decision that grants at least one optional category. No `<noscript>` GTM iframe.
- Accept and reject on the first layer: identical `secondary` buttons, equal width. No pre-ticked boxes. Necessary category locked on.
- Consent cookie name `consent`, 365 days, `SameSite=Lax`, `Secure` except on localhost.
- Categories: `necessary`, `analytics`, `marketing`. Analytics → `analytics_storage`; marketing → `ad_storage`, `ad_user_data`, `ad_personalization`.
- The module imports only `@/components/ui/button`, `@/utilities/ui`, `@/providers/Locale`, `@/i18n/config` and `@/payload-types` from the rest of the site.
- Never read the cookie on the server (pages must stay statically cached).
- All texts editable in the global with de/en fallbacks in `defaults.ts`; button labels only in `defaults.ts`.
- Schema changes are additive (new global only). After seeding from the host, clear `.next/dev/cache/fetch-cache`.
- Reduced motion: no entrance animations. Mobile: bottom sheets with safe-area padding.
- No em-dashes in copy. German copy uses "Sie".
- Commit after every task. Run `pnpm test:int` before each commit; run `pnpm lint` and `pnpm exec tsc --noEmit` at the end of Tasks 3, 7, 8 and 10.

---

## File map

| File | Responsibility |
|---|---|
| `src/consent/config.ts` | Category keys, Consent Mode signals, purge patterns, cookie name/lifetime |
| `src/consent/store.ts` | Consent record: parse, serialize, read, write, needsDecision, purgeCookies |
| `src/consent/consent-mode.ts` | Bootstrap snippet, signalsFor, applyConsent, loadGtm |
| `src/consent/track.ts` | `track()`, enable flag, delegated click tracking |
| `src/consent/defaults.ts` | de/en fallback texts and `resolveConsent(global, locale)` |
| `src/consent/global.ts` | Payload GlobalConfig `consent` |
| `src/consent/CategoryRowLabel.tsx` | Admin row label for the categories array |
| `src/consent/hooks/revalidateConsent.ts` | afterChange revalidation |
| `src/consent/components/ConsentDefaults.tsx` | Server: inline head script |
| `src/consent/components/ConsentProvider.tsx` | Client: state and actions, `useConsent()` |
| `src/consent/components/Switch.tsx` | Client: `role="switch"` button |
| `src/consent/components/ConsentBanner.tsx` | Client: first layer |
| `src/consent/components/ConsentSettings.tsx` | Client: second layer `<dialog>` |
| `src/consent/components/ConsentTrigger.tsx` | Client: footer button |
| `src/consent/components/TagManager.tsx` | Client: applies consent, loads GTM, page views, click listener |
| `src/consent/README.md` | Drop-in checklist, GTM and GA4 setup |
| `src/endpoints/seed/consent.ts` | Seed data for the global |
| `tests/int/consent-store.int.spec.ts`, `consent-mode.int.spec.ts`, `consent-ui.int.spec.tsx` | Unit and component tests |
| `tests/e2e/consent.e2e.spec.ts`, `tests/helpers/consent.ts` | End-to-end |

---

### Task 1: Config and consent record store

**Files:**
- Create: `src/consent/config.ts`
- Create: `src/consent/store.ts`
- Test: `tests/int/consent-store.int.spec.ts`

**Interfaces:**
- Produces: `CategoryKey`, `OptionalCategoryKey`, `ConsentSignal`, `consentConfig`, `optionalCategories`, `Choices`, `ConsentRecord`, `parseRecord`, `serializeRecord`, `readRecord`, `writeRecord`, `needsDecision`, `purgeCookies`, `allChoices`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/int/consent-store.int.spec.ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test:int -- tests/int/consent-store.int.spec.ts`
Expected: FAIL, "Cannot find module '@/consent/config'".

- [ ] **Step 3: Write config.ts**

```ts
// src/consent/config.ts
/**
 * Consent categories and their Google Consent Mode v2 signals. Project-specific: add a category
 * here, give it texts in ./defaults.ts and add the option to the `key` select in ./global.ts.
 */
export type CategoryKey = 'necessary' | 'analytics' | 'marketing'
export type OptionalCategoryKey = Exclude<CategoryKey, 'necessary'>

export type ConsentSignal = 'ad_storage' | 'ad_user_data' | 'ad_personalization' | 'analytics_storage'

export type CategoryConfig = {
  key: CategoryKey
  required: boolean
  /** Consent Mode signals set to "granted" when the category is granted. */
  signals: readonly ConsentSignal[]
  /** Cookie name patterns deleted when the category is withdrawn. */
  purge: readonly RegExp[]
}

export const consentConfig = {
  cookieName: 'consent',
  maxAgeDays: 365,
  categories: [
    { key: 'necessary', required: true, signals: [], purge: [] },
    { key: 'analytics', required: false, signals: ['analytics_storage'], purge: [/^_ga($|_)/, /^_gid$/] },
    {
      key: 'marketing',
      required: false,
      signals: ['ad_storage', 'ad_user_data', 'ad_personalization'],
      purge: [/^_gcl_/, /^_fbp$/],
    },
  ] as readonly CategoryConfig[],
} as const

export const optionalCategories = consentConfig.categories.filter((c) => !c.required) as readonly (CategoryConfig & {
  key: OptionalCategoryKey
})[]

export const optionalKeys = optionalCategories.map((c) => c.key) as readonly OptionalCategoryKey[]
```

- [ ] **Step 4: Write store.ts**

```ts
// src/consent/store.ts
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test:int -- tests/int/consent-store.int.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/consent/config.ts src/consent/store.ts tests/int/consent-store.int.spec.ts
git commit -m "Consent: category config and cookie record store"
```

---

### Task 2: Consent Mode, GTM loader and track helper

**Files:**
- Create: `src/consent/consent-mode.ts`
- Create: `src/consent/track.ts`
- Test: `tests/int/consent-mode.int.spec.ts`

**Interfaces:**
- Consumes: `Choices`, `consentConfig`, `ConsentSignal` from Task 1.
- Produces: `bootstrapSnippet`, `signalsFor(choices)`, `anyGranted(choices)`, `applyConsent(choices)`, `loadGtm(id)`, `isGtmLoaded()`, `TrackEvent`, `track(event)`, `setTrackingEnabled(v)`, `isTrackingEnabled()`, `installClickTracking()`.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/int/consent-mode.int.spec.ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test:int -- tests/int/consent-mode.int.spec.ts`
Expected: FAIL, "Cannot find module '@/consent/consent-mode'".

- [ ] **Step 3: Write consent-mode.ts**

```ts
// src/consent/consent-mode.ts
import { optionalCategories, type ConsentSignal } from './config'
import type { Choices } from './store'

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

const allSignals: readonly ConsentSignal[] = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']

/**
 * Inline script for <head>, before any other script: creates the dataLayer and gtag, sets every
 * Consent Mode signal to denied. Storage the site itself needs (consent cookie, chrome) is granted.
 */
export const bootstrapSnippet = [
  'window.dataLayer=window.dataLayer||[];',
  'function gtag(){dataLayer.push(arguments)}',
  'window.gtag=gtag;',
  `gtag('consent','default',{${allSignals.map((s) => `${s}:'denied'`).join(',')},functionality_storage:'granted',personalization_storage:'granted',security_storage:'granted',wait_for_update:0});`,
  "gtag('set','ads_data_redaction',true);",
].join('')

export function signalsFor(choices: Choices): Record<ConsentSignal, 'granted' | 'denied'> {
  const out = Object.fromEntries(allSignals.map((s) => [s, 'denied'])) as Record<ConsentSignal, 'granted' | 'denied'>
  for (const category of optionalCategories) {
    if (!choices[category.key]) continue
    for (const signal of category.signals) out[signal] = 'granted'
  }
  return out
}

export const anyGranted = (choices: Choices): boolean => optionalCategories.some((c) => choices[c.key])

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
  }
  window.gtag(...args)
}

export function applyConsent(choices: Choices): void {
  gtag('consent', 'update', signalsFor(choices))
}

export const isGtmLoaded = (): boolean =>
  typeof document !== 'undefined' && !!document.querySelector('script[data-gtm]')

/** Appends gtm.js once. Call only after a decision that grants at least one optional category. */
export function loadGtm(id: string): void {
  if (typeof document === 'undefined' || isGtmLoaded()) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`
  script.setAttribute('data-gtm', id)
  document.head.appendChild(script)
}
```

- [ ] **Step 4: Write track.ts**

```ts
// src/consent/track.ts
type Params = Record<string, string | number | boolean | undefined>

export type TrackEvent =
  | { name: 'page_view'; params: { page_path: string; page_title: string; page_locale: string } }
  | { name: 'cta_click'; params: { label: string; location?: string; href?: string } }
  | { name: 'outbound_click'; params: { href: string; label?: string } }
  | { name: 'generate_lead'; params: { form_id: string; form_name: string } }
  | { name: string; params?: Params }

let enabled = false

/** Set by ConsentProvider on mount. Off means track() never touches the dataLayer. */
export const setTrackingEnabled = (value: boolean): void => {
  enabled = value
}
export const isTrackingEnabled = (): boolean => enabled

/**
 * Pushes an event to the dataLayer. The dataLayer is a local array; data only leaves the browser
 * through GTM, which is loaded only after consent, so pushing before a decision is harmless and
 * lets GTM process the queue once loaded.
 */
export function track(event: TrackEvent): void {
  if (!enabled || typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  const params: Params = {}
  for (const [key, value] of Object.entries(event.params || {})) if (value !== undefined) params[key] = value
  window.dataLayer.push({ event: event.name, ...params })
}

/**
 * One delegated listener: any element with `data-track` (event name, default cta_click) pushes
 * its label (`data-track-label` or text), location (`data-track-location`) and href.
 */
export function installClickTracking(): () => void {
  const onClick = (e: MouseEvent) => {
    const target = (e.target as Element | null)?.closest<HTMLElement>('[data-track]')
    if (!target) return
    const name = target.dataset.track || 'cta_click'
    const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') || undefined : undefined
    track({
      name,
      params: {
        label: target.dataset.trackLabel || target.textContent?.trim() || '',
        location: target.dataset.trackLocation,
        href,
      },
    })
  }
  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test:int -- tests/int/consent-mode.int.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/consent/consent-mode.ts src/consent/track.ts tests/int/consent-mode.int.spec.ts
git commit -m "Consent: Consent Mode v2 signals, GTM loader and track helper"
```

---

### Task 3: Payload global and defaults

**Files:**
- Create: `src/consent/global.ts`
- Create: `src/consent/CategoryRowLabel.tsx`
- Create: `src/consent/hooks/revalidateConsent.ts`
- Create: `src/consent/defaults.ts`
- Modify: `src/payload.config.ts:15,83`
- Test: `tests/int/consent-ui.int.spec.tsx` (first describe block; the file grows in Tasks 5 and 6)

**Interfaces:**
- Consumes: `CategoryKey`, `consentConfig` from Task 1.
- Produces: Payload global slug `consent` (type `Consent` in `src/payload-types.ts`); `ConsentTexts`, `CategoryText`, `ServiceText`, `ResolvedConsent`, `resolveConsent(global, locale)`, `defaults`.

- [ ] **Step 1: Write the global**

```ts
// src/consent/global.ts
import type { GlobalConfig } from 'payload'

import { consentConfig } from './config'
import { revalidateConsent } from './hooks/revalidateConsent'

const categoryOptions = consentConfig.categories.map((c) => ({ label: c.key, value: c.key }))

/**
 * Editor-owned parts of the consent layer: texts, links, categories with their services, and a
 * revision that re-asks every visitor when raised. Button labels live in ./defaults.ts.
 */
export const Consent: GlobalConfig = {
  slug: 'consent',
  label: { de: 'Cookies & Tracking', en: 'Cookies & tracking' },
  access: { read: () => true },
  admin: { group: { de: 'Website', en: 'Site' } },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: { de: 'Banner und Tracking aktiv', en: 'Banner and tracking active' },
          admin: { width: '50%' },
        },
        {
          name: 'revision',
          type: 'number',
          defaultValue: 1,
          min: 1,
          required: true,
          label: { de: 'Revision', en: 'Revision' },
          admin: {
            width: '50%',
            description: {
              de: 'Erhöhen, um alle Besucher erneut zu fragen (z. B. nach neuen Diensten).',
              en: 'Increase to ask every visitor again (e.g. after adding services).',
            },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'privacyPage',
          type: 'relationship',
          relationTo: 'pages',
          label: { de: 'Datenschutz-Seite', en: 'Privacy page' },
          admin: { width: '50%' },
        },
        {
          name: 'imprintPage',
          type: 'relationship',
          relationTo: 'pages',
          label: { de: 'Impressum-Seite', en: 'Imprint page' },
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'banner',
      type: 'group',
      label: { de: 'Banner (erste Ebene)', en: 'Banner (first layer)' },
      fields: [
        { name: 'title', type: 'text', localized: true, label: { de: 'Titel', en: 'Title' } },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      label: { de: 'Einstellungen (zweite Ebene)', en: 'Settings (second layer)' },
      fields: [
        { name: 'title', type: 'text', localized: true, label: { de: 'Titel', en: 'Title' } },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
      ],
    },
    {
      name: 'categories',
      type: 'array',
      label: { de: 'Kategorien', en: 'Categories' },
      labels: { singular: { de: 'Kategorie', en: 'Category' }, plural: { de: 'Kategorien', en: 'Categories' } },
      admin: { components: { RowLabel: '@/consent/CategoryRowLabel#CategoryRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'key', type: 'select', required: true, options: categoryOptions, admin: { width: '30%' } },
            { name: 'label', type: 'text', localized: true, label: { de: 'Bezeichnung', en: 'Label' }, admin: { width: '70%' } },
          ],
        },
        { name: 'description', type: 'textarea', localized: true, label: { de: 'Beschreibung', en: 'Description' } },
        {
          name: 'services',
          type: 'array',
          label: { de: 'Dienste', en: 'Services' },
          labels: { singular: { de: 'Dienst', en: 'Service' }, plural: { de: 'Dienste', en: 'Services' } },
          admin: { initCollapsed: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '50%' } },
                { name: 'provider', type: 'text', label: { de: 'Anbieter', en: 'Provider' }, admin: { width: '50%' } },
              ],
            },
            { name: 'purpose', type: 'textarea', localized: true, label: { de: 'Zweck', en: 'Purpose' } },
            {
              type: 'row',
              fields: [
                {
                  name: 'cookies',
                  type: 'text',
                  label: { de: 'Cookies und Laufzeit', en: 'Cookies and lifetime' },
                  admin: { width: '50%', placeholder: '_ga, _ga_* · 2 Jahre' },
                },
                { name: 'privacyUrl', type: 'text', label: { de: 'Datenschutz-Link', en: 'Privacy link' }, admin: { width: '50%' } },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [revalidateConsent] },
}
```

```tsx
// src/consent/CategoryRowLabel.tsx
'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const CategoryRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ key?: string; label?: string }>()
  return <div>{data?.key ? `${data.key}${data.label ? `: ${data.label}` : ''}` : 'Kategorie / Category'}</div>
}
```

```ts
// src/consent/hooks/revalidateConsent.ts
import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateConsent: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating consent settings')
    // `expire: 0`: the whole route is cached, a stale copy would freeze old texts into it.
    revalidateTag('global_consent', { expire: 0 })
  }
  return doc
}
```

- [ ] **Step 2: Register the global and generate types**

In `src/payload.config.ts` add after line 15 (`import { SiteSettings } …`):

```ts
import { Consent } from './consent/global'
```

and change line 83 to:

```ts
  globals: [SiteSettings, Header, Footer, Consent],
```

Run: `pnpm generate:types && pnpm generate:importmap`
Expected: `src/payload-types.ts` now exports `Consent` with `enabled`, `revision`, `privacyPage`, `imprintPage`, `banner`, `settings`, `categories`. `src/app/(payload)/admin/importMap.js` lists `CategoryRowLabel`.

- [ ] **Step 3: Write the failing test for resolveConsent**

```tsx
// tests/int/consent-ui.int.spec.tsx
import { describe, expect, it } from 'vitest'

import { defaults, resolveConsent } from '@/consent/defaults'
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
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, "Cannot find module '@/consent/defaults'".

- [ ] **Step 5: Write defaults.ts**

```ts
// src/consent/defaults.ts
import type { Locale } from '@/i18n/config'
import type { Consent } from '@/payload-types'

import { consentConfig, type CategoryKey } from './config'

export type ServiceText = { name: string; provider?: string; purpose?: string; cookies?: string; privacyUrl?: string }
export type CategoryText = { key: CategoryKey; required: boolean; label: string; description: string; services: ServiceText[] }

type CategoryDefaults = Record<CategoryKey, { label: string; description: string }>

type Strings = {
  bannerTitle: string
  bannerText: string
  settingsTitle: string
  settingsText: string
  acceptAll: string
  rejectAll: string
  openSettings: string
  saveSelection: string
  cookieSettings: string
  lastChanged: string
  showServices: string
  alwaysActive: string
  privacy: string
  imprint: string
  close: string
  provider: string
  cookies: string
  privacyLink: string
  categories: CategoryDefaults
}

export type ConsentTexts = Omit<Strings, 'categories'> & { categories: CategoryText[] }

export type ResolvedConsent = {
  texts: ConsentTexts
  revision: number
  privacyHref: string | null
  imprintHref: string | null
}

const de: Strings = {
  bannerTitle: 'Cookies auf dieser Website',
  bannerText:
    'Wir verwenden Cookies nur mit Ihrer Zustimmung, um zu verstehen, wie die Website genutzt wird. Ohne Ihre Zustimmung wird nichts erfasst.',
  settingsTitle: 'Cookie-Einstellungen',
  settingsText: 'Wählen Sie, welche Kategorien Sie erlauben. Ihre Auswahl können Sie jederzeit hier ändern.',
  acceptAll: 'Alle akzeptieren',
  rejectAll: 'Nur notwendige',
  openSettings: 'Einstellungen',
  saveSelection: 'Auswahl speichern',
  cookieSettings: 'Cookie-Einstellungen',
  lastChanged: 'Zuletzt geändert am',
  showServices: 'Dienste anzeigen',
  alwaysActive: 'Immer aktiv',
  privacy: 'Datenschutz',
  imprint: 'Impressum',
  close: 'Schließen',
  provider: 'Anbieter',
  cookies: 'Cookies',
  privacyLink: 'Datenschutzerklärung des Anbieters',
  categories: {
    necessary: { label: 'Notwendig', description: 'Für den Betrieb der Website erforderlich, etwa um Ihre Cookie-Auswahl zu speichern.' },
    analytics: { label: 'Statistik', description: 'Hilft uns zu verstehen, welche Seiten besucht werden. Die Daten werden anonymisiert ausgewertet.' },
    marketing: { label: 'Marketing', description: 'Ermöglicht es, den Erfolg unserer Kampagnen zu messen und Ihnen relevante Inhalte zu zeigen.' },
  },
}

const en: Strings = {
  bannerTitle: 'Cookies on this website',
  bannerText:
    'We only use cookies with your consent, to understand how the website is used. Nothing is recorded without your consent.',
  settingsTitle: 'Cookie settings',
  settingsText: 'Choose which categories you allow. You can change your selection here at any time.',
  acceptAll: 'Accept all',
  rejectAll: 'Only necessary',
  openSettings: 'Settings',
  saveSelection: 'Save selection',
  cookieSettings: 'Cookie settings',
  lastChanged: 'Last changed on',
  showServices: 'Show services',
  alwaysActive: 'Always active',
  privacy: 'Privacy',
  imprint: 'Imprint',
  close: 'Close',
  provider: 'Provider',
  cookies: 'Cookies',
  privacyLink: 'Provider privacy policy',
  categories: {
    necessary: { label: 'Necessary', description: 'Required to run the website, for example to remember your cookie choice.' },
    analytics: { label: 'Statistics', description: 'Helps us understand which pages are visited. Data is evaluated anonymously.' },
    marketing: { label: 'Marketing', description: 'Lets us measure our campaigns and show you relevant content.' },
  },
}

export const defaults: Record<Locale, Strings> = { de, en }

const pageHref = (locale: string, value: Consent['privacyPage']): string | null => {
  if (!value || typeof value !== 'object' || !value.slug) return null
  return value.slug === 'home' ? `/${locale}` : `/${locale}/${value.slug}`
}

const text = (cms: string | null | undefined, fallback: string) => (cms && cms.trim() ? cms : fallback)

/** Merges the CMS global into the code defaults, field by field, for one locale. */
export function resolveConsent(global: Consent | null | undefined, locale: Locale): ResolvedConsent {
  const base = defaults[locale] || defaults.en
  const rows = global?.categories || []
  const categories: CategoryText[] = consentConfig.categories.map((category) => {
    const row = rows.find((r) => r.key === category.key)
    return {
      key: category.key,
      required: category.required,
      label: text(row?.label, base.categories[category.key].label),
      description: text(row?.description, base.categories[category.key].description),
      services: (row?.services || []).map((s) => ({
        name: s.name,
        provider: s.provider || undefined,
        purpose: s.purpose || undefined,
        cookies: s.cookies || undefined,
        privacyUrl: s.privacyUrl || undefined,
      })),
    }
  })
  return {
    revision: global?.revision || 1,
    privacyHref: pageHref(locale, global?.privacyPage),
    imprintHref: pageHref(locale, global?.imprintPage),
    texts: {
      ...base,
      bannerTitle: text(global?.banner?.title, base.bannerTitle),
      bannerText: text(global?.banner?.text, base.bannerText),
      settingsTitle: text(global?.settings?.title, base.settingsTitle),
      settingsText: text(global?.settings?.text, base.settingsText),
      categories,
    },
  }
}
```

- [ ] **Step 6: Run the tests, then lint and type-check**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx && pnpm lint && pnpm exec tsc --noEmit`
Expected: PASS (3 tests), no lint or type errors. If `tsc` complains about `row.key` typing, the generated union from the select makes `r.key === category.key` valid; if `services` fields are typed `string | null`, the `|| undefined` handles it.

- [ ] **Step 7: Commit**

```bash
git add src/consent/global.ts src/consent/CategoryRowLabel.tsx src/consent/hooks/revalidateConsent.ts src/consent/defaults.ts src/payload.config.ts src/payload-types.ts "src/app/(payload)/admin/importMap.js" tests/int/consent-ui.int.spec.tsx
git commit -m "Consent: Payload global, defaults and resolver"
```

---

### Task 4: ConsentProvider, ConsentDefaults and Switch

**Files:**
- Create: `src/consent/components/ConsentProvider.tsx`
- Create: `src/consent/components/ConsentDefaults.tsx`
- Create: `src/consent/components/Switch.tsx`
- Test: `tests/int/consent-ui.int.spec.tsx` (add a describe block)

**Interfaces:**
- Consumes: `resolveConsent`, `ResolvedConsent` (Task 3); `readRecord`, `writeRecord`, `needsDecision`, `allChoices`, `Choices`, `ConsentRecord` (Task 1); `setTrackingEnabled` (Task 2); `bootstrapSnippet` (Task 2).
- Produces: `ConsentProvider` props `{ settings: Consent | null; gtmId?: string; disabled?: boolean; children }`; `useConsent()` returning `ConsentContextValue`; `ConsentDefaults` props `{ enabled: boolean }`; `Switch` props `{ checked: boolean; onChange?(v: boolean): void; disabled?: boolean; id?: string; 'aria-labelledby'?: string }`.

- [ ] **Step 1: Write the failing test**

Append to `tests/int/consent-ui.int.spec.tsx`:

```tsx
import { act, render, screen } from '@testing-library/react'
import React from 'react'

import { ConsentProvider, useConsent } from '@/consent/components/ConsentProvider'
import { writeRecord } from '@/consent/store'
import { isTrackingEnabled } from '@/consent/track'

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, "Cannot find module '@/consent/components/ConsentProvider'".

- [ ] **Step 3: Write ConsentProvider.tsx**

```tsx
// src/consent/components/ConsentProvider.tsx
'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { Locale } from '@/i18n/config'
import type { Consent } from '@/payload-types'
import { useLocale } from '@/providers/Locale'

import { resolveConsent, type ConsentTexts } from '../defaults'
import { allChoices, needsDecision, readRecord, writeRecord, type Choices, type ConsentRecord } from '../store'
import { setTrackingEnabled } from '../track'

export type ConsentStatus = 'loading' | 'pending' | 'decided'

export type ConsentContextValue = {
  /** False when the global is off, no container id is set, or in draft mode: nothing renders. */
  enabled: boolean
  gtmId: string | null
  locale: Locale
  status: ConsentStatus
  record: ConsentRecord | null
  choices: Choices
  texts: ConsentTexts
  revision: number
  privacyHref: string | null
  imprintHref: string | null
  dialogOpen: boolean
  acceptAll: () => void
  rejectAll: () => void
  save: (choices: Choices) => void
  openSettings: () => void
  closeSettings: () => void
  hasConsent: (category: keyof Choices) => boolean
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

type Props = {
  settings: Consent | null | undefined
  gtmId?: string | null
  /** True in draft mode / live preview: no banner, no tracking. */
  disabled?: boolean
  children: React.ReactNode
}

export const ConsentProvider: React.FC<Props> = ({ settings, gtmId, disabled, children }) => {
  const locale = useLocale()
  const resolved = useMemo(() => resolveConsent(settings, locale), [settings, locale])
  const enabled = Boolean(gtmId && settings?.enabled !== false && !disabled)

  const [status, setStatus] = useState<ConsentStatus>('loading')
  const [record, setRecord] = useState<ConsentRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setTrackingEnabled(enabled)
    if (!enabled) return
    const existing = readRecord()
    if (needsDecision(existing, resolved.revision)) {
      setRecord(existing)
      setStatus('pending')
    } else {
      setRecord(existing)
      setStatus('decided')
    }
  }, [enabled, resolved.revision])

  const decide = useCallback(
    (choices: Choices) => {
      const next: ConsentRecord = { v: resolved.revision, t: new Date().toISOString(), c: choices }
      writeRecord(next)
      setRecord(next)
      setStatus('decided')
      setDialogOpen(false)
    },
    [resolved.revision],
  )

  const value = useMemo<ConsentContextValue>(
    () => ({
      enabled,
      gtmId: gtmId || null,
      locale,
      status,
      record,
      choices: record?.c || allChoices(false),
      texts: resolved.texts,
      revision: resolved.revision,
      privacyHref: resolved.privacyHref,
      imprintHref: resolved.imprintHref,
      dialogOpen,
      acceptAll: () => decide(allChoices(true)),
      rejectAll: () => decide(allChoices(false)),
      save: decide,
      openSettings: () => setDialogOpen(true),
      closeSettings: () => setDialogOpen(false),
      hasConsent: (category) => status === 'decided' && Boolean(record?.c[category]),
    }),
    [enabled, gtmId, locale, status, record, resolved, dialogOpen, decide],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export const useConsent = (): ConsentContextValue => {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside ConsentProvider')
  return ctx
}
```

- [ ] **Step 4: Write ConsentDefaults.tsx and Switch.tsx**

```tsx
// src/consent/components/ConsentDefaults.tsx
import Script from 'next/script'
import React from 'react'

import { bootstrapSnippet } from '../consent-mode'

/** Head script: dataLayer, gtag and Consent Mode defaults (all denied) before anything else runs. */
export const ConsentDefaults: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  if (!enabled) return null
  return (
    <Script id="consent-defaults" strategy="beforeInteractive">
      {bootstrapSnippet}
    </Script>
  )
}
```

```tsx
// src/consent/components/Switch.tsx
'use client'

import React from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  'aria-labelledby'?: string
  className?: string
}

/** Minimal accessible switch (role="switch"); locked when disabled. */
export const Switch: React.FC<Props> = ({ checked, onChange, disabled, className, ...aria }) => (
  <button
    aria-checked={checked}
    aria-disabled={disabled || undefined}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border border-line-strong transition-colors duration-150',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]',
      checked ? 'bg-[var(--btn-primary-bg)]' : 'bg-surface-2',
      disabled && 'cursor-not-allowed opacity-60',
      className,
    )}
    onClick={() => {
      if (!disabled) onChange?.(!checked)
    }}
    role="switch"
    type="button"
    {...aria}
  >
    <span
      aria-hidden
      className={cn(
        'block size-4 rounded-pill bg-surface shadow-card transition-transform duration-150 motion-reduce:transition-none',
        checked ? 'translate-x-6' : 'translate-x-1',
      )}
    />
  </button>
)
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/consent/components/ConsentProvider.tsx src/consent/components/ConsentDefaults.tsx src/consent/components/Switch.tsx tests/int/consent-ui.int.spec.tsx
git commit -m "Consent: provider, head defaults script and switch"
```

---

### Task 5: ConsentBanner (first layer)

**Files:**
- Create: `src/consent/components/ConsentBanner.tsx`
- Test: `tests/int/consent-ui.int.spec.tsx` (add a describe block)

**Interfaces:**
- Consumes: `useConsent()` (Task 4), `Button` from `@/components/ui/button`.
- Produces: `ConsentBanner` (no props).

- [ ] **Step 1: Write the failing test**

Append to `tests/int/consent-ui.int.spec.tsx`:

```tsx
import { ConsentBanner } from '@/consent/components/ConsentBanner'
import { readRecord } from '@/consent/store'

describe('ConsentBanner', () => {
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, "Cannot find module '@/consent/components/ConsentBanner'".

- [ ] **Step 3: Write ConsentBanner.tsx**

```tsx
// src/consent/components/ConsentBanner.tsx
'use client'

import React, { useId } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

import { useConsent } from './ConsentProvider'

/**
 * First layer. Non-modal: the page stays usable. Accept and reject are identical buttons;
 * settings is a text link. Rendered right after the skip link so keyboard users reach it first.
 */
export const ConsentBanner: React.FC = () => {
  const { enabled, status, dialogOpen, texts, privacyHref, imprintHref, acceptAll, rejectAll, openSettings } = useConsent()
  const titleId = useId()

  if (!enabled || status !== 'pending' || dialogOpen) return null

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'consent-enter fixed inset-x-0 bottom-0 z-[60] bg-surface text-ink border-t border-line shadow-float',
        'p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
        'md:inset-x-auto md:bottom-6 md:left-6 md:w-[26rem] md:rounded-card md:border md:p-6',
      )}
      role="region"
    >
      <h2 className="type-h4" id={titleId}>
        {texts.bannerTitle}
      </h2>
      <p className="mt-2 type-small text-ink-2 pretty">{texts.bannerText}</p>
      {(privacyHref || imprintHref) && (
        <p className="mt-3 flex flex-wrap gap-x-4 type-caption text-ink-3">
          {privacyHref && (
            <a className="underline underline-offset-4 hover:text-ink" href={privacyHref}>
              {texts.privacy}
            </a>
          )}
          {imprintHref && (
            <a className="underline underline-offset-4 hover:text-ink" href={imprintHref}>
              {texts.imprint}
            </a>
          )}
        </p>
      )}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button onClick={acceptAll} variant="secondary">
          {texts.acceptAll}
        </Button>
        <Button onClick={rejectAll} variant="secondary">
          {texts.rejectAll}
        </Button>
      </div>
      <button
        className="mt-3 type-small text-ink-2 underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        onClick={openSettings}
        type="button"
      >
        {texts.openSettings}
      </button>
    </section>
  )
}
```

- [ ] **Step 4: Add the entrance animation to globals.css**

Append to `src/app/(frontend)/globals.css`:

```css
/* Consent banner and dialog entrances. */
@keyframes consent-rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.consent-enter {
  animation: consent-rise 300ms var(--ease-out-quart) both;
}
@keyframes consent-pop {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
dialog.consent-dialog[open] {
  animation: consent-pop 200ms var(--ease-out-quart) both;
}
dialog.consent-dialog::backdrop {
  background: oklch(0.145 0.005 260 / 0.4);
}
@media (prefers-reduced-motion: reduce) {
  .consent-enter,
  dialog.consent-dialog[open] {
    animation: none;
  }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: PASS (9 tests).

- [ ] **Step 6: Commit**

```bash
git add src/consent/components/ConsentBanner.tsx "src/app/(frontend)/globals.css" tests/int/consent-ui.int.spec.tsx
git commit -m "Consent: first-layer banner"
```

---

### Task 6: ConsentSettings dialog (second layer)

**Files:**
- Create: `src/consent/components/ConsentSettings.tsx`
- Test: `tests/int/consent-ui.int.spec.tsx` (add a describe block)

**Interfaces:**
- Consumes: `useConsent()` (Task 4), `Switch` (Task 4), `Button`.
- Produces: `ConsentSettings` (no props).

- [ ] **Step 1: Write the failing test**

Append to `tests/int/consent-ui.int.spec.tsx`:

```tsx
import { ConsentSettings } from '@/consent/components/ConsentSettings'

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, "Cannot find module '@/consent/components/ConsentSettings'".

- [ ] **Step 3: Write ConsentSettings.tsx**

```tsx
// src/consent/components/ConsentSettings.tsx
'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

import type { OptionalCategoryKey } from '../config'
import { allChoices, type Choices } from '../store'
import { useConsent } from './ConsentProvider'
import { Switch } from './Switch'

/**
 * Second layer: a native <dialog> (focus trap, Escape and top layer for free). One row per
 * category with a switch, description and a collapsible service list.
 */
export const ConsentSettings: React.FC = () => {
  const consent = useConsent()
  const { enabled, dialogOpen, texts, record, choices, locale, privacyHref, imprintHref } = consent
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const [draft, setDraft] = useState<Choices>(choices)

  useEffect(() => {
    if (dialogOpen) setDraft(record?.c || allChoices(false))
  }, [dialogOpen, record])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (dialogOpen && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } else if (!dialogOpen && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else dialog.removeAttribute('open')
    }
  }, [dialogOpen])

  if (!enabled) return null

  const lastChanged =
    record && !Number.isNaN(Date.parse(record.t))
      ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(record.t))
      : null

  return (
    <dialog
      aria-labelledby={titleId}
      className={cn(
        'consent-dialog fixed inset-x-0 bottom-0 m-0 w-full max-h-[85dvh] overflow-y-auto bg-surface text-ink border border-line shadow-float',
        'rounded-t-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
        'md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(34rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card md:p-7',
      )}
      onClose={consent.closeSettings}
      ref={ref}
    >
      <h2 className="type-h4" id={titleId}>
        {texts.settingsTitle}
      </h2>
      <p className="mt-2 type-small text-ink-2 pretty">{texts.settingsText}</p>
      <p className="mt-3 flex flex-wrap gap-x-4 type-caption text-ink-3">
        {privacyHref && (
          <a className="underline underline-offset-4 hover:text-ink" href={privacyHref}>
            {texts.privacy}
          </a>
        )}
        {imprintHref && (
          <a className="underline underline-offset-4 hover:text-ink" href={imprintHref}>
            {texts.imprint}
          </a>
        )}
        {lastChanged && (
          <span>
            {texts.lastChanged} {lastChanged}
          </span>
        )}
      </p>

      <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
        {texts.categories.map((category) => {
          const labelId = `${titleId}-${category.key}`
          const checked = category.required ? true : draft[category.key as OptionalCategoryKey]
          return (
            <li className="flex flex-col gap-2 py-4" key={category.key}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium" id={labelId}>
                  {category.label}
                  {category.required && <span className="ml-2 type-caption text-ink-3">{texts.alwaysActive}</span>}
                </span>
                <Switch
                  aria-labelledby={labelId}
                  checked={checked}
                  disabled={category.required}
                  onChange={(value) => setDraft((d) => ({ ...d, [category.key]: value }))}
                />
              </div>
              <p className="type-small text-ink-2 pretty">{category.description}</p>
              {category.services.length > 0 && (
                <details className="type-small">
                  <summary className="cursor-pointer text-ink-2 underline underline-offset-4 hover:text-ink">
                    {texts.showServices} ({category.services.length})
                  </summary>
                  <ul className="mt-2 flex flex-col gap-3">
                    {category.services.map((service) => (
                      <li className="rounded-card-inner bg-surface-2 p-3" key={service.name}>
                        <p className="font-medium">
                          {service.name}
                          {service.provider && <span className="font-normal text-ink-3"> · {service.provider}</span>}
                        </p>
                        {service.purpose && <p className="mt-1 text-ink-2">{service.purpose}</p>}
                        {service.cookies && (
                          <p className="mt-1 type-caption text-ink-3">
                            {texts.cookies}: {service.cookies}
                          </p>
                        )}
                        {service.privacyUrl && (
                          <a
                            className="mt-1 inline-block type-caption underline underline-offset-4 text-ink-3 hover:text-ink"
                            href={service.privacyUrl}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {texts.privacyLink}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
        <Button className="sm:flex-1" onClick={() => consent.save(draft)} variant="primary">
          {texts.saveSelection}
        </Button>
        <Button className="sm:flex-1" onClick={consent.acceptAll} variant="secondary">
          {texts.acceptAll}
        </Button>
        <Button className="sm:flex-1" onClick={consent.rejectAll} variant="secondary">
          {texts.rejectAll}
        </Button>
      </div>
    </dialog>
  )
}
```

Note: `rejectAll` in the dialog means "all optional categories off" and the button label is `texts.rejectAll` ("Nur notwendige"). The spec's "Alle ablehnen" wording maps to the same label to keep one term across both layers.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: PASS (11 tests).

- [ ] **Step 5: Commit**

```bash
git add src/consent/components/ConsentSettings.tsx tests/int/consent-ui.int.spec.tsx
git commit -m "Consent: settings dialog with categories and services"
```

---

### Task 7: TagManager, ConsentTrigger and layout wiring

**Files:**
- Create: `src/consent/components/TagManager.tsx`
- Create: `src/consent/components/ConsentTrigger.tsx`
- Modify: `src/providers/index.tsx`
- Modify: `src/app/(frontend)/[locale]/layout.tsx`
- Modify: `src/Footer/Component.tsx:88-119`
- Modify: `src/environment.d.ts` (add `NEXT_PUBLIC_GTM_ID`)
- Modify: `.env.example` (append a line)
- Test: `tests/int/consent-ui.int.spec.tsx` (add a describe block)

**Interfaces:**
- Consumes: `useConsent()`, `applyConsent`, `loadGtm`, `anyGranted`, `purgeCookies`, `track`, `installClickTracking`.
- Produces: `TagManager`, `ConsentTrigger` (props `{ className?: string }`); `Providers` gains prop `consent: { settings: Consent | null; gtmId?: string; disabled?: boolean }`.

- [ ] **Step 1: Write the failing test**

Append to `tests/int/consent-ui.int.spec.tsx`:

```tsx
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }))

import { TagManager } from '@/consent/components/TagManager'

describe('TagManager', () => {
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
```

Move the `import { beforeEach, describe, expect, it } from 'vitest'` at the top of the file to also import `beforeEach` and `vi` (one import line, no duplicates).

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, "Cannot find module '@/consent/components/TagManager'".

- [ ] **Step 3: Write TagManager.tsx and ConsentTrigger.tsx**

```tsx
// src/consent/components/TagManager.tsx
'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { optionalKeys } from '../config'
import { anyGranted, applyConsent, loadGtm } from '../consent-mode'
import { purgeCookies, type Choices } from '../store'
import { installClickTracking, track } from '../track'
import { useConsent } from './ConsentProvider'

/**
 * Headless. Applies every decision to Consent Mode, loads GTM once something is granted, reloads
 * on withdrawal (after purging that category's cookies), pushes page views and installs the
 * data-track click listener.
 */
export const TagManager: React.FC = () => {
  const { enabled, gtmId, status, record, locale } = useConsent()
  const pathname = usePathname()
  const previous = useRef<Choices | null>(null)

  useEffect(() => {
    if (!enabled || !gtmId || status !== 'decided' || !record) return
    const withdrawn = optionalKeys.filter((key) => previous.current?.[key] && !record.c[key])
    previous.current = record.c
    applyConsent(record.c)
    if (withdrawn.length > 0) {
      for (const key of withdrawn) purgeCookies(key)
      window.location.reload()
      return
    }
    if (anyGranted(record.c)) loadGtm(gtmId)
  }, [enabled, gtmId, status, record])

  useEffect(() => {
    if (!enabled || !pathname) return
    track({ name: 'page_view', params: { page_path: pathname, page_title: document.title, page_locale: locale } })
  }, [enabled, pathname, locale])

  useEffect(() => {
    if (!enabled) return
    return installClickTracking()
  }, [enabled])

  return null
}
```

```tsx
// src/consent/components/ConsentTrigger.tsx
'use client'

import React from 'react'

import { cn } from '@/utilities/ui'

import { useConsent } from './ConsentProvider'

/** "Cookie-Einstellungen" button for the footer; reopens the settings dialog at any time. */
export const ConsentTrigger: React.FC<{ className?: string }> = ({ className }) => {
  const { enabled, texts, openSettings } = useConsent()
  if (!enabled) return null
  return (
    <button
      className={cn('focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]', className)}
      onClick={openSettings}
      type="button"
    >
      {texts.cookieSettings}
    </button>
  )
}
```

- [ ] **Step 4: Wire Providers, layout, footer and env**

`src/providers/index.tsx`:

```tsx
import React from 'react'

import { ConsentProvider } from '@/consent/components/ConsentProvider'
import type { Locale } from '@/i18n/config'
import type { Consent } from '@/payload-types'

import { HeaderThemeProvider } from './HeaderTheme'
import { LocaleProvider } from './Locale'
import { ThemeProvider } from './Theme'

export type ConsentProps = { settings: Consent | null; gtmId?: string; disabled?: boolean }

export const Providers: React.FC<{
  children: React.ReactNode
  locale: Locale
  consent: ConsentProps
}> = ({ children, locale, consent }) => {
  return (
    <LocaleProvider locale={locale}>
      <ConsentProvider disabled={consent.disabled} gtmId={consent.gtmId} settings={consent.settings}>
        <ThemeProvider>
          <HeaderThemeProvider>{children}</HeaderThemeProvider>
        </ThemeProvider>
      </ConsentProvider>
    </LocaleProvider>
  )
}
```

`src/app/(frontend)/[locale]/layout.tsx`: add imports

```tsx
import { ConsentBanner } from '@/consent/components/ConsentBanner'
import { ConsentDefaults } from '@/consent/components/ConsentDefaults'
import { ConsentSettings } from '@/consent/components/ConsentSettings'
import { TagManager } from '@/consent/components/TagManager'
import { getCachedGlobal } from '@/utilities/getGlobals'
```

In `RootLayout`, after `const dict = getDictionary(locale)`:

```tsx
  const consentSettings = await getCachedGlobal('consent', 1, locale)()
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  const trackingEnabled = Boolean(gtmId && consentSettings?.enabled !== false && !isEnabled)
```

In `<head>`, after the intro-gate script: `<ConsentDefaults enabled={trackingEnabled} />`.

Replace `<Providers locale={locale}>` with:

```tsx
        <Providers consent={{ settings: consentSettings, gtmId, disabled: isEnabled }} locale={locale}>
```

After the skip link `</a>`: `<ConsentBanner />`. Before `<RevealObserver />`: `<ConsentSettings />` and `<TagManager />`.

`src/Footer/Component.tsx`: import `ConsentTrigger` from `@/consent/components/ConsentTrigger` and, inside the `flex flex-wrap items-center gap-x-6 gap-y-3` div, directly after the legal `</ul>` (or in its place when `legal.length === 0`), add:

```tsx
            <ConsentTrigger className="type-caption text-ink-3 transition-colors duration-150 hover:text-ink" />
```

`src/environment.d.ts`: add `NEXT_PUBLIC_GTM_ID?: string` to the `ProcessEnv` interface (open the file, add the key next to the other `NEXT_PUBLIC_*` entries).

`.env.example`: append

```
# Google Tag Manager container. Empty means no banner and no tracking.
NEXT_PUBLIC_GTM_ID=
```

- [ ] **Step 5: Run the tests, lint and type-check**

Run: `pnpm test:int && pnpm lint && pnpm exec tsc --noEmit`
Expected: all PASS, no errors.

- [ ] **Step 6: Check it in the browser**

Run: `pnpm dev` (or use the running Docker dev server). Set `NEXT_PUBLIC_GTM_ID=GTM-TEST` in `.env` first (restart the server; `NEXT_PUBLIC_` values are inlined at build).
Open `http://localhost:3000/de` in a fresh private window. Expected: banner bottom-left on desktop, full-width sheet at 400 px width; no request to `googletagmanager.com` in the network tab. Click "Nur notwendige": banner disappears, cookie `consent` set, still no GTM request. Open "Cookie-Einstellungen" in the footer, enable Statistik, save: `gtm.js?id=GTM-TEST` requested. Open again, disable Statistik, save: page reloads, `_ga` cookies gone.

- [ ] **Step 7: Commit**

```bash
git add src/consent/components/TagManager.tsx src/consent/components/ConsentTrigger.tsx src/providers/index.tsx "src/app/(frontend)/[locale]/layout.tsx" src/Footer/Component.tsx src/environment.d.ts .env.example tests/int/consent-ui.int.spec.tsx
git commit -m "Consent: tag manager, footer trigger and layout wiring"
```

---

### Task 8: CTA and form event wiring

**Files:**
- Modify: `src/components/Link/index.tsx`
- Modify: `src/blocks/Hero/Component.tsx:32-37`
- Modify: `src/blocks/CtaSection/Component.tsx:18-23`
- Modify: `src/blocks/PricingTeaser/Component.tsx:50-54`
- Modify: `src/Header/Component.client.tsx:85`
- Modify: `src/Header/Nav/MobileMenu.tsx:218`
- Modify: `src/blocks/Form/Component.tsx:101-102`
- Test: `tests/int/consent-ui.int.spec.tsx` (add a describe block)

**Interfaces:**
- Consumes: `track` (Task 2).
- Produces: `CMSLink` prop `track?: { location: string; label?: string }`.

- [ ] **Step 1: Write the failing test**

Append to `tests/int/consent-ui.int.spec.tsx`:

```tsx
import { CMSLink } from '@/components/Link'

describe('CMSLink track prop', () => {
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int -- tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, the anchor has no `data-track` attribute.

- [ ] **Step 3: Add the prop to CMSLink**

In `src/components/Link/index.tsx` add to `CMSLinkType`:

```ts
  /** Marks the link for click tracking (see src/consent/track.ts). */
  track?: { location: string; label?: string } | null
```

Destructure `track` in the component and build the attributes:

```tsx
  const trackProps = track
    ? { 'data-track': 'cta_click', 'data-track-location': track.location, 'data-track-label': track.label || label || undefined }
    : {}
```

and spread `{...trackProps}` onto `LocaleLink` next to `{...newTabProps}`.

- [ ] **Step 4: Pass locations from the blocks and header**

- `src/blocks/Hero/Component.tsx` inside the `buttons.map` `<CMSLink … />`: add `track={{ location: 'hero' }}`.
- `src/blocks/CtaSection/Component.tsx` inside the `buttons.map` `<CMSLink … />`: add `track={{ location: 'cta-section' }}`.
- `src/blocks/PricingTeaser/Component.tsx` plan button `<CMSLink {...button} …>`: add `track={{ location: 'pricing-teaser' }}`.
- `src/Header/Component.client.tsx` line 85 primary CTA: add `track={{ location: 'header' }}`.
- `src/Header/Nav/MobileMenu.tsx` line 218 primary CTA: add `track={{ location: 'mobile-menu' }}`.

- [ ] **Step 5: Track successful form submissions**

In `src/blocks/Form/Component.tsx` import `track` from `@/consent/track` and, right after `setHasSubmitted(true)`:

```ts
          track({
            name: 'generate_lead',
            params: { form_id: String(formID), form_name: formFromProps.title || String(formID) },
          })
```

Add `formFromProps.title` to the `useCallback` dependency array (`[router, formID, redirect, confirmationType, formFromProps.title]`).

- [ ] **Step 6: Run the tests, lint and type-check**

Run: `pnpm test:int && pnpm lint && pnpm exec tsc --noEmit`
Expected: all PASS, no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/Link/index.tsx src/blocks/Hero/Component.tsx src/blocks/CtaSection/Component.tsx src/blocks/PricingTeaser/Component.tsx src/Header/Component.client.tsx src/Header/Nav/MobileMenu.tsx src/blocks/Form/Component.tsx tests/int/consent-ui.int.spec.tsx
git commit -m "Tracking: CTA click attributes and form lead event"
```

---

### Task 9: Seed the consent global

**Files:**
- Create: `src/endpoints/seed/consent.ts`
- Modify: `src/endpoints/seed/index.ts:104-108,186`

**Interfaces:**
- Consumes: `Refs`, `pick`, `T` from `src/endpoints/seed/content.ts`; `upsertGlobal` in `index.ts`.
- Produces: `consentGlobal(t, refs)`.

- [ ] **Step 1: Write the seed builder**

```ts
// src/endpoints/seed/consent.ts
import type { Consent } from '@/payload-types'

import type { Refs } from './content'

type T = <V>(de: V, en: V) => V

/** Texts for the consent layer. Button labels come from src/consent/defaults.ts. */
export const consentGlobal = (t: T, refs: Refs): Partial<Consent> => ({
  enabled: true,
  revision: 1,
  privacyPage: refs.legal['privacy-policy'],
  imprintPage: refs.legal.imprint,
  banner: {
    title: t('Cookies auf dieser Website', 'Cookies on this website'),
    text: t(
      'Wir verwenden Cookies nur mit Ihrer Zustimmung, um zu verstehen, wie die Website genutzt wird. Ohne Ihre Zustimmung wird nichts erfasst.',
      'We only use cookies with your consent, to understand how the website is used. Nothing is recorded without your consent.',
    ),
  },
  settings: {
    title: t('Cookie-Einstellungen', 'Cookie settings'),
    text: t(
      'Wählen Sie, welche Kategorien Sie erlauben. Ihre Auswahl können Sie jederzeit über den Link in der Fußzeile ändern.',
      'Choose which categories you allow. You can change your selection at any time via the link in the footer.',
    ),
  },
  categories: [
    {
      key: 'necessary',
      label: t('Notwendig', 'Necessary'),
      description: t(
        'Für den Betrieb der Website erforderlich, etwa um Ihre Cookie-Auswahl zu speichern.',
        'Required to run the website, for example to remember your cookie choice.',
      ),
      services: [
        {
          name: t('Cookie-Auswahl', 'Cookie choice'),
          provider: 'Indicate Data GmbH',
          purpose: t('Speichert Ihre Entscheidung zu Cookies.', 'Stores your cookie decision.'),
          cookies: t('consent · 12 Monate', 'consent · 12 months'),
        },
      ],
    },
    {
      key: 'analytics',
      label: t('Statistik', 'Statistics'),
      description: t(
        'Hilft uns zu verstehen, welche Seiten besucht werden. Die Daten werden anonymisiert ausgewertet.',
        'Helps us understand which pages are visited. Data is evaluated anonymously.',
      ),
      services: [
        {
          name: 'Google Analytics 4',
          provider: 'Google Ireland Limited',
          purpose: t(
            'Reichweitenmessung und Analyse der Nutzung unserer Website.',
            'Reach measurement and analysis of the use of our website.',
          ),
          cookies: t('_ga, _ga_* · 2 Jahre', '_ga, _ga_* · 2 years'),
          privacyUrl: 'https://policies.google.com/privacy',
        },
      ],
    },
    {
      key: 'marketing',
      label: t('Marketing', 'Marketing'),
      description: t(
        'Ermöglicht es, den Erfolg unserer Kampagnen zu messen und Ihnen relevante Inhalte zu zeigen. Derzeit nicht im Einsatz.',
        'Lets us measure our campaigns and show you relevant content. Not in use at the moment.',
      ),
      services: [],
    },
  ],
})
```

If `refs.legal` ids are typed `number` and the relationship expects `number | Page`, this assigns cleanly. `service.name` is not localised in the global, so the `t()` on the necessary service name only affects the primary locale; that is acceptable ("Cookie-Auswahl" is fine in both).

- [ ] **Step 2: Call it from the seed**

In `src/endpoints/seed/index.ts`: import `{ consentGlobal } from './consent'`; after the footer upsert (line 107) add:

```ts
  await upsertGlobal(payload, req, 'consent', (locale) => consentGlobal(pick(locale), refs))
```

Widen the `slug` parameter of `upsertGlobal` (line 186) to `'site-settings' | 'header' | 'footer' | 'consent'`.

- [ ] **Step 3: Run the seed and verify**

Run the seed the way the project does (see memory: host scripts need `NODE_ENV=production`; clear `.next/dev/cache/fetch-cache` afterwards). Then run: `pnpm exec tsc --noEmit`.
Open `/admin/globals/consent`: banner texts and three categories present, GA4 listed under Statistik. Open `/de` in a private window: the banner shows the seeded German text.

- [ ] **Step 4: Commit**

```bash
git add src/endpoints/seed/consent.ts src/endpoints/seed/index.ts
git commit -m "Seed: consent global texts and services"
```

---

### Task 10: End-to-end test, e2e helper and README

**Files:**
- Create: `tests/helpers/consent.ts`
- Create: `tests/e2e/consent.e2e.spec.ts`
- Modify: `tests/e2e/frontend.e2e.spec.ts` (preset the cookie)
- Create: `src/consent/README.md`

- [ ] **Step 1: Write the helper and the e2e test**

```ts
// tests/helpers/consent.ts
import type { BrowserContext } from '@playwright/test'

/** Presets the consent cookie so the banner does not block other tests. */
export async function presetConsent(context: BrowserContext, granted = false): Promise<void> {
  const record = { v: 1, t: new Date().toISOString(), c: { analytics: granted, marketing: granted } }
  await context.addCookies([
    {
      name: 'consent',
      value: encodeURIComponent(JSON.stringify(record)),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
  ])
}
```

```ts
// tests/e2e/consent.e2e.spec.ts
import { expect, test } from '@playwright/test'

const base = 'http://localhost:3000'
const skipWithoutGtm = () => test.skip(!process.env.NEXT_PUBLIC_GTM_ID, 'NEXT_PUBLIC_GTM_ID not set')

test.describe('Cookie consent', () => {
  test('first visit shows the banner and reject loads nothing', async ({ page }) => {
    skipWithoutGtm()
    const gtmRequests: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('googletagmanager.com')) gtmRequests.push(req.url())
    })
    await page.goto(`${base}/de`)
    const banner = page.getByRole('region', { name: /Cookies/ })
    await expect(banner).toBeVisible()
    await banner.getByRole('button', { name: 'Nur notwendige' }).click()
    await expect(banner).toBeHidden()
    await page.waitForTimeout(500)
    expect(gtmRequests).toHaveLength(0)
    const cookies = await page.context().cookies()
    expect(cookies.find((c) => c.name === 'consent')).toBeTruthy()
    expect(cookies.find((c) => c.name.startsWith('_ga'))).toBeUndefined()
  })

  test('accept loads GTM', async ({ page }) => {
    skipWithoutGtm()
    const gtm = page.waitForRequest((req) => req.url().includes('googletagmanager.com/gtm.js'))
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Alle akzeptieren' }).click()
    await gtm
  })

  test('footer link reopens the settings', async ({ page }) => {
    skipWithoutGtm()
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Nur notwendige' }).click()
    await page.getByRole('button', { name: 'Cookie-Einstellungen' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('switch').first()).toHaveAttribute('aria-disabled', 'true')
  })
})
```

In `tests/e2e/frontend.e2e.spec.ts` add at the top:

```ts
import { presetConsent } from '../helpers/consent'

test.beforeEach(async ({ context }) => {
  await presetConsent(context)
})
```

- [ ] **Step 2: Run the e2e tests**

Run: `NEXT_PUBLIC_GTM_ID=GTM-TEST pnpm test:e2e -- tests/e2e/consent.e2e.spec.ts tests/e2e/frontend.e2e.spec.ts` (against a dev server started with the same env).
Expected: PASS. The `gtm.js` request may 404 for a fake id; the test only waits for the request, not the response.

- [ ] **Step 3: Write the README**

```markdown
<!-- src/consent/README.md -->
# Consent and tracking module

Cookie consent (GDPR / TDDDG), Google Consent Mode v2, GTM loaded only after consent, a typed
event helper. Self-contained: copy this folder into another Payload + Next.js project.

## Drop-in checklist

1. Copy `src/consent` (this folder). It imports `@/components/ui/button`, `@/utilities/ui` (`cn`),
   `@/providers/Locale` (`useLocale`), `@/i18n/config` (`Locale`) and `@/payload-types`.
2. Payload config: `globals: [..., Consent]` from `./consent/global`. Run `payload generate:types`
   and `payload generate:importmap`.
3. Layout `<head>`: `<ConsentDefaults enabled={trackingEnabled} />` where
   `trackingEnabled = Boolean(gtmId && settings?.enabled !== false && !draftMode)`.
4. Wrap the tree in `<ConsentProvider settings={global} gtmId={process.env.NEXT_PUBLIC_GTM_ID} disabled={draftMode}>`
   inside your locale provider. Fetch the global with `depth: 1` so page links resolve.
5. Render `<ConsentBanner />` right after the skip link, `<ConsentSettings />` and `<TagManager />`
   near the end of `<body>`. Put `<ConsentTrigger />` in the footer.
6. Set `NEXT_PUBLIC_GTM_ID` (empty = no banner, no tracking). Never put the id in the CMS: a copied
   staging database must not report into production.
7. Add `.consent-enter`, `.consent-dialog` keyframes to your global CSS (see this project's `globals.css`).
8. Seed the global or fill it in the admin. Everything falls back to `defaults.ts` when empty.

## Events

- `track({ name, params })` from `./track` pushes to the dataLayer. Built-ins: `page_view`
  (automatic on navigation), `cta_click`, `outbound_click`, `generate_lead` (form block).
- Any element with `data-track` is tracked on click: `data-track="cta_click"` (default),
  `data-track-label`, `data-track-location`. `CMSLink` takes `track={{ location, label? }}`.
- Pushing before consent is harmless: the dataLayer is local, only GTM sends data, GTM only loads
  after consent, and it processes the queue when it loads.

## GTM container setup

1. Admin → Container settings → enable consent overview.
2. Tag "GA4 configuration": Measurement ID; "Send a page view event when this configuration loads" off;
   Consent settings → additional consent checks: `analytics_storage`; trigger: Custom Event `page_view`.
3. Tags "GA4 event" for `cta_click`, `generate_lead`, `outbound_click`: trigger Custom Event with the
   same name; parameters from Data Layer Variables `label`, `location`, `href`, `form_id`, `form_name`;
   consent check `analytics_storage`.
4. Google Ads / remarketing tags: consent check `ad_storage` (and `ad_user_data`, `ad_personalization`
   are sent automatically by Consent Mode). Add the service to the marketing category in the CMS and
   raise the revision.
5. Do not add the GTM snippet or the noscript iframe to the page yourself.

## GA4 property checklist

- Google Signals off until marketing consent is in use.
- Data retention: 2 months.
- Granular location and device data: review for EU.
- No user-id, no PII in event parameters.

## Adding a category or tracker

- Category: add to `consentConfig.categories` in `config.ts` (key, signals, purge patterns), add
  label/description to both locales in `defaults.ts`, add the key to the `key` select in `global.ts`.
- Tracker: service entry under its category in the CMS, tag in GTM with the matching consent check,
  raise `revision` so visitors are asked again.

## What the banner must keep

Accept and reject with identical styling on the first layer; no pre-ticked boxes; "necessary"
locked on; withdrawal via the footer link; a record with timestamp and revision; links to privacy
and imprint reachable from the banner. The privacy and cookie policy pages must list the services.
```

- [ ] **Step 4: Run everything, then commit**

Run: `pnpm test:int && pnpm lint && pnpm exec tsc --noEmit`
Expected: all PASS.

```bash
git add tests/helpers/consent.ts tests/e2e/consent.e2e.spec.ts tests/e2e/frontend.e2e.spec.ts src/consent/README.md
git commit -m "Consent: e2e tests, test helper and module README"
```

---

## Self-review

- Spec coverage: config (T1), record (T1), global and fallbacks (T3), Consent Mode + GTM + no noscript (T2, T4, T7), withdrawal purge + reload (T7), events and click attribute (T2, T8), CMSLink prop and block wiring (T8), form lead (T8), banner (T5), dialog (T6), trigger and footer (T7), locale (T3, T4), layout and providers (T7), seed (T9), tests (T1, T2, T3-T8, T10), README (T10). Draft mode disables via `disabled` (T7). Env documented (T7).
- The spec names the dialog's third button "Alle ablehnen"; the plan uses the same label as the first layer ("Nur notwendige") to keep one term. Recorded in Task 6.
- Type names used consistently: `Choices`, `ConsentRecord`, `ConsentTexts`, `ResolvedConsent`, `ConsentContextValue`, `TrackEvent`, `OptionalCategoryKey`.
