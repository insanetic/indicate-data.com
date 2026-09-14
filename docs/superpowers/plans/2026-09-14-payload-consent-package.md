# `@subneo/payload-consent` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `src/consent` with an in-repo package `packages/payload-plugin-consent` (`@subneo/payload-consent`) that any Payload + Next.js site can drop in: plugin, integration registry (GTM first), configurable trigger, hash opener, server-side consent log and `ConsentGate`.

**Architecture:** A plain setup object (`defineConsent`) describes categories and integrations and is imported by both `payload.config.ts` and a client wrapper. The plugin derives the global, the log collection and the endpoint from it. The React layer is a provider plus small components that take the site's Button and class names through props. A runner applies decisions to integrations; nothing loads before a grant.

**Tech Stack:** Payload 3.89, Next 16.3 (App Router), React 19.2, TypeScript, Tailwind (site only), Vitest + Testing Library (jsdom), Playwright.

**Spec:** `docs/superpowers/specs/2026-09-14-payload-consent-package-design.md`

## Global Constraints

- Package imports nothing from `@/`. Peer deps `next >=15`, `payload ^3.0.0`, `react ^19`. MIT.
- Consumed through tsconfig path aliases only, no pnpm workspace change, Docker `pnpm install --frozen-lockfile` untouched.
- Schema changes to the `consent` global are additive only (new `trigger` group, new `services[].integration` select, new `consent-logs` collection). Never remove or rename a field.
- Basic Consent Mode: no Google script loads before a grant. Consent Mode defaults grant only `functionality_storage` and `security_storage`.
- No IP address, no user agent in the consent log.
- Accept and reject buttons identical on the first layer; no pre-ticked boxes; the settings draft is all off while pending.
- Click tracking listener in the capture phase.
- Cookie name `consent`, `Max-Age` 365 days default, `SameSite=Lax`, `Secure` on https.
- Copy rules: formal "Sie" in German; the agent name "Resi" never appears in consent copy.
- Host-side Payload scripts: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload` (Docker dev server, no TTY, see memory `docker-dev-schema-push`).
- Run int tests with `pnpm test:int <file>`; type-check with `pnpm exec tsc --noEmit`; lint with `pnpm lint`.
- Commit after every task. Before any branch operation run `git status` and treat unknown dirty files as another session's work (memory `parallel-sessions-shared-checkout`). Work on `main` as the previous consent work did.

## Deviation from the spec (recorded in the spec, section 4.1)

`gtm({ containerId })` never returns `null`. It returns an integration with `enabled: false` when the id is empty. Reason: the `services[].integration` select lists every registered integration, and a staging database seeded with `integration: 'gtm'` must still pass select validation when staging has no container id. `defineConsent` exposes `activeIntegrations` (enabled only); bootstrap, runner and the service-row rule use the active list.

## File map

Package `packages/payload-plugin-consent/`:

| File | Responsibility |
| --- | --- |
| `package.json`, `LICENSE`, `tsconfig.json`, `README.md` | Package metadata, docs |
| `src/setup.ts` | `defineConsent`, `createIntegration`, all shared types |
| `src/store.ts` | Consent record, cookie read/write, `needsDecision`, `purgeCookies`, `registrableDomain`, `newRecordId` |
| `src/consent-mode.ts` | `signalsFor`, `consentModeBootstrap`, `gtag` fallback |
| `src/track.ts` | `track`, `installClickTracking` |
| `src/integrations/gtm.ts` | `gtm()`, `loadGtm`, `isGtmLoaded` |
| `src/defaults.ts` | de/en strings, `stringsFor`, `fill`, `resolveConsent`, `textsHash` |
| `src/global.ts` | `createConsentGlobal`, `validateCategoryRows`, `missingServiceRows` |
| `src/logs.ts` | `createConsentLogsCollection`, `createLogEndpoint`, `parseLogBody` |
| `src/hooks/revalidate.ts` | `createRevalidateHook` |
| `src/plugin.ts` | `consentPlugin` |
| `src/index.ts` | Server-safe barrel |
| `src/admin.ts` + `src/components/RowLabels.tsx` | `CategoryRowLabel`, `ServiceRowLabel` |
| `src/react.ts` | Client barrel |
| `src/components/ConsentProvider.tsx` | State, decide, log call, hash opener, components and classNames context |
| `src/components/ConsentDefaults.tsx` | Head script from integration bootstraps |
| `src/components/DefaultButton.tsx` | Fallback button |
| `src/components/ConsentBanner.tsx` | First layer |
| `src/components/Switch.tsx` | role="switch" button |
| `src/components/ConsentSettings.tsx` | Second layer dialog |
| `src/components/ConsentTrigger.tsx` | Headless trigger, `asChild` |
| `src/components/FloatingTrigger.tsx` | Floating fingerprint button |
| `src/components/ConsentGate.tsx` | Embed gate |
| `src/components/ConsentRunner.tsx` | Applies decisions to integrations, page views, click tracking |
| `src/styles.css` | Default look for sites without a design system |

Site:

| File | Change |
| --- | --- |
| `tsconfig.json` | Four path aliases |
| `src/consent/setup.ts` | This site's `defineConsent` |
| `src/consent/classNames.ts` | Tailwind classes per slot |
| `src/consent/ConsentRoot.tsx` | Client wrapper: setup + Button + classNames into the provider |
| `src/payload.config.ts` | `consentPlugin(consentSetup)`, `Consent` global removed from `globals` |
| `src/providers/index.tsx` | `ConsentRoot` replaces `ConsentProvider` |
| `src/app/(frontend)/[locale]/layout.tsx` | New imports, `FloatingTrigger`, `ConsentRunner` |
| `src/Footer/Component.tsx` | Trigger inside the legal list |
| `src/blocks/Form/Component.tsx`, `src/components/Link/index.tsx` | Import `track` from the package |
| `src/endpoints/seed/consent.ts` | Trigger, integration key, new texts |
| `src/app/(frontend)/globals.css` | Fold the consent reduced-motion block |
| `src/consent/{components,hooks,*.ts,*.tsx,README.md}` (old module) | Deleted |
| `tests/int/consent-*.int.spec.ts*` | Rewritten against the package |
| `tests/e2e/consent.e2e.spec.ts`, `tests/e2e/frontend.e2e.spec.ts`, `tests/helpers/consent.ts` | Updated |
| `docs/superpowers/handoffs/2026-09-14-consent-tracking-handoff.md` | Go-live list updated |

---

### Task 1: Package scaffold and `defineConsent`

**Files:**
- Create: `packages/payload-plugin-consent/package.json`, `LICENSE`, `tsconfig.json`, `src/setup.ts`, `src/index.ts`
- Modify: `tsconfig.json` (site, `compilerOptions.paths`)
- Test: `tests/int/consent-setup.int.spec.ts`

**Interfaces:**
- Produces: `defineConsent(setup: ConsentSetup): ResolvedSetup`, `createIntegration`, types `ConsentIntegration`, `IntegrationContext`, `CategoryConfig`, `Choices`, `ConsentModeSignal`, `ConsentModeSignals`, `ResolvedSetup`.

- [ ] **Step 1: Add the path aliases to the site tsconfig**

In `tsconfig.json`, inside `compilerOptions.paths`, after the `@subneo/payload-pricing` entry add:

```json
"@subneo/payload-consent": ["./packages/payload-plugin-consent/src/index.ts"],
"@subneo/payload-consent/react": ["./packages/payload-plugin-consent/src/react.ts"],
"@subneo/payload-consent/admin": ["./packages/payload-plugin-consent/src/admin.ts"],
"@subneo/payload-consent/integrations/*": ["./packages/payload-plugin-consent/src/integrations/*.ts"]
```

- [ ] **Step 2: Create package metadata**

`packages/payload-plugin-consent/package.json`:

```json
{
  "name": "@subneo/payload-consent",
  "version": "0.1.0",
  "description": "Cookie consent for Payload CMS + Next.js: CMS-edited texts, integration registry, Google Consent Mode, consent log, embed gate.",
  "license": "MIT",
  "type": "module",
  "sideEffects": ["./src/styles.css"],
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./react": "./src/react.ts",
    "./admin": "./src/admin.ts",
    "./integrations/*": "./src/integrations/*.ts",
    "./styles.css": "./src/styles.css"
  },
  "files": ["src", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "peerDependencies": {
    "next": ">=15",
    "payload": "^3.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  },
  "publishConfig": {
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
      "./react": { "types": "./dist/react.d.ts", "import": "./dist/react.js" },
      "./admin": { "types": "./dist/admin.d.ts", "import": "./dist/admin.js" },
      "./integrations/*": { "types": "./dist/integrations/*.d.ts", "import": "./dist/integrations/*.js" },
      "./styles.css": "./dist/styles.css"
    }
  }
}
```

`packages/payload-plugin-consent/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

`packages/payload-plugin-consent/LICENSE`: copy `packages/payload-plugin-subneo-pricing/LICENSE` verbatim (MIT, same holder).

- [ ] **Step 3: Write the failing setup test**

`tests/int/consent-setup.int.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { createIntegration, defineConsent, type ConsentIntegration } from '@subneo/payload-consent'

const noop = () => {}

const fake = (key: string, category: string, enabled = true): ConsentIntegration =>
  createIntegration({
    key,
    category,
    enabled,
    cookies: [new RegExp(`^_${key}`)],
    load: noop,
    service: { name: key.toUpperCase() },
  })

const categories = [
  { key: 'necessary', required: true, texts: { de: { label: 'Notwendig', description: 'n' }, en: { label: 'Necessary', description: 'n' } } },
  { key: 'analytics', signals: ['analytics_storage' as const], texts: { de: { label: 'Statistik', description: 's' }, en: { label: 'Statistics', description: 's' } } },
  { key: 'marketing', texts: { de: { label: 'Marketing', description: 'm' }, en: { label: 'Marketing', description: 'm' } } },
]

describe('defineConsent', () => {
  it('fills defaults and derives keys and helpers', () => {
    const setup = defineConsent({ categories, integrations: [fake('gtm', 'analytics'), fake('pixel', 'marketing', false)] })
    expect(setup.cookieName).toBe('consent')
    expect(setup.maxAgeDays).toBe(365)
    expect(setup.logging).toBe(false)
    expect(setup.requiredKey).toBe('necessary')
    expect(setup.optionalKeys).toEqual(['analytics', 'marketing'])
    expect(setup.activeIntegrations.map((i) => i.key)).toEqual(['gtm'])
    expect(setup.integrationsFor('analytics').map((i) => i.key)).toEqual(['gtm'])
    expect(setup.purgePatternsFor('marketing').map(String)).toEqual(['/^_pixel/'])
    expect(setup.purgePatternsFor('necessary')).toEqual([])
  })

  it('rejects duplicate category keys', () => {
    expect(() => defineConsent({ categories: [...categories, categories[1]], integrations: [] })).toThrow(/duplicate category/)
  })

  it('requires exactly one required category', () => {
    expect(() => defineConsent({ categories: categories.slice(1), integrations: [] })).toThrow(/exactly one/)
  })

  it('rejects integrations that target unknown or required categories', () => {
    expect(() => defineConsent({ categories, integrations: [fake('x', 'nope')] })).toThrow(/unknown or required category/)
    expect(() => defineConsent({ categories, integrations: [fake('x', 'necessary')] })).toThrow(/unknown or required category/)
  })

  it('rejects duplicate integration keys', () => {
    expect(() => defineConsent({ categories, integrations: [fake('gtm', 'analytics'), fake('gtm', 'marketing')] })).toThrow(
      /duplicate integration/,
    )
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-setup.int.spec.ts`
Expected: FAIL, cannot resolve `@subneo/payload-consent`.

- [ ] **Step 5: Implement `setup.ts` and the barrel**

`packages/payload-plugin-consent/src/setup.ts`:

```ts
/** Google Consent Mode v2 signals a category can grant. */
export type ConsentModeSignal = 'ad_storage' | 'ad_user_data' | 'ad_personalization' | 'analytics_storage'
export type ConsentModeSignals = Record<ConsentModeSignal, 'granted' | 'denied'>

/** One boolean per optional category key. */
export type Choices = Record<string, boolean>

export type CategoryTexts = { label: string; description: string }

export type CategoryConfig = {
  key: string
  /** Exactly one category is required; it is always on and cannot be withdrawn. */
  required?: boolean
  /** Consent Mode signals set to "granted" when this category is granted. */
  signals?: readonly ConsentModeSignal[]
  /** Default label and description per base language; CMS rows override field by field. */
  texts: Record<string, CategoryTexts>
}

export type IntegrationContext = { choices: Choices; locale: string; signals: ConsentModeSignals }

export type ConsentIntegration = {
  /** Stable identifier, also the value of the service row's `integration` select. */
  key: string
  /** Optional category this integration needs. */
  category: string
  /** False keeps the integration registered (select options, docs) but never loads it. Default true. */
  enabled?: boolean
  /** Cookie name patterns removed when the category is withdrawn or the record is invalidated. */
  cookies: readonly RegExp[]
  /** Inline head script that runs before hydration when the layer is enabled (e.g. Consent Mode defaults). */
  bootstrap?: string
  /** Called once per page load after a decision that grants `category`. Must be idempotent. */
  load: (ctx: IntegrationContext) => void
  /** Called on every decision after `load` (e.g. `gtag('consent','update')`). */
  update?: (ctx: IntegrationContext) => void
  /** Prefilled admin labels for the service row. */
  service: { name: string; provider?: string; privacyUrl?: string }
}

export type ConsentSetup = {
  /** Cookie holding the consent record. Default `consent`. */
  cookieName?: string
  /** Validity of a decision. Default 365; 180 is the strictest common reading. */
  maxAgeDays?: number
  categories: readonly CategoryConfig[]
  integrations: readonly ConsentIntegration[]
  /** Adds the `consent-logs` collection and `POST /api/consent/log`. */
  logging?: boolean
}

export type ResolvedSetup = {
  cookieName: string
  maxAgeDays: number
  categories: readonly CategoryConfig[]
  integrations: readonly ConsentIntegration[]
  activeIntegrations: readonly ConsentIntegration[]
  logging: boolean
  requiredKey: string
  optionalKeys: readonly string[]
  integrationsFor: (category: string) => readonly ConsentIntegration[]
  /** Cookie patterns of every active integration in the category. */
  purgePatternsFor: (category: string) => readonly RegExp[]
}

/** Validates a site's consent setup once, at import time, and derives the helpers the runtime uses. */
export function defineConsent(setup: ConsentSetup): ResolvedSetup {
  const keys = setup.categories.map((c) => c.key)
  if (new Set(keys).size !== keys.length) throw new Error('consent: duplicate category keys')
  const required = setup.categories.filter((c) => c.required)
  if (required.length !== 1) throw new Error('consent: exactly one category must be required')
  const optionalKeys = setup.categories.filter((c) => !c.required).map((c) => c.key)

  const integrationKeys = setup.integrations.map((i) => i.key)
  if (new Set(integrationKeys).size !== integrationKeys.length) throw new Error('consent: duplicate integration keys')
  for (const integration of setup.integrations) {
    if (!optionalKeys.includes(integration.category)) {
      throw new Error(
        `consent: integration "${integration.key}" targets unknown or required category "${integration.category}"`,
      )
    }
  }

  const activeIntegrations = setup.integrations.filter((i) => i.enabled !== false)
  const integrationsFor = (category: string) => activeIntegrations.filter((i) => i.category === category)

  return {
    cookieName: setup.cookieName || 'consent',
    maxAgeDays: setup.maxAgeDays ?? 365,
    categories: setup.categories,
    integrations: setup.integrations,
    activeIntegrations,
    logging: Boolean(setup.logging),
    requiredKey: required[0].key,
    optionalKeys,
    integrationsFor,
    purgePatternsFor: (category) => integrationsFor(category).flatMap((i) => i.cookies),
  }
}

/** Typed identity helper for integration files. */
export const createIntegration = <T extends ConsentIntegration>(integration: T): T => integration
```

`packages/payload-plugin-consent/src/index.ts` (grows in later tasks):

```ts
export * from './setup'
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-setup.int.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json packages/payload-plugin-consent tests/int/consent-setup.int.spec.ts
git commit -m "Consent package: scaffold and defineConsent"
```

---

### Task 2: Store with record id and generic purge

**Files:**
- Create: `packages/payload-plugin-consent/src/store.ts`
- Modify: `packages/payload-plugin-consent/src/index.ts`
- Test: `tests/int/consent-store.int.spec.ts` (rewrite; the old file imports `@/consent/store`)

**Interfaces:**
- Consumes: `ResolvedSetup`, `Choices` from Task 1.
- Produces: `ConsentRecord = { id?: string; v: number; t: string; c: Choices }`, `allChoices(setup, value)`, `parseRecord(setup, raw)`, `serializeRecord(record)`, `readRecord(setup)`, `writeRecord(setup, record)`, `needsDecision(setup, record, revision, now?)`, `purgeCookies(patterns)`, `registrableDomain(host)`, `newRecordId()`.

- [ ] **Step 1: Rewrite the store test**

Replace `tests/int/consent-store.int.spec.ts` with:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-store.int.spec.ts`
Expected: FAIL, the package has no `store` exports.

- [ ] **Step 3: Implement `store.ts`**

`packages/payload-plugin-consent/src/store.ts`:

```ts
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
    if (typeof parsed.v !== 'number' || typeof parsed.t !== 'string' || typeof parsed.c !== 'object' || !parsed.c) return null
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
export function needsDecision(setup: ResolvedSetup, record: ConsentRecord | null, revision: number, now = Date.now()): boolean {
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
```

Append to `src/index.ts`:

```ts
export * from './store'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-store.int.spec.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-consent/src tests/int/consent-store.int.spec.ts
git commit -m "Consent package: record store with id and generic purge"
```

---

### Task 3: Consent Mode, tracking and the GTM integration

**Files:**
- Create: `packages/payload-plugin-consent/src/consent-mode.ts`, `src/track.ts`, `src/integrations/gtm.ts`
- Modify: `packages/payload-plugin-consent/src/index.ts`
- Test: `tests/int/consent-mode.int.spec.ts` (rewrite)

**Interfaces:**
- Consumes: `ResolvedSetup`, `Choices`, `ConsentModeSignal(s)`, `createIntegration` from Task 1.
- Produces: `ALL_SIGNALS`, `signalsFor(setup, choices): ConsentModeSignals`, `consentModeBootstrap(): string`, `gtag(...args)`, `track(event)`, `installClickTracking(): () => void`, `TrackEvent`, `gtm({ containerId, category? }): ConsentIntegration`, `loadGtm(id)`, `isGtmLoaded()`.

- [ ] **Step 1: Rewrite the Consent Mode test**

Replace `tests/int/consent-mode.int.spec.ts` with:

```ts
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
  it('is disabled without a container id and enabled with one', () => {
    expect(gtm({ containerId: undefined }).enabled).toBe(false)
    expect(gtm({ containerId: '' }).enabled).toBe(false)
    const active = gtm({ containerId: 'GTM-TEST' })
    expect(active.enabled).toBe(true)
    expect(active.key).toBe('gtm')
    expect(active.category).toBe('analytics')
    expect(active.bootstrap).toBe(consentModeBootstrap())
    expect(['_ga', '_ga_ABC', '_gid', '_gat_UA', '_gac_1', '_gcl_au'].every((n) => active.cookies.some((p) => p.test(n)))).toBe(true)
    expect(active.cookies.some((p) => p.test('keep'))).toBe(false)
  })

  it('loads the script once and updates consent mode', () => {
    const integration = gtm({ containerId: 'GTM-TEST' })
    const ctx = { choices: { analytics: true, marketing: false }, locale: 'de', signals: signalsFor(setup, { analytics: true, marketing: false }) }
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
      '<button data-track="outbound_click" data-track-label="Docs">Docs</button>'
    const preventNavigation = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('click', preventNavigation)
    const stopBubbling = (e: Event) => e.stopPropagation()
    document.querySelector('span')!.addEventListener('click', stopBubbling)
    const stop = installClickTracking()
    try {
      document.querySelector('span')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      expect(dl().at(-1)).toEqual({ event: 'cta_click', label: 'Demo buchen', location: 'hero', href: '/demo' })
      document.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
      expect(dl().at(-1)).toEqual({ event: 'outbound_click', label: 'Docs' })
    } finally {
      stop()
      document.removeEventListener('click', preventNavigation)
      document.body.innerHTML = ''
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-mode.int.spec.ts`
Expected: FAIL, missing exports / module `@subneo/payload-consent/integrations/gtm`.

- [ ] **Step 3: Implement `consent-mode.ts`**

`packages/payload-plugin-consent/src/consent-mode.ts`:

```ts
import type { Choices, ConsentModeSignal, ConsentModeSignals, ResolvedSetup } from './setup'

type GtagFn = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: GtagFn
  }
}

export const ALL_SIGNALS: readonly ConsentModeSignal[] = [
  'ad_storage',
  'ad_user_data',
  'ad_personalization',
  'analytics_storage',
]

/**
 * Inline script for <head>, before any other script: creates the dataLayer and gtag, sets every
 * Consent Mode signal to denied. Only storage the site itself needs is granted.
 */
export function consentModeBootstrap(): string {
  const denied = [...ALL_SIGNALS, 'personalization_storage'].map((s) => `${s}:'denied'`).join(',')
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments)}',
    'window.gtag=gtag;',
    `gtag('consent','default',{${denied},functionality_storage:'granted',security_storage:'granted',wait_for_update:0});`,
    "gtag('set','ads_data_redaction',true);",
  ].join('')
}

export function signalsFor(setup: ResolvedSetup, choices: Choices): ConsentModeSignals {
  const out = Object.fromEntries(ALL_SIGNALS.map((s) => [s, 'denied'])) as ConsentModeSignals
  for (const category of setup.categories) {
    if (category.required || !choices[category.key]) continue
    for (const signal of category.signals || []) out[signal] = 'granted'
  }
  return out
}

/** Calls window.gtag, creating the dataLayer-backed fallback when the head script did not run. */
export function gtag(...args: unknown[]): void {
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
```

- [ ] **Step 4: Implement `track.ts`**

`packages/payload-plugin-consent/src/track.ts`:

```ts
type Params = Record<string, string | number | boolean | undefined>

export type TrackEvent =
  | { name: 'page_view'; params: { page_path: string; page_title: string; page_locale: string } }
  | { name: 'cta_click'; params: { label: string; location?: string; href?: string } }
  | { name: 'outbound_click'; params: { href: string; label?: string } }
  | { name: 'generate_lead'; params: { form_id: string; form_name: string } }
  | { name: string; params?: Params }

/**
 * Pushes an event to the dataLayer. The dataLayer exists only when an integration's bootstrap
 * created it, so without one this is a no-op. Data leaves the browser only through an integration,
 * which loads only after consent; pushing before a decision is harmless and lets the integration
 * process the queue once loaded.
 */
export function track(event: TrackEvent): void {
  if (typeof window === 'undefined' || !window.dataLayer) return
  const params: Params = {}
  for (const [key, value] of Object.entries(event.params || {})) if (value !== undefined) params[key] = value
  window.dataLayer.push({ event: event.name, ...params })
}

/**
 * One delegated capture-phase listener: any element with `data-track` (event name, default
 * cta_click) pushes its label (`data-track-label` or text), location (`data-track-location`) and href.
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
  document.addEventListener('click', onClick, { capture: true })
  return () => document.removeEventListener('click', onClick, { capture: true })
}
```

- [ ] **Step 5: Implement the GTM integration**

`packages/payload-plugin-consent/src/integrations/gtm.ts`:

```ts
import { consentModeBootstrap, gtag } from '../consent-mode'
import { createIntegration, type ConsentIntegration } from '../setup'

export type GtmOptions = {
  /** Container id such as `GTM-XXXXXXX`. Empty keeps the integration registered but disabled. */
  containerId?: string | null
  /** Category that loads the container. Default `analytics`. */
  category?: string
}

export const isGtmLoaded = (): boolean =>
  typeof document !== 'undefined' && !!document.querySelector('script[data-gtm]')

/** Appends gtm.js once. Call only after a decision that grants the container's category. */
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

/**
 * Google Tag Manager under basic Consent Mode: defaults denied in <head>, the container loads
 * only after its category is granted, every decision is forwarded as a consent update.
 */
export function gtm({ containerId, category = 'analytics' }: GtmOptions): ConsentIntegration {
  const id = containerId || ''
  return createIntegration({
    key: 'gtm',
    category,
    enabled: id.length > 0,
    cookies: [/^_ga($|_)/, /^_gid$/, /^_gat/, /^_gac_/, /^_gcl_/],
    bootstrap: consentModeBootstrap(),
    load: () => loadGtm(id),
    update: ({ signals }) => gtag('consent', 'update', signals),
    service: {
      name: 'Google Tag Manager',
      provider: 'Google Ireland Limited',
      privacyUrl: 'https://policies.google.com/privacy',
    },
  })
}
```

Append to `src/index.ts`:

```ts
export * from './consent-mode'
export * from './track'
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-mode.int.spec.ts`
Expected: PASS (9 tests).

- [ ] **Step 7: Commit**

```bash
git add packages/payload-plugin-consent/src tests/int/consent-mode.int.spec.ts
git commit -m "Consent package: Consent Mode bootstrap, tracking and GTM integration"
```

---

### Task 4: Defaults, `resolveConsent` and `textsHash`

**Files:**
- Create: `packages/payload-plugin-consent/src/defaults.ts`
- Modify: `packages/payload-plugin-consent/src/index.ts`
- Test: `tests/int/consent-resolve.int.spec.ts`

**Interfaces:**
- Consumes: `ResolvedSetup` from Task 1.
- Produces: `Strings`, `defaults: Record<string, Strings>`, `stringsFor(locale)`, `baseLanguage(locale)`, `fill(template, vars)`, `listLabels(locale, labels)`, `ServiceText`, `CategoryText`, `ConsentTexts`, `TriggerSettings`, `ResolvedConsent`, `ConsentGlobalDoc`, `resolveConsent(global, locale, setup)`, `textsHash(texts)`, `fnv1a(input)`.

- [ ] **Step 1: Write the failing resolve test**

`tests/int/consent-resolve.int.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { defaults, defineConsent, fill, fnv1a, resolveConsent, stringsFor, textsHash, type ConsentGlobalDoc } from '@subneo/payload-consent'
import { gtm } from '@subneo/payload-consent/integrations/gtm'

const setup = defineConsent({
  categories: [
    { key: 'necessary', required: true, texts: { de: { label: 'Notwendig', description: 'Nötig.' }, en: { label: 'Necessary', description: 'Needed.' } } },
    { key: 'analytics', signals: ['analytics_storage'], texts: { de: { label: 'Statistik', description: 'Zählt.' }, en: { label: 'Statistics', description: 'Counts.' } } },
    { key: 'marketing', texts: { de: { label: 'Marketing', description: 'Wirbt.' }, en: { label: 'Marketing', description: 'Ads.' } } },
  ],
  integrations: [gtm({ containerId: 'GTM-TEST' })],
})

describe('strings', () => {
  it('resolves by base language with English fallback', () => {
    expect(stringsFor('de-AT')).toBe(defaults.de)
    expect(stringsFor('en')).toBe(defaults.en)
    expect(stringsFor('xx')).toBe(defaults.en)
  })

  it('fills templates', () => {
    expect(fill('Hallo {name}, {name}!', { name: 'Welt' })).toBe('Hallo Welt, Welt!')
  })
})

describe('resolveConsent', () => {
  it('falls back to the code defaults when the global is empty', () => {
    const resolved = resolveConsent(null, 'de', setup)
    expect(resolved.enabled).toBe(true)
    expect(resolved.revision).toBe(1)
    expect(resolved.trigger).toEqual({ mode: 'link', position: 'bottom-left' })
    expect(resolved.texts.bannerTitle).toBe(defaults.de.bannerTitle)
    expect(resolved.texts.bannerText).toContain('Statistik und Marketing')
    expect(resolved.texts.bannerText).toContain('widerrufen')
    expect(resolved.texts.categories.map((c) => c.key)).toEqual(['necessary', 'analytics', 'marketing'])
    expect(resolved.texts.categories[1].description).toBe('Zählt.')
    expect(resolved.privacyHref).toBeNull()
    expect(resolved.textsHash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('is disabled only when the global explicitly turns it off', () => {
    expect(resolveConsent({ enabled: false }, 'de', setup).enabled).toBe(false)
    expect(resolveConsent({ enabled: true }, 'de', setup).enabled).toBe(true)
  })

  it('prefers CMS texts, trigger and services field by field and drops unknown categories', () => {
    const global: ConsentGlobalDoc = {
      enabled: true,
      revision: 3,
      privacyPage: { id: 1, slug: 'privacy-policy' },
      imprintPage: { id: 2, slug: 'home' },
      trigger: { mode: 'floating', position: 'bottom-right' },
      banner: { title: 'Cookies?', text: null },
      categories: [
        {
          key: 'analytics',
          label: 'Statistik!',
          services: [{ id: 'svc-1', name: 'Google Analytics 4', provider: 'Google Ireland Limited', purpose: 'Reichweite', integration: 'gtm' }],
        },
        { key: 'unknown', label: 'Nope' },
      ],
    }
    const resolved = resolveConsent(global, 'de', setup)
    expect(resolved.revision).toBe(3)
    expect(resolved.trigger).toEqual({ mode: 'floating', position: 'bottom-right' })
    expect(resolved.texts.bannerTitle).toBe('Cookies?')
    expect(resolved.texts.bannerText).toBe(resolveConsent(null, 'de', setup).texts.bannerText)
    expect(resolved.privacyHref).toBe('/de/privacy-policy')
    expect(resolved.imprintHref).toBe('/de')
    expect(resolved.texts.categories.map((c) => c.key)).toEqual(['necessary', 'analytics', 'marketing'])
    const analytics = resolved.texts.categories[1]
    expect(analytics.label).toBe('Statistik!')
    expect(analytics.description).toBe('Zählt.')
    expect(analytics.services[0]).toEqual({
      id: 'svc-1',
      name: 'Google Analytics 4',
      provider: 'Google Ireland Limited',
      purpose: 'Reichweite',
      cookies: undefined,
      privacyUrl: undefined,
      integration: 'gtm',
    })
  })

  it('uses English for an unknown locale', () => {
    expect(resolveConsent(null, 'xx', setup).texts.acceptAll).toBe(defaults.en.acceptAll)
  })
})

describe('textsHash', () => {
  it('is stable for equal texts and changes with any visible text', () => {
    const a = resolveConsent(null, 'de', setup)
    const b = resolveConsent(null, 'de', setup)
    expect(a.textsHash).toBe(b.textsHash)
    const c = resolveConsent({ banner: { title: 'Anders' } }, 'de', setup)
    expect(c.textsHash).not.toBe(a.textsHash)
    expect(textsHash(a.texts)).toBe(a.textsHash)
    expect(fnv1a('')).toBe('811c9dc5')
    expect(fnv1a('a')).toBe('e40c292c')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-resolve.int.spec.ts`
Expected: FAIL, missing exports.

- [ ] **Step 3: Implement `defaults.ts`**

`packages/payload-plugin-consent/src/defaults.ts`:

```ts
import type { ResolvedSetup } from './setup'

export type Strings = {
  bannerTitle: string
  /** May contain `{categories}`: the optional category labels joined for the locale. */
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
  /** `{service}` and `{category}` placeholders. */
  gateText: string
  /** `{category}` placeholder. */
  gateAllow: string
}

const de: Strings = {
  bannerTitle: 'Cookies auf dieser Website',
  bannerText:
    'Wir verwenden Cookies nur mit Ihrer Zustimmung für {categories}. Sie können Ihre Auswahl jederzeit unter „Cookie-Einstellungen“ ändern oder widerrufen.',
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
  gateText: 'Dieser Inhalt wird von {service} bereitgestellt und erst nach Ihrer Zustimmung zur Kategorie „{category}“ geladen.',
  gateAllow: 'Laden und {category} erlauben',
}

const en: Strings = {
  bannerTitle: 'Cookies on this website',
  bannerText:
    'We use cookies only with your consent, for {categories}. You can change or withdraw your choice at any time under “Cookie settings”.',
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
  gateText: 'This content is provided by {service} and loads only after you allow the “{category}” category.',
  gateAllow: 'Load and allow {category}',
}

export const defaults: Record<string, Strings> = { de, en }

export const baseLanguage = (locale: string): string => locale.toLowerCase().split(/[-_]/)[0]

export const stringsFor = (locale: string): Strings => defaults[baseLanguage(locale)] || defaults.en

export const fill = (template: string, vars: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? vars[key] : match))

/** "Statistik und Marketing" / "statistics and marketing" via Intl.ListFormat, comma join as fallback. */
export function listLabels(locale: string, labels: readonly string[]): string {
  try {
    return new Intl.ListFormat(locale, { type: 'conjunction' }).format(labels)
  } catch {
    return labels.join(', ')
  }
}

export type ServiceText = {
  id?: string
  name: string
  provider?: string
  purpose?: string
  cookies?: string
  privacyUrl?: string
  integration?: string
}

export type CategoryText = { key: string; required: boolean; label: string; description: string; services: ServiceText[] }

export type ConsentTexts = Strings & { categories: CategoryText[] }

export type TriggerSettings = { mode: 'floating' | 'link'; position: 'bottom-left' | 'bottom-right' }

export type ResolvedConsent = {
  enabled: boolean
  revision: number
  privacyHref: string | null
  imprintHref: string | null
  trigger: TriggerSettings
  /** FNV-1a over every visible text, stored with each log row. */
  textsHash: string
  texts: ConsentTexts
}

type Nullable<T> = T | null | undefined

/** Loose shape of the `consent` global; the generated Payload type is assignable to it. */
export type ConsentGlobalDoc = {
  enabled?: Nullable<boolean>
  revision?: Nullable<number>
  privacyPage?: unknown
  imprintPage?: unknown
  trigger?: Nullable<{ mode?: Nullable<string>; position?: Nullable<string> }>
  banner?: Nullable<{ title?: Nullable<string>; text?: Nullable<string> }>
  settings?: Nullable<{ title?: Nullable<string>; text?: Nullable<string> }>
  categories?: Nullable<
    Array<{
      key?: Nullable<string>
      label?: Nullable<string>
      description?: Nullable<string>
      services?: Nullable<
        Array<{
          id?: Nullable<string>
          name?: Nullable<string>
          provider?: Nullable<string>
          purpose?: Nullable<string>
          cookies?: Nullable<string>
          privacyUrl?: Nullable<string>
          integration?: Nullable<string>
        }>
      >
    }>
  >
}

const pageHref = (locale: string, value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('slug' in value) || typeof value.slug !== 'string' || !value.slug) return null
  return value.slug === 'home' ? `/${locale}` : `/${locale}/${value.slug}`
}

const text = (cms: Nullable<string>, fallback: string) => (cms && cms.trim() ? cms : fallback)

/** FNV-1a 32-bit, hex. Plain JS so it runs in the layout, in the browser and in jsdom alike. */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

export function textsHash(texts: ConsentTexts): string {
  const { categories, ...strings } = texts
  const visible = {
    strings,
    categories: categories.map((c) => ({
      key: c.key,
      label: c.label,
      description: c.description,
      services: c.services.map((s) => [s.name, s.provider, s.purpose, s.cookies, s.privacyUrl, s.integration]),
    })),
  }
  return fnv1a(JSON.stringify(visible))
}

/** Merges the CMS global into the code defaults, field by field, for one locale. */
export function resolveConsent(global: ConsentGlobalDoc | null | undefined, locale: string, setup: ResolvedSetup): ResolvedConsent {
  const base = stringsFor(locale)
  const lang = baseLanguage(locale)
  const rows = global?.categories || []
  const categories: CategoryText[] = setup.categories.map((category) => {
    const row = rows.find((r) => r.key === category.key)
    const own = category.texts[lang] || category.texts.en || Object.values(category.texts)[0] || { label: category.key, description: '' }
    return {
      key: category.key,
      required: Boolean(category.required),
      label: text(row?.label, own.label),
      description: text(row?.description, own.description),
      services: (row?.services || [])
        .filter((s) => s.name)
        .map((s) => ({
          id: s.id || undefined,
          name: s.name as string,
          provider: s.provider || undefined,
          purpose: s.purpose || undefined,
          cookies: s.cookies || undefined,
          privacyUrl: s.privacyUrl || undefined,
          integration: s.integration && s.integration !== 'none' ? s.integration : undefined,
        })),
    }
  })
  const optionalLabels = categories.filter((c) => !c.required).map((c) => c.label)
  const mode = global?.trigger?.mode === 'floating' ? 'floating' : 'link'
  const position = global?.trigger?.position === 'bottom-right' ? 'bottom-right' : 'bottom-left'
  const texts: ConsentTexts = {
    ...base,
    bannerTitle: text(global?.banner?.title, base.bannerTitle),
    bannerText: fill(text(global?.banner?.text, base.bannerText), { categories: listLabels(locale, optionalLabels) }),
    settingsTitle: text(global?.settings?.title, base.settingsTitle),
    settingsText: text(global?.settings?.text, base.settingsText),
    categories,
  }
  return {
    enabled: global?.enabled !== false,
    revision: global?.revision || 1,
    privacyHref: pageHref(locale, global?.privacyPage),
    imprintHref: pageHref(locale, global?.imprintPage),
    trigger: { mode, position },
    textsHash: textsHash(texts),
    texts,
  }
}
```

Append to `src/index.ts`:

```ts
export * from './defaults'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-resolve.int.spec.ts`
Expected: PASS (7 tests). If `fnv1a('a')` differs, compute the reference with `python3 -c "h=0x811c9dc5;h^=97;print(format((h*0x01000193)&0xffffffff,'08x'))"` and fix the implementation, not the test.

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-consent/src tests/int/consent-resolve.int.spec.ts
git commit -m "Consent package: defaults, resolver, texts hash"
```

---

### Task 5: Global, log collection, endpoint, plugin, admin row labels

**Files:**
- Create: `packages/payload-plugin-consent/src/global.ts`, `src/logs.ts`, `src/hooks/revalidate.ts`, `src/plugin.ts`, `src/components/RowLabels.tsx`, `src/admin.ts`
- Modify: `packages/payload-plugin-consent/src/index.ts`
- Test: `tests/int/consent-global.int.spec.ts`

**Interfaces:**
- Consumes: `ResolvedSetup`, `ConsentGlobalDoc`.
- Produces: `createConsentGlobal(setup, options)`, `validateCategoryRows(setup)`, `missingServiceRows(setup, data)`, `createConsentLogsCollection(options)`, `createLogEndpoint(setup, options)`, `parseLogBody(setup, body)`, `LogRow`, `createRevalidateHook(cacheTag)`, `consentPlugin(setup, options?)`, `ConsentPluginOptions`, `resolvePluginOptions`.

- [ ] **Step 1: Write the failing test**

`tests/int/consent-global.int.spec.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'

import {
  consentPlugin,
  createConsentGlobal,
  createLogEndpoint,
  defineConsent,
  missingServiceRows,
  parseLogBody,
  resolvePluginOptions,
  validateCategoryRows,
} from '@subneo/payload-consent'
import { gtm } from '@subneo/payload-consent/integrations/gtm'

const setup = defineConsent({
  categories: [
    { key: 'necessary', required: true, texts: { en: { label: 'Necessary', description: '' } } },
    { key: 'analytics', texts: { en: { label: 'Statistics', description: '' } } },
    { key: 'marketing', texts: { en: { label: 'Marketing', description: '' } } },
  ],
  integrations: [gtm({ containerId: 'GTM-TEST' })],
  logging: true,
})

const options = resolvePluginOptions({})

describe('validateCategoryRows', () => {
  const validate = validateCategoryRows(setup)
  it('accepts known unique keys', () => {
    expect(validate([{ key: 'necessary' }, { key: 'analytics' }])).toBe(true)
    expect(validate(null)).toBe(true)
  })
  it('rejects duplicates and unknown keys', () => {
    expect(validate([{ key: 'analytics' }, { key: 'analytics' }])).toMatch(/twice/)
    expect(validate([{ key: 'nope' }])).toMatch(/unknown/)
  })
})

describe('missingServiceRows', () => {
  it('lists active integrations without a service row in their category', () => {
    expect(missingServiceRows(setup, { categories: [] })).toEqual(['gtm'])
    expect(missingServiceRows(setup, { categories: [{ key: 'marketing', services: [{ name: 'x', integration: 'gtm' }] }] })).toEqual(['gtm'])
    expect(missingServiceRows(setup, { categories: [{ key: 'analytics', services: [{ name: 'GA4', integration: 'gtm' }] }] })).toEqual([])
  })
  it('ignores disabled integrations', () => {
    const staging = defineConsent({ ...setup, integrations: [gtm({ containerId: '' })] })
    expect(missingServiceRows(staging, { categories: [] })).toEqual([])
  })
})

describe('createConsentGlobal', () => {
  it('exposes trigger, integration select and the validation hook', () => {
    const global = createConsentGlobal(setup, options)
    expect(global.slug).toBe('consent')
    const names = global.fields.map((f) => ('name' in f ? f.name : f.type))
    expect(names).toContain('trigger')
    expect(names).toContain('categories')
    const json = JSON.stringify(global.fields)
    expect(json).toContain('"name":"integration"')
    expect(json).toContain('"value":"gtm"')
    expect(json).toContain('"value":"none"')
    expect(global.hooks?.beforeValidate).toHaveLength(1)
    expect(global.hooks?.afterChange).toHaveLength(1)
  })

  it('beforeValidate throws when an active integration has no service row', async () => {
    const global = createConsentGlobal(setup, options)
    const hook = global.hooks!.beforeValidate![0]
    await expect(hook({ data: { categories: [] } } as never)).rejects.toThrow(/gtm/)
    const data = { categories: [{ key: 'analytics', services: [{ name: 'GA4', integration: 'gtm' }] }] }
    await expect(hook({ data } as never)).resolves.toEqual(data)
  })
})

describe('parseLogBody', () => {
  const body = { id: 'abc-123', v: 2, t: '2026-09-14T10:00:00.000Z', c: { analytics: true, marketing: false }, h: 'deadbeef', l: 'de' }
  it('accepts a well-formed body', () => {
    expect(parseLogBody(setup, body)).toEqual({
      consentId: 'abc-123',
      revision: 2,
      choices: { analytics: true, marketing: false },
      decidedAt: '2026-09-14T10:00:00.000Z',
      textsHash: 'deadbeef',
      locale: 'de',
    })
  })
  it('rejects bad ids, revisions, timestamps and unknown categories', () => {
    expect(parseLogBody(setup, { ...body, id: 'no spaces!' })).toBeNull()
    expect(parseLogBody(setup, { ...body, v: 0 })).toBeNull()
    expect(parseLogBody(setup, { ...body, t: 'yesterday' })).toBeNull()
    expect(parseLogBody(setup, { ...body, c: { analytics: true, bogus: true } })).toBeNull()
    expect(parseLogBody(setup, { ...body, c: { analytics: 'yes' } })).toBeNull()
    expect(parseLogBody(setup, null)).toBeNull()
  })
})

describe('createLogEndpoint', () => {
  const endpoint = createLogEndpoint(setup, options)
  const request = (body: unknown, length = 200) =>
    ({
      json: async () => body,
      headers: new Headers({ 'content-length': String(length) }),
      payload: { create: vi.fn(async () => ({})), logger: { error: vi.fn() } },
    }) as never

  it('stores a row and answers 204', async () => {
    const req = request({ id: 'abc', v: 1, t: '2026-09-14T10:00:00.000Z', c: { analytics: true, marketing: false }, h: 'h', l: 'de' })
    const res = await endpoint.handler(req)
    expect(res.status).toBe(204)
    const create = (req as unknown as { payload: { create: ReturnType<typeof vi.fn> } }).payload.create
    expect(create).toHaveBeenCalledWith({
      collection: 'consent-logs',
      data: { consentId: 'abc', revision: 1, choices: { analytics: true, marketing: false }, decidedAt: '2026-09-14T10:00:00.000Z', textsHash: 'h', locale: 'de' },
    })
  })

  it('rejects oversized and malformed bodies', async () => {
    expect((await endpoint.handler(request({}, 5000))).status).toBe(413)
    expect((await endpoint.handler(request({ nope: true }))).status).toBe(400)
  })
})

describe('consentPlugin', () => {
  it('adds the global, the log collection and the endpoint', () => {
    const config = consentPlugin(setup)({ collections: [], globals: [], endpoints: [], localization: { locales: ['de', 'en'], defaultLocale: 'de' } } as never)
    expect(config.globals?.map((g) => g.slug)).toEqual(['consent'])
    expect(config.collections?.map((c) => c.slug)).toEqual(['consent-logs'])
    expect(config.endpoints?.map((e) => e.path)).toEqual(['/consent/log'])
  })
  it('adds nothing for logging when the setup turns it off', () => {
    const quiet = defineConsent({ ...setup, logging: false })
    const config = consentPlugin(quiet)({ collections: [], globals: [] } as never)
    expect(config.collections).toEqual([])
    expect(config.endpoints || []).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-global.int.spec.ts`
Expected: FAIL, missing exports.

- [ ] **Step 3: Implement the revalidate hook and the global**

`packages/payload-plugin-consent/src/hooks/revalidate.ts`:

```ts
import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/** Drops the cached global. `expire: 0` because the whole route is cached and would freeze old texts. */
export const createRevalidateHook =
  (cacheTag: string): GlobalAfterChangeHook =>
  ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`[consent] revalidating ${cacheTag}`)
      revalidateTag(cacheTag, { expire: 0 })
    }
    return doc
  }
```

`packages/payload-plugin-consent/src/global.ts`:

```ts
import { ValidationError, type Field, type GlobalConfig } from 'payload'

import type { ConsentGlobalDoc } from './defaults'
import { createRevalidateHook } from './hooks/revalidate'
import type { ResolvedPluginOptions } from './plugin'
import type { ResolvedSetup } from './setup'

type Row = { key?: string | null } | null | undefined

/** Payload `validate` for the categories array: every key known, none twice. */
export const validateCategoryRows =
  (setup: ResolvedSetup) =>
  (value: unknown): true | string => {
    const rows = Array.isArray(value) ? (value as Row[]) : []
    const seen = new Set<string>()
    const known = new Set(setup.categories.map((c) => c.key))
    for (const row of rows) {
      const key = row?.key
      if (!key) continue
      if (!known.has(key)) return `Category "${key}" is unknown to the site setup.`
      if (seen.has(key)) return `Category "${key}" appears twice.`
      seen.add(key)
    }
    return true
  }

/** Active integrations that have no service row with their key inside their own category. */
export function missingServiceRows(setup: ResolvedSetup, data: ConsentGlobalDoc | null | undefined): string[] {
  const rows = data?.categories || []
  return setup.activeIntegrations
    .filter((integration) => {
      const row = rows.find((r) => r?.key === integration.category)
      return !(row?.services || []).some((s) => s?.integration === integration.key)
    })
    .map((integration) => integration.key)
}

/**
 * Editor-owned parts of the consent layer: texts, links, trigger, categories with their services
 * and a revision that re-asks every visitor when raised. Button labels live in ./defaults.ts.
 */
export const createConsentGlobal = (setup: ResolvedSetup, options: ResolvedPluginOptions): GlobalConfig => {
  const { globalSlug, adminGroup, cacheTag, componentPaths, localized } = options
  const loc = (extra: Partial<Field> = {}): Partial<Field> => (localized ? { localized: true, ...extra } : extra)
  const categoryOptions = setup.categories.map((c) => ({ label: c.texts.en?.label || c.key, value: c.key }))
  const integrationOptions = [
    { label: '—', value: 'none' },
    ...setup.integrations.map((i) => ({ label: `${i.service.name} (${i.key})`, value: i.key })),
  ]

  return {
    slug: globalSlug,
    label: { de: 'Cookies & Tracking', en: 'Cookies & tracking' },
    access: { read: () => true },
    admin: { group: adminGroup },
    hooks: {
      beforeValidate: [
        ({ data }) => {
          const missing = missingServiceRows(setup, data as ConsentGlobalDoc)
          if (missing.length > 0) {
            throw new ValidationError({
              global: globalSlug,
              errors: missing.map((key) => ({
                path: 'categories',
                message: `Integration "${key}" runs on this site but has no service row (with integration "${key}") in its category. Add the row so visitors see what runs.`,
              })),
            })
          }
          return data
        },
      ],
      afterChange: [createRevalidateHook(cacheTag)],
    },
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
          { name: 'privacyPage', type: 'relationship', relationTo: 'pages', label: { de: 'Datenschutz-Seite', en: 'Privacy page' }, admin: { width: '50%' } },
          { name: 'imprintPage', type: 'relationship', relationTo: 'pages', label: { de: 'Impressum-Seite', en: 'Imprint page' }, admin: { width: '50%' } },
        ],
      },
      {
        name: 'trigger',
        type: 'group',
        label: { de: 'Einstellungen erneut öffnen', en: 'Reopen settings' },
        fields: [
          {
            type: 'row',
            fields: [
              {
                name: 'mode',
                type: 'select',
                defaultValue: 'link',
                options: [
                  { label: { de: 'Link (z. B. in der Fußzeile)', en: 'Link (e.g. in the footer)' }, value: 'link' },
                  { label: { de: 'Schwebender Button', en: 'Floating button' }, value: 'floating' },
                ],
                label: { de: 'Art', en: 'Mode' },
                admin: { width: '50%' },
              },
              {
                name: 'position',
                type: 'select',
                defaultValue: 'bottom-left',
                options: [
                  { label: { de: 'Unten links', en: 'Bottom left' }, value: 'bottom-left' },
                  { label: { de: 'Unten rechts', en: 'Bottom right' }, value: 'bottom-right' },
                ],
                label: { de: 'Position', en: 'Position' },
                admin: { width: '50%', condition: (_, siblingData) => siblingData?.mode === 'floating' },
              },
            ],
          },
        ],
      },
      {
        name: 'banner',
        type: 'group',
        label: { de: 'Banner (erste Ebene)', en: 'Banner (first layer)' },
        fields: [
          { name: 'title', type: 'text', label: { de: 'Titel', en: 'Title' }, ...loc() } as Field,
          {
            name: 'text',
            type: 'textarea',
            label: { de: 'Text', en: 'Text' },
            admin: { description: { de: '{categories} wird durch die Kategorienamen ersetzt.', en: '{categories} is replaced by the category names.' } },
            ...loc(),
          } as Field,
        ],
      },
      {
        name: 'settings',
        type: 'group',
        label: { de: 'Einstellungen (zweite Ebene)', en: 'Settings (second layer)' },
        fields: [
          { name: 'title', type: 'text', label: { de: 'Titel', en: 'Title' }, ...loc() } as Field,
          { name: 'text', type: 'textarea', label: { de: 'Text', en: 'Text' }, ...loc() } as Field,
        ],
      },
      {
        name: 'categories',
        type: 'array',
        label: { de: 'Kategorien', en: 'Categories' },
        labels: { singular: { de: 'Kategorie', en: 'Category' }, plural: { de: 'Kategorien', en: 'Categories' } },
        validate: (value) => validateCategoryRows(setup)(value),
        admin: { components: { RowLabel: componentPaths.categoryRowLabel } },
        fields: [
          {
            type: 'row',
            fields: [
              { name: 'key', type: 'select', required: true, options: categoryOptions, label: { de: 'Schlüssel', en: 'Key' }, admin: { width: '30%' } },
              { name: 'label', type: 'text', label: { de: 'Bezeichnung', en: 'Label' }, admin: { width: '70%' }, ...loc() } as Field,
            ],
          },
          { name: 'description', type: 'textarea', label: { de: 'Beschreibung', en: 'Description' }, ...loc() } as Field,
          {
            name: 'services',
            type: 'array',
            label: { de: 'Dienste', en: 'Services' },
            labels: { singular: { de: 'Dienst', en: 'Service' }, plural: { de: 'Dienste', en: 'Services' } },
            admin: { initCollapsed: true, components: { RowLabel: componentPaths.serviceRowLabel } },
            fields: [
              {
                type: 'row',
                fields: [
                  { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '50%' } },
                  { name: 'provider', type: 'text', label: { de: 'Anbieter', en: 'Provider' }, admin: { width: '50%' } },
                ],
              },
              {
                name: 'integration',
                type: 'select',
                defaultValue: 'none',
                options: integrationOptions,
                label: { de: 'Technische Integration', en: 'Code integration' },
                admin: {
                  description: {
                    de: 'Welcher Code-Baustein diesen Dienst lädt. Jede aktive Integration braucht genau so eine Zeile in ihrer Kategorie.',
                    en: 'Which code integration loads this service. Every active integration needs such a row in its category.',
                  },
                },
              },
              { name: 'purpose', type: 'textarea', label: { de: 'Zweck', en: 'Purpose' }, ...loc() } as Field,
              {
                type: 'row',
                fields: [
                  {
                    name: 'cookies',
                    type: 'text',
                    label: { de: 'Cookies und Laufzeit', en: 'Cookies and lifetime' },
                    admin: { width: '50%', placeholder: '_ga, _ga_* · 2 Jahre / 2 years' },
                  },
                  { name: 'privacyUrl', type: 'text', label: { de: 'Datenschutz-Link', en: 'Privacy link' }, admin: { width: '50%' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  }
}
```

- [ ] **Step 4: Implement the log collection and endpoint**

`packages/payload-plugin-consent/src/logs.ts`:

```ts
import type { CollectionConfig, Endpoint } from 'payload'

import type { ResolvedPluginOptions } from './plugin'
import type { Choices, ResolvedSetup } from './setup'

export type LogRow = {
  consentId: string
  revision: number
  choices: Choices
  decidedAt: string
  textsHash: string
  locale: string
}

const ID = /^[A-Za-z0-9-]{8,64}$/

/** Validates `{ id, v, t, c, h, l }` from the browser. Unknown category keys make the body invalid. */
export function parseLogBody(setup: ResolvedSetup, body: unknown): LogRow | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (typeof b.id !== 'string' || !ID.test(b.id)) return null
  if (typeof b.v !== 'number' || !Number.isInteger(b.v) || b.v < 1) return null
  if (typeof b.t !== 'string' || Number.isNaN(Date.parse(b.t))) return null
  if (!b.c || typeof b.c !== 'object') return null
  const choices: Choices = {}
  for (const [key, value] of Object.entries(b.c as Record<string, unknown>)) {
    if (!setup.optionalKeys.includes(key) || typeof value !== 'boolean') return null
    choices[key] = value
  }
  for (const key of setup.optionalKeys) if (!(key in choices)) choices[key] = false
  const textsHash = typeof b.h === 'string' ? b.h.slice(0, 16) : ''
  const locale = typeof b.l === 'string' ? b.l.slice(0, 10) : ''
  return { consentId: b.id, revision: b.v, choices, decidedAt: new Date(b.t).toISOString(), textsHash, locale }
}

/** Proof of consent (GDPR Art. 7(1)): what was chosen, when, under which texts. No IP, no user agent. */
export const createConsentLogsCollection = ({ logsSlug, adminGroup }: ResolvedPluginOptions): CollectionConfig => ({
  slug: logsSlug,
  labels: { singular: { de: 'Einwilligung', en: 'Consent log' }, plural: { de: 'Einwilligungen', en: 'Consent logs' } },
  admin: { group: adminGroup, useAsTitle: 'consentId', defaultColumns: ['decidedAt', 'consentId', 'revision', 'locale'] },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'consentId', type: 'text', required: true, index: true, admin: { readOnly: true } },
    { name: 'revision', type: 'number', required: true, admin: { readOnly: true } },
    { name: 'choices', type: 'json', required: true, admin: { readOnly: true } },
    { name: 'decidedAt', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'textsHash', type: 'text', admin: { readOnly: true } },
    { name: 'locale', type: 'text', admin: { readOnly: true } },
  ],
  timestamps: true,
})

const MAX_BODY = 1024

/** `POST /api/consent/log`: one row per decision. Written with the local API; the collection itself denies create. */
export const createLogEndpoint = (setup: ResolvedSetup, { logsSlug, logPath }: ResolvedPluginOptions): Endpoint => ({
  path: logPath,
  method: 'post',
  handler: async (req) => {
    const length = Number(req.headers.get('content-length') || 0)
    if (length > MAX_BODY) return new Response(null, { status: 413 })
    let body: unknown = null
    try {
      body = await req.json?.()
    } catch {
      return new Response(null, { status: 400 })
    }
    const row = parseLogBody(setup, body)
    if (!row) return new Response(null, { status: 400 })
    try {
      await req.payload.create({ collection: logsSlug as never, data: row as never })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: '[consent] could not store consent log' })
      return new Response(null, { status: 500 })
    }
    return new Response(null, { status: 204 })
  },
})
```

- [ ] **Step 5: Implement the plugin, row labels and barrels**

`packages/payload-plugin-consent/src/plugin.ts`:

```ts
import type { Plugin } from 'payload'

import { createConsentGlobal } from './global'
import { createConsentLogsCollection, createLogEndpoint } from './logs'
import type { ResolvedSetup } from './setup'

export type ConsentPluginOptions = {
  /** Set to `false` to leave the config untouched. */
  enabled?: boolean
  /** Slug of the global; default `consent`. */
  globalSlug?: string
  /** Slug of the log collection; default `consent-logs`. */
  logsSlug?: string
  /** Endpoint path under `/api`; default `/consent/log`. */
  logPath?: string
  /** Admin sidebar group; default Website / Site. */
  adminGroup?: string | Record<string, string>
  /** Next cache tag revalidated after a save; default `global_<globalSlug>`. */
  cacheTag?: string
  /** Import-map paths of the admin row labels. */
  componentPaths?: { categoryRowLabel?: string; serviceRowLabel?: string }
}

export type ResolvedPluginOptions = {
  globalSlug: string
  logsSlug: string
  logPath: string
  adminGroup: string | Record<string, string>
  cacheTag: string
  componentPaths: { categoryRowLabel: string; serviceRowLabel: string }
  localized: boolean
}

export const resolvePluginOptions = (options: ConsentPluginOptions, localized = false): ResolvedPluginOptions => {
  const globalSlug = options.globalSlug || 'consent'
  return {
    globalSlug,
    logsSlug: options.logsSlug || 'consent-logs',
    logPath: options.logPath || '/consent/log',
    adminGroup: options.adminGroup || { de: 'Website', en: 'Site' },
    cacheTag: options.cacheTag || `global_${globalSlug}`,
    componentPaths: {
      categoryRowLabel: options.componentPaths?.categoryRowLabel || '@subneo/payload-consent/admin#CategoryRowLabel',
      serviceRowLabel: options.componentPaths?.serviceRowLabel || '@subneo/payload-consent/admin#ServiceRowLabel',
    },
    localized,
  }
}

/** Adds the `consent` global and, when `setup.logging` is on, the log collection and endpoint. */
export const consentPlugin =
  (setup: ResolvedSetup, options: ConsentPluginOptions = {}): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    const resolved = resolvePluginOptions(options, Boolean(config.localization))
    const next = { ...config, globals: [...(config.globals || []), createConsentGlobal(setup, resolved)] }
    if (!setup.logging) return next
    return {
      ...next,
      collections: [...(config.collections || []), createConsentLogsCollection(resolved)],
      endpoints: [...(config.endpoints || []), createLogEndpoint(setup, resolved)],
    }
  }
```

`packages/payload-plugin-consent/src/components/RowLabels.tsx`:

```tsx
'use client'
import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

export const CategoryRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ key?: string; label?: string }>()
  return <div>{data?.key ? `${data.key}${data.label ? `: ${data.label}` : ''}` : 'Kategorie / Category'}</div>
}

export const ServiceRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ name?: string; integration?: string }>()
  const integration = data?.integration && data.integration !== 'none' ? ` (${data.integration})` : ''
  return <div>{data?.name ? `${data.name}${integration}` : 'Dienst / Service'}</div>
}
```

`packages/payload-plugin-consent/src/admin.ts`:

```ts
export { CategoryRowLabel, ServiceRowLabel } from './components/RowLabels'
```

Append to `src/index.ts`:

```ts
export * from './global'
export * from './logs'
export * from './plugin'
export { createRevalidateHook } from './hooks/revalidate'
```

Note: `@payloadcms/ui` is available to the package through the site's `node_modules` (hoisted). Add it to `peerDependencies` in the package `package.json`: `"@payloadcms/ui": "^3.0.0"`.

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-global.int.spec.ts`
Expected: PASS (12 tests). If `ValidationError`'s constructor shape differs in Payload 3.89, check `node_modules/payload/dist/errors/ValidationError.d.ts` and adapt the call; the test only needs the message to contain `gtm`.

- [ ] **Step 7: Commit**

```bash
git add packages/payload-plugin-consent tests/int/consent-global.int.spec.ts
git commit -m "Consent package: global with trigger and integration rows, consent log, plugin"
```

---

### Task 6: Provider, default button, head defaults, client barrel

**Files:**
- Create: `packages/payload-plugin-consent/src/components/DefaultButton.tsx`, `src/components/ConsentProvider.tsx`, `src/components/ConsentDefaults.tsx`, `src/react.ts`
- Test: `tests/int/consent-ui.int.spec.tsx` (rewrite; old content imports `@/consent/*` and is replaced entirely)

**Interfaces:**
- Consumes: `ResolvedSetup`, `Choices`, store functions (Task 2), `ResolvedConsent`, `ConsentTexts`, `TriggerSettings` (Task 4).
- Produces: `ConsentProvider` props `{ setup, settings, locale, disabled?, logEndpoint?, components?, classNames?, children }`; `useConsent(): ConsentContextValue` with `setup, enabled, locale, status, record, choices, texts, revision, trigger, privacyHref, imprintHref, dialogOpen, acceptAll, rejectAll, save, openSettings, closeSettings, hasConsent, Button, cx`; `ConsentSlot`, `ConsentClassNames`, `ConsentComponents`, `ConsentButtonProps`, `SETTINGS_HASH`, `ConsentDefaults`.

- [ ] **Step 1: Rewrite the UI test with the provider describes**

Replace `tests/int/consent-ui.int.spec.tsx` with:

```tsx
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
    expect(await screen.findByText('false')).toBeTruthy()
    cleanup()
    renderWith(<Probe />, { global: { enabled: false } })
    expect(await screen.findByText('false')).toBeTruthy()
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, cannot resolve `@subneo/payload-consent/react`.

- [ ] **Step 3: Implement the default button and the provider**

`packages/payload-plugin-consent/src/components/DefaultButton.tsx`:

```tsx
'use client'
import React from 'react'

export type ConsentButtonProps = {
  variant: 'primary' | 'secondary'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
}

/** Fallback when the site passes no `components.Button`. Styled by styles.css via `data-variant`. */
export const DefaultButton: React.FC<ConsentButtonProps> = ({ variant, type = 'button', ...props }) => (
  <button data-consent="button" data-variant={variant} type={type} {...props} />
)
```

`packages/payload-plugin-consent/src/components/ConsentProvider.tsx`:

```tsx
'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { ConsentTexts, ResolvedConsent, TriggerSettings } from '../defaults'
import type { Choices, ResolvedSetup } from '../setup'
import { allChoices, needsDecision, newRecordId, purgeCookies, readRecord, writeRecord, type ConsentRecord } from '../store'
import { DefaultButton, type ConsentButtonProps } from './DefaultButton'

export type ConsentSlot =
  | 'banner' | 'bannerTitle' | 'bannerText' | 'bannerLinks' | 'bannerLink' | 'bannerActions' | 'bannerSettingsLink'
  | 'dialog' | 'dialogContent' | 'dialogTitle' | 'dialogText' | 'dialogLinks' | 'dialogLink' | 'closeButton'
  | 'categoryList' | 'categoryRow' | 'categoryHeader' | 'categoryLabel' | 'categoryBadge' | 'categoryDescription'
  | 'services' | 'servicesSummary' | 'serviceList' | 'service' | 'serviceName' | 'serviceProvider' | 'servicePurpose' | 'serviceMeta' | 'serviceLink'
  | 'switch' | 'switchThumb' | 'dialogActions'
  | 'trigger' | 'floatingTrigger'
  | 'gate' | 'gateText' | 'gateActions'

export type ConsentClassNames = Partial<Record<ConsentSlot, string>>
export type ConsentComponents = { Button?: React.ComponentType<ConsentButtonProps> }
export type ConsentStatus = 'loading' | 'pending' | 'decided'

/** URL hash that opens the settings dialog on any page; editors can link it from rich text. */
export const SETTINGS_HASH = '#cookie-settings'

export type ConsentContextValue = {
  setup: ResolvedSetup
  /** False when the global is off or `disabled` is set: nothing renders, nothing loads. */
  enabled: boolean
  locale: string
  status: ConsentStatus
  record: ConsentRecord | null
  choices: Choices
  texts: ConsentTexts
  revision: number
  trigger: TriggerSettings
  privacyHref: string | null
  imprintHref: string | null
  dialogOpen: boolean
  acceptAll: () => void
  rejectAll: () => void
  save: (choices: Choices) => void
  openSettings: () => void
  closeSettings: () => void
  hasConsent: (category: string) => boolean
  Button: React.ComponentType<ConsentButtonProps>
  /** Class names for a slot, plus optional extra classes. */
  cx: (slot: ConsentSlot, extra?: string) => string | undefined
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export type ConsentProviderProps = {
  setup: ResolvedSetup
  settings: ResolvedConsent
  locale: string
  /** True in draft mode / live preview or when the site has nothing to gate: no banner, no tracking. */
  disabled?: boolean
  /** `POST` target for the consent log, e.g. `/api/consent/log`. Omit to log nothing. */
  logEndpoint?: string | null
  components?: ConsentComponents
  classNames?: ConsentClassNames
  children: React.ReactNode
}

function sendLog(endpoint: string, record: ConsentRecord, textsHash: string, locale: string): void {
  if (typeof fetch !== 'function' || !record.id) return
  const body = JSON.stringify({ id: record.id, v: record.v, t: record.t, c: record.c, h: textsHash, l: locale })
  fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {})
}

const hasSettingsHash = () => typeof window !== 'undefined' && window.location.hash === SETTINGS_HASH

const clearSettingsHash = () => {
  if (hasSettingsHash()) window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({
  setup,
  settings,
  locale,
  disabled,
  logEndpoint,
  components,
  classNames,
  children,
}) => {
  const enabled = Boolean(settings.enabled && !disabled)
  const [status, setStatus] = useState<ConsentStatus>('loading')
  const [record, setRecord] = useState<ConsentRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const existing = readRecord(setup)
    const pending = needsDecision(setup, existing, settings.revision)
    // An invalidated record (revision bump, expiry) must not leave old tracking cookies behind.
    if (pending && existing) for (const key of setup.optionalKeys) purgeCookies(setup.purgePatternsFor(key))
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration-safe cookie read; SSR has no cookie access.
    setRecord(existing)
    setStatus(pending ? 'pending' : 'decided')
  }, [enabled, setup, settings.revision])

  useEffect(() => {
    if (!enabled) return
    const sync = () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- subscribes to the URL hash, an external system.
      if (hasSettingsHash()) setDialogOpen(true)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [enabled])

  const closeSettings = useCallback(() => {
    setDialogOpen(false)
    clearSettingsHash()
  }, [])

  const decide = useCallback(
    (choices: Choices) => {
      const next: ConsentRecord = { id: record?.id || newRecordId(), v: settings.revision, t: new Date().toISOString(), c: choices }
      writeRecord(setup, next)
      setRecord(next)
      setStatus('decided')
      closeSettings()
      if (logEndpoint) sendLog(logEndpoint, next, settings.textsHash, locale)
    },
    [record?.id, settings.revision, settings.textsHash, setup, logEndpoint, locale, closeSettings],
  )

  const value = useMemo<ConsentContextValue>(
    () => ({
      setup,
      enabled,
      locale,
      status,
      record,
      choices: record?.c || allChoices(setup, false),
      texts: settings.texts,
      revision: settings.revision,
      trigger: settings.trigger,
      privacyHref: settings.privacyHref,
      imprintHref: settings.imprintHref,
      dialogOpen,
      acceptAll: () => decide(allChoices(setup, true)),
      rejectAll: () => decide(allChoices(setup, false)),
      save: decide,
      openSettings: () => setDialogOpen(true),
      closeSettings,
      hasConsent: (category) => category === setup.requiredKey || (status === 'decided' && Boolean(record?.c[category])),
      Button: components?.Button || DefaultButton,
      cx: (slot, extra) => [classNames?.[slot], extra].filter(Boolean).join(' ') || undefined,
    }),
    [setup, enabled, locale, status, record, settings, dialogOpen, decide, closeSettings, components, classNames],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export const useConsent = (): ConsentContextValue => {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside ConsentProvider')
  return ctx
}
```

`packages/payload-plugin-consent/src/components/ConsentDefaults.tsx` (server component, no directive):

```tsx
import Script from 'next/script'
import React from 'react'

import type { ResolvedSetup } from '../setup'

/** Head script: the bootstrap of every active integration (deduplicated), before anything else runs. */
export const ConsentDefaults: React.FC<{ setup: ResolvedSetup; enabled: boolean }> = ({ setup, enabled }) => {
  if (!enabled) return null
  const snippet = Array.from(new Set(setup.activeIntegrations.map((i) => i.bootstrap).filter(Boolean))).join('')
  if (!snippet) return null
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router: beforeInteractive belongs in the root layout.
    <Script id="consent-defaults" strategy="beforeInteractive">
      {snippet}
    </Script>
  )
}
```

`packages/payload-plugin-consent/src/react.ts` (grows in Tasks 7 to 9):

```ts
export { ConsentProvider, useConsent, SETTINGS_HASH } from './components/ConsentProvider'
export type { ConsentClassNames, ConsentComponents, ConsentContextValue, ConsentProviderProps, ConsentSlot, ConsentStatus } from './components/ConsentProvider'
export { DefaultButton } from './components/DefaultButton'
export type { ConsentButtonProps } from './components/DefaultButton'
export { ConsentDefaults } from './components/ConsentDefaults'
export { track, installClickTracking } from './track'
export type { TrackEvent } from './track'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-ui.int.spec.tsx`
Expected: PASS (7 tests). If the hashchange assertion is flaky, replace the `setTimeout` with `window.dispatchEvent(new HashChangeEvent('hashchange'))` inside the same `act`.

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-consent/src tests/int/consent-ui.int.spec.tsx
git commit -m "Consent package: provider with record id, log call, hash opener and UI slots"
```

---

### Task 7: Banner, switch and settings dialog

**Files:**
- Create: `packages/payload-plugin-consent/src/components/ConsentBanner.tsx`, `src/components/Switch.tsx`, `src/components/ConsentSettings.tsx`
- Modify: `packages/payload-plugin-consent/src/react.ts`
- Test: `tests/int/consent-ui.int.spec.tsx` (append)

**Interfaces:**
- Consumes: `useConsent` (Task 6).
- Produces: `ConsentBanner`, `ConsentSettings`, `Switch` components.

- [ ] **Step 1: Append the banner and settings tests**

Append to `tests/int/consent-ui.int.spec.tsx` (add `ConsentBanner, ConsentSettings` to the `@subneo/payload-consent/react` import and `defaults` to the `@subneo/payload-consent` import):

```tsx
/* ------------------------------------------------------------------ */
/* Banner                                                                */
/* ------------------------------------------------------------------ */

describe('ConsentBanner', () => {
  beforeEach(clearCookies)
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, `ConsentBanner` / `ConsentSettings` not exported.

- [ ] **Step 3: Implement the banner**

`packages/payload-plugin-consent/src/components/ConsentBanner.tsx`:

```tsx
'use client'

import React, { useId } from 'react'

import { useConsent } from './ConsentProvider'

/**
 * First layer. Non-modal: the page stays usable. Accept and reject are identical buttons;
 * settings is a text button. Render it right after the skip link so keyboard users reach it first.
 */
export const ConsentBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { enabled, status, dialogOpen, texts, privacyHref, imprintHref, acceptAll, rejectAll, openSettings, Button, cx } = useConsent()
  const id = useId()

  if (!enabled || status !== 'pending' || dialogOpen) return null

  return (
    <section aria-describedby={`${id}-text`} aria-labelledby={`${id}-title`} className={cx('banner', className)} data-consent="banner">
      <p className={cx('bannerTitle')} data-consent="bannerTitle" id={`${id}-title`}>
        {texts.bannerTitle}
      </p>
      <p className={cx('bannerText')} data-consent="bannerText" id={`${id}-text`}>
        {texts.bannerText}
      </p>
      {(privacyHref || imprintHref) && (
        <p className={cx('bannerLinks')} data-consent="bannerLinks">
          {privacyHref && (
            <a className={cx('bannerLink')} href={privacyHref}>
              {texts.privacy}
            </a>
          )}
          {imprintHref && (
            <a className={cx('bannerLink')} href={imprintHref}>
              {texts.imprint}
            </a>
          )}
        </p>
      )}
      <div className={cx('bannerActions')} data-consent="bannerActions">
        <Button onClick={acceptAll} variant="secondary">
          {texts.acceptAll}
        </Button>
        <Button onClick={rejectAll} variant="secondary">
          {texts.rejectAll}
        </Button>
      </div>
      <button className={cx('bannerSettingsLink')} data-consent="bannerSettingsLink" onClick={openSettings} type="button">
        {texts.openSettings}
      </button>
    </section>
  )
}
```

- [ ] **Step 4: Implement the switch**

`packages/payload-plugin-consent/src/components/Switch.tsx`:

```tsx
'use client'

import React from 'react'

import { useConsent } from './ConsentProvider'

type Props = {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  'aria-labelledby'?: string
}

/** Minimal accessible switch (role="switch"); locked when disabled. `data-state` drives styling. */
export const Switch: React.FC<Props> = ({ checked, onChange, disabled, ...aria }) => {
  const { cx } = useConsent()
  const state = checked ? 'checked' : 'unchecked'
  return (
    <button
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      className={cx('switch')}
      data-consent="switch"
      data-state={state}
      onClick={() => {
        if (!disabled) onChange?.(!checked)
      }}
      role="switch"
      type="button"
      {...aria}
    >
      <span aria-hidden className={cx('switchThumb')} data-consent="switchThumb" data-state={state} />
    </button>
  )
}
```

- [ ] **Step 5: Implement the settings dialog**

`packages/payload-plugin-consent/src/components/ConsentSettings.tsx`:

```tsx
'use client'

import React, { useEffect, useId, useRef, useState } from 'react'

import type { Choices } from '../setup'
import { allChoices } from '../store'
import { useConsent } from './ConsentProvider'
import { Switch } from './Switch'

const CloseIcon = () => (
  <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

/**
 * Second layer: a native <dialog> (focus trap, Escape and top layer for free). One row per
 * category with a switch, description and a collapsible service list. Backdrop click and the
 * close button dismiss it without deciding.
 */
export const ConsentSettings: React.FC<{ className?: string }> = ({ className }) => {
  const consent = useConsent()
  const { setup, enabled, status, dialogOpen, texts, record, locale, privacyHref, imprintHref, Button, cx } = consent
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const [draft, setDraft] = useState<Choices>(() => allChoices(setup, false))

  useEffect(() => {
    // Strict reading of "no pre-ticked boxes": the draft mirrors the record only while it is valid.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the draft each time the dialog opens.
    if (dialogOpen) setDraft(status === 'decided' && record ? record.c : allChoices(setup, false))
  }, [dialogOpen, record, status, setup])

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
      aria-describedby={`${id}-text`}
      aria-labelledby={`${id}-title`}
      className={cx('dialog', className)}
      data-consent="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) consent.closeSettings()
      }}
      onClose={consent.closeSettings}
      ref={ref}
    >
      <div className={cx('dialogContent')} data-consent="dialogContent">
        <button aria-label={texts.close} className={cx('closeButton')} data-consent="closeButton" onClick={consent.closeSettings} type="button">
          <CloseIcon />
        </button>
        <h2 className={cx('dialogTitle')} data-consent="dialogTitle" id={`${id}-title`}>
          {texts.settingsTitle}
        </h2>
        <p className={cx('dialogText')} data-consent="dialogText" id={`${id}-text`}>
          {texts.settingsText}
        </p>
        <p className={cx('dialogLinks')} data-consent="dialogLinks">
          {privacyHref && (
            <a className={cx('dialogLink')} href={privacyHref}>
              {texts.privacy}
            </a>
          )}
          {imprintHref && (
            <a className={cx('dialogLink')} href={imprintHref}>
              {texts.imprint}
            </a>
          )}
          {lastChanged && (
            <span>
              {texts.lastChanged} {lastChanged}
            </span>
          )}
        </p>

        <ul className={cx('categoryList')} data-consent="categoryList">
          {texts.categories.map((category) => {
            const labelId = `${id}-${category.key}`
            const checked = category.required ? true : Boolean(draft[category.key])
            return (
              <li className={cx('categoryRow')} data-consent="categoryRow" key={category.key}>
                <div className={cx('categoryHeader')} data-consent="categoryHeader">
                  <span className={cx('categoryLabel')} data-consent="categoryLabel" id={labelId}>
                    {category.label}
                    {category.required && (
                      <span className={cx('categoryBadge')} data-consent="categoryBadge">
                        {texts.alwaysActive}
                      </span>
                    )}
                  </span>
                  <Switch
                    aria-labelledby={labelId}
                    checked={checked}
                    disabled={category.required}
                    onChange={(value) => setDraft((d) => ({ ...d, [category.key]: value }))}
                  />
                </div>
                <p className={cx('categoryDescription')} data-consent="categoryDescription">
                  {category.description}
                </p>
                {category.services.length > 0 && (
                  <details className={cx('services')} data-consent="services">
                    <summary className={cx('servicesSummary')} data-consent="servicesSummary">
                      {texts.showServices} ({category.services.length})
                    </summary>
                    <ul className={cx('serviceList')} data-consent="serviceList">
                      {category.services.map((service, index) => (
                        <li className={cx('service')} data-consent="service" key={service.id || `${service.name}-${index}`}>
                          <p className={cx('serviceName')} data-consent="serviceName">
                            {service.name}
                            {service.provider && (
                              <span className={cx('serviceProvider')} data-consent="serviceProvider">
                                {' '}
                                · {texts.provider}: {service.provider}
                              </span>
                            )}
                          </p>
                          {service.purpose && (
                            <p className={cx('servicePurpose')} data-consent="servicePurpose">
                              {service.purpose}
                            </p>
                          )}
                          {service.cookies && (
                            <p className={cx('serviceMeta')} data-consent="serviceMeta">
                              {texts.cookies}: {service.cookies}
                            </p>
                          )}
                          {service.privacyUrl && (
                            <a className={cx('serviceLink')} data-consent="serviceLink" href={service.privacyUrl} rel="noopener noreferrer" target="_blank">
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

        <div className={cx('dialogActions')} data-consent="dialogActions">
          <Button onClick={() => consent.save(draft)} variant="primary">
            {texts.saveSelection}
          </Button>
          <Button onClick={consent.acceptAll} variant="secondary">
            {texts.acceptAll}
          </Button>
          <Button onClick={consent.rejectAll} variant="secondary">
            {texts.rejectAll}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
```

Append to `src/react.ts`:

```ts
export { ConsentBanner } from './components/ConsentBanner'
export { ConsentSettings } from './components/ConsentSettings'
export { Switch } from './components/Switch'
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-ui.int.spec.tsx`
Expected: PASS (14 tests).

- [ ] **Step 7: Commit**

```bash
git add packages/payload-plugin-consent/src tests/int/consent-ui.int.spec.tsx
git commit -m "Consent package: banner, switch and settings dialog with close button"
```

---

### Task 8: Triggers and `ConsentGate`

**Files:**
- Create: `packages/payload-plugin-consent/src/components/ConsentTrigger.tsx`, `src/components/FloatingTrigger.tsx`, `src/components/ConsentGate.tsx`
- Modify: `packages/payload-plugin-consent/src/react.ts`
- Test: `tests/int/consent-ui.int.spec.tsx` (append)

**Interfaces:**
- Consumes: `useConsent`, `fill` (Task 4).
- Produces: `ConsentTrigger({ className?, asChild?, children? })`, `FloatingTrigger({ className? })`, `ConsentGate({ category, service, className?, children })`.

- [ ] **Step 1: Append the trigger and gate tests**

Append to `tests/int/consent-ui.int.spec.tsx` (add `ConsentGate, ConsentTrigger, FloatingTrigger` to the react import):

```tsx
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
    expect(button.style.right).toContain('safe-area-inset-right')
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

  it('renders children directly when the layer is disabled or the category is required', () => {
    renderWith(<ConsentGate category="marketing" service="YouTube"><iframe title="video" /></ConsentGate>, { disabled: true })
    expect(screen.getByTitle('video')).toBeTruthy()
    cleanup()
    renderWith(<ConsentGate category="necessary" service="Self"><iframe title="video" /></ConsentGate>)
    expect(screen.getByTitle('video')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, components not exported.

- [ ] **Step 3: Implement the three components**

`packages/payload-plugin-consent/src/components/ConsentTrigger.tsx`:

```tsx
'use client'

import React from 'react'

import { useConsent } from './ConsentProvider'

type Props = {
  className?: string
  /** Attach the opener to the child element instead of rendering a button. */
  asChild?: boolean
  children?: React.ReactNode
}

/** Reopens the settings dialog. Headless: a plain button by default, any element with `asChild`. */
export const ConsentTrigger: React.FC<Props> = ({ className, asChild, children }) => {
  const { enabled, texts, openSettings, cx } = useConsent()
  if (!enabled) return null
  if (asChild && React.isValidElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>(children)) {
    const child = children
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e)
        e.preventDefault()
        openSettings()
      },
    })
  }
  return (
    <button className={cx('trigger', className)} data-consent="trigger" onClick={openSettings} type="button">
      {children ?? texts.cookieSettings}
    </button>
  )
}
```

`packages/payload-plugin-consent/src/components/FloatingTrigger.tsx`:

```tsx
'use client'

import React from 'react'

import { useConsent } from './ConsentProvider'

const FingerprintIcon = () => (
  <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" viewBox="0 0 24 24" width="22">
    <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8v1" />
    <path d="M7 21v-3a5 5 0 0 1 10 0v3" />
    <path d="M7 14v-2a5 5 0 0 1 5-5 5 5 0 0 1 5 5" />
    <path d="M12 13v8" />
    <path d="M9.5 21v-4M14.5 21v-4" />
  </svg>
)

/**
 * Floating "Cookie settings" button at the corner chosen in the CMS. Visible only after a decision
 * and while the dialog is closed, so it never competes with the banner.
 */
export const FloatingTrigger: React.FC<{ className?: string }> = ({ className }) => {
  const { enabled, trigger, status, dialogOpen, texts, openSettings, cx } = useConsent()
  if (!enabled || trigger.mode !== 'floating' || status !== 'decided' || dialogOpen) return null
  const inset = 'max(1.25rem, env(safe-area-inset-INSET))'
  const side =
    trigger.position === 'bottom-right'
      ? { right: inset.replace('INSET', 'right') }
      : { left: inset.replace('INSET', 'left') }
  return (
    <button
      aria-label={texts.cookieSettings}
      className={cx('floatingTrigger', className)}
      data-consent="floatingTrigger"
      data-position={trigger.position}
      onClick={openSettings}
      style={{ position: 'fixed', bottom: inset.replace('INSET', 'bottom'), zIndex: 50, ...side }}
      title={texts.cookieSettings}
      type="button"
    >
      <FingerprintIcon />
    </button>
  )
}
```

`packages/payload-plugin-consent/src/components/ConsentGate.tsx`:

```tsx
'use client'

import React from 'react'

import { fill } from '../defaults'
import { useConsent } from './ConsentProvider'

type Props = {
  /** Category key the embed needs, e.g. `marketing`. */
  category: string
  /** Provider name shown in the placeholder, e.g. `YouTube`. */
  service: string
  className?: string
  children: React.ReactNode
}

/**
 * Renders `children` only once the category is granted; otherwise a placeholder with a one-click
 * grant and a link to the settings. A disabled layer (draft mode) shows the children.
 */
export const ConsentGate: React.FC<Props> = ({ category, service, className, children }) => {
  const { enabled, hasConsent, choices, save, openSettings, texts, Button, cx } = useConsent()
  if (!enabled || hasConsent(category)) return <>{children}</>
  const label = texts.categories.find((c) => c.key === category)?.label || category
  return (
    <div aria-label={label} className={cx('gate', className)} data-consent="gate" role="group">
      <p className={cx('gateText')} data-consent="gateText">
        {fill(texts.gateText, { service, category: label })}
      </p>
      <div className={cx('gateActions')} data-consent="gateActions">
        <Button onClick={() => save({ ...choices, [category]: true })} variant="primary">
          {fill(texts.gateAllow, { category: label })}
        </Button>
        <Button onClick={openSettings} variant="secondary">
          {texts.cookieSettings}
        </Button>
      </div>
    </div>
  )
}
```

Append to `src/react.ts`:

```ts
export { ConsentTrigger } from './components/ConsentTrigger'
export { FloatingTrigger } from './components/FloatingTrigger'
export { ConsentGate } from './components/ConsentGate'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-ui.int.spec.tsx`
Expected: PASS (21 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-consent/src tests/int/consent-ui.int.spec.tsx
git commit -m "Consent package: headless trigger, floating trigger, ConsentGate"
```

---

### Task 9: `ConsentRunner`

**Files:**
- Create: `packages/payload-plugin-consent/src/components/ConsentRunner.tsx`
- Modify: `packages/payload-plugin-consent/src/react.ts`
- Test: `tests/int/consent-ui.int.spec.tsx` (append)

**Interfaces:**
- Consumes: `useConsent`, `signalsFor`, `purgeCookies`, `track`, `installClickTracking`.
- Produces: `ConsentRunner` (renders null).

- [ ] **Step 1: Append the runner tests**

Append to `tests/int/consent-ui.int.spec.tsx` (add `ConsentRunner` to the react import and `signalsFor` to the package import):

```tsx
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

  it('installs the capture-phase click listener while enabled', async () => {
    renderWith(<><Probe /><ConsentRunner /><a data-track data-track-location="hero" href="#">CTA</a></>)
    await screen.findByText('pending')
    await act(async () => screen.getByText('CTA').click())
    const dl = (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer
    expect(dl.some((e) => e.event === 'cta_click' && e.location === 'hero')).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:int tests/int/consent-ui.int.spec.tsx`
Expected: FAIL, `ConsentRunner` not exported.

- [ ] **Step 3: Implement the runner**

`packages/payload-plugin-consent/src/components/ConsentRunner.tsx`:

```tsx
'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { signalsFor } from '../consent-mode'
import type { Choices, IntegrationContext } from '../setup'
import { purgeCookies } from '../store'
import { installClickTracking, track } from '../track'
import { useConsent } from './ConsentProvider'

/**
 * Headless. Forwards every decision to the active integrations (`update`), loads each granted
 * integration once per page load, purges and reloads on withdrawal, pushes page views and installs
 * the data-track click listener. Reloading is the only reliable way to unload third-party scripts.
 */
export const ConsentRunner: React.FC = () => {
  const { setup, enabled, status, record, locale } = useConsent()
  const pathname = usePathname()
  const previous = useRef<Choices | null>(null)
  const loaded = useRef<Set<string>>(new Set())
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || status !== 'decided' || !record) return
    const ctx: IntegrationContext = { choices: record.c, locale, signals: signalsFor(setup, record.c) }
    for (const integration of setup.activeIntegrations) integration.update?.(ctx)

    const withdrawn = setup.optionalKeys.filter((key) => previous.current?.[key] && !record.c[key])
    previous.current = record.c
    if (withdrawn.length > 0) {
      for (const key of withdrawn) purgeCookies(setup.purgePatternsFor(key))
      window.location.reload()
      return
    }

    for (const integration of setup.activeIntegrations) {
      if (!record.c[integration.category] || loaded.current.has(integration.key)) continue
      integration.load(ctx)
      loaded.current.add(integration.key)
    }
  }, [enabled, setup, status, record, locale])

  useEffect(() => {
    if (!enabled || !pathname || lastPath.current === pathname) return
    lastPath.current = pathname
    track({ name: 'page_view', params: { page_path: pathname, page_title: document.title, page_locale: locale } })
  }, [enabled, pathname, locale])

  useEffect(() => {
    if (!enabled) return
    return installClickTracking()
  }, [enabled])

  return null
}
```

Append to `src/react.ts`:

```ts
export { ConsentRunner } from './components/ConsentRunner'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:int tests/int/consent-ui.int.spec.tsx`
Expected: PASS (26 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-consent/src tests/int/consent-ui.int.spec.tsx
git commit -m "Consent package: runner applies decisions to integrations"
```

---

### Task 10: Default stylesheet, README, package type-check

**Files:**
- Create: `packages/payload-plugin-consent/src/styles.css`, `packages/payload-plugin-consent/README.md`
- Verify: `packages/payload-plugin-consent/tsconfig.json` compiles

**Interfaces:**
- Consumes: the `data-consent` attributes every component renders (Tasks 6 to 9).
- Produces: the documented drop-in contract other sites follow.

- [ ] **Step 1: Write the stylesheet**

`packages/payload-plugin-consent/src/styles.css`:

```css
/* Default look for sites that pass no classNames. Override the variables or skip the file. */
:root {
  --consent-bg: #fff;
  --consent-fg: #111;
  --consent-muted: #555;
  --consent-line: #ddd;
  --consent-accent: #111;
  --consent-accent-fg: #fff;
  --consent-radius: 12px;
  --consent-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}
[data-consent='banner'] {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: 60;
  padding: 1.25rem;
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
  background: var(--consent-bg);
  color: var(--consent-fg);
  border-top: 1px solid var(--consent-line);
  box-shadow: var(--consent-shadow);
  font: 15px/1.5 system-ui, sans-serif;
}
@media (min-width: 768px) {
  [data-consent='banner'] {
    inset-inline: auto;
    left: 1.5rem;
    bottom: 1.5rem;
    width: 26rem;
    border: 1px solid var(--consent-line);
    border-radius: var(--consent-radius);
  }
}
[data-consent='bannerTitle'],
[data-consent='dialogTitle'] {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}
[data-consent='bannerText'],
[data-consent='dialogText'],
[data-consent='categoryDescription'],
[data-consent='gateText'] {
  margin: 0.5rem 0 0;
  color: var(--consent-muted);
}
[data-consent='bannerLinks'],
[data-consent='dialogLinks'] {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1rem;
  margin: 0.75rem 0 0;
  font-size: 0.8125rem;
  color: var(--consent-muted);
}
[data-consent='bannerActions'] {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 1.25rem;
}
[data-consent='dialogActions'] {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
@media (min-width: 640px) {
  [data-consent='dialogActions'] {
    flex-direction: row-reverse;
  }
  [data-consent='dialogActions'] > * {
    flex: 1;
  }
}
[data-consent='button'] {
  padding: 0.65rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--consent-line);
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
[data-consent='button'][data-variant='primary'] {
  background: var(--consent-accent);
  color: var(--consent-accent-fg);
  border-color: var(--consent-accent);
}
[data-consent='bannerSettingsLink'],
[data-consent='trigger'] {
  margin-top: 0.75rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--consent-muted);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
[data-consent='dialog'] {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  margin: 0;
  width: 100%;
  max-height: 85dvh;
  overflow-y: auto;
  padding: 0;
  border: 1px solid var(--consent-line);
  border-radius: var(--consent-radius) var(--consent-radius) 0 0;
  background: var(--consent-bg);
  color: var(--consent-fg);
  box-shadow: var(--consent-shadow);
  font: 15px/1.5 system-ui, sans-serif;
}
[data-consent='dialog']::backdrop {
  background: rgba(0, 0, 0, 0.4);
}
@media (min-width: 768px) {
  [data-consent='dialog'] {
    inset: auto;
    left: 50%;
    top: 50%;
    width: min(34rem, calc(100vw - 2rem));
    transform: translate(-50%, -50%);
    border-radius: var(--consent-radius);
  }
}
[data-consent='dialogContent'] {
  position: relative;
  padding: 1.25rem;
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom));
}
[data-consent='closeButton'] {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: none;
  color: var(--consent-muted);
  cursor: pointer;
}
[data-consent='categoryList'] {
  list-style: none;
  margin: 1.5rem 0 0;
  padding: 0;
  border-top: 1px solid var(--consent-line);
}
[data-consent='categoryRow'] {
  padding: 1rem 0;
  border-bottom: 1px solid var(--consent-line);
}
[data-consent='categoryHeader'] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
[data-consent='categoryLabel'] {
  font-weight: 500;
}
[data-consent='categoryBadge'] {
  margin-left: 0.5rem;
  font-size: 0.8125rem;
  color: var(--consent-muted);
}
[data-consent='switch'] {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 2.75rem;
  height: 1.5rem;
  flex-shrink: 0;
  border: 1px solid var(--consent-line);
  border-radius: 999px;
  background: #eee;
  cursor: pointer;
  transition: background-color 150ms;
}
[data-consent='switch'][data-state='checked'] {
  background: var(--consent-accent);
}
[data-consent='switch'][aria-disabled='true'] {
  opacity: 0.6;
  cursor: not-allowed;
}
[data-consent='switchThumb'] {
  display: block;
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: var(--consent-bg);
  transform: translateX(0.25rem);
  transition: transform 150ms;
}
[data-consent='switchThumb'][data-state='checked'] {
  transform: translateX(1.5rem);
}
[data-consent='services'] {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}
[data-consent='servicesSummary'] {
  cursor: pointer;
  color: var(--consent-muted);
  text-decoration: underline;
}
[data-consent='serviceList'] {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
[data-consent='service'] {
  padding: 0.75rem;
  border-radius: 8px;
  background: #f5f5f5;
}
[data-consent='serviceName'] {
  margin: 0;
  font-weight: 500;
}
[data-consent='serviceProvider'],
[data-consent='serviceMeta'],
[data-consent='serviceLink'] {
  font-weight: 400;
  color: var(--consent-muted);
}
[data-consent='servicePurpose'],
[data-consent='serviceMeta'] {
  margin: 0.25rem 0 0;
}
[data-consent='floatingTrigger'] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--consent-line);
  border-radius: 999px;
  background: var(--consent-bg);
  color: var(--consent-muted);
  box-shadow: var(--consent-shadow);
  cursor: pointer;
}
[data-consent='gate'] {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--consent-line);
  border-radius: var(--consent-radius);
  background: #f5f5f5;
}
[data-consent='gateActions'] {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
@media (prefers-reduced-motion: reduce) {
  [data-consent='switch'],
  [data-consent='switchThumb'] {
    transition: none;
  }
}
```

- [ ] **Step 2: Write the README**

`packages/payload-plugin-consent/README.md`:

````markdown
# @subneo/payload-consent

Cookie consent for Payload CMS + Next.js (App Router). Texts and the service list are edited in
Payload, trackers are code integrations, nothing loads before a grant, every decision can be logged
on the server, and embeds can be gated until consent.

Built for the strict reading of GDPR / ePrivacy / TDDDG (DSK, DSB, CNIL):

- accept and reject equally easy on the first layer, purposes and withdrawal named there;
- no pre-ticked boxes, the settings draft starts all off until a valid decision exists;
- withdrawal from every page: footer link, floating button, or the `#cookie-settings` hash;
- every running tracker must be listed (the global refuses to save otherwise);
- Google Consent Mode v2 in basic mode: no Google script before a grant, defaults denied;
- proof of consent on the server without IP address or user agent;
- withdrawal purges the category's cookies and reloads the page.

## Drop-in checklist

1. Add the package (path alias in `tsconfig.json`, or install it):
   `@subneo/payload-consent`, `@subneo/payload-consent/react`, `@subneo/payload-consent/admin`,
   `@subneo/payload-consent/integrations/*`.
2. `src/consent/setup.ts`, imported by the Payload config and by the browser:

   ```ts
   import { defineConsent } from '@subneo/payload-consent'
   import { gtm } from '@subneo/payload-consent/integrations/gtm'

   export const consentSetup = defineConsent({
     categories: [
       { key: 'necessary', required: true, texts: { de: { label: 'Notwendig', description: '…' }, en: { label: 'Necessary', description: '…' } } },
       { key: 'analytics', signals: ['analytics_storage'], texts: { /* … */ } },
       { key: 'marketing', signals: ['ad_storage', 'ad_user_data', 'ad_personalization'], texts: { /* … */ } },
     ],
     integrations: [gtm({ containerId: process.env.NEXT_PUBLIC_GTM_ID })],
     logging: true,
   })
   ```

   Keep tracker ids in environment variables, never in the CMS: a copied staging database must not
   report into production. An integration without an id stays registered but disabled.
3. `payload.config.ts`: `plugins: [consentPlugin(consentSetup)]`. Run `payload generate:types` and
   `payload generate:importmap`.
4. A client wrapper, because the setup holds functions and cannot cross the server/client boundary
   as a prop:

   ```tsx
   'use client'
   import { ConsentProvider, type ConsentButtonProps } from '@subneo/payload-consent/react'
   import { consentSetup } from './setup'

   export const ConsentRoot = ({ settings, locale, disabled, children }) => (
     <ConsentProvider setup={consentSetup} settings={settings} locale={locale} disabled={disabled}
       logEndpoint={consentSetup.logging ? '/api/consent/log' : null}
       components={{ Button: MyButton }} classNames={myClassNames}>
       {children}
     </ConsentProvider>
   )
   ```

5. Root layout (server): fetch the global with `depth: 1`, then
   `const settings = resolveConsent(global, locale, consentSetup)`. Resolve on the server: the raw
   global carries the linked pages' full rich text and must not reach the client.
   In `<head>`: `<ConsentDefaults setup={consentSetup} enabled={settings.enabled && !draftMode} />`.
   In `<body>`: `<ConsentRoot …>` around the tree, `<ConsentBanner />` right after the skip link,
   `<ConsentSettings />`, `<FloatingTrigger />` and `<ConsentRunner />` before `</body>`.
   Set `disabled` in draft mode / live preview and when `setup.activeIntegrations` is empty and
   nothing is gated.
6. Footer: `<ConsentTrigger className="…" />` (or `asChild` around your own element).
7. Styling: pass `classNames` per slot (see `ConsentSlot`) and your Button, or import
   `@subneo/payload-consent/styles.css`. Every element carries `data-consent="<slot>"`.
8. Seed or fill the global in the admin. Everything falls back to the code defaults when empty.
9. Legal pages: privacy policy lists every service, names the consent log as necessary processing
   (proof of consent, Art. 7(1) GDPR) and explains withdrawal; the cookie policy lists the `consent`
   cookie (with its `id`) and every tracker cookie with lifetime.

## Integrations

An integration is one object:

```ts
import { createIntegration } from '@subneo/payload-consent'

export const plausible = () =>
  createIntegration({
    key: 'plausible',
    category: 'analytics',
    cookies: [],
    load: () => {
      const s = document.createElement('script')
      s.defer = true
      s.src = 'https://plausible.io/js/script.js'
      document.head.appendChild(s)
    },
    service: { name: 'Plausible', provider: 'Plausible Insights OÜ', privacyUrl: 'https://plausible.io/privacy' },
  })
```

- `load` runs once per page load after a decision that grants `category`; make it idempotent.
- `update` runs on every decision (Consent Mode updates, for example).
- `bootstrap` is an inline head script (Consent Mode defaults); identical strings are deduplicated.
- `cookies` are purged on withdrawal and when a record is invalidated.
- Add a service row with the integration's key in its category in the CMS, or the global will not
  save. Raise `revision` so visitors are asked again.

Shipped: `integrations/gtm` (Google Tag Manager, basic Consent Mode).

## Events

`track({ name, params })` pushes to `window.dataLayer` and is a no-op when no integration created
one. Built-ins: `page_view` (automatic on navigation), `cta_click`, `outbound_click`,
`generate_lead`. Any element with `data-track` is tracked on click (capture phase):
`data-track="cta_click"` (default), `data-track-label`, `data-track-location`.

## Gating embeds

```tsx
<ConsentGate category="marketing" service="YouTube">
  <iframe src="https://www.youtube-nocookie.com/embed/…" title="…" />
</ConsentGate>
```

The placeholder names the service and category, offers a one-click grant for that category and a
link to the settings. A disabled layer (draft mode) renders the children.

## Reopen and withdraw

- `ConsentTrigger`: text button, or `asChild` around any element.
- `FloatingTrigger`: renders when the global's trigger mode is "floating"; corner from the CMS.
- `#cookie-settings`: link it from any rich text; the provider opens the dialog and clears the hash
  on close.

## Consent log

With `logging: true` the plugin adds the `consent-logs` collection (read for logged-in users, no
create/update/delete through the API) and `POST /api/consent/log`. Each decision, including a
withdrawal, stores: `consentId` (random id kept in the cookie), `revision`, `choices`, `decidedAt`,
`textsHash` (hash of every text the visitor saw) and `locale`. No IP, no user agent, bodies over
1 KB are rejected.

## GTM container setup

1. Admin → Container settings → enable consent overview.
2. Tag "GA4 configuration": Measurement ID; "Send a page view event when this configuration loads"
   off; Consent settings → additional consent checks: `analytics_storage`; trigger: Custom Event
   `page_view`.
3. Tags "GA4 event" for `cta_click`, `generate_lead`, `outbound_click`: trigger Custom Event with
   the same name; parameters from Data Layer Variables `label`, `location`, `href`, `form_id`,
   `form_name`; consent check `analytics_storage`.
4. Google Ads / remarketing tags: consent check `ad_storage`. Add the service to the marketing
   category in the CMS and raise the revision.
5. Never paste the GTM snippet or the noscript iframe into the page.

## GA4 property checklist

- Google Signals off until marketing consent is in use.
- Data retention: 2 months.
- Granular location and device data: review for EU.
- No user id, no personal data in event parameters.

## Invariants and the tests that guard them

| Invariant | Test |
| --- | --- |
| Consent Mode defaults deny everything but functionality and security storage | `consent-mode` › consentModeBootstrap |
| No integration loads after reject | `consent-ui` › ConsentRunner "never loads after reject" |
| Withdrawal purges and reloads | `consent-ui` › ConsentRunner "purges cookies and reloads" |
| Invalidated record purges cookies and asks again with all switches off | `consent-ui` › ConsentProvider / ConsentSettings |
| Every active integration has a service row | `consent-global` › missingServiceRows |
| Log carries no IP or user agent | `consent-global` › createLogEndpoint (row shape) |

## Editorial rules

- Raise `revision` after adding a service, changing a category description or the banner text.
  Text changes without a bump silently alter what earlier visitors consented to.
- Write service `name` and `cookies` language-neutral when the fields are not localised.
- `{categories}` in the banner text is replaced by the optional category labels.
````

- [ ] **Step 3: Type-check the package on its own and the site**

Run: `pnpm exec tsc -p packages/payload-plugin-consent/tsconfig.json --noEmit`
Expected: no errors. If `@payloadcms/ui` or `next/script` types are missing in the package-only check, add `"types": []` is NOT the fix; the modules resolve from the root `node_modules`, so run the command from the repo root as shown.

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: clean. Fix any lint findings in the package files (unused imports, missing eslint-disable reasons).

- [ ] **Step 4: Commit**

```bash
git add packages/payload-plugin-consent
git commit -m "Consent package: default stylesheet and README"
```

---

### Task 11: Wire the site to the package and delete the old module

**Files:**
- Create: `src/consent/setup.ts`, `src/consent/classNames.ts`, `src/consent/ConsentRoot.tsx`
- Modify: `src/payload.config.ts`, `src/providers/index.tsx`, `src/app/(frontend)/[locale]/layout.tsx`, `src/Footer/Component.tsx`, `src/blocks/Form/Component.tsx:13`, `src/components/Link/index.tsx:20`, `src/endpoints/seed/consent.ts`, `src/app/(frontend)/globals.css:1065-1107`, `src/utilities/getGlobals.ts:28`
- Delete: `src/consent/components/`, `src/consent/hooks/`, `src/consent/CategoryRowLabel.tsx`, `src/consent/README.md`, `src/consent/config.ts`, `src/consent/consent-mode.ts`, `src/consent/defaults.ts`, `src/consent/global.ts`, `src/consent/store.ts`, `src/consent/track.ts`
- Regenerate: `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`
- Test: `tests/int/consent-ui.int.spec.tsx` (append the CMSLink describe)

**Interfaces:**
- Consumes: everything exported from `@subneo/payload-consent` and `/react`.
- Produces: `consentSetup` (`ResolvedSetup`), `ConsentRoot`, `consentClassNames`.

- [ ] **Step 1: Create the site setup**

`src/consent/setup.ts`:

```ts
import { defineConsent } from '@subneo/payload-consent'
import { gtm } from '@subneo/payload-consent/integrations/gtm'

export type SiteCategory = 'necessary' | 'analytics' | 'marketing'

/**
 * This site's consent surface. Imported by payload.config.ts (global, log collection) and by
 * ConsentRoot (browser). The container id is a build-time public env value; empty on staging.
 */
export const consentSetup = defineConsent({
  categories: [
    {
      key: 'necessary',
      required: true,
      texts: {
        de: { label: 'Notwendig', description: 'Für den Betrieb der Website erforderlich, etwa um Ihre Cookie-Auswahl zu speichern.' },
        en: { label: 'Necessary', description: 'Required to run the website, for example to remember your cookie choice.' },
      },
    },
    {
      key: 'analytics',
      signals: ['analytics_storage'],
      texts: {
        de: { label: 'Statistik', description: 'Hilft uns zu verstehen, welche Seiten besucht werden. Die Daten werden anonymisiert ausgewertet.' },
        en: { label: 'Statistics', description: 'Helps us understand which pages are visited. Data is evaluated anonymously.' },
      },
    },
    {
      key: 'marketing',
      signals: ['ad_storage', 'ad_user_data', 'ad_personalization'],
      texts: {
        de: { label: 'Marketing', description: 'Ermöglicht es, den Erfolg unserer Kampagnen zu messen und Ihnen relevante Inhalte zu zeigen.' },
        en: { label: 'Marketing', description: 'Lets us measure our campaigns and show you relevant content.' },
      },
    },
  ],
  integrations: [gtm({ containerId: process.env.NEXT_PUBLIC_GTM_ID })],
  logging: true,
})
```

- [ ] **Step 2: Create the class map and the client root**

`src/consent/classNames.ts`:

```ts
import type { ConsentClassNames } from '@subneo/payload-consent/react'

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]'
const link = 'underline underline-offset-4 hover:text-ink'

/** Site design system applied to the package slots. */
export const consentClassNames: ConsentClassNames = {
  banner:
    'consent-enter fixed inset-x-0 bottom-0 z-[60] bg-surface text-ink border-t border-line shadow-float p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-6 md:left-6 md:w-[26rem] md:rounded-card md:border md:p-6',
  bannerTitle: 'type-h4',
  bannerText: 'mt-2 type-small text-ink-2 pretty',
  bannerLinks: 'mt-3 flex flex-wrap gap-x-4 type-caption text-ink-3',
  bannerLink: link,
  bannerActions: 'mt-5 grid grid-cols-2 gap-3',
  bannerSettingsLink: `mt-3 type-small text-ink-2 ${link} ${focus}`,
  dialog:
    'consent-dialog fixed inset-x-0 bottom-0 m-0 w-full max-h-[85dvh] overflow-y-auto bg-surface text-ink border border-line shadow-float rounded-t-card p-0 md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(34rem,calc(100vw-2rem))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card',
  dialogContent: 'relative p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:p-7',
  dialogTitle: 'type-h4 pr-10',
  dialogText: 'mt-2 type-small text-ink-2 pretty',
  dialogLinks: 'mt-3 flex flex-wrap gap-x-4 type-caption text-ink-3',
  dialogLink: link,
  closeButton: `absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-pill text-ink-2 hover:bg-surface-2 hover:text-ink md:right-6 md:top-6 ${focus}`,
  categoryList: 'mt-6 flex flex-col divide-y divide-line border-y border-line',
  categoryRow: 'flex flex-col gap-2 py-4',
  categoryHeader: 'flex items-center justify-between gap-4',
  categoryLabel: 'font-medium',
  categoryBadge: 'ml-2 type-caption text-ink-3',
  categoryDescription: 'type-small text-ink-2 pretty',
  services: 'type-small',
  servicesSummary: `cursor-pointer text-ink-2 ${link}`,
  serviceList: 'mt-2 flex flex-col gap-3',
  service: 'rounded-card-inner bg-surface-2 p-3',
  serviceName: 'font-medium',
  serviceProvider: 'font-normal text-ink-3',
  servicePurpose: 'mt-1 text-ink-2',
  serviceMeta: 'mt-1 type-caption text-ink-3',
  serviceLink: `mt-1 inline-block type-caption text-ink-3 ${link}`,
  switch: `relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border border-line-strong bg-surface-2 transition-colors duration-150 motion-reduce:transition-none data-[state=checked]:bg-[var(--btn-primary-bg)] aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${focus}`,
  switchThumb:
    'block size-4 translate-x-1 rounded-pill bg-surface shadow-card transition-transform duration-150 motion-reduce:transition-none data-[state=checked]:translate-x-6',
  dialogActions: 'mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:[&>*]:flex-1',
  trigger: `type-caption text-ink-3 transition-colors duration-150 hover:text-ink ${focus}`,
  floatingTrigger: `consent-enter inline-flex size-12 items-center justify-center rounded-pill border border-line bg-surface text-ink-2 shadow-float hover:text-ink ${focus}`,
  gate: 'flex flex-col gap-4 rounded-card border border-line bg-surface-2 p-6',
  gateText: 'type-small text-ink-2 pretty',
  gateActions: 'flex flex-wrap gap-3',
}
```

`src/consent/ConsentRoot.tsx`:

```tsx
'use client'

import React from 'react'

import type { ResolvedConsent } from '@subneo/payload-consent'
import { ConsentProvider, type ConsentButtonProps } from '@subneo/payload-consent/react'

import { Button } from '@/components/ui/button'

import { consentClassNames } from './classNames'
import { consentSetup } from './setup'

const ConsentButton: React.FC<ConsentButtonProps> = ({ variant, ...props }) => <Button variant={variant} {...props} />

type Props = { settings: ResolvedConsent; locale: string; disabled?: boolean; children: React.ReactNode }

/** Binds the package provider to this site's setup, Button and Tailwind classes. */
export const ConsentRoot: React.FC<Props> = ({ settings, locale, disabled, children }) => (
  <ConsentProvider
    classNames={consentClassNames}
    components={{ Button: ConsentButton }}
    disabled={disabled}
    locale={locale}
    logEndpoint={consentSetup.logging ? '/api/consent/log' : null}
    settings={settings}
    setup={consentSetup}
  >
    {children}
  </ConsentProvider>
)
```

- [ ] **Step 3: Rewire Payload config, providers, layout, footer, form, link**

`src/payload.config.ts`: remove `import { Consent } from './consent/global'`; add

```ts
import { consentPlugin } from '@subneo/payload-consent'
import { consentSetup } from './consent/setup'
```

change `globals: [SiteSettings, Header, Footer, Consent],` to `globals: [SiteSettings, Header, Footer],` and `plugins,` to `plugins: [...plugins, consentPlugin(consentSetup)],`.

`src/providers/index.tsx`:

```tsx
import React from 'react'

import type { ResolvedConsent } from '@subneo/payload-consent'

import { ConsentRoot } from '@/consent/ConsentRoot'
import type { Locale } from '@/i18n/config'

import { HeaderThemeProvider } from './HeaderTheme'
import { LocaleProvider } from './Locale'
import { ThemeProvider } from './Theme'

export type ConsentProps = { settings: ResolvedConsent; disabled?: boolean }

export const Providers: React.FC<{
  children: React.ReactNode
  locale: Locale
  consent: ConsentProps
}> = ({ children, locale, consent }) => {
  return (
    <LocaleProvider locale={locale}>
      <ConsentRoot disabled={consent.disabled} locale={locale} settings={consent.settings}>
        <ThemeProvider>
          <HeaderThemeProvider>{children}</HeaderThemeProvider>
        </ThemeProvider>
      </ConsentRoot>
    </LocaleProvider>
  )
}
```

`src/app/(frontend)/[locale]/layout.tsx`: replace the five `@/consent/...` imports with

```ts
import { resolveConsent } from '@subneo/payload-consent'
import { ConsentBanner, ConsentDefaults, ConsentRunner, ConsentSettings, FloatingTrigger } from '@subneo/payload-consent/react'
import { consentSetup } from '@/consent/setup'
```

Replace lines 53 to 56 with

```ts
  const consentSettings = await getCachedGlobal('consent', 1, locale)()
  const consent = resolveConsent(consentSettings, locale, consentSetup)
  // No trackers (staging without a container id) and nothing gated: no banner at all.
  const consentDisabled = isEnabled || consentSetup.activeIntegrations.length === 0
  const trackingEnabled = consent.enabled && !consentDisabled
```

Replace `<ConsentDefaults enabled={trackingEnabled} />` with `<ConsentDefaults enabled={trackingEnabled} setup={consentSetup} />`, the `Providers` line with `<Providers consent={{ settings: consent, disabled: consentDisabled }} locale={locale}>`, and

```tsx
          <ConsentSettings />
          <TagManager />
```

with

```tsx
          <ConsentSettings />
          <FloatingTrigger />
          <ConsentRunner />
```

`src/utilities/getGlobals.ts`: `const CACHE_VERSION = 'v4'` (the global's shape changed).

`src/Footer/Component.tsx`: replace the import with `import { ConsentTrigger } from '@subneo/payload-consent/react'`; replace the legal list block (the `{legal.length > 0 && (<ul …>…</ul>)}` plus the `<ConsentTrigger …/>` line) with

```tsx
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {legal.map((entry, i) => (
                <li key={entry.id || i}>
                  <CMSLink
                    {...entry.link}
                    appearance="inline"
                    className="type-caption text-ink-3 transition-colors duration-150 hover:text-ink"
                  />
                </li>
              ))}
              <li>
                <ConsentTrigger />
              </li>
            </ul>
```

(The trigger's classes come from `consentClassNames.trigger`.)

`src/blocks/Form/Component.tsx:13`: `import { track } from '@subneo/payload-consent/react'`.

`src/components/Link/index.tsx:20`: comment becomes `/** Marks the link for click tracking (data-track contract of @subneo/payload-consent). */`.

- [ ] **Step 4: Update the seed**

Replace `src/endpoints/seed/consent.ts` with:

```ts
import type { Consent } from '@/payload-types'

import type { Refs, T } from './content'

/** Texts for the consent layer. Button labels and gate texts come from the package defaults. */
export const consentGlobal = (t: T, refs: Refs): Partial<Consent> => ({
  enabled: true,
  revision: 1,
  privacyPage: refs.legal['privacy-policy'],
  imprintPage: refs.legal.imprint,
  trigger: { mode: 'floating', position: 'bottom-left' },
  banner: {
    title: t('Cookies auf dieser Website', 'Cookies on this website'),
    text: t(
      'Wir verwenden Cookies nur mit Ihrer Zustimmung für {categories}. Sie können Ihre Auswahl jederzeit unter „Cookie-Einstellungen“ ändern oder widerrufen.',
      'We use cookies only with your consent, for {categories}. You can change or withdraw your choice at any time under “Cookie settings”.',
    ),
  },
  settings: {
    title: t('Cookie-Einstellungen', 'Cookie settings'),
    text: t(
      'Wählen Sie, welche Kategorien Sie erlauben. Ihre Auswahl können Sie jederzeit über den Button unten links oder den Link in der Fußzeile ändern.',
      'Choose which categories you allow. You can change your selection at any time via the button at the bottom left or the link in the footer.',
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
          name: 'Cookie-Einwilligung',
          provider: 'Indicate Data GmbH',
          integration: 'none',
          purpose: t(
            'Speichert Ihre Entscheidung zu Cookies im Browser. Zum Nachweis der Einwilligung wird jede Entscheidung mit Zeitpunkt, Auswahl und einer zufälligen Kennung auf unserem Server protokolliert, ohne IP-Adresse.',
            'Stores your cookie decision in the browser. As proof of consent, every decision is recorded on our server with time, choices and a random identifier, without an IP address.',
          ),
          cookies: 'consent · 12 Monate / 12 months',
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
          name: 'Google Tag Manager / Google Analytics 4',
          provider: 'Google Ireland Limited',
          integration: 'gtm',
          purpose: t(
            'Reichweitenmessung und Analyse der Nutzung unserer Website. Wird erst nach Ihrer Zustimmung geladen.',
            'Reach measurement and analysis of the use of our website. Loads only after your consent.',
          ),
          cookies: '_ga, _ga_* · 2 Jahre / 2 years',
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

- [ ] **Step 5: Fold the reduced-motion block in globals.css**

In `src/app/(frontend)/globals.css`, change the segmented-control block (around line 1065) to

```css
@media (prefers-reduced-motion: reduce) {
  .segmented-thumb {
    transition: none;
  }
  .consent-enter,
  dialog.consent-dialog[open] {
    animation: none;
  }
}
```

and delete the trailing block

```css
@media (prefers-reduced-motion: reduce) {
  .consent-enter,
  dialog.consent-dialog[open] {
    animation: none;
  }
}
```

at the end of the file (after `dialog.consent-dialog::backdrop`).

- [ ] **Step 6: Delete the old module and regenerate types and import map**

```bash
git rm -r -q src/consent/components src/consent/hooks src/consent/CategoryRowLabel.tsx src/consent/README.md \
  src/consent/config.ts src/consent/consent-mode.ts src/consent/defaults.ts src/consent/global.ts src/consent/store.ts src/consent/track.ts
git status --short   # only expected files; anything else belongs to another session, leave it alone
NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:types
NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:importmap
grep -n "payload-consent" src/app/\(payload\)/admin/importMap.js
grep -n "consent-logs\|integration\|trigger" src/payload-types.ts | head
```

Expected: the import map contains `@subneo/payload-consent/admin#CategoryRowLabel` and `#ServiceRowLabel`; `payload-types.ts` has `ConsentLog`, `trigger`, `integration`. If the import map generator cannot resolve the alias, create `src/consent/admin.ts` with `export { CategoryRowLabel, ServiceRowLabel } from '@subneo/payload-consent/admin'` and pass `componentPaths: { categoryRowLabel: '@/consent/admin#CategoryRowLabel', serviceRowLabel: '@/consent/admin#ServiceRowLabel' }` to `consentPlugin` in `payload.config.ts`, then regenerate.

- [ ] **Step 7: Append the CMSLink test and run everything**

Append to `tests/int/consent-ui.int.spec.tsx` (add `import { CMSLink } from '@/components/Link'` at the top):

```tsx
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
```

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm test:int`
Expected: type-check clean, lint clean, every int spec green (the pre-existing non-consent specs included).

- [ ] **Step 8: Push the schema to the dev container and reseed**

```bash
docker compose restart app
sleep 20; docker compose logs --tail 60 app | grep -i -E "consent|error|push|ready" 
```

Expected: the log shows the additive push (new table `consent_logs`, new columns) and "Ready". If the push hangs with a drizzle prompt, stop: the change was not additive; report it instead of forcing.

```bash
NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload ./node_modules/.bin/payload run scripts/seed.ts
docker exec indicate-datacomdemo-app-1 rm -rf /app/.next/dev/cache/fetch-cache && docker compose restart app
```

- [ ] **Step 9: Commit**

```bash
git add -A src/consent src/payload.config.ts src/providers/index.tsx "src/app/(frontend)/[locale]/layout.tsx" src/Footer/Component.tsx \
  src/blocks/Form/Component.tsx src/components/Link/index.tsx src/endpoints/seed/consent.ts "src/app/(frontend)/globals.css" \
  src/utilities/getGlobals.ts src/payload-types.ts "src/app/(payload)/admin/importMap.js" tests/int/consent-ui.int.spec.tsx
git commit -m "Consent: site uses @subneo/payload-consent, floating trigger, consent log"
```

---

### Task 12: E2e, handoff, verification

**Files:**
- Modify: `tests/e2e/consent.e2e.spec.ts`, `tests/e2e/frontend.e2e.spec.ts:47-53`, `tests/e2e/pricing.e2e.spec.ts`, `tests/helpers/consent.ts`, `docs/superpowers/handoffs/2026-09-14-consent-tracking-handoff.md`

- [ ] **Step 1: Update the helper and the e2e specs**

`tests/helpers/consent.ts`:

```ts
import type { BrowserContext } from '@playwright/test'

import { consentGlobal } from '../../src/endpoints/seed/consent'

/** Revision the seed installs; a record below it makes the banner reappear. */
const seededRevision = consentGlobal(() => '', { legal: {} } as never).revision || 1

/** Presets the consent cookie so the banner does not block other tests. */
export async function presetConsent(context: BrowserContext, granted = false): Promise<void> {
  const record = { id: 'e2e-preset-0000000000', v: seededRevision, t: new Date().toISOString(), c: { analytics: granted, marketing: granted } }
  await context.addCookies([
    { name: 'consent', value: encodeURIComponent(JSON.stringify(record)), domain: 'localhost', path: '/', sameSite: 'Lax' },
  ])
}
```

If importing the seed module pulls in `@/payload-types` type-only imports, that is fine under `tsx`; if it pulls a runtime `@/` alias, replace the import with `const seededRevision = 1` and a comment pointing at the seed.

`tests/e2e/consent.e2e.spec.ts`:

```ts
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
    await expect(banner).toContainText('widerrufen')
    await banner.getByRole('button', { name: 'Nur notwendige' }).click()
    await expect(banner).toBeHidden()
    await page.waitForLoadState('networkidle')
    expect(gtmRequests).toHaveLength(0)
    const cookies = await page.context().cookies()
    const consent = cookies.find((c) => c.name === 'consent')
    expect(consent).toBeTruthy()
    expect(JSON.parse(decodeURIComponent(consent!.value)).id).toMatch(/^[A-Za-z0-9-]+$/)
    expect(cookies.find((c) => c.name.startsWith('_ga'))).toBeUndefined()
  })

  test('accept loads GTM and logs the decision', async ({ page }) => {
    skipWithoutGtm()
    const gtm = page.waitForRequest((req) => req.url().includes('googletagmanager.com/gtm.js'))
    const log = page.waitForResponse((res) => res.url().endsWith('/api/consent/log'))
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Alle akzeptieren' }).click()
    await gtm
    expect((await log).status()).toBe(204)
  })

  test('floating button and footer link reopen the settings', async ({ page }) => {
    skipWithoutGtm()
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Nur notwendige' }).click()
    const floating = page.locator('[data-consent="floatingTrigger"]')
    await expect(floating).toBeVisible()
    await floating.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('switch').first()).toHaveAttribute('aria-disabled', 'true')
    await expect(page.getByRole('switch').nth(1)).toHaveAttribute('aria-checked', 'false')
    await dialog.getByRole('button', { name: 'Schließen' }).click()
    await expect(dialog).toBeHidden()
    await page.locator('footer').getByRole('button', { name: 'Cookie-Einstellungen' }).click()
    await expect(dialog).toBeVisible()
  })

  test('#cookie-settings opens the dialog on any page', async ({ page }) => {
    skipWithoutGtm()
    await page.goto(`${base}/de`)
    await page.getByRole('button', { name: 'Nur notwendige' }).click()
    await page.goto(`${base}/de/privacy-policy#cookie-settings`)
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(new URL(page.url()).hash).toBe('')
  })
})
```

`tests/e2e/frontend.e2e.spec.ts` lines 47 to 53:

```ts
  test('switches the language and keeps the page', async ({ page }) => {
    await page.goto(`${base}/de`)
    await page.getByRole('combobox', { name: 'Sprache' }).selectOption('en')
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1').first()).toContainText('Agentic analytics')
  })
```

`tests/e2e/pricing.e2e.spec.ts`: add at the top, after the imports,

```ts
import { presetConsent } from '../helpers/consent'

test.beforeEach(async ({ context }) => {
  await presetConsent(context)
})
```

(if the file already declares a `test.beforeEach`, add the call inside it).

- [ ] **Step 2: Run the e2e suite against the Docker server**

`.env` already holds `NEXT_PUBLIC_GTM_ID=GTM-TEST` (see handoff). Run:

```bash
pnpm test:e2e tests/e2e/consent.e2e.spec.ts tests/e2e/frontend.e2e.spec.ts tests/e2e/pricing.e2e.spec.ts
```

Expected: all green. If the privacy page slug differs, read it from `src/endpoints/seed/legal/privacy-policy.ts` (the slug used by `refs.legal['privacy-policy']`) and adjust the URL.

- [ ] **Step 3: Verify the consent log rows and the admin**

```bash
docker exec -i indicate-datacomdemo-app-1 sh -c 'psql "$DATABASE_URL" -c "select consent_id, revision, decided_at, locale from consent_logs order by id desc limit 5"' \
  || psql postgres://payload:payload@localhost:5433/payload -c "select consent_id, revision, decided_at, locale from consent_logs order by id desc limit 5"
```

Expected: rows from the e2e run. Open `http://localhost:3000/admin/globals/consent` (Playwright scratch script or browser tool) and confirm the "Einstellungen erneut öffnen" group, the "Technische Integration" select on the GA4 row, and that removing the GA4 row and saving fails with the message naming `gtm`. Restore the row afterwards.

- [ ] **Step 4: Update the handoff**

In `docs/superpowers/handoffs/2026-09-14-consent-tracking-handoff.md`:

- Under "What works today", add: "The consent layer is the in-repo package `packages/payload-plugin-consent` (`@subneo/payload-consent`). Trigger mode comes from the CMS (floating, bottom-left on this site); the consent log is on (`consent-logs` collection, `POST /api/consent/log`)."
- In "Before a real container id goes live", item 1: add "and the `consent` cookie carries a random `id` that links to the server-side log"; item 2: add "State that every decision is recorded on the server (proof of consent, Art. 7(1)) without IP address, and that consent can be changed via the floating button, the footer link or the `#cookie-settings` link."; item 7: replace with "Consent logging is implemented and on. Decide on a retention period (follow-up: retention job)."
- Under "Code follow-ups", remove the entries that this work resolved (stale language-switch test, hardcoded revision, fixed wait, pre-ticked switches, bubble phase, withdrawal on the first layer, `purgeCookies` parent domain, unused `close`/`provider` strings, Switch motion-reduce, footer trigger spacing, "Consent-Cookie" naming, mixed-language row label, duplicated link classNames, second reduced-motion block). Keep: missing e2e for dialog accept/reject, `generate_lead` push test, service `name`/`cookies` localisation.
- Replace "Reuse in another Payload project" with a pointer to `packages/payload-plugin-consent/README.md`.

- [ ] **Step 5: Final verification and commit**

```bash
pnpm exec tsc --noEmit && pnpm lint && pnpm test:int
git status --short
git add tests/e2e/consent.e2e.spec.ts tests/e2e/frontend.e2e.spec.ts tests/e2e/pricing.e2e.spec.ts tests/helpers/consent.ts docs/superpowers/handoffs/2026-09-14-consent-tracking-handoff.md
git commit -m "Consent: e2e for floating trigger, hash opener and log; handoff updated"
```

Do not push; the handoff records that `main` is pushed by the user.

---

## Self-review

- **Spec coverage:** §3 layout → Tasks 1, 10; §4 setup and GTM → Tasks 1, 3; §5 store → Task 2; §6 global → Task 5; §7 log → Tasks 5, 6; §8.1 wiring → Task 11; §8.2 provider → Task 6; §8.3 runner → Task 9; §8.4 tracking → Task 3; §9 UI → Tasks 7, 8; §10 defaults → Task 4; §11 site changes → Task 11; §12 tests → every task plus Task 12; §13 README → Task 10.
- **Deviation:** disabled integrations instead of `null` (recorded above and in the spec).
- **Type consistency:** `ResolvedSetup.activeIntegrations`, `purgePatternsFor`, `optionalKeys`, `requiredKey` used identically in Tasks 2 to 9 and 11; `ConsentRecord.id` optional everywhere; `resolveConsent(global, locale, setup)` three-argument form in Tasks 4, 6, 11; `ConsentProvider` props match between Task 6 and `ConsentRoot` in Task 11; `ResolvedPluginOptions.logPath`/`logsSlug` used by Task 5's endpoint and collection.
