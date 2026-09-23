# @subneo/payload-testimonials

Central testimonials for Payload CMS and Next.js (App Router). Each quote is written once, in a
`testimonials` collection with drafts and tags. Page sections then reference quotes instead of
copying them: an editor picks them by hand, or lets the block choose by tag. The sidebar of every
testimonial lists the pages that show it, so you can see what a change touches before you make it.

## What it does

- Adds two collections: `testimonials` (quote, name, role, company, photo, logo, link, tags,
  internal note; drafts on) and `testimonial-tags`.
- Exports a page block that stores which testimonials a section shows, never the quotes
  themselves.
- Resolves a block to testimonials at render time with one cached query per locale.
- Admin: a live preview of the automatic pick with a reshuffle button, and a "Shown on" panel on
  each testimonial.

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
resolves every testimonials block on the page in order, and an automatic block's own picks skip
what an earlier block already shows. Pinned testimonials are the exception: pinning means "always
show", so a pinned quote appears even if an earlier block shows it too. Without `layout` and
`blockIndex` each block is resolved on its own and two sections can show the same quote.

`draft: true` (site draft mode, live preview) reads drafts and bypasses the cache. The function
never throws: a failed query is logged and the block renders nothing.

## Selection rules

**Manual.** The hand-picked testimonials in the stored order. Unpublished and deleted ones are
skipped.

**Automatic.** From every published testimonial:

1. drop the ones in "Never show" (`exclude`);
2. keep the ones with the chosen tags, matching any tag or all of them (`tagMatch`). No tags means
   no filter;
3. put the pinned ones first, in their stored order;
4. fill up to `count` (1 to 6, default 3) by rendezvous hashing of the block's `seed` against each
   testimonial id.

The hash makes the pick stable. The same seed gives the same testimonials on every render, and
adding one testimonial changes at most one slot per page. The seed is a random string set when the
block is created; the preview's reshuffle button draws a new one.

The same pure functions (`selectTestimonials`, and `selectForLayout` for a whole page) run on the
site, in the admin preview and in the usage panel, so all three agree. The preview works on the
unsaved form: it sends the page's blocks up to and including the one being edited, so it already
accounts for what the earlier blocks show before anything is saved.

## Caching

Outside draft mode the pool of testimonials is cached with `unstable_cache` under the tag
`testimonials` (see `cacheTag`). Saving or deleting a testimonial or a tag calls
`revalidateTag`, and pages pick up the change on the next request. Nothing else expires the
cache.

Seeds, scripts and migrations pass `context: { disableRevalidate: true }` to skip the
revalidation. Outside a Next request `revalidateTag` throws; the hook catches that, so a CLI write
never fails on it.

## Admin

- **Block preview.** In automatic mode the block shows which testimonials it would show right
  now, computed from the unsaved form values of the page up to this block, how many match its
  filter, and a button for a new seed.
- **Shown on.** The testimonial sidebar lists the published pages whose blocks show it, and the
  ones that reference it but currently do not show it. Configure where it looks with `usage`.
- **Internal note.** Readable only by logged-in users, never through the public API.

The admin components are registered by import-map path. If your import map resolves the package
under another name, set `componentPaths`.

Endpoints, both for logged-in users only:

- `GET /api/testimonials/:id/usage` feeds the "Shown on" panel;
- `POST /api/testimonials/preview` feeds the block preview. The body is
  `{ layout, blockIndex, locale }` (the page's blocks up to and including this one, and its index);
  a bare `{ block, locale }` previews the block on its own. An unknown locale falls back to the
  request's.

Anonymous readers of the collection (REST, GraphQL) get published testimonials only. Logged-in
users see everything.

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
| `componentPaths` | `@subneo/payload-testimonials/admin#…` | Import-map paths of `usagePanel` and `selectionPreview`. |
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
- Each block switches to manual mode, references those testimonials in the same order and gets
  its id as `seed` if it had none.
- The inline rows are kept, so the migration can be reversed: its `down` drops the testimonials
  and the block references, and the pages render their inline quotes again, as does the previous
  image. A later schema cleanup removes the rows and the hidden `items` field.
- Published pages stay published and do not pick up pending draft edits.
- A page with a pending draft keeps it. The draft is saved again on top of the new published
  version, as a draft. Its block is converted only when it holds the same people in the same
  order as the published one.
- Any other draft block keeps its inline quotes and is returned in `needsReview` with the page,
  the block and the reason. The migration writes each one to the deploy log as a warning; an
  editor then picks the testimonials by hand.
- A block with no inline quote and no tags or pins showed nothing before. The new columns would
  make it an automatic block with three picks, so it becomes a manual block with no testimonials
  and its id as seed, in the published page and in a pending draft alike. The result counts them
  in `emptyBlocks` and `emptyDraftBlocks`.
- A database with neither inline quotes nor blocks from before the migration (a fresh install)
  skips the step.

The site renders a block's inline quotes only while the block is still unconverted: no
references, tags or pinned picks, and no seed. Rows saved before the switch never got a seed,
while converted blocks, new blocks and blocks reshuffled in the preview always have one. So the
deploy order never changes what a page shows, and the kept inline rows cannot take over again
once an editor has chosen something else.

Outside a migration, run `scripts/convert-testimonials.ts`. It wraps the same step in a
transaction of its own (`runInlineTestimonialConversion`).

## Tests

The config, selection, preview, server, usage and conversion specs (`tests/int/testimonials-*.int.spec.ts`)
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
