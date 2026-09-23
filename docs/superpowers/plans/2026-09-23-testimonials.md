# Central Testimonials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Testimonials live in a central Payload collection with cohort tags; the page block picks them by hand or deterministically, and every page updates when a testimonial changes.

**Architecture:** A workspace package `@subneo/payload-testimonials` (`packages/payload-plugin-testimonials`) adds two collections, a block factory, a pure selection function (rendezvous hashing), a tag-cached loader, two endpoints (usage, preview) and admin components. The site wires it like `@subneo/payload-pricing`: tsconfig path aliases, `createTestimonialsBlock({ before, after, extraFields })`, and its own server component for the markup. A conversion utility moves the existing inline quotes into the collection.

**Tech Stack:** Payload 3.90.1 (Postgres, drafts, localisation de/en), Next.js (App Router, `unstable_cache`, `revalidateTag`), React 19, `@payloadcms/ui` hooks, Vitest 5 (`tests/int/**/*.int.spec.ts`, jsdom).

**Spec:** `docs/superpowers/specs/2026-09-23-testimonials-design.md`

## Global Constraints

- Schema changes must be **additive** (dev DB is push-managed in a Docker container with no TTY). Never remove or rename an existing field; the old inline `items` array stays in the block as a hidden field.
- Block slug stays `testimonials`, `interfaceName` stays `TestimonialsBlock`.
- Collection slugs: `testimonials`, `testimonial-tags`. Cache tag: `testimonials`. Pool cache `revalidate: 86400`.
- Package imports nothing from the site (`@/…`). Package labels are `{ de, en }` via `l()`.
- Visitors never see tags. No per-visit randomness.
- Host-side Payload CLI commands run as `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload ./node_modules/.bin/payload <cmd>` (NODE_ENV=production skips the dev push). The dev app runs in container `indicate-datacomdemo-app-1`.
- Revalidation calls must be skipped when `req.context.disableRevalidate` is set (seed, scripts, migrations) and must never throw outside a Next request.
- Spec deviations decided while planning (apply them, they are intentional):
  - The auto-mode count field is named `count` (not `limit`) to avoid the SQL/query keyword.
  - The admin title is a **stored** `title` field filled by a `beforeChange` hook (Payload list search/sort need a column; a virtual field cannot be `useAsTitle` reliably).
  - The admin preview does not apply per-page dedupe (it has no page context); the frontend and usage endpoint do.
  - Until the conversion runs, the site component renders a block's legacy inline `items` when it has them and no `testimonials` references (deploy-order safety).

## Review Focus

1. **Blocks that exist before conversion** — after the schema push, old blocks get `mode = 'auto'` (column default) with no references; they must keep showing their inline quotes, not "all testimonials". Pinned by the legacy-fallback test in Task 6.
2. **Deleted or unpublished referenced testimonials** — a manual/pinned id that is no longer in the pool must be skipped silently, never crash or render an empty card. Pinned in Task 1 tests.
3. **Mixed id types** — form state, JSON bodies and Payload docs mix `number` and `string` ids; selection must compare as strings. Pinned in Task 1 tests.
4. **Expiry at the day boundary** — `approvedUntil` = today still shows; yesterday does not. Pinned in Task 1 tests.
5. **Missing / out-of-range count and seed** — `count` null, 0 or > pool falls back sensibly (default 3, clamp 1–6); missing `seed` uses the block id. Pinned in Task 1 tests.

---

## File Structure

```
packages/payload-plugin-testimonials/
  package.json, tsconfig.json, LICENSE, README.md
  src/index.ts          config-side exports (plugin, block factory, types, select)
  src/types.ts          Testimonial / Tag / block data types, idOf, options + resolveOptions
  src/labels.ts         l(de, en)
  src/hash.ts           fnv1a + fmix32 finaliser
  src/select.ts         selectTestimonials, countEligible, selectForLayout (pure)
  src/collections.ts    createTestimonialsCollection, createTagsCollection
  src/block.ts          createTestimonialsBlock
  src/hooks.ts          createRevalidateHook, setTitle
  src/usage.ts          findUsage (pure)
  src/endpoints.ts      usage + preview endpoint factories
  src/plugin.ts         testimonialsPlugin
  src/server.ts         loadPool, getTestimonials (+ re-exports select)
  src/admin.ts          client component exports
  src/components/SelectionPreview.tsx
  src/components/UsagePanel.tsx
  src/components/ApprovedUntilCell.tsx
  src/components/i18n.ts
tests/int/testimonials-select.int.spec.ts
tests/int/testimonials-config.int.spec.ts
tests/int/testimonials-server.int.spec.ts
tests/int/testimonials-usage.int.spec.ts
tests/int/testimonials-convert.int.spec.ts
src/blocks/Testimonials/config.ts        (rewrite: factory + legacy items)
src/blocks/Testimonials/Component.tsx    (async, loader, legacy fallback, link)
src/blocks/Testimonials/legacy.ts        (legacy fallback helper)
src/blocks/RenderBlocks.tsx              (pass layout + blockIndex to testimonials)
src/plugins/index.ts                     (plugin + MCP entries)
src/utilities/convertInlineTestimonials.ts
scripts/convert-testimonials.ts
src/endpoints/seed/testimonials.ts, index.ts, content.ts, pages.ts, about.ts
src/migrations/<stamp>_testimonials.ts   (generated + data step)
tsconfig.json                            (aliases)
```

---

### Task 1: Package scaffold, hashing and pure selection

**Files:**
- Create: `packages/payload-plugin-testimonials/package.json`, `tsconfig.json`, `LICENSE`, `src/labels.ts`, `src/types.ts`, `src/hash.ts`, `src/select.ts`, `src/index.ts`
- Modify: `tsconfig.json` (paths)
- Test: `tests/int/testimonials-select.int.spec.ts`

**Interfaces:**
- Produces:
  - `type Id = number | string`; `idOf(v): string | null`
  - `interface Testimonial { id: Id; quote?: string | null; name?: string | null; role?: string | null; company?: string | null; avatar?: unknown; logo?: unknown; tags?: Rel<TestimonialTag>[] | null; link?: TestimonialLink | null; approvedUntil?: string | null; title?: string | null; _status?: 'draft' | 'published' | null }`
  - `interface TestimonialsBlockData { id?: string | null; blockType?: string; mode?: 'auto' | 'manual' | null; testimonials?: Rel<Testimonial>[] | null; tags?: Rel<TestimonialTag>[] | null; tagMatch?: 'any' | 'all' | null; count?: number | null; pinned?: Rel<Testimonial>[] | null; exclude?: Rel<Testimonial>[] | null; seed?: string | null }`
  - `type Reason = 'manual' | 'pinned' | 'auto'`; `interface Selected { testimonial: Testimonial; reason: Reason }`
  - `selectTestimonials({ pool, block, now?, alreadyShown? }): Selected[]`
  - `countEligible({ pool, block, now? }): number`
  - `selectForLayout({ layout, pool, blockSlug?, now? }): Map<number, Selected[]>`
  - `fnv1a(s: string): number`, `score(seed: string, id: string): number`
  - `DEFAULT_COUNT = 3`, `MAX_COUNT = 6`

- [ ] **Step 1: Scaffold the package**

`packages/payload-plugin-testimonials/package.json`:

```json
{
  "name": "@subneo/payload-testimonials",
  "version": "0.1.0",
  "description": "Central testimonials for Payload CMS: collection, cohort tags, a page block with manual or stable automatic selection, where-used panel.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server.ts",
    "./admin": "./src/admin.ts"
  },
  "files": ["src", "README.md", "LICENSE"],
  "scripts": { "build": "tsc -p tsconfig.json" },
  "peerDependencies": {
    "@payloadcms/ui": "^3.0.0",
    "next": ">=15",
    "payload": "^3.0.0",
    "react": "^19.0.0"
  },
  "devDependencies": { "typescript": "^5.7.0" },
  "publishConfig": {
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
      "./server": { "types": "./dist/server.d.ts", "import": "./dist/server.js" },
      "./admin": { "types": "./dist/admin.d.ts", "import": "./dist/admin.js" }
    }
  }
}
```

Copy `packages/payload-plugin-consent/tsconfig.json` and `packages/payload-plugin-consent/LICENSE` verbatim.

In the root `tsconfig.json` `paths`, after the consent entries, add:

```json
      "@subneo/payload-testimonials": ["./packages/payload-plugin-testimonials/src/index.ts"],
      "@subneo/payload-testimonials/server": ["./packages/payload-plugin-testimonials/src/server.ts"],
      "@subneo/payload-testimonials/admin": ["./packages/payload-plugin-testimonials/src/admin.ts"]
```

`src/labels.ts`:

```ts
/** Admin labels in German and English; Payload falls back to the config's fallback language. */
export const l = (de: string, en: string): Record<string, string> => ({ de, en })
```

- [ ] **Step 2: Types**

`src/types.ts`:

```ts
export type Id = number | string

/** A relationship value: an id, or the populated document. */
export type Rel<T extends { id: Id }> = Id | T | null | undefined

export interface TestimonialTag {
  id: Id
  title?: string | null
  slug?: string | null
}

export interface TestimonialLink {
  type?: 'none' | 'internal' | 'external' | null
  doc?: { relationTo: string; value: Id | { id: Id; slug?: string | null; title?: string | null } } | null
  url?: string | null
  label?: string | null
}

export interface Testimonial {
  id: Id
  quote?: string | null
  name?: string | null
  role?: string | null
  company?: string | null
  avatar?: unknown
  logo?: unknown
  tags?: Rel<TestimonialTag>[] | null
  link?: TestimonialLink | null
  approvedUntil?: string | null
  title?: string | null
  _status?: 'draft' | 'published' | null
}

export interface TestimonialsBlockData {
  id?: string | null
  blockType?: string
  mode?: 'auto' | 'manual' | null
  testimonials?: Rel<Testimonial>[] | null
  tags?: Rel<TestimonialTag>[] | null
  tagMatch?: 'any' | 'all' | null
  count?: number | null
  pinned?: Rel<Testimonial>[] | null
  exclude?: Rel<Testimonial>[] | null
  seed?: string | null
}

export type Reason = 'manual' | 'pinned' | 'auto'

export interface Selected {
  testimonial: Testimonial
  reason: Reason
}

export const DEFAULT_COUNT = 3
export const MAX_COUNT = 6

/** Normalises a relationship value to a string id (ids arrive as numbers or strings). */
export const idOf = (value: unknown): string | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') {
    const id = (value as { id?: Id }).id
    return id === undefined || id === null ? null : String(id)
  }
  return String(value)
}

export const idsOf = (values: unknown[] | null | undefined): string[] =>
  (values || []).map(idOf).filter((id): id is string => id !== null)
```

(Options types are added in Task 2.)

- [ ] **Step 3: Write the failing selection tests**

`tests/int/testimonials-select.int.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { countEligible, fnv1a, score, selectForLayout, selectTestimonials, type Testimonial } from '@subneo/payload-testimonials'

const t = (id: number, extra: Partial<Testimonial> = {}): Testimonial => ({ id, name: `P${id}`, quote: `Q${id}`, ...extra })
const pool = (n: number, extra: (i: number) => Partial<Testimonial> = () => ({})) =>
  Array.from({ length: n }, (_, i) => t(i + 1, extra(i + 1)))
const ids = (s: { testimonial: Testimonial }[]) => s.map((x) => String(x.testimonial.id))
const now = new Date('2026-09-23T10:00:00Z')

describe('hash', () => {
  it('is stable', () => {
    expect(fnv1a('abc')).toBe(fnv1a('abc'))
    expect(fnv1a('abc')).not.toBe(fnv1a('abd'))
  })
  it('spreads adjacent ids evenly (no bias towards low ids)', () => {
    const wins: Record<string, number> = {}
    for (let s = 0; s < 2000; s++) {
      const top = ['1', '2', '3', '4', '5'].sort((a, b) => score(`seed${s}`, b) - score(`seed${s}`, a))[0]
      wins[top] = (wins[top] || 0) + 1
    }
    for (const k of ['1', '2', '3', '4', '5']) expect(wins[k]).toBeGreaterThan(300) // ~400 expected
  })
})

describe('selectTestimonials — auto', () => {
  it('is deterministic for the same seed', () => {
    const block = { mode: 'auto' as const, seed: 'home', count: 3 }
    expect(ids(selectTestimonials({ pool: pool(10), block, now }))).toEqual(ids(selectTestimonials({ pool: pool(10), block, now })))
  })

  it('differs between seeds (at least sometimes)', () => {
    const picks = new Set<string>()
    for (let s = 0; s < 20; s++) picks.add(ids(selectTestimonials({ pool: pool(10), block: { seed: `s${s}`, count: 3 }, now })).join())
    expect(picks.size).toBeGreaterThan(5)
  })

  it('adding a testimonial changes at most one slot, and only to the newcomer', () => {
    for (let s = 0; s < 200; s++) {
      const block = { seed: `s${s}`, count: 3 }
      const before = ids(selectTestimonials({ pool: pool(10), block, now }))
      const after = ids(selectTestimonials({ pool: pool(11), block, now }))
      const lost = before.filter((id) => !after.includes(id))
      const gained = after.filter((id) => !before.includes(id))
      expect(lost.length).toBeLessThanOrEqual(1)
      expect(gained).toEqual(lost.length ? ['11'] : [])
    }
  })

  it('removing a testimonial that is not shown changes nothing', () => {
    for (let s = 0; s < 200; s++) {
      const block = { seed: `s${s}`, count: 3 }
      const before = ids(selectTestimonials({ pool: pool(10), block, now }))
      const hidden = pool(10).find((x) => !before.includes(String(x.id)))!
      const after = ids(selectTestimonials({ pool: pool(10).filter((x) => x.id !== hidden.id), block, now }))
      expect(after).toEqual(before)
    }
  })

  it('puts pinned first in their order and counts them toward count', () => {
    const r = selectTestimonials({ pool: pool(10), block: { seed: 'x', count: 3, pinned: [7, 2] }, now })
    expect(ids(r).slice(0, 2)).toEqual(['7', '2'])
    expect(r.map((x) => x.reason)).toEqual(['pinned', 'pinned', 'auto'])
    expect(r).toHaveLength(3)
  })

  it('skips excluded ones', () => {
    const r = selectTestimonials({ pool: pool(4), block: { seed: 'x', count: 6, exclude: [2, { id: 3 }] }, now })
    expect(ids(r).sort()).toEqual(['1', '4'])
  })

  it('filters by tags: any / all / none', () => {
    const p = [t(1, { tags: [10] }), t(2, { tags: [10, 20] }), t(3, { tags: [{ id: 20 }] }), t(4)]
    const pick = (block: object) => ids(selectTestimonials({ pool: p, block: { seed: 'x', count: 6, ...block }, now })).sort()
    expect(pick({ tags: [10] })).toEqual(['1', '2'])
    expect(pick({ tags: [10, 20], tagMatch: 'any' })).toEqual(['1', '2', '3'])
    expect(pick({ tags: [10, 20], tagMatch: 'all' })).toEqual(['2'])
    expect(pick({ tags: [] })).toEqual(['1', '2', '3', '4'])
  })

  it('treats approvedUntil by day: today shows, yesterday does not', () => {
    const p = [t(1, { approvedUntil: '2026-09-23T00:00:00.000Z' }), t(2, { approvedUntil: '2026-09-22T12:00:00.000Z' }), t(3, { approvedUntil: null })]
    expect(ids(selectTestimonials({ pool: p, block: { seed: 'x', count: 6 }, now })).sort()).toEqual(['1', '3'])
  })

  it('clamps count: null → 3, 0 → 1, 99 → 6, more than pool → pool size', () => {
    expect(selectTestimonials({ pool: pool(10), block: { seed: 'x', count: null }, now })).toHaveLength(3)
    expect(selectTestimonials({ pool: pool(10), block: { seed: 'x', count: 0 }, now })).toHaveLength(1)
    expect(selectTestimonials({ pool: pool(10), block: { seed: 'x', count: 99 }, now })).toHaveLength(6)
    expect(selectTestimonials({ pool: pool(2), block: { seed: 'x', count: 5 }, now })).toHaveLength(2)
  })

  it('falls back to the block id when seed is missing', () => {
    const a = ids(selectTestimonials({ pool: pool(10), block: { id: 'blk1', count: 3 }, now }))
    const b = ids(selectTestimonials({ pool: pool(10), block: { id: 'blk1', seed: 'blk1', count: 3 }, now }))
    expect(a).toEqual(b)
  })

  it('compares mixed id types as strings', () => {
    const r = selectTestimonials({ pool: pool(5), block: { seed: 'x', count: 2, pinned: ['4'], exclude: ['1', 2, 3, 5] }, now })
    expect(ids(r)).toEqual(['4'])
  })

  it('skips pinned ids that are not in the pool (deleted/unpublished) or expired', () => {
    const p = [t(1), t(2, { approvedUntil: '2020-01-01T00:00:00.000Z' })]
    const r = selectTestimonials({ pool: p, block: { seed: 'x', count: 3, pinned: [99, 2, 1] }, now })
    expect(ids(r)).toEqual(['1'])
  })

  it('returns [] for an empty pool', () => {
    expect(selectTestimonials({ pool: [], block: { seed: 'x' }, now })).toEqual([])
  })

  it('skips alreadyShown in auto mode', () => {
    const r = selectTestimonials({ pool: pool(3), block: { seed: 'x', count: 6 }, now, alreadyShown: new Set(['2']) })
    expect(ids(r).sort()).toEqual(['1', '3'])
  })
})

describe('selectTestimonials — manual', () => {
  it('keeps the chosen order, ignores tags/count/alreadyShown, drops missing and expired', () => {
    const p = [...pool(5), t(6, { approvedUntil: '2020-01-01T00:00:00.000Z' })]
    const r = selectTestimonials({
      pool: p,
      block: { mode: 'manual', testimonials: [5, { id: 1 }, 99, 6, 3], tags: [123], count: 1 },
      now,
      alreadyShown: new Set(['5']),
    })
    expect(ids(r)).toEqual(['5', '1', '3'])
    expect(r.every((x) => x.reason === 'manual')).toBe(true)
  })
})

describe('countEligible', () => {
  it('counts pool matches for the filter (ignoring count)', () => {
    const p = [t(1, { tags: [10] }), t(2, { tags: [10] }), t(3)]
    expect(countEligible({ pool: p, block: { tags: [10], count: 1 }, now })).toBe(2)
  })
})

describe('selectForLayout', () => {
  it('dedupes later auto blocks against earlier ones and ignores other block types', () => {
    const layout = [
      { blockType: 'hero' },
      { blockType: 'testimonials', mode: 'manual', testimonials: [1, 2] },
      { blockType: 'testimonials', mode: 'auto', seed: 'x', count: 6 },
    ]
    const map = selectForLayout({ layout, pool: pool(4), now })
    expect(map.has(0)).toBe(false)
    expect(ids(map.get(1)!)).toEqual(['1', '2'])
    expect(ids(map.get(2)!).sort()).toEqual(['3', '4'])
  })
})
```

- [ ] **Step 4: Run to verify it fails**

Run: `pnpm test:int tests/int/testimonials-select.int.spec.ts`
Expected: FAIL — cannot resolve `@subneo/payload-testimonials` exports.

- [ ] **Step 5: Implement hash and selection**

`src/hash.ts`:

```ts
/**
 * FNV-1a (32 bit) with the murmur3 finaliser. FNV alone barely changes its output when only the
 * last character differs ("seed:1" vs "seed:2"), which would rank testimonials by id; the
 * finaliser spreads those bits.
 */
export const fnv1a = (input: string): number => {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

/** Rendezvous score of one testimonial for one block seed. */
export const score = (seed: string, id: string): number => fnv1a(`${seed}:${id}`)
```

`src/select.ts`:

```ts
import { score } from './hash'
import { DEFAULT_COUNT, MAX_COUNT, idOf, idsOf, type Selected, type Testimonial, type TestimonialsBlockData } from './types'

const day = (date: Date) => date.toISOString().slice(0, 10)

/** `approvedUntil` is a permission date: valid through that whole (UTC) day. */
const isExpired = (t: Testimonial, now: Date) => Boolean(t.approvedUntil) && day(new Date(t.approvedUntil as string)) < day(now)

const matchesTags = (t: Testimonial, block: TestimonialsBlockData) => {
  const wanted = idsOf(block.tags)
  if (wanted.length === 0) return true
  const has = new Set(idsOf(t.tags))
  return block.tagMatch === 'all' ? wanted.every((id) => has.has(id)) : wanted.some((id) => has.has(id))
}

const clampCount = (count: number | null | undefined) =>
  Math.min(MAX_COUNT, Math.max(1, typeof count === 'number' && Number.isFinite(count) ? Math.round(count) : DEFAULT_COUNT))

const seedOf = (block: TestimonialsBlockData) => block.seed || block.id || ''

interface Args {
  pool: Testimonial[]
  block: TestimonialsBlockData
  now?: Date
  /** Ids shown by earlier blocks on the same page; skipped in auto mode. */
  alreadyShown?: Set<string>
}

const eligible = ({ pool, block, now = new Date() }: Args) => {
  const excluded = new Set(idsOf(block.exclude))
  return pool.filter((t) => !isExpired(t, now) && !excluded.has(String(t.id)) && matchesTags(t, block))
}

/** Number of testimonials matching the block's filter (for the admin hint). */
export const countEligible = (args: Args): number => eligible(args).length

/**
 * Picks the testimonials a block shows. Pure: the site, the admin preview and the usage
 * endpoint all call this, so they always agree. The pool must already hold only what may be
 * shown (published, or drafts in preview); deleted or unpublished ids are simply not found.
 */
export const selectTestimonials = (args: Args): Selected[] => {
  const { pool, block, now = new Date(), alreadyShown = new Set<string>() } = args
  const byId = new Map(pool.map((t) => [String(t.id), t]))

  if (block.mode === 'manual') {
    return idsOf(block.testimonials)
      .map((id) => byId.get(id))
      .filter((t): t is Testimonial => Boolean(t) && !isExpired(t as Testimonial, now))
      .map((testimonial) => ({ testimonial, reason: 'manual' as const }))
  }

  const count = clampCount(block.count)
  const candidates = eligible({ pool, block, now }).filter((t) => !alreadyShown.has(String(t.id)))
  const candidateIds = new Set(candidates.map((t) => String(t.id)))

  const pinned = idsOf(block.pinned)
    .filter((id) => candidateIds.has(id))
    .slice(0, count)
    .map((id) => ({ testimonial: byId.get(id) as Testimonial, reason: 'pinned' as const }))
  const taken = new Set(pinned.map((p) => String(p.testimonial.id)))

  const seed = seedOf(block)
  const rest = candidates
    .filter((t) => !taken.has(String(t.id)))
    .map((t) => ({ t, s: score(seed, String(t.id)) }))
    .sort((a, b) => b.s - a.s || String(a.t.id).localeCompare(String(b.t.id)))
    .slice(0, count - pinned.length)
    .map(({ t }) => ({ testimonial: t, reason: 'auto' as const }))

  return [...pinned, ...rest]
}

/**
 * Resolves every testimonials block of a page layout in order, so a later auto block does not
 * repeat what an earlier block already shows. Keys are layout indexes.
 */
export const selectForLayout = ({
  layout,
  pool,
  blockSlug = 'testimonials',
  now = new Date(),
}: {
  layout: unknown[] | null | undefined
  pool: Testimonial[]
  blockSlug?: string
  now?: Date
}): Map<number, Selected[]> => {
  const result = new Map<number, Selected[]>()
  const shown = new Set<string>()
  ;(layout || []).forEach((raw, index) => {
    const block = raw as TestimonialsBlockData
    if (block?.blockType !== blockSlug) return
    const selected = selectTestimonials({ pool, block, now, alreadyShown: shown })
    for (const s of selected) shown.add(String(s.testimonial.id))
    result.set(index, selected)
  })
  return result
}

export { idOf }
```

`src/index.ts` (grows in later tasks):

```ts
export * from './types'
export { fnv1a, score } from './hash'
export { countEligible, selectForLayout, selectTestimonials } from './select'
```

- [ ] **Step 6: Run the tests**

Run: `pnpm test:int tests/int/testimonials-select.int.spec.ts`
Expected: PASS (all).

- [ ] **Step 7: Commit**

```bash
git add packages/payload-plugin-testimonials tsconfig.json tests/int/testimonials-select.int.spec.ts
git commit -m "Testimonials package: stable rendezvous selection"
```

---

### Task 2: Collections, plugin and revalidation

**Files:**
- Create: `packages/payload-plugin-testimonials/src/collections.ts`, `src/hooks.ts`, `src/plugin.ts`
- Modify: `packages/payload-plugin-testimonials/src/types.ts` (options), `src/index.ts`, `src/plugins/index.ts`
- Test: `tests/int/testimonials-config.int.spec.ts`

**Interfaces:**
- Consumes: `l` (Task 1).
- Produces:
  - `interface TestimonialsPluginOptions { enabled?: boolean; slugs?: { testimonials?: string; tags?: string }; mediaSlug?: string; linkCollections?: string[]; adminGroup?: string | Record<string, string>; cacheTag?: string; usage?: false | { collection: string; field: string; blockSlug?: string }; componentPaths?: Partial<ComponentPaths> }`
  - `interface ResolvedOptions { slugs: { testimonials: string; tags: string }; mediaSlug: string; linkCollections: string[]; adminGroup: string | Record<string, string>; cacheTag: string; usage: false | { collection: string; field: string; blockSlug: string }; componentPaths: ComponentPaths; localized: boolean }`
  - `interface ComponentPaths { usagePanel: string; selectionPreview: string; approvedUntilCell: string }`
  - `resolveOptions(options, localized): ResolvedOptions`
  - `DEFAULT_CACHE_TAG = 'testimonials'`
  - `createTestimonialsCollection(o: ResolvedOptions): CollectionConfig`
  - `createTagsCollection(o: ResolvedOptions): CollectionConfig`
  - `createRevalidateHook(tag: string)` (usable as afterChange and afterDelete)
  - `testimonialsPlugin(options?): Plugin`

- [ ] **Step 1: Write the failing config test**

`tests/int/testimonials-config.int.spec.ts`:

```ts
import type { Config, CollectionConfig, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { testimonialsPlugin } from '@subneo/payload-testimonials'

const base = { collections: [], localization: { locales: ['de', 'en'], defaultLocale: 'de' } } as unknown as Config
const byName = (fields: Field[], name: string) => fields.find((f) => 'name' in f && f.name === name) as Field & Record<string, unknown>
const collection = (config: Config, slug: string) => (config.collections as CollectionConfig[]).find((c) => c.slug === slug)!

describe('testimonialsPlugin', () => {
  it('adds both collections with drafts on testimonials', async () => {
    const config = await testimonialsPlugin()(base)
    const t = collection(config, 'testimonials')
    expect(collection(config, 'testimonial-tags')).toBeDefined()
    expect(t.versions).toMatchObject({ drafts: true })
    expect(t.admin?.useAsTitle).toBe('title')
  })

  it('localises quote and role only when the config is localised', async () => {
    const localised = collection(await testimonialsPlugin()(base), 'testimonials')
    expect(byName(localised.fields, 'quote').localized).toBe(true)
    expect(byName(localised.fields, 'name').localized).toBeFalsy()
    const plain = collection(await testimonialsPlugin()({ collections: [] } as unknown as Config), 'testimonials')
    expect(byName(plain.fields, 'quote').localized).toBeFalsy()
  })

  it('points tags and link docs at the configured collections', async () => {
    const t = collection(await testimonialsPlugin({ slugs: { tags: 'cohorts' }, linkCollections: ['pages'] })(base), 'testimonials')
    expect(byName(t.fields, 'tags').relationTo).toBe('cohorts')
    const link = byName(t.fields, 'link') as unknown as { fields: Field[] }
    expect(byName(link.fields, 'doc').relationTo).toEqual(['pages'])
  })

  it('omits the internal link option when linkCollections is empty', async () => {
    const t = collection(await testimonialsPlugin({ linkCollections: [] })(base), 'testimonials')
    const link = byName(t.fields, 'link') as unknown as { fields: Field[] }
    expect(byName(link.fields, 'doc')).toBeUndefined()
  })

  it('fills the stored title from name and company', async () => {
    const t = collection(await testimonialsPlugin()(base), 'testimonials')
    const hook = t.hooks!.beforeChange![0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await (hook as any)({ data: { company: 'Familotel AG' }, originalDoc: { name: 'Armin Biebl' } })
    expect(data.title).toBe('Armin Biebl – Familotel AG')
  })

  it('does nothing when disabled', async () => {
    const config = await testimonialsPlugin({ enabled: false })(base)
    expect(config.collections).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:int tests/int/testimonials-config.int.spec.ts`
Expected: FAIL — `testimonialsPlugin` is not exported.

- [ ] **Step 3: Options in `src/types.ts`** (append)

```ts
export const DEFAULT_CACHE_TAG = 'testimonials'

export interface ComponentPaths {
  usagePanel: string
  selectionPreview: string
  approvedUntilCell: string
}

export interface TestimonialsPluginOptions {
  /** Set to `false` to leave the config untouched. */
  enabled?: boolean
  slugs?: { testimonials?: string; tags?: string }
  /** Upload collection for photo and logo; default `media`. */
  mediaSlug?: string
  /** Collections a testimonial can link to (case study etc.); default pages + posts. `[]` = external links only. */
  linkCollections?: string[]
  /** Admin sidebar group; default Kundenstimmen / Testimonials. */
  adminGroup?: string | Record<string, string>
  /** Next cache tag of the loaded pool; default `testimonials`. */
  cacheTag?: string
  /** Where the usage panel looks for blocks; default pages.layout. `false` hides the panel. */
  usage?: false | { collection: string; field: string; blockSlug?: string }
  /** Import-map paths of the admin components. */
  componentPaths?: Partial<ComponentPaths>
}

export interface ResolvedOptions {
  slugs: { testimonials: string; tags: string }
  mediaSlug: string
  linkCollections: string[]
  adminGroup: string | Record<string, string>
  cacheTag: string
  usage: false | { collection: string; field: string; blockSlug: string }
  componentPaths: ComponentPaths
  localized: boolean
}

export const resolveOptions = (options: TestimonialsPluginOptions = {}, localized = false): ResolvedOptions => ({
  slugs: { testimonials: options.slugs?.testimonials || 'testimonials', tags: options.slugs?.tags || 'testimonial-tags' },
  mediaSlug: options.mediaSlug || 'media',
  linkCollections: options.linkCollections ?? ['pages', 'posts'],
  adminGroup: options.adminGroup || { de: 'Kundenstimmen', en: 'Testimonials' },
  cacheTag: options.cacheTag || DEFAULT_CACHE_TAG,
  usage:
    options.usage === false
      ? false
      : { collection: 'pages', field: 'layout', blockSlug: 'testimonials', ...(options.usage || {}) },
  componentPaths: {
    usagePanel: '@subneo/payload-testimonials/admin#UsagePanel',
    selectionPreview: '@subneo/payload-testimonials/admin#SelectionPreview',
    approvedUntilCell: '@subneo/payload-testimonials/admin#ApprovedUntilCell',
    ...(options.componentPaths || {}),
  },
  localized,
})
```

- [ ] **Step 4: Hooks**

`src/hooks.ts`:

```ts
import type { CollectionBeforeChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * Drops the cached pool so every page that renders testimonials is rebuilt. Skipped for seeds,
 * scripts and migrations (`context.disableRevalidate`); outside a Next request (tests, CLI)
 * `revalidateTag` throws, which must not fail the write.
 */
export const createRevalidateHook =
  (tag: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ doc, req: { payload, context } }: { doc: any; req: { payload: any; context: Record<string, unknown> } }) => {
    if (!context?.disableRevalidate) {
      try {
        revalidateTag(tag, { expire: 0 })
      } catch (err) {
        payload.logger.debug({ err }, `[testimonials] revalidateTag('${tag}') skipped outside Next`)
      }
    }
    return doc
  }

/** Stored admin title "Name – Company"; partial updates (one locale) fall back to the saved values. */
export const setTitle: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const name = data?.name ?? originalDoc?.name
  const company = data?.company ?? originalDoc?.company
  return { ...data, title: [name, company].filter(Boolean).join(' – ') }
}
```

- [ ] **Step 5: Collections**

`src/collections.ts`:

```ts
import type { Access, CollectionConfig, Field } from 'payload'

import { slugField } from 'payload'

import { createRevalidateHook, setTitle } from './hooks'
import { l } from './labels'
import type { ResolvedOptions } from './types'

const authenticated: Access = ({ req }) => Boolean(req.user)
const publishedOrAuthenticated: Access = ({ req }) => (req.user ? true : { _status: { equals: 'published' } })

const linkField = (o: ResolvedOptions): Field => {
  const types = [
    { label: l('Kein Link', 'No link'), value: 'none' },
    ...(o.linkCollections.length ? [{ label: l('Interne Seite', 'Internal page'), value: 'internal' }] : []),
    { label: l('Externe URL', 'External URL'), value: 'external' },
  ]
  return {
    name: 'link',
    type: 'group',
    label: l('Link (z. B. Fallstudie)', 'Link (e.g. case study)'),
    fields: [
      { name: 'type', type: 'radio', defaultValue: 'none', options: types, admin: { layout: 'horizontal' } },
      ...(o.linkCollections.length
        ? [
            {
              name: 'doc',
              type: 'relationship',
              relationTo: o.linkCollections,
              label: l('Seite', 'Page'),
              admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'internal' },
            } as Field,
          ]
        : []),
      {
        name: 'url',
        type: 'text',
        label: 'URL',
        admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'external' },
      },
      {
        name: 'label',
        type: 'text',
        localized: o.localized,
        label: l('Linktext (optional)', 'Link text (optional)'),
        admin: { condition: (_: unknown, s: { type?: string }) => Boolean(s?.type) && s.type !== 'none' },
      },
    ],
  }
}

export const createTestimonialsCollection = (o: ResolvedOptions): CollectionConfig => {
  const revalidate = createRevalidateHook(o.cacheTag)
  return {
    slug: o.slugs.testimonials,
    labels: { singular: l('Kundenstimme', 'Testimonial'), plural: l('Kundenstimmen', 'Testimonials') },
    admin: {
      group: o.adminGroup,
      useAsTitle: 'title',
      defaultColumns: ['title', 'tags', 'approvedUntil', '_status', 'updatedAt'],
      listSearchableFields: ['name', 'company', 'quote'],
    },
    access: {
      read: publishedOrAuthenticated,
      create: authenticated,
      update: authenticated,
      delete: authenticated,
    },
    versions: { drafts: true },
    hooks: { beforeChange: [setTitle], afterChange: [revalidate], afterDelete: [revalidate] },
    fields: [
      { name: 'title', type: 'text', admin: { hidden: true } },
      { name: 'quote', type: 'textarea', required: true, localized: o.localized, label: l('Zitat', 'Quote') },
      {
        type: 'row',
        fields: [
          { name: 'name', type: 'text', required: true, label: l('Name', 'Name'), admin: { width: '34%' } },
          { name: 'role', type: 'text', localized: o.localized, label: l('Rolle', 'Role'), admin: { width: '33%' } },
          { name: 'company', type: 'text', label: l('Unternehmen', 'Company'), admin: { width: '33%' } },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'avatar', type: 'upload', relationTo: o.mediaSlug, label: l('Foto (optional)', 'Photo (optional)'), admin: { width: '50%' } },
          { name: 'logo', type: 'upload', relationTo: o.mediaSlug, label: l('Firmenlogo (optional)', 'Company logo (optional)'), admin: { width: '50%' } },
        ],
      },
      {
        name: 'tags',
        type: 'relationship',
        relationTo: o.slugs.tags,
        hasMany: true,
        label: l('Zielgruppen-Tags', 'Cohort tags'),
        admin: { description: l('Nur für die Auswahl in Abschnitten; Besucher sehen die Tags nicht.', 'Only used to select testimonials in sections; visitors never see tags.') },
      },
      linkField(o),
      {
        name: 'approvedUntil',
        type: 'date',
        label: l('Freigabe bis', 'Approved until'),
        admin: {
          position: 'sidebar',
          date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
          description: l('Nach diesem Tag wird das Zitat nicht mehr angezeigt.', 'After this day the quote is no longer shown.'),
          components: { Cell: o.componentPaths.approvedUntilCell },
        },
      },
      {
        name: 'internalNote',
        type: 'textarea',
        label: l('Interne Notiz', 'Internal note'),
        admin: { position: 'sidebar', description: l('Z. B. wer freigegeben hat. Wird nie angezeigt.', 'E.g. who approved it. Never shown.') },
      },
      ...(o.usage
        ? [
            {
              name: 'usage',
              type: 'ui',
              label: l('Verwendet auf', 'Shown on'),
              admin: {
                position: 'sidebar',
                components: { Field: { path: o.componentPaths.usagePanel, clientProps: { apiSlug: o.slugs.testimonials } } },
              },
            } as Field,
          ]
        : []),
    ],
  }
}

export const createTagsCollection = (o: ResolvedOptions): CollectionConfig => {
  const revalidate = createRevalidateHook(o.cacheTag)
  return {
    slug: o.slugs.tags,
    labels: { singular: l('Zielgruppen-Tag', 'Cohort tag'), plural: l('Zielgruppen-Tags', 'Cohort tags') },
    admin: { group: o.adminGroup, useAsTitle: 'title', defaultColumns: ['title', 'slug'] },
    access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
    hooks: { afterChange: [revalidate], afterDelete: [revalidate] },
    fields: [{ name: 'title', type: 'text', required: true, localized: o.localized, label: l('Name', 'Name') }, slugField()],
  }
}
```

- [ ] **Step 6: Plugin**

`src/plugin.ts`:

```ts
import type { Plugin } from 'payload'

import { createTagsCollection, createTestimonialsCollection } from './collections'
import { resolveOptions, type TestimonialsPluginOptions } from './types'

/** Adds the testimonials and tag collections (and, from Task 5, the usage and preview endpoints). */
export const testimonialsPlugin =
  (options: TestimonialsPluginOptions = {}): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    const o = resolveOptions(options, Boolean(config.localization))
    return {
      ...config,
      collections: [...(config.collections || []), createTestimonialsCollection(o), createTagsCollection(o)],
    }
  }
```

`src/index.ts` add:

```ts
export { createTagsCollection, createTestimonialsCollection } from './collections'
export { createRevalidateHook } from './hooks'
export { l } from './labels'
export { testimonialsPlugin } from './plugin'
```

- [ ] **Step 7: Run the test**

Run: `pnpm test:int tests/int/testimonials-config.int.spec.ts`
Expected: PASS.

- [ ] **Step 8: Wire into the site**

In `src/plugins/index.ts`: `import { testimonialsPlugin } from '@subneo/payload-testimonials'`, append `testimonialsPlugin()` to the `plugins` array (after `subneoPricingPlugin`), and add to the `mcpPlugin` `collections`:

```ts
      testimonials: {
        description:
          'Central customer testimonials (quote, person, company, cohort tags, optional link, approvedUntil). Pages reference them from the testimonials block. Localised: de and en for quote, role, link label.',
        enabled: { find: true, create: true, update: true, delete: false },
      },
      'testimonial-tags': {
        description: 'Cohort tags for testimonials (e.g. hotellerie, agenturen). Used by the testimonials block filter; never shown to visitors.',
        enabled: { find: true, create: true, update: true, delete: false },
      },
```

Also extend the `pages` MCP description's block list note: `testimonials (central, references the testimonials collection)`.

- [ ] **Step 9: Generate types and check the dev schema push**

Run: `pnpm generate:types` (if it tries to connect, prefix with `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload`).
Expected: `src/payload-types.ts` gains `Testimonial` and `TestimonialTag`.

Run: `docker logs --since 2m indicate-datacomdemo-app-1 2>&1 | tail -30` after saving (the dev server hot-reloads and pushes).
Expected: no "created or renamed" prompt, no errors; `curl -s localhost:3000/api/testimonials | head -c 200` returns `{"docs":[]…`. If the container hangs, `docker compose restart app`.

- [ ] **Step 10: Commit**

```bash
git add packages/payload-plugin-testimonials src/plugins/index.ts src/payload-types.ts tests/int/testimonials-config.int.spec.ts
git commit -m "Testimonials package: collections, tags and cache revalidation"
```

---

### Task 3: Block factory and site block config

**Files:**
- Create: `packages/payload-plugin-testimonials/src/block.ts`
- Modify: `packages/payload-plugin-testimonials/src/index.ts`, `src/blocks/Testimonials/config.ts`
- Test: `tests/int/testimonials-config.int.spec.ts` (extend)

**Interfaces:**
- Consumes: `l`, `resolveOptions`, `DEFAULT_COUNT`, `MAX_COUNT`, `ComponentPaths`.
- Produces: `createTestimonialsBlock(opts?: TestimonialsBlockOptions): Block` where
  `interface TestimonialsBlockOptions { slug?: string; interfaceName?: string; localized?: boolean; before?: Field[]; after?: Field[]; extraFields?: Field[]; testimonialsSlug?: string; tagsSlug?: string; selectionPreviewPath?: string }`.
  Block field names: `mode`, `testimonials`, `tags`, `tagMatch`, `count`, `pinned`, `exclude`, `seed`, `preview`.

- [ ] **Step 1: Extend the failing test** (append to `tests/int/testimonials-config.int.spec.ts`)

```ts
import { createTestimonialsBlock } from '@subneo/payload-testimonials'
import { Testimonials } from '@/blocks/Testimonials/config'

describe('createTestimonialsBlock', () => {
  const block = createTestimonialsBlock({ before: [{ name: 'header', type: 'text' }], after: [{ name: 'settings', type: 'text' }] })
  const names = block.fields.map((f) => ('name' in f ? f.name : f.type))

  it('orders before → own fields → after', () => {
    expect(names[0]).toBe('header')
    expect(names.at(-1)).toBe('settings')
    expect(names).toEqual(expect.arrayContaining(['mode', 'testimonials', 'tags', 'tagMatch', 'count', 'pinned', 'exclude', 'seed', 'preview']))
  })

  it('defaults to auto mode and a random seed', () => {
    expect(byName(block.fields, 'mode').defaultValue).toBe('auto')
    const seed = byName(block.fields, 'seed').defaultValue as () => string
    expect(typeof seed()).toBe('string')
    expect(seed()).not.toBe(seed())
  })

  it('shows manual/auto fields conditionally', () => {
    const cond = (name: string) => (byName(block.fields, name).admin as { condition: (d: unknown, s: unknown) => boolean }).condition
    expect(cond('testimonials')({}, { mode: 'manual' })).toBe(true)
    expect(cond('testimonials')({}, { mode: 'auto' })).toBe(false)
    expect(cond('count')({}, { mode: 'auto' })).toBe(true)
    expect(cond('tagMatch')({}, { mode: 'auto', tags: [1] })).toBe(false)
    expect(cond('tagMatch')({}, { mode: 'auto', tags: [1, 2] })).toBe(true)
  })
})

describe('site Testimonials block', () => {
  it('keeps the slug and interface and the legacy inline items (hidden)', () => {
    expect(Testimonials.slug).toBe('testimonials')
    expect(Testimonials.interfaceName).toBe('TestimonialsBlock')
    const items = byName(Testimonials.fields, 'items')
    expect(items.type).toBe('array')
    expect((items.admin as { hidden?: boolean }).hidden).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:int tests/int/testimonials-config.int.spec.ts`
Expected: FAIL — `createTestimonialsBlock` not exported.

- [ ] **Step 3: Implement the block factory**

`src/block.ts`:

```ts
import type { Block, Field } from 'payload'

import { l } from './labels'
import { MAX_COUNT, DEFAULT_COUNT } from './types'

export interface TestimonialsBlockOptions {
  slug?: string
  interfaceName?: string
  /** Kept for symmetry with the other packages; the block's own fields are not localised. */
  localized?: boolean
  /** Site fields before the block's own (e.g. a section header). */
  before?: Field[]
  /** Site fields after (e.g. section settings). */
  after?: Field[]
  /** Site fields placed before `after`, e.g. legacy fields kept for a migration. */
  extraFields?: Field[]
  testimonialsSlug?: string
  tagsSlug?: string
  selectionPreviewPath?: string
}

type Sibling = { mode?: string; tags?: unknown[] }
const isAuto = (_: unknown, s: Sibling) => s?.mode !== 'manual'
const isManual = (_: unknown, s: Sibling) => s?.mode === 'manual'

export const newSeed = () => Math.random().toString(36).slice(2, 10)

/**
 * The page block. It stores *which* testimonials a section shows (hand-picked, or a filter +
 * seed); the content lives in the testimonials collection and is resolved at render time.
 */
export const createTestimonialsBlock = ({
  slug = 'testimonials',
  interfaceName = 'TestimonialsBlock',
  before = [],
  after = [],
  extraFields = [],
  testimonialsSlug = 'testimonials',
  tagsSlug = 'testimonial-tags',
  selectionPreviewPath = '@subneo/payload-testimonials/admin#SelectionPreview',
}: TestimonialsBlockOptions = {}): Block => ({
  slug,
  interfaceName,
  labels: { singular: l('Kundenstimmen', 'Testimonials'), plural: l('Kundenstimmen-Abschnitte', 'Testimonial sections') },
  fields: [
    ...before,
    {
      name: 'mode',
      type: 'radio',
      defaultValue: 'auto',
      label: l('Auswahl', 'Selection'),
      admin: { layout: 'horizontal' },
      options: [
        { label: l('Automatisch', 'Automatic'), value: 'auto' },
        { label: l('Von Hand', 'Manual'), value: 'manual' },
      ],
    },
    {
      name: 'testimonials',
      type: 'relationship',
      relationTo: testimonialsSlug,
      hasMany: true,
      label: l('Kundenstimmen (Reihenfolge = Anzeige)', 'Testimonials (order = display order)'),
      admin: { condition: isManual, isSortable: true },
    },
    {
      type: 'row',
      admin: { condition: isAuto },
      fields: [
        {
          name: 'tags',
          type: 'relationship',
          relationTo: tagsSlug,
          hasMany: true,
          label: l('Nur mit Tags (leer = alle)', 'Only with tags (empty = all)'),
          admin: { width: '50%', condition: isAuto },
        },
        {
          name: 'tagMatch',
          type: 'radio',
          defaultValue: 'any',
          label: l('Tags', 'Tags'),
          options: [
            { label: l('mindestens einer', 'any'), value: 'any' },
            { label: l('alle', 'all'), value: 'all' },
          ],
          admin: { width: '25%', condition: (_: unknown, s: Sibling) => isAuto(_, s) && (s?.tags?.length ?? 0) >= 2 },
        },
        {
          name: 'count',
          type: 'number',
          defaultValue: DEFAULT_COUNT,
          min: 1,
          max: MAX_COUNT,
          label: l('Anzahl', 'Count'),
          admin: { width: '25%', condition: isAuto },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: isAuto },
      fields: [
        {
          name: 'pinned',
          type: 'relationship',
          relationTo: testimonialsSlug,
          hasMany: true,
          label: l('Immer zeigen (zuerst)', 'Always show (first)'),
          admin: { width: '50%', condition: isAuto, isSortable: true },
        },
        {
          name: 'exclude',
          type: 'relationship',
          relationTo: testimonialsSlug,
          hasMany: true,
          label: l('Nie zeigen', 'Never show'),
          admin: { width: '50%', condition: isAuto },
        },
      ],
    },
    { name: 'seed', type: 'text', defaultValue: newSeed, admin: { hidden: true } },
    {
      name: 'preview',
      type: 'ui',
      admin: {
        condition: isAuto,
        components: { Field: { path: selectionPreviewPath, clientProps: { apiSlug: testimonialsSlug } } },
      },
    },
    ...extraFields,
    ...after,
  ],
})
```

Note on the test: `byName` finds top-level fields only; `tags`, `tagMatch`, `count`, `pinned`, `exclude` sit in rows. Update `byName` in the test file to search rows recursively:

```ts
const byName = (fields: Field[], name: string): Field & Record<string, unknown> => {
  for (const f of fields) {
    if ('name' in f && f.name === name) return f as Field & Record<string, unknown>
    if (f.type === 'row') {
      const hit = byName(f.fields, name)
      if (hit) return hit
    }
  }
  return undefined as unknown as Field & Record<string, unknown>
}
```

and in the ordering test compute names via a flatten of rows:

```ts
const flat = (fields: Field[]): string[] => fields.flatMap((f) => (f.type === 'row' ? flat(f.fields) : ['name' in f ? f.name : f.type]))
const names = flat(block.fields)
```

`src/index.ts` add: `export { createTestimonialsBlock, newSeed, type TestimonialsBlockOptions } from './block'`

- [ ] **Step 4: Rewrite the site block config**

`src/blocks/Testimonials/config.ts`:

```ts
import type { Field } from 'payload'

import { createTestimonialsBlock } from '@subneo/payload-testimonials'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

/**
 * The quotes this block stored inline before testimonials became central. Kept (hidden) so the
 * dev schema push stays additive; `scripts/convert-testimonials.ts` moves them into the
 * collection. Drop in a later, separate change.
 */
const legacyInlineItems: Field = {
  name: 'items',
  type: 'array',
  admin: { hidden: true },
  fields: [
    { name: 'quote', type: 'textarea', localized: true },
    { name: 'name', type: 'text' },
    { name: 'role', type: 'text', localized: true },
    { name: 'company', type: 'text' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
  ],
}

/** Central testimonials, wrapped in this site's section header and settings. */
export const Testimonials = createTestimonialsBlock({
  localized: true,
  before: [sectionHeader({ optionalHeading: true })],
  after: [sectionSettings()],
  extraFields: [legacyInlineItems],
})
```

Keep the column set identical to today (`quote` required was a validation rule only — dropping `required` does not change the schema). Delete `src/blocks/Testimonials/RowLabel.tsx` only if nothing else imports it: `grep -rn "Testimonials/RowLabel" src` — the hidden array no longer references it; then run `pnpm generate:importmap`.

- [ ] **Step 5: Run the tests, types, schema push**

Run: `pnpm test:int tests/int/testimonials-config.int.spec.ts tests/int/blocks.int.spec.ts`
Expected: PASS.

Run: `pnpm generate:types`; then `docker logs --since 2m indicate-datacomdemo-app-1 2>&1 | tail -30`
Expected: new columns `mode`, `tag_match`, `count`, `seed` on `pages_blocks_testimonials` (and `_pages_v_…`), new rels; no prompt. `src/payload-types.ts` `TestimonialsBlock` now has `mode`, `testimonials`, … and still `items`.

`src/blocks/Testimonials/Component.tsx` will not type-check against the new `TestimonialsBlock` fully until Task 6; that is fine as long as `pnpm exec tsc --noEmit -p tsconfig.json` shows errors only in that file. Record them; Task 6 fixes them.

- [ ] **Step 6: Commit**

```bash
git add packages/payload-plugin-testimonials src/blocks/Testimonials src/payload-types.ts src/app/\(payload\)/admin/importMap.js tests/int/testimonials-config.int.spec.ts
git commit -m "Testimonials block: manual or automatic selection from the central collection"
```

---

### Task 4: Server loader

**Files:**
- Create: `packages/payload-plugin-testimonials/src/server.ts`
- Test: `tests/int/testimonials-server.int.spec.ts`

**Interfaces:**
- Consumes: `selectTestimonials`, `selectForLayout`, `resolveOptions`, `Testimonial`, `TestimonialsBlockData`, `Selected`.
- Produces:
  - `loadPool({ payload, locale?, draft?, slug?, linkCollections? }): Promise<Testimonial[]>` — uncached.
  - `getTestimonials({ payload, block, layout?, blockIndex?, locale?, draft?, now?, slug?, cacheTag?, blockSlug?, linkCollections? }): Promise<Selected[]>` — cached, never throws.
  - Re-exports `selectTestimonials`, `selectForLayout`, `countEligible`.

- [ ] **Step 1: Write the failing test**

`tests/int/testimonials-server.int.spec.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: vi.fn(),
}))

import { getTestimonials, loadPool } from '@subneo/payload-testimonials/server'

const docs = [
  { id: 1, name: 'A', quote: 'qa', _status: 'published' },
  { id: 2, name: 'B', quote: 'qb', _status: 'published' },
  { id: 3, name: 'C', quote: 'qc', _status: 'published' },
]

const fakePayload = (impl?: () => unknown) => {
  const find = vi.fn(impl || (async () => ({ docs })))
  const error = vi.fn()
  return { payload: { find, logger: { error, debug: vi.fn() } } as never, find, error }
}

describe('loadPool', () => {
  it('asks for published docs only, unless in draft mode', async () => {
    const { payload, find } = fakePayload()
    await loadPool({ payload, locale: 'en' })
    expect(find.mock.calls[0][0]).toMatchObject({ collection: 'testimonials', locale: 'en', draft: false, pagination: false, where: { _status: { equals: 'published' } } })
    await loadPool({ payload, draft: true })
    expect(find.mock.calls[1][0].where).toBeUndefined()
    expect(find.mock.calls[1][0].draft).toBe(true)
  })

  it('only populates slug and title of linked docs', async () => {
    const { payload, find } = fakePayload()
    await loadPool({ payload, linkCollections: ['pages', 'posts'] })
    expect(find.mock.calls[0][0].populate).toEqual({ pages: { slug: true, title: true }, posts: { slug: true, title: true } })
  })
})

describe('getTestimonials', () => {
  it('resolves a manual block', async () => {
    const { payload } = fakePayload()
    const r = await getTestimonials({ payload, block: { mode: 'manual', testimonials: [3, 1] } })
    expect(r.map((s) => s.testimonial.id)).toEqual([3, 1])
  })

  it('dedupes against earlier blocks of the layout', async () => {
    const { payload } = fakePayload()
    const layout = [
      { blockType: 'testimonials', mode: 'manual', testimonials: [1] },
      { blockType: 'testimonials', mode: 'auto', seed: 's', count: 6 },
    ]
    const r = await getTestimonials({ payload, block: layout[1] as never, layout, blockIndex: 1 })
    expect(r.map((s) => s.testimonial.id).sort()).toEqual([2, 3])
  })

  it('logs and returns [] when loading fails', async () => {
    const { payload, error } = fakePayload(async () => {
      throw new Error('db down')
    })
    expect(await getTestimonials({ payload, block: { mode: 'auto' } })).toEqual([])
    expect(error).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:int tests/int/testimonials-server.int.spec.ts`
Expected: FAIL — module `@subneo/payload-testimonials/server` not found.

- [ ] **Step 3: Implement**

`src/server.ts`:

```ts
import type { Payload } from 'payload'

import { unstable_cache } from 'next/cache'

import { selectForLayout, selectTestimonials } from './select'
import { DEFAULT_CACHE_TAG, type Selected, type Testimonial, type TestimonialsBlockData } from './types'

export { countEligible, selectForLayout, selectTestimonials } from './select'

const POOL_REVALIDATE_SECONDS = 86400

export interface LoadPoolArgs {
  payload: Payload
  locale?: string
  /** Include drafts (site draft mode / live preview). */
  draft?: boolean
  slug?: string
  linkCollections?: string[]
}

/**
 * Loads every testimonial that may be shown, in one query. The pool is small (hundreds at most),
 * so one list per locale is cheaper than a query per block. Linked docs are reduced to slug and
 * title so a case-study link does not drag a whole page layout along.
 */
export const loadPool = async ({ payload, locale, draft = false, slug = 'testimonials', linkCollections = ['pages', 'posts'] }: LoadPoolArgs): Promise<Testimonial[]> => {
  const result = await payload.find({
    // The slug is configurable, so it cannot be typed against the site's generated collections.
    collection: slug as Parameters<Payload['find']>[0]['collection'],
    depth: 1,
    draft,
    pagination: false,
    overrideAccess: true,
    populate: Object.fromEntries(linkCollections.map((c) => [c, { slug: true, title: true }])) as never,
    ...(locale ? { locale: locale as 'all' } : {}),
    ...(draft ? {} : { where: { _status: { equals: 'published' } } }),
  })
  return result.docs as unknown as Testimonial[]
}

export interface GetTestimonialsArgs extends LoadPoolArgs {
  block: TestimonialsBlockData
  /** The page layout and this block's index in it; enables dedupe across blocks. */
  layout?: unknown[] | null
  blockIndex?: number
  now?: Date
  cacheTag?: string
  blockSlug?: string
}

/**
 * Testimonials for one block. Outside draft mode the pool is cached under the `testimonials`
 * tag (revalidated by the collection hooks) and at most a day, so an `approvedUntil` date takes
 * effect without a save. Never throws: a failure logs and renders nothing.
 */
export const getTestimonials = async (args: GetTestimonialsArgs): Promise<Selected[]> => {
  const { payload, block, layout, blockIndex, now = new Date(), draft = false, locale, cacheTag = DEFAULT_CACHE_TAG, blockSlug = 'testimonials' } = args
  const slug = args.slug || 'testimonials'
  try {
    const pool = draft
      ? await loadPool({ ...args, slug, draft: true })
      : await unstable_cache(() => loadPool({ ...args, slug, draft: false }), ['testimonials-pool', slug, locale || ''], {
          tags: [cacheTag],
          revalidate: POOL_REVALIDATE_SECONDS,
        })()
    if (layout && typeof blockIndex === 'number') {
      return selectForLayout({ layout, pool, blockSlug, now }).get(blockIndex) || []
    }
    return selectTestimonials({ pool, block, now })
  } catch (err) {
    payload.logger.error({ err }, '[testimonials] could not load testimonials')
    return []
  }
}
```

- [ ] **Step 4: Run the test**

Run: `pnpm test:int tests/int/testimonials-server.int.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/payload-plugin-testimonials/src/server.ts tests/int/testimonials-server.int.spec.ts
git commit -m "Testimonials package: cached pool loader"
```

---

### Task 5: Usage and preview endpoints

**Files:**
- Create: `packages/payload-plugin-testimonials/src/usage.ts`, `src/endpoints.ts`
- Modify: `packages/payload-plugin-testimonials/src/collections.ts` (attach endpoints), `src/index.ts`
- Test: `tests/int/testimonials-usage.int.spec.ts`

**Interfaces:**
- Consumes: `selectForLayout`, `selectTestimonials`, `countEligible`, `idsOf`, `loadPool`, `ResolvedOptions`.
- Produces:
  - `interface Usage { docId: Id; docTitle: string; blockIndex: number; heading: string | null; reason: 'manual' | 'pinned' | 'auto'; shown: boolean }`
  - `findUsage({ docs, field, blockSlug, pool, testimonialId, now? }): Usage[]`
  - `createUsageEndpoint(o): Endpoint` → `GET /api/<testimonials>/:id/usage` → `{ usages: Usage[] }`
  - `createPreviewEndpoint(o): Endpoint` → `POST /api/<testimonials>/preview` body `{ block: TestimonialsBlockData, locale?: string }` → `{ items: { id: Id; title: string; reason: Reason }[]; matching: number }`
  - Both return 401 without a user.

- [ ] **Step 1: Write the failing test**

`tests/int/testimonials-usage.int.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { findUsage } from '@subneo/payload-testimonials'

const pool = [1, 2, 3, 4].map((id) => ({ id, name: `P${id}`, quote: 'q' }))
const now = new Date('2026-09-23T00:00:00Z')

describe('findUsage', () => {
  const docs = [
    { id: 10, title: 'Home', layout: [{ blockType: 'testimonials', mode: 'manual', testimonials: [2], header: { heading: 'Stimmen' } }] },
    { id: 11, title: 'Hotels', layout: [{ blockType: 'hero' }, { blockType: 'testimonials', mode: 'auto', pinned: [3], count: 1, seed: 'x' }] },
    { id: 12, title: 'All', layout: [{ blockType: 'testimonials', mode: 'auto', count: 6, seed: 'y' }] },
    { id: 13, title: 'Empty', layout: null },
  ]

  it('reports manual, pinned and auto uses with the block heading', () => {
    const u = findUsage({ docs, field: 'layout', blockSlug: 'testimonials', pool, testimonialId: 2, now })
    expect(u).toContainEqual({ docId: 10, docTitle: 'Home', blockIndex: 0, heading: 'Stimmen', reason: 'manual', shown: true })
    expect(u).toContainEqual({ docId: 12, docTitle: 'All', blockIndex: 0, heading: null, reason: 'auto', shown: true })
    expect(u.find((x) => x.docId === 11)).toBeUndefined()
  })

  it('reports a pinned reference', () => {
    const u = findUsage({ docs, field: 'layout', blockSlug: 'testimonials', pool, testimonialId: '3', now })
    expect(u).toContainEqual(expect.objectContaining({ docId: 11, blockIndex: 1, reason: 'pinned', shown: true }))
  })

  it('reports references that are currently not shown (expired / not in pool)', () => {
    const u = findUsage({ docs, field: 'layout', blockSlug: 'testimonials', pool: pool.filter((t) => t.id !== 2), testimonialId: 2, now })
    expect(u).toEqual([{ docId: 10, docTitle: 'Home', blockIndex: 0, heading: 'Stimmen', reason: 'manual', shown: false }])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:int tests/int/testimonials-usage.int.spec.ts`
Expected: FAIL — `findUsage` not exported.

- [ ] **Step 3: Implement `src/usage.ts`**

```ts
import { selectForLayout } from './select'
import { idsOf, type Id, type Reason, type Testimonial, type TestimonialsBlockData } from './types'

export interface Usage {
  docId: Id
  docTitle: string
  blockIndex: number
  heading: string | null
  reason: Reason
  /** False when the block references it but it is not rendered (expired, draft, deduped). */
  shown: boolean
}

type Doc = { id: Id; title?: string | null } & Record<string, unknown>

/**
 * Where one testimonial appears: hand-picked or pinned references, plus automatic picks. Uses
 * the same selection as the site, so "auto" means "rendered there right now".
 */
export const findUsage = ({
  docs,
  field,
  blockSlug,
  pool,
  testimonialId,
  now = new Date(),
}: {
  docs: Doc[]
  field: string
  blockSlug: string
  pool: Testimonial[]
  testimonialId: Id
  now?: Date
}): Usage[] => {
  const target = String(testimonialId)
  const usages: Usage[] = []
  for (const doc of docs) {
    const layout = (doc[field] as unknown[] | null | undefined) || []
    const selected = selectForLayout({ layout, pool, blockSlug, now })
    layout.forEach((raw, blockIndex) => {
      const block = raw as TestimonialsBlockData & { header?: { heading?: string | null } }
      if (block?.blockType !== blockSlug) return
      const shownIds = (selected.get(blockIndex) || []).map((s) => String(s.testimonial.id))
      const reason: Reason | null =
        block.mode === 'manual'
          ? idsOf(block.testimonials).includes(target) ? 'manual' : null
          : idsOf(block.pinned).includes(target) ? 'pinned' : shownIds.includes(target) ? 'auto' : null
      if (!reason) return
      usages.push({
        docId: doc.id,
        docTitle: doc.title || String(doc.id),
        blockIndex,
        heading: block.header?.heading || null,
        reason,
        shown: shownIds.includes(target),
      })
    })
  }
  return usages
}
```

`src/index.ts` add: `export { findUsage, type Usage } from './usage'`

- [ ] **Step 4: Run the test**

Run: `pnpm test:int tests/int/testimonials-usage.int.spec.ts`
Expected: PASS.

- [ ] **Step 5: Endpoints**

`src/endpoints.ts`:

```ts
import type { Endpoint, Payload, PayloadRequest } from 'payload'

import { addDataAndFileToRequest } from 'payload'

import { countEligible, selectTestimonials } from './select'
import { loadPool } from './server'
import type { ResolvedOptions, TestimonialsBlockData } from './types'
import { findUsage } from './usage'

const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 })
const localeOf = (req: PayloadRequest) => (typeof req.locale === 'string' ? req.locale : undefined)

/** GET /api/<testimonials>/:id/usage — pages that show or reference this testimonial. */
export const createUsageEndpoint = (o: ResolvedOptions): Endpoint => ({
  path: '/:id/usage',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    if (!o.usage) return Response.json({ usages: [] })
    const { collection, field, blockSlug } = o.usage
    const payload: Payload = req.payload
    const hasDrafts = Boolean(payload.collections[collection as keyof typeof payload.collections]?.config.versions?.drafts)
    const [pool, pages] = await Promise.all([
      loadPool({ payload, slug: o.slugs.testimonials, locale: localeOf(req), linkCollections: o.linkCollections }),
      payload.find({
        collection: collection as Parameters<Payload['find']>[0]['collection'],
        depth: 0,
        pagination: false,
        overrideAccess: true,
        select: { title: true, [field]: true } as never,
        ...(hasDrafts ? { where: { _status: { equals: 'published' } } } : {}),
      }),
    ])
    const usages = findUsage({
      docs: pages.docs as never,
      field,
      blockSlug,
      pool,
      testimonialId: String(req.routeParams?.id),
    })
    return Response.json({ usages })
  },
})

/** POST /api/<testimonials>/preview — what a block would show with the given (unsaved) values. */
export const createPreviewEndpoint = (o: ResolvedOptions): Endpoint => ({
  path: '/preview',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return unauthorized()
    await addDataAndFileToRequest(req)
    const body = (req.data || {}) as { block?: TestimonialsBlockData; locale?: string }
    const block = body.block || {}
    const pool = await loadPool({ payload: req.payload, slug: o.slugs.testimonials, locale: body.locale || localeOf(req), linkCollections: o.linkCollections })
    const items = selectTestimonials({ pool, block }).map(({ testimonial, reason }) => ({
      id: testimonial.id,
      title: testimonial.title || testimonial.name || String(testimonial.id),
      reason,
    }))
    return Response.json({ items, matching: countEligible({ pool, block }) })
  },
})
```

In `src/collections.ts`, import both factories and add to the testimonials collection: `endpoints: [createUsageEndpoint(o), createPreviewEndpoint(o)],`.

- [ ] **Step 6: Verify against the running dev app**

Log in to `http://localhost:3000/admin` in the browser, then in the devtools console:

```js
await (await fetch('/api/testimonials/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ block: { mode: 'auto', count: 3, seed: 'x' } }) })).json()
```

Expected: `{ items: [], matching: 0 }` (collection still empty). Without cookies (`curl -s -X POST localhost:3000/api/testimonials/preview`) → 401.

- [ ] **Step 7: Commit**

```bash
git add packages/payload-plugin-testimonials tests/int/testimonials-usage.int.spec.ts
git commit -m "Testimonials package: usage and preview endpoints"
```

---

### Task 6: Site component, legacy fallback and customer link

**Files:**
- Create: `src/blocks/Testimonials/legacy.ts`
- Modify: `src/blocks/Testimonials/Component.tsx`, `src/blocks/RenderBlocks.tsx`
- Test: `tests/int/testimonials-server.int.spec.ts` (extend with legacy helper)

**Interfaces:**
- Consumes: `getTestimonials` (`@subneo/payload-testimonials/server`), `Selected`, `Testimonial`, `TestimonialLink`.
- Produces: `legacySelection(block: TestimonialsBlockProps): Selected[] | null` — returns the inline items as `Selected[]` when the block has inline `items` and no `testimonials` references, else `null`.

- [ ] **Step 1: Failing test for the legacy fallback** (append to `tests/int/testimonials-server.int.spec.ts`)

```ts
import { legacySelection } from '@/blocks/Testimonials/legacy'

describe('legacySelection', () => {
  it('uses inline items when the block has no references yet', () => {
    const r = legacySelection({ mode: 'auto', items: [{ id: 'a', quote: 'q', name: 'N', company: 'C' }] } as never)
    expect(r?.map((s) => s.testimonial.name)).toEqual(['N'])
  })
  it('returns null once the block references testimonials', () => {
    expect(legacySelection({ mode: 'manual', testimonials: [1], items: [{ id: 'a', quote: 'q', name: 'N' }] } as never)).toBeNull()
  })
  it('returns null without inline items', () => {
    expect(legacySelection({ mode: 'auto', items: [] } as never)).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:int tests/int/testimonials-server.int.spec.ts`
Expected: FAIL — cannot resolve `@/blocks/Testimonials/legacy`.

- [ ] **Step 3: Implement `src/blocks/Testimonials/legacy.ts`**

```ts
import type { Selected } from '@subneo/payload-testimonials'

import type { TestimonialsBlock } from '@/payload-types'

/**
 * Blocks saved before testimonials became central keep their quotes inline until
 * `scripts/convert-testimonials.ts` runs. Render those instead of an automatic pick, so the
 * deploy order (schema first, conversion second) never changes what a page shows.
 */
export const legacySelection = (block: TestimonialsBlock): Selected[] | null => {
  const inline = (block.items || []).filter((i) => i.quote && i.name)
  if (inline.length === 0 || (block.testimonials || []).length > 0) return null
  return inline.map((i, index) => ({
    testimonial: { id: i.id || `legacy-${index}`, quote: i.quote, name: i.name, role: i.role, company: i.company, avatar: i.avatar, logo: i.logo },
    reason: 'manual',
  }))
}
```

- [ ] **Step 4: Rewrite the component**

`src/blocks/Testimonials/Component.tsx` — keep the markup, change the data source:

```tsx
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import { getTestimonials } from '@subneo/payload-testimonials/server'
import type { TestimonialLink } from '@subneo/payload-testimonials'

import type { Media as MediaType, Page, TestimonialsBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { Avatar } from '@/components/Illustrations/primitives'
import { cn } from '@/utilities/ui'

import { legacySelection } from './legacy'

/** Company line: linked to the case study or customer site when the testimonial has a link. */
const Company: React.FC<{ text: string; link?: TestimonialLink | null }> = ({ text, link }) => {
  if (!text) return null
  if (link?.type === 'internal' && link.doc && typeof link.doc.value === 'object') {
    return <CMSLink className="underline decoration-line underline-offset-4 hover:text-ink" label={link.label || text} reference={link.doc as never} type="reference" />
  }
  if (link?.type === 'external' && link.url) {
    return <CMSLink className="underline decoration-line underline-offset-4 hover:text-ink" label={link.label || text} newTab type="custom" url={link.url} />
  }
  return <>{text}</>
}

/**
 * Editorial quotes: heading on the left, each quote set large with a yellow opening mark and
 * a hairline between them. No cards, no grid of equal boxes. The quotes come from the central
 * testimonials collection (hand-picked or chosen by tag and seed, see @subneo/payload-testimonials).
 */
export const TestimonialsBlock: React.FC<Props & { locale: Locale; layout?: Page['layout']; blockIndex?: number }> = async (props) => {
  const { header, locale, layout, blockIndex } = props
  const { isEnabled: draft } = await draftMode()

  const selected =
    legacySelection(props) ??
    (await getTestimonials({ payload: await getPayload({ config: configPromise }), block: props as never, layout, blockIndex, locale, draft }))

  const list = selected.map((s) => s.testimonial).filter((t) => t.quote && t.name)
  if (list.length === 0) return null

  return (
    <div className="container">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <SectionHeading className="reveal lg:col-span-4 lg:sticky lg:top-28 lg:self-start" header={header} />
        <ul className="reveal-stagger flex flex-col divide-y divide-line border-y border-line lg:col-span-8">
          {list.map((t, i) => {
            const name = t.name as string
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
            const avatar = t.avatar && typeof t.avatar === 'object' ? (t.avatar as MediaType) : null
            const logo = t.logo && typeof t.logo === 'object' ? (t.logo as MediaType) : null
            return (
              <li className="grid gap-6 py-10 md:grid-cols-[3rem_1fr] md:gap-8 md:py-12" key={String(t.id)} style={{ '--i': i } as React.CSSProperties}>
                <span aria-hidden="true" className="font-display text-[3.5rem] leading-[0.7] text-accent select-none">
                  „
                </span>
                <figure className="flex flex-col gap-7">
                  <blockquote className={cn('font-display text-ink pretty', i === 0 ? 'type-h3 md:text-[1.9rem] md:leading-[1.3]' : 'type-h3')}>
                    {t.quote}
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    {avatar ? (
                      <Media htmlElement={null} imgClassName="size-10 rounded-full object-cover" resource={avatar} />
                    ) : (
                      <Avatar className="size-10 type-small" initials={initials} tone={(['blue', 'yellow', 'coral'] as const)[i % 3]} />
                    )}
                    <div className="flex flex-col">
                      <span className="type-small font-medium text-ink">{name}</span>
                      <span className="type-caption text-ink-3">
                        {t.role}
                        {t.role && t.company ? ', ' : null}
                        {t.company && <Company link={t.link} text={t.company} />}
                      </span>
                    </div>
                    {logo && <Media htmlElement={null} imgClassName="ml-auto h-6 w-auto opacity-70" resource={logo} />}
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
```

`CMSLink`'s `reference.relationTo` type is `'pages' | 'posts'`, matching the default `linkCollections`.

- [ ] **Step 5: Pass layout and index from `RenderBlocks`**

In `src/blocks/RenderBlocks.tsx`, in the `Section` branch:

```tsx
            <Block
              {...block}
              {...(blockType === 'testimonials' ? { layout: blocks, blockIndex: index } : {})}
              isFirst={index === 0}
              locale={locale}
              slug={slug}
            />
```

- [ ] **Step 6: Tests, type-check, visual check**

Run: `pnpm test:int tests/int/testimonials-server.int.spec.ts`
Expected: PASS.

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no errors in `src/blocks/Testimonials/*` or `RenderBlocks.tsx` (pre-existing unrelated errors, if any, unchanged — compare with `git stash`-free baseline noted in Task 3).

Open `http://localhost:3000/de` and `/de/about`: the testimonials section looks exactly as before (it renders via `legacySelection`, no conversion has run yet).

- [ ] **Step 7: Commit**

```bash
git add src/blocks/Testimonials src/blocks/RenderBlocks.tsx tests/int/testimonials-server.int.spec.ts
git commit -m "Testimonials block renders central testimonials, inline quotes until converted"
```

---

### Task 7: Admin components

**Files:**
- Create: `packages/payload-plugin-testimonials/src/admin.ts`, `src/components/i18n.ts`, `src/components/SelectionPreview.tsx`, `src/components/UsagePanel.tsx`, `src/components/ApprovedUntilCell.tsx`
- Modify: `src/app/(payload)/admin/importMap.js` (generated)

**Interfaces:**
- Consumes: preview endpoint (`POST /api/<slug>/preview` → `{ items, matching }`), usage endpoint (`GET /api/<slug>/:id/usage` → `{ usages }`), `newSeed`.
- Produces: named exports `SelectionPreview`, `UsagePanel`, `ApprovedUntilCell` from `@subneo/payload-testimonials/admin`.

These are thin UI over tested endpoints; they are verified in the browser (no unit tests).

- [ ] **Step 1: Shared i18n helper**

`src/components/i18n.ts`:

```ts
'use client'

import { useTranslation } from '@payloadcms/ui'

/** Picks the German or English string for the admin UI language. */
export const useL = () => {
  const { i18n } = useTranslation()
  return (de: string, en: string) => (i18n.language === 'de' ? de : en)
}
```

- [ ] **Step 2: Selection preview + reshuffle**

`src/components/SelectionPreview.tsx`:

```tsx
'use client'

import { Button, useConfig, useField, useFormFields, useLocale } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import { newSeed } from '../block'
import { useL } from './i18n'

type Item = { id: number | string; title: string; reason: 'manual' | 'pinned' | 'auto' }

/** Shows what an automatic block currently picks, with a button to draw a new selection. */
export const SelectionPreview: React.FC<{ path: string; apiSlug?: string }> = ({ path, apiSlug = 'testimonials' }) => {
  const t = useL()
  const parent = path.split('.').slice(0, -1).join('.')
  const at = (name: string) => (parent ? `${parent}.${name}` : name)
  const { config } = useConfig()
  const locale = useLocale()
  const { value: seed, setValue: setSeed } = useField<string>({ path: at('seed') })
  const block = useFormFields(([fields]) => ({
    mode: fields[at('mode')]?.value,
    tags: fields[at('tags')]?.value,
    tagMatch: fields[at('tagMatch')]?.value,
    count: fields[at('count')]?.value,
    pinned: fields[at('pinned')]?.value,
    exclude: fields[at('exclude')]?.value,
    id: fields[at('id')]?.value,
  }))
  const [state, setState] = useState<{ items: Item[]; matching: number } | null>(null)
  const key = JSON.stringify({ ...block, seed, locale: locale?.code })

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${config.serverURL}${config.routes.api}/${apiSlug}/preview`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ block: { ...block, seed }, locale: locale?.code }),
          signal: controller.signal,
        })
        if (res.ok) setState(await res.json())
      } catch {
        /* aborted or offline: keep the last preview */
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const count = Number(block.count) || 3
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', margin: '0.5rem 0 1.5rem' }}>
      <div style={{ flex: 1, minWidth: '16rem' }}>
        <strong>{t('Aktuell angezeigt: ', 'Currently shown: ')}</strong>
        {state ? (state.items.length ? state.items.map((i) => i.title).join(', ') : '—') : '…'}
        {state && (
          <span style={{ color: 'var(--theme-elevation-500)' }}>
            {' · '}
            {state.matching} {t('passend', 'matching')}
          </span>
        )}
        {state && state.matching < count && (
          <div style={{ color: 'var(--theme-warning-500)' }}>
            {t(
              `Nur ${state.matching} Kundenstimmen passen zum Filter – Tags prüfen oder Anzahl senken.`,
              `Only ${state.matching} testimonials match the filter – check the tags or lower the count.`,
            )}
          </div>
        )}
      </div>
      <Button buttonStyle="secondary" onClick={() => setSeed(newSeed())} size="small">
        {t('Neu mischen', 'Reshuffle')}
      </Button>
    </div>
  )
}
```

Note: the preview does not dedupe against other blocks on the page (the site does).

- [ ] **Step 3: Usage panel**

`src/components/UsagePanel.tsx`:

```tsx
'use client'

import { useConfig, useDocumentInfo } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

import type { Usage } from '../usage'
import { useL } from './i18n'

/** Sidebar list of the pages that show or reference this testimonial. */
export const UsagePanel: React.FC<{ apiSlug?: string }> = ({ apiSlug = 'testimonials' }) => {
  const t = useL()
  const { id } = useDocumentInfo()
  const { config } = useConfig()
  const [usages, setUsages] = useState<Usage[] | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`${config.serverURL}${config.routes.api}/${apiSlug}/${id}/usage`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { usages: [] }))
      .then((d) => setUsages(d.usages))
      .catch(() => setUsages([]))
  }, [id, apiSlug, config.serverURL, config.routes.api])

  const reason = (u: Usage) =>
    u.reason === 'manual' ? t('von Hand', 'manual') : u.reason === 'pinned' ? t('fixiert', 'pinned') : t('automatisch', 'automatic')

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="field-label">{t('Verwendet auf', 'Shown on')}</div>
      {!id && <p>{t('Nach dem ersten Speichern sichtbar.', 'Visible after the first save.')}</p>}
      {id && usages === null && <p>…</p>}
      {usages && usages.length === 0 && <p>{t('Derzeit auf keiner Seite.', 'Not on any page right now.')}</p>}
      {usages && usages.length > 0 && (
        <>
          <ul style={{ paddingLeft: '1rem', margin: '0.25rem 0' }}>
            {usages.map((u) => (
              <li key={`${u.docId}-${u.blockIndex}`}>
                <a href={`${config.routes.admin}/collections/pages/${u.docId}`}>{u.docTitle}</a>
                {u.heading ? ` · ${u.heading}` : ''} · {reason(u)}
                {!u.shown && ` (${t('derzeit ausgeblendet', 'currently hidden')})`}
              </li>
            ))}
          </ul>
          <p style={{ color: 'var(--theme-warning-500)' }}>
            {t('Löschen oder Umbenennen wirkt sich auf diese Seiten aus.', 'Deleting or renaming affects these pages.')}
          </p>
        </>
      )}
    </div>
  )
}
```

(The admin link uses `pages` because `o.usage.collection` defaults to it; pass the collection through `clientProps` if a site configures another: add `usageCollection: o.usage ? o.usage.collection : 'pages'` next to `apiSlug` in `collections.ts` and use it in the href.)

- [ ] **Step 4: Expiry cell**

`src/components/ApprovedUntilCell.tsx`:

```tsx
'use client'

import React from 'react'

/** List cell for `approvedUntil`: the date, red once it has passed. */
export const ApprovedUntilCell: React.FC<{ cellData?: string | null }> = ({ cellData }) => {
  if (!cellData) return <span>—</span>
  const date = new Date(cellData)
  const expired = date.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)
  return <span style={expired ? { color: 'var(--theme-error-500)', fontWeight: 600 } : undefined}>{date.toLocaleDateString('de-DE')}</span>
}
```

`src/admin.ts`:

```ts
export { ApprovedUntilCell } from './components/ApprovedUntilCell'
export { SelectionPreview } from './components/SelectionPreview'
export { UsagePanel } from './components/UsagePanel'
```

- [ ] **Step 5: Import map and browser check**

Run: `pnpm generate:importmap`
Expected: `importMap.js` contains `@subneo/payload-testimonials/admin#SelectionPreview`, `#UsagePanel`, `#ApprovedUntilCell`.

In the admin (`http://localhost:3000/admin`):
1. Create tag "Hotellerie" (slug `hotellerie`); create and publish two testimonials tagged with it, one with `approvedUntil` yesterday.
2. The list shows the past date in red.
3. Open the home page, add a testimonials block in auto mode: the preview line lists one name, "1 passend", and the warning (count 3 > 1). "Neu mischen" changes nothing visible with one match but must not error (check console).
4. Save the page as draft only; open a testimonial: panel says "Derzeit auf keiner Seite" (drafts are not counted). Publish the page: panel lists it as "automatisch".

- [ ] **Step 6: Commit**

```bash
git add packages/payload-plugin-testimonials src/app/\(payload\)/admin/importMap.js
git commit -m "Testimonials admin: selection preview, reshuffle, usage panel, expiry cell"
```

---

### Task 8: Convert inline quotes into the collection

**Files:**
- Create: `src/utilities/convertInlineTestimonials.ts`, `scripts/convert-testimonials.ts`
- Test: `tests/int/testimonials-convert.int.spec.ts`

**Interfaces:**
- Consumes: Payload local API, generated `Page` type.
- Produces:
  - `collectInlineTestimonials(pages: { id: number; layout?: unknown[] | null }[], localised: Record<string, PageLocales>): { entries: InlineEntry[]; assignments: { pageId: number; blockId: string; keys: string[] }[] }` (pure)
  - `keyOf(name, company): string` → `name|company` lower-cased and trimmed
  - `convertInlineTestimonials({ payload, req }): Promise<{ created: number; reused: number; blocks: number }>` (idempotent)

- [ ] **Step 1: Write the failing test for the pure part**

`tests/int/testimonials-convert.int.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { collectInlineTestimonials, keyOf } from '@/utilities/convertInlineTestimonials'

const item = (id: string, name: string, company: string, de: string, en: string) => ({
  id,
  name,
  company,
  quote: { de, en },
  role: { de: 'Vorstand', en: 'Board member' },
  avatar: null,
  logo: null,
})

describe('collectInlineTestimonials', () => {
  const pages = [
    { id: 1, layout: [{ blockType: 'testimonials', id: 'b1', items: [item('i1', 'Armin Biebl', 'Familotel AG', 'Q1', 'E1'), item('i2', 'Ilona', 'Familotel AG', 'Q2', 'E2')] }] },
    { id: 2, layout: [{ blockType: 'hero', id: 'h' }, { blockType: 'testimonials', id: 'b2', items: [item('i3', ' armin biebl ', 'Familotel AG', 'Q1', 'E1')] }] },
    { id: 3, layout: [{ blockType: 'testimonials', id: 'b3', items: [item('i4', 'X', '', 'Q', 'E')], testimonials: [5] }] },
    { id: 4, layout: null },
  ]

  it('dedupes people by name + company and keeps both locales', () => {
    const { entries } = collectInlineTestimonials(pages)
    expect(entries.map((e) => e.key)).toEqual([keyOf('Armin Biebl', 'Familotel AG'), keyOf('Ilona', 'Familotel AG')])
    expect(entries[0].quote).toEqual({ de: 'Q1', en: 'E1' })
  })

  it('assigns every unconverted block, skipping already converted ones', () => {
    const { assignments } = collectInlineTestimonials(pages)
    expect(assignments).toEqual([
      { pageId: 1, blockId: 'b1', keys: [keyOf('Armin Biebl', 'Familotel AG'), keyOf('Ilona', 'Familotel AG')] },
      { pageId: 2, blockId: 'b2', keys: [keyOf('Armin Biebl', 'Familotel AG')] },
    ])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test:int tests/int/testimonials-convert.int.spec.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`src/utilities/convertInlineTestimonials.ts`:

```ts
import type { Payload, PayloadRequest } from 'payload'

import { locales, type Locale } from '@/i18n/config'

type Localised = Partial<Record<Locale, string | null>> | string | null | undefined
type InlineItem = { name?: string | null; company?: string | null; quote?: Localised; role?: Localised; avatar?: unknown; logo?: unknown }
type Block = { blockType?: string; id?: string | null; items?: InlineItem[] | null; testimonials?: unknown[] | null }
type PageLike = { id: number; layout?: unknown[] | null }

export type InlineEntry = {
  key: string
  name: string
  company: string | null
  quote: Partial<Record<Locale, string>>
  role: Partial<Record<Locale, string>>
  avatar: number | null
  logo: number | null
}

export const keyOf = (name?: string | null, company?: string | null) => `${(name || '').trim().toLowerCase()}|${(company || '').trim().toLowerCase()}`

const perLocale = (value: Localised): Partial<Record<Locale, string>> => {
  if (!value) return {}
  if (typeof value === 'string') return { [locales[0]]: value }
  return Object.fromEntries(Object.entries(value).filter(([, v]) => Boolean(v))) as Partial<Record<Locale, string>>
}
const mediaId = (v: unknown) => (typeof v === 'number' ? v : v && typeof v === 'object' ? ((v as { id?: number }).id ?? null) : null)

/**
 * Pure part of the conversion: which people exist (deduped by name + company) and which blocks
 * point at them. Pages must be read with `locale: 'all'` so localised fields arrive as
 * `{ de, en }`. Blocks that already reference testimonials are skipped (idempotent).
 */
export const collectInlineTestimonials = (pages: PageLike[]) => {
  const entries = new Map<string, InlineEntry>()
  const assignments: { pageId: number; blockId: string; keys: string[] }[] = []
  for (const page of pages) {
    for (const raw of page.layout || []) {
      const block = raw as Block
      if (block.blockType !== 'testimonials' || !block.id) continue
      if ((block.testimonials || []).length > 0) continue
      const items = (block.items || []).filter((i) => i.name && i.quote)
      if (items.length === 0) continue
      const keys: string[] = []
      for (const i of items) {
        const key = keyOf(i.name, i.company)
        keys.push(key)
        if (!entries.has(key)) {
          entries.set(key, {
            key,
            name: (i.name as string).trim(),
            company: i.company?.trim() || null,
            quote: perLocale(i.quote),
            role: perLocale(i.role),
            avatar: mediaId(i.avatar),
            logo: mediaId(i.logo),
          })
        }
      }
      assignments.push({ pageId: page.id, blockId: block.id, keys })
    }
  }
  return { entries: [...entries.values()], assignments }
}

/**
 * Moves inline quotes into the testimonials collection and switches those blocks to manual mode
 * pointing at them. Idempotent: existing testimonials are matched by name + company, converted
 * blocks are skipped. The inline `items` stay (hidden) until a later cleanup.
 * Every call passes `req`: inside a migration the new tables exist only in its transaction.
 */
export const convertInlineTestimonials = async ({ payload, req }: { payload: Payload; req: PayloadRequest }) => {
  const context = { disableRevalidate: true }
  const [primary, ...rest] = locales
  const pages = await payload.find({ collection: 'pages', locale: 'all', depth: 0, pagination: false, draft: false, overrideAccess: true, req })
  const { entries, assignments } = collectInlineTestimonials(pages.docs as unknown as PageLike[])

  const existing = await payload.find({ collection: 'testimonials', depth: 0, pagination: false, overrideAccess: true, draft: true, req })
  const idByKey = new Map(existing.docs.map((d) => [keyOf(d.name, d.company), d.id]))
  let created = 0
  for (const e of entries) {
    if (idByKey.has(e.key)) continue
    const doc = await payload.create({
      collection: 'testimonials',
      locale: primary,
      data: { name: e.name, company: e.company, quote: e.quote[primary] || Object.values(e.quote)[0] || '', role: e.role[primary], avatar: e.avatar, logo: e.logo, _status: 'published' },
      req,
      context,
    })
    for (const locale of rest) {
      if (!e.quote[locale] && !e.role[locale]) continue
      await payload.update({ collection: 'testimonials', id: doc.id, locale, data: { quote: e.quote[locale], role: e.role[locale], _status: 'published' }, req, context })
    }
    idByKey.set(e.key, doc.id)
    created++
  }

  for (const pageId of [...new Set(assignments.map((a) => a.pageId))]) {
    const page = await payload.findByID({ collection: 'pages', id: pageId, locale: primary, depth: 0, draft: false, overrideAccess: true, req })
    const forPage = assignments.filter((a) => a.pageId === pageId)
    const layout = (page.layout || []).map((block) => {
      const a = forPage.find((x) => x.blockId === block.id)
      return a ? { ...block, mode: 'manual' as const, testimonials: a.keys.map((k) => idByKey.get(k) as number) } : block
    })
    await payload.update({ collection: 'pages', id: pageId, locale: primary, data: { layout }, req, context })
  }

  return { created, reused: entries.length - created, blocks: assignments.length }
}
```

`scripts/convert-testimonials.ts`:

```ts
/**
 * Moves the inline quotes of all testimonials blocks into the central collection:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/convert-testimonials.ts
 * Safe to run again. Production runs the same step inside the testimonials migration.
 */
import { getPayload, type PayloadRequest } from 'payload'
import config from '@payload-config'

import { convertInlineTestimonials } from '../src/utilities/convertInlineTestimonials'

const payload = await getPayload({ config })
const result = await convertInlineTestimonials({ payload, req: { payload, context: {} } as unknown as PayloadRequest })
payload.logger.info(`[testimonials] created ${result.created}, reused ${result.reused}, converted ${result.blocks} blocks`)
process.exit(0)
```

- [ ] **Step 4: Run the test**

Run: `pnpm test:int tests/int/testimonials-convert.int.spec.ts`
Expected: PASS.

- [ ] **Step 5: Run it against the dev DB (twice)**

Run the script command from its header twice.
Expected: first run `created 2, reused 0, converted 4 blocks` (home, hotels, hotel-groups, about); second run `created 0, reused 0, converted 0 blocks`.

Then clear the dev fetch cache and restart: `docker exec indicate-datacomdemo-app-1 rm -rf /app/.next/dev/cache/fetch-cache && docker compose restart app`.
Check `/de`, `/en`, `/de/about`, `/de/hotels`: same two Familotel quotes, English text on `/en`. In the admin both testimonials exist, and each shows 4 usages ("von Hand").

- [ ] **Step 6: Commit**

```bash
git add src/utilities/convertInlineTestimonials.ts scripts/convert-testimonials.ts tests/int/testimonials-convert.int.spec.ts
git commit -m "Convert inline testimonial quotes into the central collection"
```

---

### Task 9: Seeds use central testimonials

**Files:**
- Create: `src/endpoints/seed/testimonials.ts`
- Modify: `src/endpoints/seed/index.ts`, `src/endpoints/seed/content.ts` (Refs + home block), `src/endpoints/seed/pages.ts` (`testimonials()` + 2 call sites), `src/endpoints/seed/about.ts`

**Interfaces:**
- Consumes: `T`, `Refs`, `upsert` helpers in `index.ts`.
- Produces:
  - `Refs.testimonialTags: Record<TestimonialTagSlug, number>`
  - `type TestimonialTagSlug = 'hotellerie' | 'agenturen'`
  - `testimonialTagData(t): Record<TestimonialTagSlug, { title: string }>`
  - `testimonialData(t): { name: string; company: string; quote: string; role: string; tags: TestimonialTagSlug[] }[]`
  - `testimonials(t, refs, opts?: { tag?: TestimonialTagSlug; count?: number; seed: string; header?: Partial<Block['header']> }): Block` in `pages.ts`

- [ ] **Step 1: Seed data**

`src/endpoints/seed/testimonials.ts`:

```ts
import type { T } from './content'

export const testimonialTagSlugs = ['hotellerie', 'agenturen'] as const
export type TestimonialTagSlug = (typeof testimonialTagSlugs)[number]

export const testimonialTagData = (t: T): Record<TestimonialTagSlug, { title: string }> => ({
  hotellerie: { title: t('Hotellerie', 'Hotels') },
  agenturen: { title: t('Agenturen', 'Agencies') },
})

/** Central testimonials; pages select them by tag. Keyed by name + company when upserting. */
export const testimonialData = (t: T) => [
  {
    name: 'Armin Biebl',
    company: 'Familotel AG',
    role: t('Vorstand', 'Board member'),
    quote: t(
      'Seit ich mit Indicate arbeite, ist meine Arbeit deutlich einfacher geworden. Die Benutzerfreundlichkeit ist ein großer Vorteil.',
      'Since I started using Indicate, my work has become significantly easier. The user-friendliness is a major advantage.',
    ),
    tags: ['hotellerie'] as TestimonialTagSlug[],
  },
  {
    name: 'Ilona Stöger-Wolfmeir',
    company: 'Familotel AG',
    role: t('Vorstand', 'Board member'),
    quote: t(
      'Indicate hat die Auswertung aller relevanten Kennzahlen drastisch vereinfacht und vereinheitlicht.',
      'Indicate has drastically simplified and standardised how we evaluate all relevant KPIs.',
    ),
    tags: ['hotellerie'] as TestimonialTagSlug[],
  },
]
```

- [ ] **Step 2: Upsert in `index.ts` before the subpages**

Add imports `testimonialData, testimonialTagData, testimonialTagSlugs, type TestimonialTagSlug` from `./testimonials` and `keyOf` from `@/utilities/convertInlineTestimonials`. Before `const draft: Refs = …` (line ~93) insert:

```ts
  payload.logger.info('— Testimonials')
  const testimonialTags = {} as Record<TestimonialTagSlug, number>
  for (const slug of testimonialTagSlugs) {
    const found = await payload.find({ collection: 'testimonial-tags', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    const [primary, ...rest] = locales
    const doc = found.docs[0]
      ? await payload.update({ collection: 'testimonial-tags', id: found.docs[0].id, data: { ...testimonialTagData(pick(primary))[slug], slug }, locale: primary, req, context })
      : await payload.create({ collection: 'testimonial-tags', data: { ...testimonialTagData(pick(primary))[slug], slug }, locale: primary, req, context })
    for (const locale of rest) await payload.update({ collection: 'testimonial-tags', id: doc.id, data: testimonialTagData(pick(locale))[slug], locale, req, context })
    testimonialTags[slug] = doc.id
  }
  const existingTestimonials = await payload.find({ collection: 'testimonials', pagination: false, depth: 0, draft: true })
  const [primaryLocale, ...otherLocales] = locales
  const base = testimonialData(pick(primaryLocale))
  for (let i = 0; i < base.length; i++) {
    const entry = base[i]
    const data = { ...entry, tags: entry.tags.map((s) => testimonialTags[s]), _status: 'published' as const }
    const match = existingTestimonials.docs.find((d) => keyOf(d.name, d.company) === keyOf(entry.name, entry.company))
    const doc = match
      ? await payload.update({ collection: 'testimonials', id: match.id, data, locale: primaryLocale, req, context })
      : await payload.create({ collection: 'testimonials', data, locale: primaryLocale, req, context })
    for (const locale of otherLocales) {
      const localised = testimonialData(pick(locale))[i]
      await payload.update({ collection: 'testimonials', id: doc.id, data: { quote: localised.quote, role: localised.role, _status: 'published' }, locale, req, context })
    }
  }
```

Add `testimonialTags` to both `draft` and `refs` objects.

- [ ] **Step 3: Refs type and the block builder**

In `content.ts` `Refs` add:

```ts
  /** Ids of the testimonial cohort tags (see ./testimonials). */
  testimonialTags: Record<TestimonialTagSlug, number>
```

(import the type from `./testimonials`).

In `pages.ts` replace `export const testimonials = (t: T): Block => ({ … })` with:

```ts
export const testimonials = (
  t: T,
  refs: Refs,
  opts: { seed: string; tag?: TestimonialTagSlug; count?: number; header?: Partial<NonNullable<Extract<Block, { blockType: 'testimonials' }>['header']>> },
): Block => ({
  blockType: 'testimonials',
  blockName: t('Kundenstimmen', 'Testimonials'),
  header: {
    eyebrow: t('Kundenstimmen', 'Customers'),
    heading: t('Was Hotels über Indicate sagen', 'What hotels say about Indicate'),
    align: 'left',
    ...opts.header,
  },
  mode: 'auto',
  tags: opts.tag ? [refs.testimonialTags[opts.tag]] : [],
  count: opts.count ?? 2,
  seed: opts.seed,
  settings: { ...defaults },
})
```

Call sites: hotels page `testimonials(t, refs, { seed: 'hotels', tag: 'hotellerie' })`; hotel-groups `testimonials(t, refs, { seed: 'hotel-groups', tag: 'hotellerie' })`; about `testimonials(t, refs, { seed: 'about' })`.

In `content.ts` home: replace the inline block object (lines ~677–710) with

```ts
    testimonials(t, refs, {
      seed: 'home',
      header: {
        heading: t('Was Hotels und Partner über Indicate sagen', 'What hotels and partners say about Indicate'),
        lead: t(
          'Im Einsatz bei Familotel AG, Alpenhof, Feldberger Hof, Hochegger Klippitz und Hotel Seeklause.',
          'In use at Familotel AG, Alpenhof, Feldberger Hof, Hochegger Klippitz and Hotel Seeklause.',
        ),
      },
    }),
```

keeping `settings: { background: 'default', spacing: 'default' }` if it differs from `defaults` (check `defaults` in `pages.ts`; if equal, nothing to add). Import `testimonials` from `./pages`.

- [ ] **Step 4: Type-check and run the seed**

Run: `pnpm exec tsc --noEmit -p tsconfig.json`
Expected: no new errors.

Run the seed from the host (command in `scripts/seed.ts` header), then clear the fetch cache and restart the app (command in Task 8 Step 5).
Expected: seed completes; no duplicate testimonials (still 2); home, hotels, hotel-groups, about show the two Familotel quotes; the blocks in the admin are in "Automatisch" mode with preview "2 passend".

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed
git commit -m "Seed central testimonials and select them by tag"
```

---

### Task 10: Production migration, package README, final verification

**Files:**
- Create: `src/migrations/<stamp>_testimonials.ts` (+ `.json`), `packages/payload-plugin-testimonials/README.md`
- Modify: `src/migrations/index.ts` (generated)

- [ ] **Step 1: Generate the migration**

Run: `make migration NAME=testimonials`
Expected: `src/migrations/<stamp>_testimonials.ts` with `CREATE TABLE "testimonials"…`, `"testimonial_tags"…`, `_testimonials_v…`, `ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "mode"…`, `"count"`, `"seed"`, `"tag_match"`, rels columns. Review: **no `DROP`** statements. If any DROP appears, stop and investigate (it means a field was renamed/removed).

- [ ] **Step 2: Append the data step**

At the end of `up`:

```ts
import { convertInlineTestimonials } from '../utilities/convertInlineTestimonials'
// …
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`…generated…`)
  // Move the inline quotes of existing blocks into the new collection (idempotent).
  await convertInlineTestimonials({ payload, req })
}
```

`down` stays as generated (schema only; the converted testimonials are dropped with their tables).

- [ ] **Step 3: Package README**

`packages/payload-plugin-testimonials/README.md` — sections: What it does; Install (`testimonialsPlugin()` in `plugins`, `createTestimonialsBlock({ before, after })` in your blocks); Rendering (`getTestimonials` from `/server`, returns `{ testimonial, reason }[]`; pass `layout` + `blockIndex` for dedupe; call inside a server component); Selection rules (manual; auto = tags any/all, pinned, exclude, count 1–6, rendezvous hashing: adding one testimonial changes at most one slot per page); Caching (tag `testimonials`, daily revalidate for `approvedUntil`); Admin (preview + reshuffle, usage panel, expiry cell; `componentPaths` for custom import maps); Options table (copy from `TestimonialsPluginOptions` doc comments); Licence MIT.

- [ ] **Step 4: Full test run and lint**

Run: `pnpm test:int`
Expected: all testimonials specs PASS; no previously passing spec fails.

Run: `pnpm lint`
Expected: no errors in changed files.

- [ ] **Step 5: Production-mode check** (per the project's deploy notes)

Run: `BUILD_WITHOUT_DB=true pnpm build && PORT=3001 pnpm start` (against the dev DB), then:

```bash
curl -s localhost:3001/pages-sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g; s#https\?://[^/]*#http://localhost:3001#' | while read u; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done | grep -v '^200' || echo "all 200"
```

Expected: `all 200`. Then edit a testimonial's role in the admin on :3001, publish, reload `/de/about` on :3001 → the new role appears (tag revalidation works in production mode). Revert the edit.

- [ ] **Step 6: Commit**

```bash
git add src/migrations packages/payload-plugin-testimonials/README.md
git commit -m "Testimonials migration with inline-quote conversion, package README"
```
