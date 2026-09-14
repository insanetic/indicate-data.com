# Design: `@subneo/payload-consent`, a reusable consent package for Payload sites

Date: 2026-09-14
Status: approved 2026-09-14; plan in `docs/superpowers/plans/2026-09-14-payload-consent-package.md`
Supersedes: `docs/superpowers/specs/2026-09-13-consent-and-tracking-design.md` (the module this package replaces)
Review that led here: cookie banner review of 2026-09-14 (compliance, semantics, extensibility)

## 1. Goal

Turn `src/consent` into an in-repo package that any Payload + Next.js site can drop in, under the
strictest reading of GDPR, ePrivacy and TDDDG as applied by the German DSK, the Austrian DSB and the
French CNIL:

- nothing non-essential runs, loads or is stored before an explicit grant;
- accept and reject equally easy on the first layer, no pre-ticked boxes, purposes and withdrawal
  named on the first layer;
- withdrawal as easy as consent, from every page;
- every running tracker is listed with provider, purpose, cookies and lifetime;
- proof of consent on the server, without IP addresses;
- embeds that transfer data (video, maps) blocked until consent.

And extensible in the ways the next sites will need: another tracker is one file, the reopen trigger
is a CMS setting, the UI takes the site's own button and classes.

## 2. Decisions (founder, 2026-09-14)

| Topic | Decision |
| --- | --- |
| Scope of first release | Package + plugin + integration registry, configurable trigger + hash opener, server-side consent log, `ConsentGate` for embeds. All four. |
| Package setup | In-repo `packages/payload-plugin-consent`, consumed through tsconfig path aliases like `@subneo/payload-pricing`. No pnpm workspace change. Extractable later. |
| npm name | `@subneo/payload-consent`, MIT. |
| Tracker model | Code registry of integrations; CMS service rows reference an integration key; GTM is the first integration. |
| Trigger on this site | Floating fingerprint button bottom-left, hidden while banner or dialog is open; footer keeps the text link. |
| Behaviour decisions from the handoff | All resolved toward the strict side: dialog draft all off while pending, click tracking in capture phase, withdrawal named on the first layer. |
| Consent Mode defaults | Only `functionality_storage` and `security_storage` granted; `personalization_storage` denied. |

## 3. Package layout

```
packages/payload-plugin-consent/
  package.json              @subneo/payload-consent, MIT, peer deps next >=15, payload ^3, react ^19
  README.md                 drop-in checklist, integrations, GTM/GA4 setup, compliance notes
  LICENSE
  tsconfig.json
  src/
    index.ts                server-safe: consentPlugin, defineConsent, resolveConsent, types,
                            createIntegration, textsHash
    react.ts                client: ConsentProvider, ConsentBanner, ConsentSettings, ConsentTrigger,
                            FloatingTrigger, ConsentGate, ConsentDefaults, ConsentRunner, useConsent,
                            useTrack
    admin.ts                Payload admin components: CategoryRowLabel, ServiceRowLabel
    integrations/gtm.ts     gtm({ containerId }) integration
    plugin.ts               consentPlugin
    global.ts               createConsentGlobal(setup)
    logs.ts                 createConsentLogsCollection(), createLogEndpoint()
    setup.ts                defineConsent, CategoryConfig, ConsentIntegration, ConsentSetup
    store.ts                record, cookie, needsDecision, purge
    consent-mode.ts         Consent Mode signal mapping (used by the gtm integration)
    track.ts                track(), installClickTracking()
    defaults.ts             de/en strings, resolveConsent, textsHash
    components/*.tsx
    hooks/revalidate.ts
```

tsconfig paths in the site:

```
"@subneo/payload-consent":                  ["./packages/payload-plugin-consent/src/index.ts"],
"@subneo/payload-consent/react":            ["./packages/payload-plugin-consent/src/react.ts"],
"@subneo/payload-consent/admin":            ["./packages/payload-plugin-consent/src/admin.ts"],
"@subneo/payload-consent/integrations/*":   ["./packages/payload-plugin-consent/src/integrations/*.ts"]
```

`package.json` `exports` mirrors these four entry points. `publishConfig` points at `dist/` as in the
pricing package.

The package imports nothing from `@/`. It has no Tailwind classes of its own beyond a minimal
`styles.css` (data-attribute selectors, CSS variables) for sites that do not pass `classNames`.

## 4. Setup object (`setup.ts`)

One plain object describes a site's consent surface. It is imported by `payload.config.ts` (server)
and by a client wrapper (browser), so it must contain only serialisable data and plain functions, no
React and no Node modules.

```ts
type CategoryKey = string                     // 'necessary' | 'analytics' | 'marketing' on this site

type CategoryConfig = {
  key: CategoryKey
  required?: boolean                          // exactly one required category, key 'necessary'
  /** Google Consent Mode signals set to granted when this category is granted. */
  signals?: readonly ConsentModeSignal[]
  /** Default label and description per locale; CMS rows override field by field. */
  texts: Record<string, { label: string; description: string }>
}

type ConsentIntegration = {
  key: string                                 // 'gtm'
  category: CategoryKey                       // must be an optional category
  /** Cookie name patterns removed when the category is withdrawn or the record is invalidated. */
  cookies: readonly RegExp[]
  /** Inline head script, runs before hydration on every page when the layer is enabled. */
  bootstrap?: string
  /** Called once per page load after a decision that grants `category`. Idempotent. */
  load: (ctx: IntegrationContext) => void
  /** Called on every decision, granted or not, after `load` when applicable. */
  update?: (ctx: IntegrationContext) => void
  /** Prefilled admin labels for the service row. */
  service: { name: string; provider?: string; privacyUrl?: string }
}

type IntegrationContext = { choices: Choices; locale: string; signals: ConsentModeSignals }

type ConsentSetup = {
  cookieName?: string                         // default 'consent'
  maxAgeDays?: number                         // default 365; 180 is the strictest common reading
  categories: readonly CategoryConfig[]
  integrations: readonly ConsentIntegration[]
  logging?: boolean                           // adds the consent-logs collection and endpoint
}

export const defineConsent = (setup: ConsentSetup): ResolvedSetup
```

`defineConsent` validates at import time: exactly one required category, unique keys, every
integration category exists and is optional, unique integration keys. It returns the setup with
defaults filled in plus derived helpers (`optionalKeys`, `integrationsFor(category)`).

`createIntegration(fn)` is a typed identity helper for integration files.

### 4.1 GTM integration (`integrations/gtm.ts`)

```ts
gtm({ containerId: string | undefined, category?: 'analytics' }): ConsentIntegration
```

Returns the integration with `enabled: false` when `containerId` is empty. It stays registered (so
the service row's `integration` select still accepts `gtm` on a staging database without an id)
but never bootstraps or loads; `defineConsent` exposes `activeIntegrations` for the runtime.
Fields:

- `cookies`: `/^_ga($|_)/, /^_gid$/, /^_gat/, /^_gac_/, /^_gcl_/`.
- `bootstrap`: the current snippet with `personalization_storage: 'denied'`, `ads_data_redaction`
  on, no `url_passthrough`.
- `load`: appends `gtm.js` once (marker attribute `data-gtm`), pushes `gtm.start`.
- `update`: `gtag('consent', 'update', ctx.signals)`.
- `service`: Google Tag Manager, Google Ireland Limited, Google privacy URL.

The category defaults to `analytics` because a container that only hosts GA4 belongs there; a site
that uses the container for ads tags too keeps `analytics` and relies on Consent Mode checks inside
the container, as today.

Basic Consent Mode only: no Google script loads before a grant. The README states this as an
invariant with the test that guards it.

## 5. Consent record and storage (`store.ts`)

```ts
type ConsentRecord = { id: string; v: number; t: string; c: Choices }
```

- `id`: `crypto.randomUUID()` when the first record is written, kept across later decisions in
  the same browser. It links the cookie to log rows. Records without `id` (written by the previous
  module) stay valid; the next decision adds one.
- Cookie: `Path=/; Max-Age=<maxAgeDays>; SameSite=Lax; Secure` on https, host-only.
- `needsDecision(record, revision, now)` as today.
- `purgeCookies(patterns)` takes patterns (from integrations) and clears them on the host, on the
  host with a leading dot and on the registrable parent. The parent is derived with a small
  public-suffix guard: if the host has three or more labels and the last two are both at most three
  characters (`co.uk`, `com.au`), keep three labels; otherwise keep two.

## 6. Payload global `consent` (`global.ts`)

Created by `createConsentGlobal(setup, { localized })`. Field changes relative to today, all
additive (Docker dev server, no destructive pushes):

| Field | Change |
| --- | --- |
| `trigger` group | New. `mode` select `floating` \| `link`, default `link`; `position` select `bottom-left` \| `bottom-right`, default `bottom-left`, shown only when mode is floating. |
| `categories[].key` | Options now carry labels from `setup.categories[].texts.en`. |
| `categories[].services[].integration` | New select: `none` plus one option per integration key (label from `integration.service.name`). |
| `categories` | `validate`: keys unique and known. |
| global `beforeValidate` hook | Every integration must appear as a service row with its key inside its own category, otherwise the save fails with a message naming the integration. This is the rule "every running tracker is listed". |

Everything else stays. `revision`, `enabled`, `privacyPage`, `imprintPage`, banner and settings
groups, the service row fields.

Admin components move to `@subneo/payload-consent/admin#CategoryRowLabel` and `#ServiceRowLabel`
(shows name and integration key). The importMap resolves them through the tsconfig alias.

## 7. Consent log (`logs.ts`)

Enabled by `setup.logging`. Adds:

- Collection `consent-logs`: `consentId` (text, indexed), `revision` (number), `choices` (json),
  `decidedAt` (date), `textsHash` (text), `locale` (text). Access: read for authenticated users,
  create/update/delete `false` (only the endpoint writes, with the local API). `admin.group`
  Website, list columns `decidedAt`, `consentId`, `revision`.
- Endpoint `POST /api/consent/log`, body `{ id, v, t, c, h, l }` under 1 KB. It validates shape and
  types, rejects unknown category keys, stores one row, returns 204. It stores no IP and no user
  agent. Errors are logged, never surfaced to the visitor.
- `resolveConsent` returns `textsHash`: FNV-1a over the resolved texts (banner, settings, category
  labels and descriptions, service rows) so a log row proves which texts the visitor saw. Plain JS,
  no `crypto` import, works in jsdom.

The client sends the log with `fetch(..., { method: 'POST', keepalive: true })` right after the
cookie is written, for every decision including withdrawals. A failed request does not block the UI.

The site's privacy policy must name this log as necessary processing (proof of consent, Art. 7(1)).
The seed's service row "Cookie-Einwilligung" mentions the server record in its purpose text.

## 8. Runtime

### 8.1 Site wiring

```
src/consent/setup.ts          defineConsent({ categories, integrations: [gtm({ containerId })], logging: true })
src/consent/ConsentRoot.tsx   'use client'; imports setup and the site's Button; renders
                              <ConsentProvider setup={setup} settings={...} locale={...} disabled={...}
                                components={{ Button }} classNames={consentClassNames}>
src/consent/classNames.ts     the site's Tailwind classes per slot
payload.config.ts             plugins: [consentPlugin(setup)]
[locale]/layout.tsx           resolveConsent(global, locale) on the server; <ConsentDefaults setup>
                              in <head>; <ConsentRoot> replaces the ConsentProvider in Providers;
                              <ConsentBanner /> after the skip link; <ConsentSettings />,
                              <FloatingTrigger />, <ConsentRunner /> before </body>
Footer                        <ConsentTrigger className=...> stays as text link
```

The setup object cannot cross the server/client boundary as a prop (it holds functions), which is
why the client wrapper imports it. `ConsentDefaults` is a server component that concatenates the
`bootstrap` strings of all integrations into one `beforeInteractive` script, only when
`enabled`.

`disabled` is computed by the site: draft mode, or no active integrations and no gated content.
This site: `draftMode || setup.activeIntegrations.length === 0`. `ConsentRoot` also passes
`logEndpoint="/api/consent/log"` when `setup.logging` is true.

### 8.2 Provider state

As today (`status`, `record`, `dialogOpen`, `choices`, `hasConsent`), plus:

- On mount with an existing record that `needsDecision`: purge every optional category's cookies
  immediately, then `pending`. The settings draft starts all off while pending; it starts from the
  record only when `decided`.
- `decide()` keeps or creates the record `id`, writes the cookie, posts the log when
  `logEndpoint` is set, updates state.
- Hash opener: on mount and on `hashchange`, `#cookie-settings` opens the dialog. Closing the dialog
  with that hash present replaces the URL without the hash. Editors can link `#cookie-settings`
  from any rich text.
- `locale` is a prop (string). Defaults resolve by base language with `en` fallback.

### 8.3 Runner (`ConsentRunner`)

Replaces `TagManager`:

- On every decided record: for each integration whose category is granted, call `load` once per
  page load; then call every integration's `update`. `signals` in the context come from the granted
  categories' `signals`.
- Withdrawal (a category granted in the previous record of this page load and denied now): purge
  that category's integration cookies, then `window.location.reload()`. The reload is documented as
  the only reliable way to unload third-party scripts.
- Page view push on pathname change and the delegated click listener in the capture phase, as today.

### 8.4 Tracking (`track.ts`)

`track()` pushes to `window.dataLayer` only when it exists. The dataLayer is created solely by an
integration's bootstrap, so the module-level `enabled` flag disappears: no dataLayer means no
integration that could consume events. `installClickTracking` uses `{ capture: true }`.

## 9. UI

### 9.1 Styling and slots

`ConsentProvider` takes:

```ts
components?: { Button?: React.ComponentType<ConsentButtonProps> }
classNames?: Partial<Record<ConsentSlot, string>>
```

`ConsentButtonProps = { variant: 'primary' | 'secondary'; onClick; children; className?; type? }`.
Without `components.Button` the package renders a plain `<button data-variant>`.

Slots: `banner`, `bannerTitle`, `bannerText`, `bannerLinks`, `bannerActions`, `bannerSettingsLink`,
`dialog`, `dialogTitle`, `dialogText`, `dialogLinks`, `categoryList`, `categoryRow`,
`categoryLabel`, `categoryDescription`, `services`, `service`, `switch`, `switchThumb`,
`dialogActions`, `closeButton`, `trigger`, `floatingTrigger`, `gate`, `gateText`, `gateActions`.
Every root element also carries `data-consent="<slot>"` so `styles.css` and tests can target it.
`styles.css` gives a readable default for sites without a design system.

### 9.2 Banner

As today, with: `<section aria-labelledby aria-describedby>` (no explicit `role`), title as a
`<p>` with heading styling (no `h2` before the page `h1`), and the default first-layer text names
the purposes and the withdrawal: "Wir verwenden Cookies nur mit Ihrer Zustimmung für Statistik und
Marketing. Sie können Ihre Auswahl jederzeit über „Cookie-Einstellungen“ ändern oder widerrufen."
English equivalent. The seed gets the same text.

### 9.3 Settings dialog

As today, plus a close button (icon, `aria-label` from the `close` string) in the top-right corner
and `aria-describedby` on the dialog. Backdrop click closes. Draft rule from 8.2.

### 9.4 Triggers

- `ConsentTrigger`: headless. Renders a `<button>` with the `cookieSettings` text by default; with
  `asChild` it clones its child and attaches `onClick` and `type="button"`. Renders nothing when
  disabled.
- `FloatingTrigger`: renders only when `settings.trigger.mode === 'floating'`, the layer is enabled,
  and neither banner nor dialog is open. Fixed button at the configured corner with a fingerprint
  icon (inline SVG), `aria-label` = `cookieSettings`, `title` the same, `z-index` below the banner.
  Respects `env(safe-area-inset-*)`.

### 9.5 `ConsentGate`

```tsx
<ConsentGate category="marketing" service="YouTube" className?>{children}</ConsentGate>
```

Renders `children` when `hasConsent(category)`. Otherwise a placeholder: the gate text with the
service name and the category label, a primary button "Load and allow <category>" that calls
`save({ ...choices, [category]: true })`, and a secondary "Cookie settings" link opening the dialog.
Gate strings live in `defaults.ts` (`gateText`, `gateAllow`) per locale. When the layer is
disabled the gate renders its children (draft mode must show the embed).

## 10. Defaults and resolver (`defaults.ts`)

- Strings keyed by base language; `de` and `en` shipped. A site can pass `texts` overrides for
  another language through `defineConsent` later (follow-up, not in this release).
- `close` and `provider` strings are used (close button, service provider label).
- `resolveConsent(global, locale, setup)` merges as today, adds `trigger` and `textsHash`, and
  filters service rows to known category keys.

## 11. Site changes in this repo

- `src/consent/` is deleted; the four site files from 8.1 replace it.
- `src/blocks/Form/Component.tsx` and `src/components/Link/index.tsx` import `track` and the
  `data-track` contract from `@subneo/payload-consent/react`.
- Footer: `ConsentTrigger` stays as the last item of the legal list.
- Seed: `trigger: { mode: 'floating', position: 'bottom-left' }`; GA4 service row gets
  `integration: 'gtm'` and the row is renamed "Google Tag Manager / Google Analytics 4"; the
  necessary row becomes "Cookie-Einwilligung" and mentions the server record; new banner text from
  9.2; `revision` stays 1 (nothing is live yet).
- `globals.css`: the consent keyframes stay; the second `prefers-reduced-motion` block folds into
  the first.
- `src/payload-types.ts`, importMap regenerated. The `consent-logs` table and the new columns are
  additive, so the Docker dev push succeeds.
- Handoff go-live list gains: privacy policy names the consent log; cookie policy names the
  `consent` cookie's `id`.

## 12. Tests

Package tests stay under `tests/int/` (vitest includes only that folder) and import through the
alias; on extraction they move with the package.

- `consent-setup.int.spec.ts`: `defineConsent` validation; `gtm()` returns null without an id;
  `textsHash` stable and sensitive to text changes.
- `consent-store.int.spec.ts`: as today plus `id` handling and the public-suffix guard.
- `consent-mode.int.spec.ts`: bootstrap denies `personalization_storage`; `track` is a no-op
  without a dataLayer; click tracking fires under `stopPropagation` in a child.
- `consent-ui.int.spec.tsx`: as today plus: revision bump purges cookies and resets the draft; hash
  opens and closes the dialog; close button; floating trigger visibility rules; `ConsentGate`
  placeholder, allow button grants the category; log endpoint called with the record; runner
  loads a fake integration once and calls `update` on every decision; withdrawal purges and
  reloads; `asChild` trigger.
- `consent-global.int.spec.ts`: `beforeValidate` rejects a global missing a service row for an
  integration; category validate rejects duplicates.
- E2e (`tests/e2e/consent.e2e.spec.ts`): reject waits for `networkidle` instead of 500 ms; new
  test: floating trigger opens the dialog; `#cookie-settings` opens the dialog on the privacy page.
- `tests/helpers/consent.ts` writes a record with `id` and reads the revision from the seed module.

## 13. README contents

Drop-in checklist (setup file, client wrapper, plugin, layout, footer, CSS, env), integration
authoring guide with the `ConsentIntegration` contract and the GTM file as the example, GTM and
GA4 checklists (moved from today's README), compliance invariants and which test guards each, the
`#cookie-settings` convention for editors, the consent log and what to write in the privacy policy.

## 14. Out of scope, follow-ups

- Further integrations (GA4 direct, Meta Pixel, LinkedIn Insight, Hotjar, Plausible). The contract
  is designed for them; each is one file plus a test.
- Additional languages through `defineConsent` text overrides.
- Log retention job and export.
- Cross-tab sync of a withdrawal.
- Publishing to npm and the extraction into its own repository.
- Localising service `name` and `cookies` (needs a destructive migration, see handoff).

## 15. Open points

None. Behaviour decisions from the handoff are settled in section 2.
