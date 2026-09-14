# Handoff: cookie consent and tracking, open items

Date: 2026-09-14
State: merged to `main` (commits `e5307f2` to `c92f7f7`), `main` is 17 commits ahead of `origin/main` and not pushed.
Spec: `docs/superpowers/specs/2026-09-13-consent-and-tracking-design.md`
Plan: `docs/superpowers/plans/2026-09-13-consent-and-tracking.md`
Module docs: `src/consent/README.md` (drop-in checklist, GTM and GA4 setup, how to add a category or tracker)

## What works today

- Banner, settings dialog and footer trigger render on every page when `NEXT_PUBLIC_GTM_ID` is set and the "Cookies & Tracking" global is enabled. Draft mode and live preview show nothing.
- Nothing reaches Google before a grant. GTM loads only after the visitor grants Statistik or Marketing; withdrawal purges the category cookies and reloads.
- Page views, five CTAs (`hero`, `cta-section`, `pricing-teaser`, `header`, `mobile-menu`) and form submissions (`generate_lead`) are pushed to the dataLayer.
- Texts and the service list are editable in Payload under Website, seeded in German and English. Code fallbacks cover an empty global.
- Verified: 95 integration tests, 3 consent e2e tests, type-check and lint clean on merged `main`.
- Local `.env` holds the test container id `GTM-TEST` (uncommitted); the Docker app container was restarted with it. Remove or keep as you like; the value only matters for local checks.

## Before a real container id goes live

These are the items that would make the live site non-compliant or non-functional. Do them in this order.

1. **Rewrite the cookie policy page.** `src/endpoints/seed/legal/cookie-policy.ts` still says cookies enable "Funktionen von Slack", uses the informal "du", and lists no categories or services. It must describe the real cookies: the `consent` cookie (12 months), Google Analytics 4 (`_ga`, `_ga_*`, 2 years, Google Ireland Limited), and state that consent can be changed via the "Cookie-Einstellungen" link in the footer. Reseed afterwards (see the content workflow notes: host-side seed, then clear `.next/dev/cache/fetch-cache` in the container and restart it).
2. **Check the privacy policy wording.** It already lists Google Analytics with the AV contract. Add one sentence that analytics runs only after consent and how to withdraw it (footer link).
3. **Set up the GTM container** as described in the README: consent overview on; GA4 configuration tag with "send a page view" off, consent check `analytics_storage`, trigger custom event `page_view`; event tags for `cta_click`, `generate_lead`, `outbound_click` with data-layer variables `label`, `location`, `href`, `form_id`, `form_name`. Do not paste the GTM snippet or the noscript iframe into the site.
4. **GA4 property settings:** Google Signals off until Marketing is in use, data retention 2 months, no user id, review granular location and device data.
5. **Set `NEXT_PUBLIC_GTM_ID` in the production environment.** It is a build-time value; redeploy after setting it. Staging should stay empty or use its own container.
6. **Look at the banner and dialog in a real desktop browser once** (768 px and wider, plus a phone width). Nobody has done this yet; only Playwright in headless Chromium has exercised the flow. Check the bottom-left card, the equal-width buttons, the centred dialog and the bottom-sheet variant.
7. **Decide on consent logging.** Proof of consent (GDPR Art. 7 para. 1) currently lives only in the visitor's cookie. If you want a server-side record, the `decide()` function in `src/consent/components/ConsentProvider.tsx` is the place to call an endpoint. The spec deferred this deliberately.
8. **Push `main`.**

## Editorial rules for the CMS global

- Raising `revision` asks every visitor again. Do this after adding a service, changing a category description, or changing the banner text. Text changes without a bump silently alter what earlier visitors consented to.
- Service fields `name` and `cookies` are shared between languages on purpose (localising them would move a database column, which the Docker dev server cannot do without a reset). Write them language-neutral, for example "_ga, _ga_* · 2 Jahre / 2 years".
- The Payload MCP server only sees the `consent` global after its connection is restarted.

## Code follow-ups, none blocking

Test hygiene:
- `tests/e2e/frontend.e2e.spec.ts` "switches the language and keeps the page" fails on `main` since commit `de90b93` moved the language switch into a footer select. Update the test to use the combobox labelled "Sprache".
- `tests/helpers/consent.ts` presets the cookie with `v: 1`. Raising the CMS revision makes the banner reappear in the frontend spec; read the revision from the seed or bump both together.
- `tests/e2e/pricing.e2e.spec.ts` does not preset the consent cookie; add the same `beforeEach` when `NEXT_PUBLIC_GTM_ID` is set in CI.
- `tests/e2e/consent.e2e.spec.ts` uses a fixed 500 ms wait for the "no GTM request after reject" check. Prefer a deterministic signal (banner hidden plus network idle).
- Missing tests: dialog accept-all and reject-all buttons, Escape closing the dialog, the `generate_lead` push in the form block, `CMSLink` `track` prop in the button-wrapped branch.

Behaviour worth a decision:
- After a revision bump or an expired cookie, the settings dialog seeds its switches from the old record, so previously granted categories appear on while the banner is pending. Resetting to all off in that state is the stricter reading of "no pre-ticked boxes" (`src/consent/components/ConsentSettings.tsx`, draft initialisation).
- The delegated click listener in `src/consent/track.ts` runs in the bubble phase; a `stopPropagation()` upstream swallows a CTA click. Capture phase is more robust.
- The banner text does not mention that consent can be withdrawn; only the dialog does. One clause on the first layer would strengthen it (`src/consent/defaults.ts` and the seed).
- `purgeCookies` in `src/consent/store.ts` derives the parent domain as the last two labels, which yields `co.uk` for such hosts. Harmless on this domain; note or fix if the folder is reused elsewhere.

Polish:
- `src/consent/defaults.ts`: the `close` and `provider` strings are unused; either use `provider` as a label in the dialog or delete both.
- `src/consent/components/Switch.tsx`: the track colour transition has no `motion-reduce:` variant (the thumb has one).
- `src/Footer/Component.tsx`: the "Cookie-Einstellungen" trigger sits beside the legal list, so its spacing is the outer gap; move it into the list as the last item if the spacing looks off.
- Seed copy: the necessary service is named "Consent-Cookie"; "Cookie-Einwilligung" reads better and works in both languages.
- `src/consent/global.ts`: the `cookies` placeholder is German only; `CategoryRowLabel` falls back to a mixed-language label.
- `src/app/(frontend)/globals.css`: a second `prefers-reduced-motion` block was appended for the consent animations; fold it into the existing one.
- `src/consent/components/ConsentBanner.tsx`: the two link classNames are duplicated.

Later, with a real migration (reset script in a terminal):
- Localise the service `name` and `cookies` fields and switch the seed back to `t()` for them.

## Reuse in another Payload project

Follow `src/consent/README.md`. The important detail that is easy to miss: call `resolveConsent(global, locale)` on the server in the layout and pass the result to `ConsentProvider`. Passing the raw global would serialize the linked privacy and imprint pages into every page's payload.
