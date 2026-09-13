# Subneo pricing page — implementation plan

Spec: `docs/superpowers/specs/2026-09-13-subneo-pricing-page-design.md`. Built 2026-09-13.

- [x] `packages/subneo-sdk`: wire types mirroring the Go DTOs, `createSubneoClient`, problem+json errors, money and catalogue helpers, golden fixture from the Go wire test, README, package files.
- [x] `packages/payload-plugin-subneo-pricing`: plugin (global + refresh endpoint), `createPricingBlock`, `buildPricingModel` (pure), `getPricing` (global → cached fetch or fixtures → model), revalidation hook, README.
- [x] Site: tsconfig aliases, plugin registered, `pricing` block on Pages + registry + renderer, Indicate fixture (`src/pricing/fixture.ts`), dictionary strings, env typings, price-swap CSS.
- [x] Block UI: controls (period + currency), plan cards, add-on cards, comparison (desktop table with sticky header, mobile plan switcher), CTA links.
- [x] Seed: `/pricing` page (block, logos, FAQ, closing), `subneo-pricing` global with German/English overrides, nav and footer entries.
- [x] Tests: SDK, model, block render (vitest); Playwright e2e for the page and its mobile view.
- [ ] Go live: create a `reader` API key in Subneo bound to the environment, paste it into the global (or set `SUBNEO_API_KEY`), switch source to "Subneo API", confirm prices.
- [ ] Optional: feed `pricingTeaser` from the same model; per-value translations for string entitlements; publish the packages.
