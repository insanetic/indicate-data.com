# Central testimonials — design

Date: 2026-09-23
Status: approved in conversation, awaiting spec review

## Goal

Customer testimonials are maintained in one place. Pages no longer carry copies of quotes; a page's
testimonials section either picks specific testimonials by hand or selects them automatically and
deterministically from the central pool, optionally restricted to cohort tags (e.g. hotels vs
agencies). Renaming, adding, unpublishing or deleting a testimonial updates every page that shows it.

The feature ships as a workspace package, `@subneo/payload-testimonials`, built like
`@subneo/payload-consent` and `@subneo/payload-pricing`, so it can later be published as open source
with little more than a README.

## Decisions (from the conversation)

- Tags are an **editor-side filter only**. Visitors never see tabs or tag labels.
- Selection modes: **manual** and **automatic (stable)**. No per-visit randomness: pages are
  statically rendered and the same page always shows the same quotes until content changes or the
  editor reshuffles.
- v1 extras: **where-used panel** (only if efficient and non-invasive), **release status**,
  **customer link**, **MCP access**.
- Also in v1 (approved with the design sections): per-page dedupe across testimonials blocks.
- Not in v1: featured flag, short quote variant, layout
  variants, star ratings / review JSON-LD (Google ignores self-serving reviews).
- 2026-09-23: approvedUntil removed on request; may return later.

## Current state

- Block `testimonials` (`src/blocks/Testimonials/config.ts`) stores up to 6 quotes inline
  (`items[]`: quote, name, role, company, avatar, logo).
- The same two Familotel quotes are duplicated in `src/endpoints/seed/content.ts` (home) and
  `src/endpoints/seed/pages.ts` (`testimonials(t)`, used on two subpages and on about).
- Pages are statically rendered, revalidated by path on page save. Nothing revalidates a page when
  data it reads from elsewhere changes, except loaders cached by tag (pricing, integrations).

## Architecture

```
packages/payload-plugin-testimonials/        @subneo/payload-testimonials (MIT)
  src/index.ts        testimonialsPlugin, createTestimonialsBlock, types
  src/plugin.ts       adds collections, endpoint, hooks
  src/collections.ts  testimonials + testimonial-tags collection factories
  src/block.ts        createTestimonialsBlock({ before, after, extraFields })
  src/select.ts       selectTestimonials(): pure, deterministic
  src/hash.ts         small stable string hash (FNV-1a 32-bit)
  src/server.ts       getTestimonials() loader (unstable_cache, tag) + selectTestimonials re-export
  src/endpoint.ts     GET /api/<slug>/:id/usage
  src/hooks.ts        revalidate tag on change/delete
  src/admin.ts        'use client' exports: UsagePanel, ReshuffleButton, SelectionPreview
  src/labels.ts       de/en label helper
```

Entry points mirror the consent package: `.` (config side), `./server`, `./admin`. The site wires it
with a tsconfig path alias and a workspace dependency, as the other two packages do. The package is
headless: it does not ship the visitor-facing React component. The site keeps its editorial markup.

### Site integration

- `src/plugins/index.ts`: `testimonialsPlugin({ ... })`, plus MCP entries for `testimonials` and
  `testimonial-tags` (find, create, update; no delete — same policy as pages).
- `src/blocks/Testimonials/config.ts`: becomes
  `createTestimonialsBlock({ localized: true, before: [sectionHeader({ optionalHeading: true })], after: [sectionSettings()], extraFields: [legacyInlineItems] })`.
  `legacyInlineItems` is the old `items` array with `admin.hidden: true`. The block slug and
  `interfaceName` (`testimonials`, `TestimonialsBlock`) stay the same.
- `src/blocks/Testimonials/Component.tsx`: async server component that calls `getTestimonials` and
  renders the existing markup, plus an optional link on the company line.
- `RenderBlocks` passes the page's `layout` and the block index to the component (for dedupe).

## Data model

### Collection `testimonials`

| Field | Type | Notes |
|---|---|---|
| `quote` | textarea, required, localised | |
| `name` | text, required | person |
| `role` | text, localised | |
| `company` | text | |
| `avatar` | upload → media | optional, initials fallback as today |
| `logo` | upload → media | optional |
| `tags` | relationship → testimonial-tags, hasMany | optional |
| `link` | group: `type` (none / internal / external), `doc` (relationship → configurable collections, default pages + posts), `url`, `label` (localised) | customer link / case study |
| `internalNote` | textarea, sidebar | e.g. who approved, where the quote came from; never rendered |
| `title` | text, virtual (`Name – Company`) | `useAsTitle` |

- Drafts and versions enabled (`versions: { drafts: true }`). Only published documents are shown on
  the site; draft mode on the site shows drafts.
- Access: read = published only for anonymous users (as posts); write = authenticated.
- List view columns: title, tags, `_status`, `updatedAt`.

### Collection `testimonial-tags`

| Field | Type | Notes |
|---|---|---|
| `title` | text, required, localised | shown in admin only |
| `slug` | slugField | stable, unique |

Blocks reference tags by relationship (id), so renaming a tag never touches pages.

### Block `testimonials`

| Field | Type | Notes |
|---|---|---|
| (before) | site fields | `header` |
| `mode` | radio: `auto` (default) / `manual` | |
| `testimonials` | relationship → testimonials, hasMany, sortable | manual mode only (`admin.condition`) |
| `tags` | relationship → testimonial-tags, hasMany | auto; empty = all |
| `tagMatch` | radio `any` / `all`, default `any` | auto; shown when ≥ 2 tags |
| `limit` | number 1–6, default 3 | auto |
| `pinned` | relationship → testimonials, hasMany | auto; always shown first, in order, count toward limit |
| `exclude` | relationship → testimonials, hasMany | auto |
| `seed` | text, hidden in UI | set once on create (random), changed by the reshuffle button |
| `preview` | ui field → `SelectionPreview` + `ReshuffleButton` | auto; shows current pick |
| (extraFields) | site fields | the legacy inline `items` array, hidden (see Migration) |
| (after) | site fields | `settings` |

The manual picker is named `testimonials`, not `items`, because the old inline array keeps its
name `items` (hidden legacy field, see Migration) and renaming it would be a destructive schema change.

## Selection

`selectTestimonials({ pool, block, seed, alreadyShown })` is pure and has no Payload dependency.

1. **Eligible** = published, not in `exclude`, and matching the tag filter (`any`: shares ≥ 1 tag;
   `all`: has every tag; no tags on the block: everything).
2. **Manual mode**: the chosen `testimonials` in their order, minus ineligible ones (unpublished,
   deleted). Tags and limit are ignored.
3. **Auto mode**: `pinned` (eligible ones, in order) first. Remaining slots up to `limit` are filled
   from the other eligible testimonials, ordered by **rendezvous hashing**:
   `score = fnv1a(seed + ':' + testimonialId)`, highest first, ties broken by id.
   - Why rendezvous: adding a testimonial only changes pages where the newcomer outranks a current
     pick; removing one only affects pages that showed it. Every other page keeps its quotes. A
     seeded shuffle of the pool would reshuffle every page on every change.
4. **Dedupe on a page**: testimonials already shown by an earlier testimonials block on the same
   page (`alreadyShown`) are skipped in auto mode (not in manual mode — a hand pick wins). The
   loader computes `alreadyShown` by resolving the earlier blocks of the same layout.
5. **Seed**: the block's `seed`. If missing (old data), fall back to the block's `id`, which Payload
   keeps stable.

The same function drives the frontend, the admin preview and the usage endpoint, so all three
always agree.

## Loading and caching

`getTestimonials({ payload, block, layout, blockIndex, locale, draft })`:

- Reads the pool with one query: all testimonials (depth 1 for media and link doc, `locale`), cached
  with `unstable_cache` under tag `testimonials`, with no time-based revalidate: only the hooks
  below invalidate it. In draft mode the cache is bypassed and drafts are included.
- Pool size assumption: hundreds at most, so loading the pool once per locale is cheaper and simpler
  than per-block queries. Selecting fields (`select`) keeps the payload small.
- Returns resolved testimonials (quote, name, role, company, avatar, logo, link href/label).

Revalidation: `afterChange` / `afterDelete` hooks on both collections call
`revalidateTag('testimonials', { expire: 0 })` (same call as the pricing plugin), unless
`context.disableRevalidate`. Next re-renders exactly the pages that read the tag. Page saves keep
revalidating by path as today.

## Admin UX

- Sidebar group "Kundenstimmen" / "Testimonials" (configurable) with both collections.
- **Usage panel** (sidebar UI field on a testimonial): calls `GET /api/testimonials/:id/usage` and lists
  `Page title · block heading · manual | pinned | auto`, linking to the page in the admin.
  The endpoint loads published pages with `select: { title: true, slug: true, layout: true }`, runs
  `selectTestimonials` for every testimonials block, and returns matches. One request when the panel
  opens; no stored relation, no extra table, no page schema change. It warns ("shown on 3 pages")
  but never blocks deletion.
  - The pages collection and layout field names are options (`usage: { collection: 'pages', field: 'layout' }`), so the package does not assume this site's structure. Disabled with `usage: false`.
- **Selection preview** (UI field in the block, auto mode): "Aktuell angezeigt: Biebl (Familotel),
  Stöger-Wolfmeir (Familotel) · 7 passend". It is computed client-side through the same endpoint
  family (`POST /api/testimonials/preview` with the block's current values), and shows a hint when
  fewer testimonials match than `limit`.
- **Reshuffle button**: sets `seed` to a new random value in the form state; the preview updates
  immediately and the change takes effect on save/publish like any other edit.

## Migration

Dev uses schema push and must stay additive (no TTY in the app container). Therefore:

1. The old inline array stays in the block schema as `items`, hidden (`admin.hidden: true`), passed by
   the site through `extraFields`. Nothing is dropped.
2. New collections and new block fields are additive.
3. A data step (`scripts/migrate-testimonials.ts`, also usable from a Payload migration) walks all pages
   (both locales), creates a testimonial per unique `name + company` (quote per locale from the
   array), and sets each block to `mode: 'manual'` with `testimonials` pointing at them. Idempotent:
   re-running finds existing testimonials by `name + company` and does not duplicate.
4. `make migration NAME=testimonials` generates the production schema migration; the data step is
   appended to it so production converts on deploy.
5. The seeds create the testimonials (and tags `hotellerie`, `agenturen`) centrally and reference them;
   the seeded blocks use `mode: 'auto'` with the fitting tag, except where a specific quote is wanted.
6. Dropping the legacy `items` array is a later, separate change (same as `navItems`).

## Package options (summary)

```ts
testimonialsPlugin({
  enabled?: boolean
  slugs?: { testimonials?: string; tags?: string }       // default 'testimonials', 'testimonial-tags'
  mediaSlug?: string                                     // default 'media'
  linkCollections?: string[]                             // default ['pages', 'posts']; [] hides internal links
  adminGroup?: string | Record<string, string>
  cacheTag?: string                                      // default 'testimonials'
  usage?: false | { collection: string; field: string; blockSlug?: string }
  access?: Partial<CollectionConfig['access']>           // override defaults
})

createTestimonialsBlock({ slug?, interfaceName?, localized?, before?, after?, extraFields?, maxLimit? })
```

Localisation is detected from `config.localization`, as in the consent plugin.

## Error handling

- Loader failure: logged via `payload.logger.error` with a `[testimonials]` prefix; the block renders
  nothing rather than breaking the page.
- Empty result (no match): the block renders nothing on the site; the admin preview
  says why ("0 passend — Filter prüfen").
- Deleted testimonial referenced in manual mode / pinned / exclude: relationship resolves to null and
  is skipped.
- Usage endpoint: authenticated only; returns 401 otherwise.

## Testing

- **Unit (vitest, package)** for `selectTestimonials`: determinism; rendezvous stability (adding or
  removing one testimonial changes at most the affected slot on each page, verified over many seeds);
  pinned order and limit; exclude; tag `any`/`all`/empty; drafts ignored;
  dedupe via `alreadyShown`; manual mode ignores tags/limit but drops unpublished ones; missing seed
  falls back to block id.
- **Integration (`tests/int`)**: create tags and testimonials, a page with two testimonials blocks;
  `getTestimonials` resolves the expected lists with no duplicates; usage endpoint lists the page with
  the right mode; the migration script converts an inline block and is idempotent.
- **Manual/browser**: home and about render the same quotes as before the migration; editing a
  testimonial's name shows on the page after save (tag revalidation); production check per
  `BUILD_WITHOUT_DB=true pnpm build && pnpm start` walking `/pages-sitemap.xml` for 200s.

## Out of scope / later

- Dropping the legacy inline `items` array.
- Featured flag, short quote variant, layout variants (single large quote, carousel).
- A default visitor-facing component in the package (needed before open-sourcing; the site's
  component can serve as the starting point).
- Publishing to npm (build via `tsc`, `publishConfig` as in the consent package).
