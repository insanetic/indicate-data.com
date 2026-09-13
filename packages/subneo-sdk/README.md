# @subneo/sdk

Models and helpers for the [Subneo](https://subneo.io) public API. No UI, no framework: the
types mirror the Go DTOs of `GET /v1/plans` field for field, the client is a thin `fetch`
wrapper, and the helpers answer what a pricing page asks (currencies, billing periods, monthly
equivalents, savings, plan order, comparison matrix).

```ts
import { createSubneoClient, sortPlans, findRate, formatMoney, rateAmount } from '@subneo/sdk'

const subneo = createSubneoClient({ apiKey: process.env.SUBNEO_API_KEY! })
const plans = sortPlans(await subneo.listPlans({ family: 'app' }))
for (const plan of plans) {
  const monthly = findRate(plan, 'EUR', 'month')
  console.log(plan.name, monthly ? formatMoney(rateAmount(monthly), 'EUR', 'de-DE') : 'contact us')
}
```

## Wire conventions

- Money and 64-bit integers are decimal **strings** (`"49000000"` micros). Use `microsToAmount`.
- Capacities are `"5"` or `"infinite"`. Use `parseCapacity`.
- Entitlement values only carry the fields their `kind` names. Use `entitlementView` for a
  discriminated union.
- `metadata` is always an object. The helpers read the keys in `META` (`rank`, `featured`,
  `family`, `tagline`, `badge`, `ctaUrl`, `ctaLabel`) when present.

## Versioning

Requests send `Subneo-Version: 2026-09-03` (the release this SDK was written against). Pass
`apiVersion` to pin another date.

`goldenPlan` is the exact document the Go wire test asserts; keep it in sync when the API changes.
