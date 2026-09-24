# Composable section blocks

Date: 2026-09-24
Status: approved

## Goal

Page sections are built from small, flat blocks (Heading, Media, Items, Actions, Logo groups, Split)
instead of monolithic blocks that each re-implement the same heading, points grid and action row.
Every block carries background and spacing, and the defaults are tuned so a page built without
overrides has a calm, consistent rhythm (neither sparse nor dense). The structural blocks
`featureStory`, `ctaSection`, `pillars`, `cardGrid`, `steps`, `stats` and `integrations` are migrated
into the new blocks and removed.

## Decisions (from the brainstorm)

- Flat blocks on the page `layout`, no nesting (Payload's usual pattern; nested blocks on Postgres
  cost extra tables and a second admin layer).
- New blocks are defined once in the config `blocks` and referenced by slug (`blockReferences`).
- Heading alignment has three variants: `left` (heading left, lead right), `right` (lead left,
  heading right), `center` (stacked, centred).
- Spacing is set per side: space above and space below, each `auto` by default.
- Old structural blocks are converted and removed; widgets stay.

## Blocks

All new blocks get the shared `settings` group (see Spacing) and, via the block tools plugin, the
`hidden` switch and copy button.

### Heading (`heading`)

| Field | Type | Notes |
|---|---|---|
| `eyebrow` | text, localised | optional |
| `heading` | text, localised | required |
| `lead` | textarea, localised | optional |
| `align` | select `left` / `right` / `center` | default `left` |
| `size` | select `h2` / `display` | default `h2`; `display` replaces the CTA section look |
| `links` | `linkGroup`, max 2, localised | appearances `default` (yellow button), `outline` (secondary button), `link` (text link with arrow) |

Rendering:
- `left`: 12-column grid, heading block (eyebrow + heading) in columns 1–7, lead in 9–12 aligned to
  the heading's baseline area (as in the current stacked FeatureStory); actions under the lead.
- `right`: the mirror: lead + actions in 1–4, heading in 6–12, heading right-aligned.
- Without a lead, `left`/`right` render the heading alone at its side with actions under it.
- `center`: eyebrow, heading, lead, actions stacked and centred.
- Below `lg` every variant stacks: eyebrow, heading, lead, actions, left-aligned (centre stays centred).
- Heading level: `h1` when it is the first visible block on the page, otherwise `h2`.
- Eyebrow, heading and lead go through `withResi()`.

### Media (`media`)

The existing `visual` field (built-in illustration or uploaded image) plus `width`:
`full` (container width, default) or `narrow` (max-w-4xl, centred).

### Items (`items`)

| Field | Type | Notes |
|---|---|---|
| `style` | select `points` / `cards` / `steps` / `stats` | default `points` |
| `columns` | select `auto` / `2` / `3` / `4` | `auto` derives from the row count (4 → 4, else 3; 2 → 2) |
| `divider` | checkbox | rule above the row; default on for `points` |
| `items` | array | fields shown per style (below) |

Row fields by style (`admin.condition` on the parent `style`):
- `points`: icon, title, text. Renders like FeatureStory points (image 1).
- `cards`: icon, title, bullet points (max 5), one link, size `sm` / `lg` (lg spans two columns).
  Renders like the current CardGrid cards; also covers the "pillars" of the Pillars block.
- `steps`: title, text; the number is automatic. Renders like the current Steps block.
- `stats`: value, suffix, label, optional link, count-up animation. Covers Stats and the Pillars tiles.

Title, text, label and points are localised; icon, value, suffix and size are not (as today).

### Actions (`actions`)

`links` (`linkGroup`, 1–2, same appearances as Heading) and `align` `left` / `center` / `right`.
For actions that belong under everything else in a group (bottom of image 1).

### Logo groups (`logoGroups`)

The current Integrations `groups` array unchanged (group title, items with name and logo).

### Split (`split`)

The one composite block, for text beside a scene: heading fields (eyebrow, heading, lead),
`visual`, `mediaSide` `left` / `right`, points (max 4, icon/title/text), links (max 2).
It renders through the same Heading, Media and Items components; no own markup for those parts.

## Spacing and background

`sectionSettings` becomes, for every non-legacy block (new blocks and widgets):

- `background`: `default` / `tinted` / `dark` / `accent` (unchanged)
- `spaceTop`, `spaceBottom`: `auto` / `none` / `tight` / `normal` / `large`, default `auto`
- `anchor` (unchanged)

Scale: `tight` = 2.5rem / md 3rem, `normal` = 5rem / md 7rem (today's default), `large` = 7rem / md 10rem.

The rhythm rule lives in one pure function, `resolveSpacing(blocks)`, used by `RenderBlocks`:

1. A block **starts a group** if it is the first visible block, a `heading`, a `split`, a widget,
   or its background differs from the previous visible block.
2. A block **ends a group** if the next visible block starts one (or there is none).
3. `auto` above = `normal` at a group start, `tight` otherwise.
   `auto` below = `normal` at a group end, `none` otherwise.
4. An explicit value always wins for its side. This is how an editor makes a block the first or
   last element of a group, or glues two groups together.

Consecutive blocks with the same background form one surface: the `tinted` top/bottom border is
drawn only at the group's outer edges.

## Widgets that stay

`hero`, `logoWall`, `featureTabs`, `agentShowcase`, `pricingTeaser`, `pricing`, `faq`,
`testimonials`, `integrationDirectory`, `spotlight`, `document` keep their fields. Changes:

- Their heading renders through the shared Heading component (today's `SectionHeading`, extended),
  so `left` / `right` / `center` look identical everywhere; `sectionHeader` gets the `right` option.
- They get `spaceTop` / `spaceBottom` instead of `spacing` and always start and end their own group.

Legacy starter blocks (`archive`, `content`, `cta`, `formBlock`, `mediaBlock`) and posts are out of scope.

## Migration

A pure converter `splitLegacyBlock(block): NewBlock[]` maps each removed block to blocks at the same
position:

| Old block | New blocks |
|---|---|
| `featureStory` stacked | `heading` (left) → `media` (full) → `items` (points, divider) → `actions` (if links) |
| `featureStory` visual-left/right | `split` (mediaSide from layout) |
| `ctaSection` | `heading` (center, display, links); hidden `note` dropped |
| `pillars` | `heading` → `items` (cards, from pillars) → `items` (stats, from tiles) |
| `cardGrid` | `heading` → `items` (cards, columns from `layout`) |
| `steps` | `heading` (center) → `items` (steps) |
| `stats` | `heading` (only if it has a heading or lead) → `items` (stats) |
| `integrations` | `heading` (center) → `media` (narrow) → `logoGroups` → `actions` (if links) |

Header `align` carries over (`center` stays `center`). Settings: `background` and `hidden` are copied
to every generated block; old `spacing` maps to the first block's `spaceTop` and the last block's
`spaceBottom` (`default` → `auto`, `compact` → `tight`, `none` → `none`); `anchor` goes to the first
block. Generated block ids are derived from the old id plus index, so writing each locale hits the
same rows. All locales (de, en) are preserved.

Scope of conversion: each page's published version and its latest draft, handled separately as in
the testimonials migration. Older entries in the version history are not converted; restoring one
of those after phase 2 loses the removed blocks. (Review point, see below.)

Delivery in two phases, because the dev database uses schema push without a TTY:

1. **Add and convert.** New blocks, new settings fields, shared Heading, `resolveSpacing`. Old blocks
   stay in the config but are removed from the block picker. Migration `…_section_blocks` adds the
   schema and converts data in production; `scripts/convert-sections.ts` does the same for the dev
   database (push skips migration data steps). The seed (`src/endpoints/seed/pages.ts` and home)
   is rewritten to the new blocks.
2. **Remove.** Delete the old block configs and components, and the old `spacing` column. Dev:
   drop the tables and column by hand with SQL before merging. Production: migration
   `…_drop_legacy_section_blocks`.

## Testing

- Unit: `splitLegacyBlock` for every row of the mapping table, including settings, hidden, anchor,
  missing optional parts and both locales; `resolveSpacing` for group starts, background changes,
  hidden blocks and explicit overrides.
- Unit: registry test still finds a renderer for every configured block.
- DB integration on a scratch database (pattern from the testimonials package): run the conversion on
  a copy of the dev data; published and draft layouts come out as expected; running it twice is a no-op.
- Visual: screenshots of home and every subpage (desktop and mobile) before and after conversion;
  they should match apart from intended spacing changes. Check heading `left` / `right` / `center`.
- e2e: block tools hide and copy work on the new blocks.

## Version history (decided)

Older version-history entries are not converted; restoring a pre-migration version drops the
removed blocks. Accepted on review (2026-09-24) in favour of a fast migration with short locks.
