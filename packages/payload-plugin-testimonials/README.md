# @subneo/payload-testimonials

Central testimonials for Payload CMS and Next.js (App Router). Each quote is written once, in a
`testimonials` collection with drafts, tags and an approval date. Page sections then reference
quotes instead of copying them: an editor picks them by hand, or lets the block choose by tag.
The sidebar of every testimonial lists the pages that show it, so a quote whose approval runs out
can be traced before it is removed.

## What it does

- Adds two collections: `testimonials` (quote, name, role, company, photo, logo, link, tags,
  approval date, internal note; drafts on) and `testimonial-tags`.
- Exports a page block that stores which testimonials a section shows, never the quotes
  themselves.
- Resolves a block to testimonials at render time with one cached query per locale.
- Admin: a live preview of the automatic pick with a reshuffle button, a "Shown on" panel on each
  testimonial, and a list cell that turns red once the approval date has passed.

## Install

1. Add the package (path alias in `tsconfig.json`, or install it). Entry points:
   `@subneo/payload-testimonials` (config), `@subneo/payload-testimonials/server` (rendering) and
   `@subneo/payload-testimonials/admin` (admin components).
2. `payload.config.ts`:

   ```ts
   import { testimonialsPlugin } from '@subneo/payload-testimonials'

   export default buildConfig({
     plugins: [testimonialsPlugin()],
   })
   ```

3. Put the block in your layout field. `before` and `after` take the site's own fields, such as a
   section heading or spacing settings:

   ```ts
   import { createTestimonialsBlock } from '@subneo/payload-testimonials'

   export const Testimonials = createTestimonialsBlock({
     before: [sectionHeader()],
     after: [sectionSettings()],
   })
   ```

4. Run `payload generate:types` and `payload generate:importmap`, then create a migration.

## Rendering

Call `getTestimonials` inside a server component. It returns `{ testimonial, reason }[]`, where
`reason` is `manual`, `pinned` or `auto`:

```tsx
import { getTestimonials } from '@subneo/payload-testimonials/server'

const selected = await getTestimonials({ payload, block, layout, blockIndex, locale, draft })
```

Pass the page `layout` and the block's `blockIndex` whenever you have them. The package then
resolves every testimonials block on the page in order, and an automatic block skips what an
earlier block already shows. Without them each block is resolved on its own and two sections can
show the same quote.

`draft: true` (site draft mode, live preview) reads drafts and bypasses the cache. The function
never throws: a failed query is logged and the block renders nothing.

## Selection rules

**Manual.** The hand-picked testimonials in the stored order. Unpublished, deleted and expired
ones are skipped.

**Automatic.** From every published, unexpired testimonial:

1. drop the ones in "Never show" (`exclude`);
2. keep the ones with the chosen tags, matching any tag or all of them (`tagMatch`). No tags means
   no filter;
3. put the pinned ones first, in their stored order;
4. fill up to `count` (1 to 6, default 3) by rendezvous hashing of the block's `seed` against each
   testimonial id.

The hash makes the pick stable. The same seed gives the same testimonials on every render, and
adding one testimonial changes at most one slot per page. The seed is a random string set when the
block is created; the preview's reshuffle button draws a new one.

`approvedUntil` is a permission date and counts the whole day in UTC. From the next day on the
quote disappears everywhere, manual blocks included.

The same pure function (`selectTestimonials`) runs on the site, in the admin preview and in the
usage panel, so the three never disagree.

## Caching

Outside draft mode the pool of testimonials is cached with `unstable_cache` under the tag
`testimonials` (see `cacheTag`). Saving or deleting a testimonial or a tag calls
`revalidateTag`, and pages pick up the change on the next request. The cache also expires after
a day, which is how an `approvedUntil` date takes effect without anyone saving.

Seeds, scripts and migrations pass `context: { disableRevalidate: true }` to skip the
revalidation. Outside a Next request `revalidateTag` throws; the hook catches that, so a CLI write
never fails on it.

## Admin

- **Block preview.** In automatic mode the block shows which testimonials it would pick right now
  from the unsaved form values, how many match the filter, and a button for a new seed.
- **Shown on.** The testimonial sidebar lists the published pages whose blocks show it, and the
  ones that reference it but currently do not show it. Configure where it looks with `usage`.
- **Approved until.** The list column turns red after the date.
- **Internal note.** Readable only by logged-in users, never through the public API.

The admin components are registered by import-map path. If your import map resolves the package
under another name, set `componentPaths`.

Endpoints, both for logged-in users only:

- `GET /api/testimonials/:id/usage` feeds the "Shown on" panel;
- `POST /api/testimonials/preview` feeds the block preview.

## Options

`testimonialsPlugin(options)`:

| Option | Default | What it does |
| --- | --- | --- |
| `enabled` | `true` | `false` leaves the config untouched. |
| `slugs` | `{ testimonials: 'testimonials', tags: 'testimonial-tags' }` | Collection slugs. |
| `mediaSlug` | `'media'` | Upload collection for photo and logo. |
| `linkCollections` | `['pages', 'posts']` | Collections a testimonial can link to (a case study, say). `[]` allows external links only. |
| `adminGroup` | Kundenstimmen / Testimonials | Admin sidebar group. |
| `cacheTag` | `'testimonials'` | Next cache tag of the loaded pool. |
| `usage` | `{ collection: 'pages', field: 'layout', blockSlug: 'testimonials' }` | Where the "Shown on" panel looks for blocks. `false` hides the panel. |
| `componentPaths` | `@subneo/payload-testimonials/admin#…` | Import-map paths of `usagePanel`, `selectionPreview` and `approvedUntilCell`. |
| `access` | see below | Access for the testimonials collection, merged key by key over the defaults. |

The default access: visitors read published testimonials, logged-in users read everything and may
create, update and delete. To let only editors write, for example:

```ts
testimonialsPlugin({ access: { create: isEditor, update: isEditor, delete: isEditor } })
```

Tags are readable by everyone and writable by logged-in users; `access` does not change them.

`createTestimonialsBlock(options)` takes `slug`, `interfaceName`, `before`, `after`,
`extraFields` (placed before `after`, meant for legacy fields kept for a migration),
`testimonialsSlug`, `tagsSlug` and `selectionPreviewPath`. Match the slugs to the plugin's.

## Moving inline quotes into the collection

A site that stored quotes inside the block converts them once. On indicate-data.com the step is
`convertInlineTestimonials` in `src/utilities/convertInlineTestimonials.ts`, and the
testimonials migration runs it after the schema change, with the migration's own `req` so every
save is part of the migration's transaction. A failure rolls back the schema change too.

What it does:

- Every inline quote becomes a published testimonial. People are matched by name and company, so
  a quote that appears on four pages becomes one testimonial, and a second run creates nothing.
- Each block switches to manual mode and references those testimonials in the same order.
- The inline rows are emptied once copied. The hidden `items` field itself stays in the schema
  until a later change removes it.
- Published pages stay published and do not pick up pending draft edits.
- A page with a pending draft keeps it. The draft is saved again on top of the new published
  version, as a draft. Its block is converted only when it holds the same people in the same
  order as the published one.
- Any other draft block keeps its inline quotes and is returned in `needsReview` with the page,
  the block and the reason. The migration writes each one to the deploy log as a warning; an
  editor then picks the testimonials by hand.

Until a block is converted, the site renders its inline quotes, so the deploy order never changes
what a page shows. Once an editor configures the block, the configuration wins.

Outside a migration, run `scripts/convert-testimonials.ts`. It wraps the same step in a
transaction of its own (`runInlineTestimonialConversion`).

## Tests

The config, selection, server, usage and conversion specs (`tests/int/testimonials-*.int.spec.ts`)
run with `pnpm test:int` and need no database.

`tests/int/testimonials-convert-db.int.spec.ts` runs the conversion against a real database and
writes to it, so it is opt-in:

```bash
TESTIMONIALS_DB_TEST=1 DATABASE_URL=postgres://…/a_scratch_copy pnpm test:int tests/int/testimonials-convert-db.int.spec.ts
```

It refuses the shared dev database (`/payload`), limits the conversion to its own fixture page
and deletes what it created afterwards. Without the variable it is skipped.

## Licence

MIT
