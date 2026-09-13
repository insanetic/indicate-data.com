# Cookie consent and tracking (GTM, GA4, Consent Mode v2)

Date: 2026-09-13
Status: approved design, not yet implemented

## 1. Goal

Add a consent layer and a tracking layer to the site that is compliant for Germany and the EU,
editable in Payload, styled with the site's own tokens, multilingual, mobile-friendly, and
packaged so that other Payload projects can adopt it by copying one folder. Google Tag Manager is
the only tag loader; GA4 is the first tag. Marketing events (page views, CTA clicks, form leads,
custom events) reach GTM through a typed helper and a data attribute, and only leave the browser
after consent.

## 2. Decisions (founder, 2026-09-13)

- Own thin implementation, no consent library, no SaaS CMP. Reason: full control over look and
  reuse; the compliance core is small. A Google-certified CMP (TCF) is only required for serving
  AdSense / Ad Manager ads to EU users, not for GA4 or Google Ads conversion tracking.
- GTM loads only after the visitor grants at least one optional category. Nothing is sent to
  Google before that ("basic" consent mode). Cookieless pings from rejecting visitors are given up.
- Texts and the service list live in a Payload global with de/en fallbacks in code.
- The accept and reject buttons on the first layer are styled identically (both outline, equal
  width). The settings link is a plain text link.

## 3. Folder and reuse

All code sits in `src/consent/`. It imports only `@/components/ui/button`, `@/utilities/ui` (`cn`)
and `@/providers/Locale` (`useLocale`) from the rest of the site; everything else is local.

```
src/consent/
  README.md            drop-in checklist, GTM container setup, GA4 property checklist
  config.ts            categories, Consent Mode mapping, cookie name/lifetime, cookies to purge
  defaults.ts          de/en fallback texts (banner, dialog, category labels, button labels)
  global.ts            Payload GlobalConfig `consent` + revalidate hook
  store.ts             cookie record: parse, serialize, read, write, needsDecision
  consent-mode.ts      gtag consent default/update, dataLayer bootstrap snippet, GTM loader
  track.ts             track(), data-track delegated listener, event types
  components/
    ConsentDefaults.tsx  server: inline head script (dataLayer, gtag, defaults denied)
    ConsentProvider.tsx  client: state, actions, context
    ConsentBanner.tsx    client: first layer
    ConsentSettings.tsx  client: second layer (<dialog>)
    ConsentTrigger.tsx   client: "Cookie-Einstellungen" button for the footer
    TagManager.tsx       client: loads GTM on grant, page_view on navigation, click listener
    Switch.tsx           client: small role="switch" button used by the settings dialog
```

Adopting the folder in another project: copy it, add `Consent` to `globals` in the Payload
config, render `ConsentDefaults` in `<head>`, wrap the body in `ConsentProvider` with the global
and the container id, render `ConsentBanner`, `ConsentSettings` and `TagManager` inside it, put
`ConsentTrigger` in the footer, set `NEXT_PUBLIC_GTM_ID`. The README lists exactly this.
Extracting a Payload plugin is deferred until a third project needs it.

## 4. Configuration (`config.ts`)

```ts
export type CategoryKey = 'necessary' | 'analytics' | 'marketing'

export const consentConfig = {
  cookieName: 'consent',
  maxAgeDays: 365,
  categories: [
    { key: 'necessary', required: true, signals: [], purge: [] },
    { key: 'analytics', required: false, signals: ['analytics_storage'], purge: [/^_ga($|_)/, /^_gid$/] },
    { key: 'marketing', required: false, signals: ['ad_storage', 'ad_user_data', 'ad_personalization'], purge: [/^_gcl_/, /^_fbp$/] },
  ],
} as const
```

- `signals` are the Consent Mode v2 keys granted when the category is granted. Signals not owned
  by any category (`functionality_storage`, `personalization_storage`, `security_storage`) are
  always granted; they cover the consent cookie and site chrome.
- `purge` lists cookie name patterns deleted on withdrawal of that category (on the current host
  and its parent domain).
- Adding a category is one entry here plus a label/description pair in `defaults.ts`.

## 5. Consent record (`store.ts`)

Cookie `consent`, JSON, URL-encoded, `Path=/; Max-Age=31536000; SameSite=Lax; Secure` (Secure
omitted on `http://localhost`). This cookie is strictly necessary and needs no consent itself.

```ts
type ConsentRecord = {
  v: number                       // revision from the CMS global at decision time
  t: string                       // ISO timestamp of the decision
  c: Record<Exclude<CategoryKey, 'necessary'>, boolean>
}
```

Pure functions, all unit-tested: `parseRecord(cookieString)`, `serializeRecord(record)`,
`readRecord()`, `writeRecord(record)`, `needsDecision(record, revision)` (true when the record
is missing, malformed, its `v` is lower than `revision`, or `t` is older than `maxAgeDays`),
`purgeCookies(category)`.

Reading happens on the client after mount, never on the server (`cookies()` would make every
page dynamic). The banner therefore appears a frame after hydration; that is acceptable.

## 6. Payload global `consent` (`global.ts`)

Label "Cookies & Tracking" (de) / "Cookies & tracking" (en), group "Website / Site", public read.

| Field | Type | Notes |
|---|---|---|
| `enabled` | checkbox, default true | Off means no banner, no GTM, no events. |
| `revision` | number, default 1, min 1 | Description: "Erhöhen, um alle Besucher erneut zu fragen (z. B. nach neuen Diensten)." |
| `privacyPage` | relationship `pages` | Linked from banner and dialog. |
| `imprintPage` | relationship `pages` | Linked from banner and dialog. |
| `banner` group | `title` text localized, `text` textarea localized | First layer copy. |
| `settings` group | `title` text localized, `text` textarea localized | Second layer copy. |
| `categories` array | rows keyed by `key` select (necessary, analytics, marketing) | Row label component shows the key. |
| ↳ `label` | text localized | Falls back to `defaults.ts`. |
| ↳ `description` | textarea localized | Falls back to `defaults.ts`. |
| ↳ `services` array | `name` text, `provider` text, `purpose` textarea localized, `cookies` text (e.g. "_ga, _ga_* · 2 Jahre"), `privacyUrl` text | Rendered in the dialog under the category. |

Button labels ("Alle akzeptieren", "Nur notwendige", "Einstellungen", "Auswahl speichern",
"Alle ablehnen", "Cookie-Einstellungen", "Zuletzt geändert") stay in `defaults.ts`.

`afterChange` hook revalidates tag `global_consent` with `expire: 0`, same as the other globals.
The global is a new table (additive schema, see memory rule about the Docker dev server).

Container id: `NEXT_PUBLIC_GTM_ID` (env), not a CMS field, so a copied staging database can never
report into the production container. The layout passes it to the provider.

## 7. Consent Mode and GTM (`consent-mode.ts`, `ConsentDefaults.tsx`, `TagManager.tsx`)

- `ConsentDefaults` renders one inline `<Script strategy="beforeInteractive">` in `<head>`:
  defines `window.dataLayer`, `window.gtag`, then
  `gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', functionality_storage: 'granted', personalization_storage: 'granted', security_storage: 'granted', wait_for_update: 0 })`
  and `gtag('set', 'ads_data_redaction', true)`. It renders nothing when tracking is disabled.
- `applyConsent(record)` calls `gtag('consent', 'update', …)` with the signals derived from
  `config.ts`.
- `loadGtm(id)` is idempotent: pushes `{ 'gtm.start': Date.now(), event: 'gtm.js' }` and appends
  `https://www.googletagmanager.com/gtm.js?id=<id>` once. It is only called after
  `applyConsent` with at least one optional category granted.
- `TagManager` subscribes to the provider. On every decision: `applyConsent`; if any optional
  category is granted, `loadGtm`; if a previously granted category is now denied, `purgeCookies`
  for it and `window.location.reload()` so nothing already loaded keeps running.
- `TagManager` pushes `page_view` (`page_path`, `page_title`, `page_locale`) on mount and on every
  `usePathname()` change. The GA4 tag in GTM is configured without automatic page views and
  fires on this event.
- No GTM `<noscript>` iframe: it would load before consent.

## 8. Events (`track.ts`)

```ts
type TrackEvent =
  | { name: 'page_view'; params: { page_path: string; page_title: string; page_locale: string } }
  | { name: 'cta_click'; params: { label: string; location: string; href?: string } }
  | { name: 'outbound_click'; params: { href: string; label?: string } }
  | { name: 'generate_lead'; params: { form_id: string; form_name: string } }
  | { name: string; params?: Record<string, string | number | boolean> }   // custom

export function track(event: TrackEvent): void   // window.dataLayer.push({ event: name, ...params })
```

- `track` always pushes when tracking is enabled; the dataLayer is a local array and GTM is the
  only thing that sends data, and GTM only exists after consent. Events queued before acceptance
  are processed when GTM loads. `track` is a no-op on the server and when tracking is disabled;
  the provider sets a module-level flag via `setTrackingEnabled(boolean)` on mount.
- Delegated click listener (installed once by `TagManager`): `click` on `document`, finds
  `closest('[data-track]')`, pushes `{ event: data-track || 'cta_click', label: data-track-label || textContent, location: data-track-location, href }`.
- `CMSLink` gets an optional `track?: { location: string; label?: string }` prop that renders the
  attributes. Initial wiring: Hero, CtaSection, PricingTeaser and the header CTA pass their block
  or area name as `location`.
- Form block: after a successful submission, `track({ name: 'generate_lead', params: { form_id, form_name } })`.
- Outbound links are not auto-tracked; mark them with `data-track="outbound_click"` if wanted.

## 9. Interface

### 9.1 Provider (`ConsentProvider`)

Props: `settings` (the global, resolved for the page locale), `gtmId`, `disabled` (true in draft
mode / live preview). State: `record | null`, `status: 'loading' | 'pending' | 'decided'`,
`dialogOpen`. Actions: `acceptAll()`, `rejectAll()`, `save(choices)`, `openSettings()`,
`closeSettings()`. `useConsent()` exposes state, actions and `hasConsent(category)`.
Tracking is enabled when `settings.enabled && gtmId && !disabled`; otherwise the provider renders
children only and every child component renders null.

### 9.2 First layer (`ConsentBanner`)

- Rendered when `status === 'pending'` and the dialog is closed. Placed in the layout directly
  after the skip link so keyboard users reach it first; focus is not moved on load.
- `<section role="region" aria-label={settings.title}>`, no backdrop, page stays usable.
- Desktop (`md` up): fixed card, bottom 1.5rem, left 1.5rem, `max-w-[26rem]`, `bg-surface
  text-ink border border-line rounded-card shadow-float p-6`. Mobile: fixed full-width bottom
  sheet, `rounded-t-card`, safe-area padding.
- Content order: title (`type-h4`), text (`type-small text-ink-2`), links row (privacy, imprint,
  `type-caption`), button row: "Alle akzeptieren" and "Nur notwendige" as two `secondary`
  buttons with identical size and `flex-1`, then "Einstellungen" as a `link`-styled button below.
- Entrance: translateY 12px and opacity 0 to 0 / 1, 300 ms `ease-out-quart`; none under
  `prefers-reduced-motion`. z-index above the header (`z-[60]`).

### 9.3 Second layer (`ConsentSettings`)

- Native `<dialog>` opened with `showModal()`: focus trap, Escape, top layer for free. Escape
  closes the dialog; the banner shows again if no decision exists.
- Desktop: centred, `max-w-[34rem]`, `rounded-card shadow-float`. Mobile: bottom sheet,
  `max-h-[85dvh]`, internal scroll, safe-area padding. Backdrop `bg-night/40`.
- Header: title, text, privacy and imprint links. When a record exists: "Zuletzt geändert am
  {date}" formatted with `Intl.DateTimeFormat(locale, { dateStyle: 'long' })`.
- One row per configured category: label, `Switch` (necessary locked on and `aria-disabled`),
  description, and a `<details>` "Dienste anzeigen ({n})" listing services as a compact
  definition list (name and provider, purpose, cookies, privacy link).
- Footer buttons: "Auswahl speichern" (primary), "Alle akzeptieren" and "Alle ablehnen"
  (secondary). Every button closes the dialog and writes the record.
- Enter/exit: opacity and scale 0.98 → 1, 200 ms; none under reduced motion.

### 9.4 Reopen (`ConsentTrigger`)

A `<button>` styled like the footer legal links that calls `openSettings()`. The footer renders
it as the last item in the legal row whenever tracking is enabled.

### 9.5 Locale

Components read the locale from `useLocale()`. Texts come from `settings` (already localized by
the layout's `getCachedGlobal('consent', 1, locale)`), falling back per field to
`defaults[locale]`, then `defaults.en`.

## 10. Layout wiring

`src/app/(frontend)/[locale]/layout.tsx`:

- fetch `consent` with `getCachedGlobal('consent', 1, locale)`; no `CACHE_VERSION` bump is
  needed because the cache key already includes the slug.
- `<head>`: `<ConsentDefaults enabled={tracking} />`.
- Body: `Providers` receives `consent={{ settings, gtmId, disabled: isEnabled }}` and wraps the
  tree in `ConsentProvider`. After the skip link: `<ConsentBanner />`. Before `RevealObserver`:
  `<ConsentSettings />` and `<TagManager />`.
- Footer: `<ConsentTrigger />` in the legal row.

`payload.config.ts`: `globals: [SiteSettings, Header, Footer, Consent]`. Run `generate:types`.

## 11. Seed

`src/endpoints/seed` fills the global: enabled, revision 1, privacy and imprint page relations
by slug, banner and settings texts (de/en, short, stating that nothing is tracked until
accepted), categories with labels and descriptions, and one service under analytics:
Google Analytics 4, Google Ireland Limited, purpose text, cookies "_ga, _ga_* · 2 Jahre",
privacy link `https://policies.google.com/privacy`. Marketing has no services yet.
After host seeding, clear `.next/dev/cache/fetch-cache` (memory rule).

## 12. Tests

- `tests/int/consent-store.int.spec.ts`: parse/serialize round trip, malformed cookie → null,
  `needsDecision` for missing / lower revision / expired / valid, `purgeCookies` patterns.
- `tests/int/consent-mode.int.spec.ts`: signal mapping for each combination of categories,
  `loadGtm` idempotency (jsdom), `track` pushes the expected object and is a no-op when disabled.
- `tests/int/consent-ui.int.spec.tsx` (Testing Library): banner shows when pending; accept all
  writes the cookie with both categories and calls the GTM loader; reject writes both false and
  does not load; settings dialog toggles and saves; necessary switch cannot be toggled; fallback
  texts render when the global is empty.
- `tests/e2e/consent.e2e.spec.ts`: first visit shows the banner; reject → no `gtm.js` request,
  no `_ga` cookie; accept → `gtm.js` requested. Other e2e specs preset the `consent` cookie via
  a helper in `tests/helpers/consent.ts`.

## 13. README contents (`src/consent/README.md`)

1. Drop-in checklist (section 3).
2. GTM container setup: Consent Overview enabled; GA4 configuration tag with "Send a page view
   event" off, built-in consent check `analytics_storage`, trigger custom event `page_view`;
   GA4 event tags for `cta_click`, `generate_lead`, `outbound_click` with data layer variables
   `label`, `location`, `href`, `form_id`, `form_name`; Google Ads tags require `ad_storage`.
3. GA4 property checklist: Google Signals off until marketing is in use, data retention 2 months,
   granular location and device data collection reviewed, no user-id.
4. How to add a tracker (service in CMS, tag in GTM with consent check, bump revision) and how to
   add a category (config, defaults, CMS select option).
5. Legal notes: what the banner must keep (equal buttons, no pre-ticked boxes, withdrawal link,
   record with timestamp and revision) and what the privacy and cookie policy pages must list.

## 14. Out of scope

- Server-side consent logging (the provider's change callback is the hook for it later).
- TCF / IAB strings, Google-certified CMP.
- Geo-targeting the banner (it shows to everyone).
- Server-side GTM.
- Auto-tracking of every link or scroll depth (GTM triggers can add this without code).

## 15. Open points

- The seeded cookie policy page still says cookies enable "Funktionen von Slack"; the page must
  be corrected and should list the categories and services before launch. Content task, not
  part of this module.
- Whether the header CTA and pricing teaser are the right first set of tracked CTAs is a
  marketing choice; the wiring is one prop per link.
