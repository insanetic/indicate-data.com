# Pricing page fed by Subneo

Date: 2026-09-13
Status: implemented under stated assumptions (built autonomously; open points listed at the end)

## 1. Goal

A pricing page for indicate-data.com that reads its plans, prices and entitlements from Subneo (the subscription platform) instead of from hand-typed CMS rows, so a change in Subneo shows up on the site without a deployment. The page has two levels: a simple card view (three app plans plus the Resi agent add-ons) and a full comparison of every entitlement grouped by feature group. The pieces that are not specific to this site are packaged so other Payload sites (and, later, any Subneo customer) can reuse them.

## 2. Inputs

- **Subneo public API** (`../../subneoio/subneo`, `api/http/v1/handler/public*.go`, DTOs in `api/http/v1/model/public/`, spec `data/artifacts/public/v1.yaml`). One catalogue route: `GET /v1/plans?family=<code>` with `Authorization: Bearer sneo_…` and an optional `Subneo-Version: YYYY-MM-DD` header (only release: `2026-09-03`). `family` is required but does not filter yet. Response: `{ data: Plan[] }`, a plan = `code, name, metadata, version, rates[], entitlements[]`. A rate is one currency × one billing period (`billingPeriod` day/week/month/year × `billingPeriodCount`), with trial, commitment, notice, early-termination and renewal-uplift fields and per-feature overage rates (`featureRates`: flat / graduated / volume, package size). An entitlement carries `featureCode, name, description, kind, group{code,name}, value, position`; `kind` is `boolean | string | number | allocation | consumable`, and `value` only holds the fields the kind names (allocation/consumable: `min/included/max` as quoted numbers or `"infinite"`, consumable adds reset period/anchor and rollover). All money is micros in quoted decimal strings. Ordering is deterministic (plans by code, entitlements by position). Not on the public API: plan-family rank and `isFeatured`, checkout or portal URLs, CORS (so the site must call it server-side).
- **Indicate product truth** (`../indicate`, `../indicate-web`): tiers `core` (€100/month), `pro` (€500/month), `enterprise` (custom), 10 % yearly rebate; pipelines included 3/10/50 with €5 per extra pipeline token; agent tokens €20/month single space and €100/month multi space; AI usage metered per model call with a monthly money budget; audit-log retention 2/50/500 days; sub-daily sync, premium connectors, data sharing, brand palettes and warehouse access for Resi are Pro and up; organisation banner is Enterprise. Roles reader/user/admin, MFA, Flying KPIs (scheduled reports, optional AI summary), template marketplace, KPI Studio, MCP for Claude/ChatGPT/Langdock. No trial, no SSO.
- **Competitor patterns**: Databox (headline quantities per card, monthly/annual toggle with "save 20 %", AI credits per plan plus top-up, comparison grouped in four categories, 12-question FAQ), Linear (grouped matrix with check / value / "Add-on" cells), Vercel (VAT note in FAQ), Resend (credits reset monthly, product keeps working when they run out). Hospitality BI: only Juyo, HotelIQ and Demand Calendar publish prices (per room or per hotel with minimums); the rest is "book a demo". Publishing prices is itself a differentiator.
- **Founder rules** (memory): no negative copy, no invented ROI numbers, Resi always via `withResi()`, deterministic and reusable code, additive schema only (Docker dev server without TTY).

## 3. Shape of the solution

Three layers, from generic to site-specific:

| Layer | Package | Contains | Depends on |
|---|---|---|---|
| Models + helpers | `packages/subneo-sdk` (`@subneo/sdk`) | Wire types mirroring the Go DTOs, enum unions, `createSubneoClient()` (`listPlans`), problem+json error, money helpers (micros → decimal, formatting), catalogue helpers (rates by currency and period, monthly equivalent and savings, plan ordering and featured detection, comparison matrix), the golden fixture from the Go wire test | nothing (uses global `fetch`) |
| Payload plugin | `packages/payload-plugin-subneo-pricing` (`@subneo/payload-pricing`) | `subneoPricingPlugin(options)` adding the `subneo-pricing` global (connection + families + overrides), a refresh endpoint, a revalidation hook; `createPricingBlock()` block factory; `getPricing()` server loader that reads the global, calls the SDK (or a fixture), applies overrides and returns a locale-independent `PricingModel` | `payload`, `next/cache`, `@subneo/sdk` |
| Site | `src/blocks/Pricing/*`, `src/i18n/dictionaries.ts`, seed | React rendering in this site's design system, UI strings in de/en, the Indicate fixture, the seeded `/pricing` page, nav and footer entries | the two packages |

Both packages live in this repo under `packages/` and are consumed through tsconfig path aliases (no workspace change, no lockfile change, the Docker dev container keeps working). Each has its own `package.json`, README and licence so it can be moved to its own repository and published later; a `build` script (`tsc`) is included but not wired into this site's pipeline.

## 4. Data flow

1. A page contains the `pricing` block. Its server component calls `getPricing({ payload, tag })`.
2. `getPricing` reads the `subneo-pricing` global with the local API (`overrideAccess: true`, the global is readable only by logged-in users so the API key never leaves the server). It resolves the API key from the global or, when empty, from `SUBNEO_API_KEY`, and the base URL from the global or `SUBNEO_API_URL`.
3. For every configured family it calls `listPlans({ family })` through `unstable_cache` keyed by base URL, family code and API version, with the TTL from the global (default 300 s) and the tag `subneo-pricing`. When the source is set to "Example data", the plugin's `fixtures` option supplies the plans instead, so the same code path runs without Subneo. When Subneo fails and nothing is cached, the loader returns an empty model and logs the problem; the block renders a short "prices on request" notice with the contact link. It never falls back to example data in live mode.
4. `buildPricingModel(plans, settings)` (pure, tested) produces the view model: families in configured order, each with ordered plans, per-plan prices per currency and period, highlight rows for the cards, a contact flag for plans without rates, and for the app family the comparison matrix (groups → rows → per-plan cells). Overrides from the global are merged by code (plan, feature, group); hidden entries are dropped; unknown groups and features coming from Subneo are kept, so new entitlements appear without a deploy.
5. The block component formats the model for the locale (number and currency formatting via `Intl`, UI strings from the dictionary) and renders. State on the client is limited to billing period, currency and the mobile plan selector.
6. Revalidation: saving the global fires `revalidateTag('subneo-pricing', { expire: 0 })`; `POST /api/subneo-pricing/refresh` (logged-in user or `Authorization: Bearer <SUBNEO_REFRESH_SECRET>`) does the same for webhooks or a cron; the TTL covers the rest.

## 5. The `subneo-pricing` global

Tabs, all labels de/en:

- **Verbindung / Connection**: `source` (select: `subneo` | `fixture`, default `fixture` until a key exists), `baseUrl` (default `https://api.subneo.io/v1`), `apiKey` (text; field read access restricted to logged-in users; empty = use env), `apiVersion` (default `2026-09-03`), `cacheSeconds` (default 300).
- **Pakete / Plan families**: `families[]` with `code` (the Subneo family code), `role` (`app` | `addon`), `label` and `lead` (localised), `unit` (localised, e.g. "pro Betrieb und Monat"), `featuredPlanCode`, `highlightFeatureCodes[]` (which entitlements the cards list; empty = first five by position), `showInComparison` (checkbox, default on for `app`).
- **Anpassungen / Overrides**: `planOverrides[]` (`planCode`, localised `name`, `tagline`, `badge`, `ctaLabel`, `ctaUrl`, `hidden`), `featureOverrides[]` (`featureCode`, localised `label`, `description`, `hidden`), `groupOverrides[]` (`groupCode`, localised `label`, `order`).
- **Buttons / CTAs**: `defaultCtaUrl` (template with `{plan}` and `{rate}` placeholders, default `https://app.indicate-data.com/signup?plan={plan}&rate={rate}`), `contactUrl` for plans without rates.

Everything is additive; nothing existing changes.

## 6. Conventions the plugin understands in Subneo metadata

Because rank and featured are not public, the plugin reads plan metadata keys when the CMS has no override: `rank` (number, ascending), `featured` (`"true"`), `tagline`, `badge`, `ctaUrl`. Plans without rates are "contact" plans and sort last. Within a family the order is: CMS `featuredPlanCode` and overrides first for display attributes; sort by `metadata.rank`, then by lowest monthly-equivalent amount, then by code.

## 7. Page design

Route `/de/pricing` and `/en/pricing` (slug shared, like every page). Layout, top to bottom:

1. **Pricing block** (`background: default`): section header (eyebrow "Preise", heading "Klar kalkuliert. Pro Betrieb, pro Monat.", lead one line). Controls row: billing period segmented control (Monatlich / Jährlich with a "−10 %" tag computed from the rates), currency select only when more than one currency exists. Three app plan cards: name, tagline, price (`€ 100` large, "pro Betrieb / Monat"; yearly view shows the per-month equivalent with "jährlich abgerechnet" and the yearly total in small type), the five highlight rows (quantities render as "3 Datenquellen inklusive", consumables as "500 Resi-Credits / Monat", booleans as check + label), the card CTA. The featured plan gets the ink ring and the primary button; the Enterprise card shows "Individuell" and a contact button. Under the cards one line: "Alle Preise zzgl. MwSt. Monatlich kündbar." plus a trial line when the rate has a trial.
2. **Resi add-ons** (`background: tinted`, still inside the block): heading "Resi wächst mit." with a lead that every plan includes credits and MCP access; add-on plans as compact horizontal cards (name, price, unit, two rows). Rendered from the `addon` family.
3. **Comparison** (still inside the block, `showComparison`): heading "Alles im Vergleich". Desktop: table with a sticky header row of plan names and prices, groups as sub-headings, cells check / dash / value / "500 / Monat" / "Add-on" (feature has an overage rate but no included amount). Mobile (< md): segmented plan selector above a two-column list (feature, value) for the chosen plan; the header row stays sticky.
4. **FAQ block** (existing) with six seeded questions: what counts as a data source, how Resi credits work (reset monthly, no rollover, dashboards keep working), yearly billing, switching plans, hotel groups and agencies, VAT and currency.
5. **CTA block** (existing): demo booking.

Motion: `.reveal` and `.reveal-stagger` on entry; the price number crossfades on toggle (opacity + 4 px rise, 200 ms, none under reduced motion). No scroll-linked animation.

## 8. Fixture (Indicate example data)

Two families shaped exactly like the API. Family `indicate-app`: `core` (€100/month, €1 080/year), `pro` (€500/month, €5 400/year, featured), `enterprise` (no rates, contact). Entitlement groups and features: Daten & Integrationen (pipelines allocation 3/10/50 with €5 overage rate, premium connectors, sync interval string, CSV import, data sharing, warehouse export), Dashboards & Reporting (dashboards allocation, templates, KPI Studio, Flying KPIs, AI summary in reports, brand palettes), Resi (chat, dashboard building, credits consumable 100/500/2 500 per month, warehouse access, MCP clients, agent tokens allocation 1/5/unlimited), Team & Governance (users unlimited, roles, MFA, audit-log days number 2/50/500, API tokens, service accounts, organisation branding), Support (support channel string, onboarding, SLA). Family `indicate-agent`: `agent-single` (€20/month, one agent token for one space), `agent-multi` (€100/month, one token across all spaces), `resi-credits-500` (€25/month, +500 credits), `resi-credits-2500` (€100/month, +2 500 credits). All prices are illustrative; the numbers come from the app's constants where they exist.

## 9. Files

- `packages/subneo-sdk/src/{index,types,client,errors,money,catalog}.ts`, `fixtures/golden.ts`, tests in `tests/int/subneo-sdk.int.spec.ts`.
- `packages/payload-plugin-subneo-pricing/src/{index,plugin,global,block,types,model,load,hooks,endpoint}.ts`, tests in `tests/int/subneo-pricing-model.int.spec.ts`.
- Site: `src/plugins/index.ts` (register plugin with the Indicate fixture), `src/collections/Pages/index.ts` and `src/blocks/registry.ts` and `RenderBlocks.tsx` (block), `src/blocks/Pricing/{Component.tsx,Client.tsx,PlanCard.tsx,Comparison.tsx,format.ts}`, `src/i18n/dictionaries.ts` (pricing strings), `src/pricing/fixture.ts` (Indicate example data), `src/endpoints/seed/pricing.ts` and `index.ts` and `content.ts` (page, nav, footer), `tsconfig.json` paths, `src/environment.d.ts` (env keys), `tests/int/pricing-block.int.spec.tsx`, `tests/e2e/pricing.e2e.spec.ts`.

## 10. Assumptions / open points

- The Subneo public API does not filter by family yet; the plugin sends `family` and also filters client-side by `metadata.family` when present, so the day Subneo narrows the set nothing changes.
- Rank and featured come from CMS or plan metadata until Subneo exposes family membership publicly.
- Feature names and descriptions arrive from Subneo in one language; German and English overrides live in the CMS. String-valued entitlements (e.g. sync interval) are shown as delivered.
- No checkout exists in Subneo; the card CTA links to the app's signup with `plan` and `rate` query parameters, configurable per plan.
- The `pricingTeaser` block stays hand-typed; feeding it from Subneo is a follow-up.
- Prices in the fixture are illustrative and must be confirmed before the page goes live with `source: subneo`.
