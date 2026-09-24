# Block tools: hide blocks, copy blocks to another page

Date: 2026-09-24

## Goal

Editors can:

1. **Hide** any layout block on a page. A hidden block stays in the admin, clearly marked, and keeps all
   its content, but never renders on the website (published pages, draft preview, live preview). Unhiding
   brings it back unchanged. Use cases: a section that is not finished, or one taken offline for a while.
2. **Copy a block to another page**, with all its content, the same way "Duplicate" works on the same page.

## Decisions

- **Hide applies to all languages.** One non-localised checkbox. Hiding one language only is out of scope.
- **Hiding is ordinary content.** It goes through draft → publish like any other edit. No separate state.
- **Copy is server-side** ("Copy to page…" button), not the built-in localStorage Copy/Paste row. The native
  Paste row can only overwrite an existing row and leaves an inconsistent row when the block types differ.
  The native actions stay available.
- **A local plugin**, `src/plugins/blockTools/`, not a `packages/` package. It edits every block config and
  adds an endpoint and admin components in one place; nothing about it is meant for other projects.

## Scope

- Applies to the `layout` blocks field of `pages` (the only blocks field on the site). The plugin takes the
  collection and field as options, so it isn't tied to `pages` in code.
- Lexical blocks inside Posts rich text are out of scope.

## Design

### Plugin

`blockToolsPlugin({ collections: { pages: { field: 'layout' } } })`, registered in `src/plugins/index.ts`
before `unlocalizedCollections`. For the configured blocks field it:

1. Adds a field to **every** block of the field (so new blocks get it automatically):
   `hidden: checkbox`, `defaultValue: false`, not localised. It goes first in the block's fields, in a
   `row` together with the copy button (below), with a short admin description.
2. Sets `admin.components.Label` on every block to the plugin's `BlockRowLabel` (see Admin UI). The plugin
   fails at startup if a block already defines its own `Label` (none do today), so nothing is silently
   overwritten.
3. Adds the `copyToPage` UI field (the button) next to `hidden`.
4. Registers the endpoint `POST /api/<collection>/copy-block`.

Adding `hidden` creates a `hidden` boolean column in every `pages_blocks_*` table (and the version tables).
Dev applies it via schema push; production needs a generated migration (additive, default false).

### Frontend

- `visibleBlocks(blocks)` in `src/plugins/blockTools/visibleBlocks.ts` returns the blocks without
  `hidden === true`. Pure, no React.
- `RenderBlocks` filters once at the top and uses the filtered list everywhere, including the `layout` it
  passes to the testimonials block (its de-duplication must only see blocks that actually render).
  The FAQ JSON-LD is emitted inside the FAQ block's component, so it disappears along with the block.
- `isFirst` means the first *visible* block.
- No other code renders `layout` (checked: `page.tsx` → `RenderBlocks`; llms.txt and sitemaps don't read
  blocks).

### Admin UI

- **Row header**: `BlockRowLabel` (client component) rebuilds the default header from public
  `@payloadcms/ui` exports: the row number, a `Pill` with the block's label, and `SectionTitle` (the
  editable block name). When the row's `hidden` field is true (read live with `useFormFields`) it adds a
  "Ausgeblendet / Hidden" pill, so a hidden block is visible even when the row is collapsed. The block
  label comes from the server-side `Label` props (`blockType`, translated label).
- **Hidden checkbox**: label "Auf der Website ausblenden / Hide on website", description "Bleibt
  gespeichert und kann jederzeit wieder eingeblendet werden. / Stays saved; unhide any time."
- **Copy to page… button** (`copyToPage` UI field): opens a drawer with a page picker (search by title,
  current page excluded) and a Copy button. Disabled with a hint while the document has unsaved changes,
  because the server copies the last saved version. On success a toast shows "Copied to <title>" with a link
  that opens the target page. Errors show as an error toast.

### Endpoint `POST /api/pages/copy-block`

Body: `{ sourceId, blockId, targetId }`.

1. Requires a user with `update` access on the target page (`overrideAccess: false`, `user: req.user`) and
   `read` access on the source page. Otherwise 401/403.
2. Rejects `sourceId === targetId` (use the built-in Duplicate), a missing block (404) or a missing target
   page (404).
3. Builds one mapping from every `id` inside the source block (the block itself and nested array/block rows)
   to a new ObjectId. The same mapping is used for every locale, so rows line up across languages.
4. For each locale, default locale first, inside one transaction (`req` shared):
   - read the source page with `draft: true`, `depth: 0`, `locale`, `fallbackLocale: false`
     (so empty English fields stay empty instead of copying the German text);
   - read the target page the same way;
   - set the target layout to its current layout plus the copied block (IDs replaced from the mapping),
     appended at the end, and `payload.update` with `draft: true`, the same `locale`.
5. Returns `{ targetId, title, blockId: <new id> }`.

The target page gets a new **draft**. Its published version doesn't change until someone publishes. The
copy keeps the source's `hidden` value.

Deterministic: the same source revision always produces the same content on the target. Only the new IDs
differ.

## Error handling

- Endpoint: plain JSON errors with a status code; the transaction rolls back on any failure, so there are
  no half-copied locales.
- Plugin misconfiguration (unknown collection or field, field not `blocks`, block with its own `Label`)
  throws at config build time.

## Testing

Integration (vitest, `tests/int/`):

- `block-tools-config.int.spec.ts`: every block in `pages.layout` has `hidden` and the `Label`; the plugin
  throws on a block with its own Label and on an unknown field.
- `block-tools-visible.int.spec.ts`: `visibleBlocks` filtering; `RenderBlocks` doesn't render a hidden
  block and passes the filtered layout to testimonials; `isFirst` goes to the first visible block.
- `block-tools-copy.int.spec.ts` (against the dev DB, like the other server specs): copy a block with a
  nested array and localised text between two scratch pages. Checks: appended at the end, new IDs, de and
  en both copied, empty en stays empty, source unchanged, target published version unchanged, access
  denied without a user, same page rejected.

E2E (Playwright, `tests/e2e/admin.e2e.spec.ts`): hide a block → pill appears → publish → block gone from
the page; unhide → back. Copy a block to another page → appears at the end of the target's draft.

## Out of scope

- Hiding per language, scheduled hide/show.
- Choosing an insert position on the target page (it always appends; move it afterwards).
- Copying several blocks at once.
- Lexical (rich text) blocks in Posts.
- The testimonials "used on" admin panel still counts hidden blocks as usage (the content is still on the
  page, just not shown). Revisit if that turns out to be confusing.
