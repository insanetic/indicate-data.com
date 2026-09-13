# Consent and tracking module

Cookie consent (GDPR / TDDDG), Google Consent Mode v2, GTM loaded only after consent, a typed
event helper. Self-contained: copy this folder into another Payload + Next.js project.

## Drop-in checklist

1. Copy `src/consent` (this folder). It imports `@/components/ui/button`, `@/utilities/ui` (`cn`),
   `@/providers/Locale` (`useLocale`), `@/i18n/config` (`Locale`) and `@/payload-types`.
2. Payload config: `globals: [..., Consent]` from `./consent/global`. Run `payload generate:types`
   and `payload generate:importmap`.
3. Layout `<head>`: `<ConsentDefaults enabled={trackingEnabled} />` where
   `trackingEnabled = Boolean(gtmId && consent.enabled && !draftMode)`.
4. Call `const consent = resolveConsent(global, locale)` on the server (in the layout, right after
   fetching the global) and wrap the tree in
   `<ConsentProvider settings={consent} gtmId={process.env.NEXT_PUBLIC_GTM_ID} disabled={draftMode}>`
   inside your locale provider. An absent global counts as enabled. Fetch the global with `depth: 1`
   so page links resolve, but resolve it before it reaches the client: the global's `privacyPage`
   and `imprintPage` are full `Page` documents (whole Lexical body), and passing the raw global to a
   client component would serialize all of that rich text into every page's Flight payload.
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
