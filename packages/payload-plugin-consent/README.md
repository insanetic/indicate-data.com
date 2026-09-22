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
     integrations: [gtm()], // container id from the admin, else GTM_ID, at request time
     logging: true,
   })
   ```

   Ids are read on the server per request (`ConsentIntegration.resolve`), never compiled into the
   bundle, so they can come from the admin, from the container's environment or from a mounted
   config file. An integration without an id stays registered but disabled, and the banner is not
   shown.

   An integration that declares `settings` gets a field per entry in the global (Cookies & tracking
   → Integrations) and the editor can change the id without a deploy; the environment variable of
   the same `envKey` remains the fallback for a blank field. The trade-off is that the id now
   travels with the database: whoever restores a production dump onto a laptop or a staging server
   inherits the live container, so clear the field there or set the id from the environment only.
3. `payload.config.ts`: `plugins: [consentPlugin(consentSetup)]`, with `consentPlugin` imported from
   `@subneo/payload-consent/server`. Run `payload generate:types` and `payload generate:importmap`.
4. A client wrapper, because the setup holds functions and cannot cross the server/client boundary
   as a prop:

   ```tsx
   'use client'
   import { ConsentProvider, type ConsentButtonProps, type ConsentClassNames } from '@subneo/payload-consent/react'
   import { consentSetup } from './setup'

   const MyButton: React.FC<ConsentButtonProps> = ({ variant, type = 'button', ...props }) => (
     <button data-variant={variant} type={type} {...props} />
   )

   const myClassNames: ConsentClassNames = { banner: 'fixed bottom-4 left-4 rounded-xl bg-card p-6' }

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
   `myClassNames` carries one class string per `ConsentSlot`; every slot is optional.
5. Root layout (server): fetch the global with `depth: 1`, then
   `const settings = resolveConsent(global, locale, consentSetup)` from the root entry. Resolve it
   on the server. The raw
   global carries the linked pages' full rich text, which must not reach the client.
   In `<head>`:

   ```tsx
   <ConsentDefaults
     setup={consentSetup}
     enabled={settings.enabled && !draftMode && consentSetup.activeIntegrations.length > 0}
   />
   ```

   In `<body>`: `<ConsentRoot …>` around the tree, `<ConsentBanner />` right after the skip link,
   `<ConsentSettings />`, `<FloatingTrigger />` and `<ConsentRunner />` before `</body>`.
   Set `disabled` in draft mode / live preview, and when `setup.activeIntegrations` is empty on a site
   that gates no embeds — with no tracker and nothing gated there is nothing to ask about. A site with
   `ConsentGate` embeds must keep the layer enabled even without an active integration.
6. Footer: `<ConsentTrigger className="…" />` (or `asChild` around your own element).
7. Styling: pass `classNames` per slot (see `ConsentSlot`) and your own button, or import
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
- `settings` declares runtime values the editor may fill in the admin (an id, a container name).
  Each one overrides the environment variable named in its `envKey` before `resolve` runs. Never
  name a setting `id`: Payload's schema builder skips fields of that name and the value gets no
  column.
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

Because the label falls back to the element's text content, set `data-track-label` explicitly on
anything whose text could carry personal data — a visitor's name in a greeting, an email address in a
link, a row label from user input — so that nothing personal ends up in an event parameter.

### What happens before a decision

`page_view` and click events are pushed to `window.dataLayer` from the first page load, before any
decision. That queue is local: the dataLayer is a plain array in the page, no integration has loaded,
and nothing leaves the browser. On reject nothing ever does — the queue is discarded with the page. On
accept the integration loads and replays what the queue holds, so the entry page view is not lost.

If your reading of "no processing before consent" does not allow that queue either, gate the runner's
page-view and click effects on `status === 'decided'`; tracking then starts with the page after the
decision and the entry page view is gone.

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
`textsHash` (hash of every text the visitor saw) and `locale`. No IP, no user agent.

`createdAt` is the authoritative timestamp: it comes from the server clock. `decidedAt` is the
visitor's own clock and is only stored as sent when it is within 24 hours of the server time;
further off, the server time is stored instead. Use `createdAt` for any proof that has to hold up.

The endpoint is public, so it is guarded: bodies over 1 KB are rejected with 413 (a streamed body is
abandoned as soon as it passes the cap, never buffered), and more than 20 requests a minute from one
address answer 429. The rate limit counts a SHA-256 hash of the forwarded address in memory only —
the address itself is never stored or logged, and a restart forgets the counters.

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
| A one-click grant in the gate never re-grants the categories of an invalidated record | `consent-ui` › ConsentGate "does not re-grant" |
| Accept and reject are the same kind of button | `consent-ui` › ConsentBanner "same variant and classes" |
| The log endpoint caps the body it reads, clamps `decidedAt` and rate-limits per address | `consent-global` › createLogEndpoint |
| Every active integration has a service row | `consent-global` › missingServiceRows |
| Log carries no IP or user agent | `consent-global` › createLogEndpoint (row shape) |

## Editorial rules

- Raise `revision` after adding a service, changing a category description or the banner text.
  Text changes without a bump silently alter what earlier visitors consented to.
- Write service `name` and `cookies` language-neutral when the fields are not localised.
- `{categories}` in the banner text is replaced by the optional category labels.
