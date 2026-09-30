# @subneo/payload-pricing

A Payload CMS plugin that turns Subneo plans into a pricing page. It adds:

- a **`subneo-pricing` global**: data source (live API, plans maintained by hand, or example
  data), base URL, API version, API key (or an environment variable), cache TTL, the plan families to show (main plans and
  add-ons), the featured plan, which entitlements the cards list, per-language overrides for
  plan, feature and group names, and the button templates;
- a **`pricing` block** (`createPricingBlock()`) with headings and switches for cards, add-ons and
  the comparison table;
- **`getPricing()`**, a server loader that reads the global, fetches every family through
  `unstable_cache` (tag `subneo-pricing`, TTL from the global) and returns a `PricingModel`;
- a **refresh endpoint** `POST /api/subneo-pricing/refresh` (admin session or
  `Authorization: Bearer $SUBNEO_REFRESH_SECRET`) and an `afterChange` hook on the global, both
  dropping the cache.

Rendering stays in the site so it matches the site's design system. The model is
locale-aware for labels (overrides come from the localised global) and locale-neutral for numbers.

```ts
// payload.config.ts
import { subneoPricingPlugin, createPricingBlock } from '@subneo/payload-pricing'

plugins: [subneoPricingPlugin({ fixtures: { 'my-app': examplePlans } })]
// Pages collection
blocks: [createPricingBlock({ localized: true, before: [sectionHeader()], after: [sectionSettings()] })]
```

```tsx
// Block component (server)
const model = await getPricing({ payload, locale, familyCodes, fixtures })
```

## Conventions read from Subneo plan metadata

`rank` (order), `featured` (`"true"`), `family` (client-side narrowing), `tagline`, `badge`,
`ctaUrl`, `ctaLabel`. CMS overrides win over metadata. Plans without rates are "contact" plans.

## Plans maintained by hand

While a catalogue is not live in Subneo yet, set the data source to "Maintained by hand" and
edit the "Plans (manual)" tab: comparison groups, features (code, name, type, group) and plans
(family, EUR monthly and yearly price, add-on prices, and one text value per feature). Values by
feature type: `ja`/`nein`; amount `3` (more can be added), `10/10` (included/maximum) or
`unbegrenzt`; monthly allowance `500`; number `50`; text as typed. The admin refuses values that do
not fit the feature's type.

`manualToPlans()` turns these fields into the exact `GET /v1/plans` shape (rate codes
`monthly_eur`/`yearly_eur`, rank = order within the family), so switching to the live API later
changes nothing else. `plansToManual()` goes the other way, e.g. to start from example plans.
The row labels come from `@subneo/payload-pricing/admin#ManualRowLabel` (override with
`componentPaths.rowLabel`).
