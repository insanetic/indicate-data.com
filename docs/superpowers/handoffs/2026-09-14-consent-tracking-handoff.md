# Handoff: cookie consent and tracking, open items

Date: 2026-09-14
State: on the branch `feat/consent-package`, not merged. `main` carries the work up to `c92f7f7` and is
not pushed either.
Spec: `docs/superpowers/specs/2026-09-13-consent-and-tracking-design.md`
Plan: `docs/superpowers/plans/2026-09-13-consent-and-tracking.md`
Module docs: `packages/payload-plugin-consent/README.md` (drop-in checklist, GTM and GA4 setup, how to add a category or tracker)

## What works today

- The consent layer is the in-repo package `packages/payload-plugin-consent` (`@subneo/payload-consent`). Trigger mode comes from the CMS (floating, bottom-left on this site); the consent log is on (`consent-logs` collection, `POST /api/consent/log`).
- `payload.config.ts` imports the plugin from `@subneo/payload-consent/server` (the Payload-side entry: plugin, global, log collection, endpoint); the browser side comes from `@subneo/payload-consent` and `@subneo/payload-consent/react`. The package README is `packages/payload-plugin-consent/README.md`.
- Banner, settings dialog and footer trigger render on every page when `NEXT_PUBLIC_GTM_ID` is set and the "Cookies & Tracking" global is enabled. Draft mode and live preview show nothing.
- Nothing reaches Google before a grant. GTM loads only after the visitor grants Statistik or Marketing; withdrawal purges the category cookies and reloads.
- Page views, five CTAs (`hero`, `cta-section`, `pricing-teaser`, `header`, `mobile-menu`) and form submissions (`generate_lead`) are pushed to the dataLayer.
- Texts and the service list are editable in Payload under Website, seeded in German and English. Code fallbacks cover an empty global.
- Verified on `feat/consent-package`: 150 integration tests pass (`pnpm test:int`), type-check
  (`tsc --noEmit`) and lint clean. Not yet run on this branch: the consent e2e suite (4 tests), the
  Docker schema push, the seed and the admin check — do those on `main` after the merge.
- Every one of those 4 e2e tests calls `test.skip` when `NEXT_PUBLIC_GTM_ID` is unset, so a green e2e
  run proves nothing without it. CI needs a placeholder container id (e.g. `GTM-TEST`) in the
  environment.
- Local `.env` holds the test container id `GTM-TEST` (uncommitted); the Docker app container was restarted with it. Remove or keep as you like; the value only matters for local checks.

## Before a real container id goes live

These are the items that would make the live site non-compliant or non-functional. Do them in this order.

1. **Reseed the `consent` global** (or set the `Technische Integration` select to `gtm` on the Google row and the trigger to floating/bottom-left in the admin). Until then every save of the global fails with a message naming `gtm`, and the floating button does not appear.
2. **Rewrite the cookie policy page.** `src/endpoints/seed/legal/cookie-policy.ts` still says cookies enable "Funktionen von Slack", uses the informal "du", and lists no categories or services. It must describe the real cookies: the `consent` cookie (12 months), Google Analytics 4 (`_ga`, `_ga_*`, 2 years, Google Ireland Limited), and state that consent can be changed in three places — the floating button, the "Cookie-Einstellungen" link in the footer and a `#cookie-settings` link in any text — and that the `consent` cookie carries a random `id` that links to the server-side log. Reseed afterwards (see the content workflow notes: host-side seed, then clear `.next/dev/cache/fetch-cache` in the container and restart it).
3. **Check the privacy policy wording.** It already lists Google Analytics with the AV contract. Add one sentence that analytics runs only after consent and how to withdraw it (footer link). State that every decision is recorded on the server (proof of consent, Art. 7(1)) without IP address, and that consent can be changed via the floating button, the footer link or the `#cookie-settings` link.
4. **Set up the GTM container** as described in the README: consent overview on; GA4 configuration tag with "send a page view" off, consent check `analytics_storage`, trigger custom event `page_view`; event tags for `cta_click`, `generate_lead`, `outbound_click` with data-layer variables `label`, `location`, `href`, `form_id`, `form_name`. Do not paste the GTM snippet or the noscript iframe into the site.
5. **GA4 property settings:** Google Signals off until Marketing is in use, data retention 2 months, no user id, review granular location and device data.
6. **Set `NEXT_PUBLIC_GTM_ID` in the production environment.** It is a build-time value; redeploy after setting it. Staging should stay empty or use its own container.
7. **Look at the banner and dialog in a real desktop browser once** (768 px and wider, plus a phone width). Nobody has done this yet; only Playwright in headless Chromium has exercised the flow. Check the bottom-left card, the equal-width buttons, the centred dialog and the bottom-sheet variant.
8. **Consent logging is implemented and on.** Decide on a retention period (follow-up: retention job).
9. **Push `main`.**

## Editorial rules for the CMS global

- Raising `revision` asks every visitor again. Do this after adding a service, changing a category description, or changing the banner text. Text changes without a bump silently alter what earlier visitors consented to.
- Service fields `name` and `cookies` are shared between languages on purpose (localising them would move a database column, which the Docker dev server cannot do without a reset). Write them language-neutral, for example "_ga, _ga_* · 2 Jahre / 2 years".
- The Payload MCP server only sees the `consent` global after its connection is restarted.

## Code follow-ups, none blocking

- Missing tests: dialog accept-all and reject-all buttons, the `generate_lead` push in the form block, `CMSLink` `track` prop in the button-wrapped branch.

Later, with a real migration (reset script in a terminal):
- Localise the service `name` and `cookies` fields and switch the seed back to `t()` for them.

## Reuse in another Payload project

Follow `packages/payload-plugin-consent/README.md`. It has the drop-in checklist, the entry points, the integration registry and the GTM and GA4 setup. The detail that is easiest to miss is unchanged: resolve the global on the server and pass the result to `ConsentProvider`, never the raw global, which would serialize the linked privacy and imprint pages into every page payload.
