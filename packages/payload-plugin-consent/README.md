# @subneo/payload-consent

Cookie consent for Payload CMS and Next.js (App Router). Editors keep the texts and the service list
in the CMS, trackers are code integrations that load only after a grant, the server can log every
decision, and embeds stay behind a placeholder until their category is allowed.

Built for the strict reading of GDPR / ePrivacy / TDDDG (DSK, DSB, CNIL):

- accept and reject equally easy on the first layer, purposes and withdrawal named there;
- no pre-ticked boxes, the settings draft starts all off until a valid decision exists;
- withdrawal from every page: footer link, floating button, or the `#cookie-settings` hash;
- every running tracker must be listed (the global refuses to save otherwise);
- Google Consent Mode v2 in basic mode: no Google script before a grant, defaults denied;
- proof of consent on the server without IP address or user agent;
- withdrawal purges the category's cookies and reloads the page.

## Drop-in checklist

1. Add the package (path alias in `tsconfig.json`, or install it). The entry points are
   `@subneo/payload-consent`, `@subneo/payload-consent/server`, `@subneo/payload-consent/react`,
   `@subneo/payload-consent/admin` and `@subneo/payload-consent/integrations/*`.
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
3. `payload.config.ts`: `plugins: [consentPlugin(consentSetup)]`, with `consentPlugin` imported from
   `@subneo/payload-consent/server`. Run `payload generate:types` and `payload generate:importmap`.
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

   `MyButton` only has to accept `ConsentButtonProps`: `variant` (`primary` or `secondary`),
   `onClick`, `children`, `className` and `type`. Without it the package renders its own button.
5. Root layout (server): fetch the global with `depth: 1`, then
   `const settings = resolveConsent(global, locale, consentSetup)` from the root entry. Resolve it
   on the server. The raw
   global carries the linked pages' full rich text, which must not reach the client.
   In `<head>`: `<ConsentDefaults setup={consentSetup} enabled={settings.enabled && !draftMode} />`.
   In `<body>`: `<ConsentRoot …>` around the tree, `<ConsentBanner />` right after the skip link,
   `<ConsentSettings />`, `<FloatingTrigger />` and `<ConsentRunner />` before `</body>`.
   Set `disabled` in draft mode / live preview and when `setup.activeIntegrations` is empty and
   nothing is gated.
6. Footer: `<ConsentTrigger className="…" />` (or `asChild` around your own element).
7. Styling: pass `classNames` per slot (see `ConsentSlot`) and your own button, or import
   `@subneo/payload-consent/styles.css`. Every element carries `data-consent="<slot>"`, except the
   `bannerLink` and `dialogLink` anchors, which take the class name only.
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
`generate_lead`. One capture-phase listener tracks a click on any element with `data-track`:
`data-track="outbound_click"` names the event, while bare `data-track`, `data-track=""` and the JSX
boolean form (React renders it as `data-track="true"`) all mean `cta_click`. `data-track-label` and
`data-track-location` fill the parameters; without a label the element's own text is sent, and an
anchor adds its `href`.

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
