# @subneo/payload-pricing

A Payload CMS plugin that turns Subneo plans into a pricing page. It adds:

- a **`subneo-pricing` global**: data source (live API or example data), base URL, API version,
  API key (or an environment variable), cache TTL, the plan families to show (main plans and
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
