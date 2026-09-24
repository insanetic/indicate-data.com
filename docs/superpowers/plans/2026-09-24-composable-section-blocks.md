# Composable Section Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the seven structural page blocks with flat, composable blocks (Heading, Media, Items, Actions, Integration tree, Split) whose spacing is resolved automatically per group, and migrate all existing content.

**Architecture:** New blocks live under `src/blocks/<Name>/` like the existing ones and are registered inline on the Pages `layout` field. A pure function `resolveSpacing` (in `src/sections/rhythm.ts`) decides each block's top and bottom gap from its neighbours; `RenderBlocks` passes the result to `<Section>`. A pure converter (`src/sections/legacy.ts`) turns each old block into its sequence of new blocks; a runner (`src/sections/convertPages.ts`) applies it to published and draft pages per locale, used by the phase 1 migration, a dev script and the seed. Phase 2 (a separate deploy) deletes the old blocks.

**Tech Stack:** Payload 3.90.1 (Postgres adapter), Next.js 16.3.5, React, Tailwind, Vitest (jsdom), Playwright.

**Spec:** `docs/superpowers/specs/2026-09-24-composable-section-blocks-design.md` (read the "Amendments from planning" section first; it overrides the rest).

## Global Constraints

- Payload `3.90.1`, Postgres; Postgres identifiers must stay ≤ 63 characters (why the gap fields are `gapTop` / `gapBottom`).
- Dev database uses schema push without a TTY: every schema change in phase 1 must be additive (new tables, new columns, new enum values, dropped NOT NULL). No column or table is removed before phase 2.
- Every admin label is `{ de, en }`; content fields a marketer writes are `localized: true`; `value`, `suffix`, `icon`, `size` and integration item `name` stay non-localised (as today).
- Eyebrow, heading, lead, titles and texts render through `withResi()`; never add "Resi" styling any other way.
- Tailwind classes must appear as complete literal strings (no string building like `` `pt-${x}` ``).
- Host-side Payload commands use `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload` (NODE_ENV=production skips the dev push).
- `psql` is not installed on the host; use `docker exec indicate-datacomdemo-postgres-1 psql -U payload -d <db> ...`.
- Other Claude sessions share this checkout: stage only the files a task names (`git add <paths>`), never `git add -A` or `git commit -a`.
- Legacy starter blocks (`archive`, `content`, `cta`, `formBlock`, `mediaBlock`) and posts are out of scope.
- Phase 1 (Tasks 1–12) and phase 2 (Task 13) ship as two separate production deploys.

## Review Focus

1. **A widget below a Heading block** (FAQ, pricing teaser) with its own heading left empty should sit tight under the heading, not a full section gap away. Covered in Task 2 tests.
2. **Pages with a pending draft** must keep the draft's edits and stay published with the published content after conversion. Covered by the DB test in Task 10.
3. **English content** must survive conversion (block ids stable across locale passes). Covered in Task 9 (ids) and Task 10 (DB, both locales).
4. **The `right` heading variant on phones** should stack like `left` (heading, then lead), never right-aligned or with the lead above. Covered in Task 3 and Task 4 tests.
5. **An integrations block with an uploaded image** must still show only the image, and keep its groups. Covered in Task 9 tests.

---

## File map

Create:
- `scripts/screenshot-pages.ts`: full-page screenshots of every seeded page (before/after comparison).
- `src/sections/rhythm.ts`: `resolveSpacing`, group rules, gap types.
- `src/sections/legacy.ts`: legacy block types, `splitLegacyBlock`, `splitLegacyLayout`, `convertWidgetSpacing`, `needsSectionConversion`.
- `src/sections/convertPages.ts`: `convertSectionBlocks`, `runSectionConversion` (published/draft, per locale, in a transaction).
- `scripts/convert-sections.ts`: dev database conversion.
- `src/components/ActionRow/index.tsx`: the row of 0–2 buttons/links shared by Heading, Split and Actions.
- `src/blocks/Heading/{config.ts,Component.tsx}`
- `src/blocks/MediaSection/{config.ts,Component.tsx}`
- `src/blocks/Actions/{config.ts,Component.tsx}`
- `src/blocks/Items/{config.ts,Component.tsx,columns.ts,Points.tsx,Cards.tsx,Steps.tsx,Stats.tsx,RowLabel.tsx}`
- `src/blocks/IntegrationTree/{config.ts,Component.tsx,RowLabel.tsx}`
- `src/blocks/Split/{config.ts,Component.tsx}`
- Tests: `tests/int/sections-rhythm.int.spec.ts`, `tests/int/sections-heading.int.spec.tsx`, `tests/int/sections-items.int.spec.tsx`, `tests/int/sections-legacy.int.spec.ts`, `tests/int/sections-convert-db.int.spec.ts`, `tests/e2e/sections.e2e.spec.ts`
- Migrations: `src/migrations/<stamp>_section_blocks.{ts,json}` (phase 1), `src/migrations/<stamp>_drop_legacy_section_blocks.{ts,json}` (phase 2)

Modify:
- `src/fields/sectionSettings.ts`, `src/fields/sectionHeader.ts`, `src/components/Section/index.tsx`, `src/components/SectionHeading/index.tsx`, `src/blocks/RenderBlocks.tsx`, `src/blocks/registry.ts`, `src/collections/Pages/index.ts`, `tests/int/blocks.int.spec.ts`
- Widget configs (headings optional): `src/blocks/{FeatureTabs,AgentShowcase,PricingTeaser,Faq,IntegrationDirectory}/config.ts`
- Seed: `src/endpoints/seed/{index.ts,pages.ts,content.ts,about.ts}`
- Generated: `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`

Delete (phase 2): `src/blocks/{FeatureStory,CtaSection,Pillars,CardGrid,Steps,Stats,Integrations}/`

---

## Phase 1

### Task 1: Baseline screenshots

Before anything changes, capture every page so later tasks can compare.

**Files:**
- Create: `scripts/screenshot-pages.ts`

**Interfaces:**
- Produces: `pnpm exec tsx scripts/screenshot-pages.ts <out-dir> [base-url]` writes `<out-dir>/<locale>-<slug>-<desktop|mobile>.png`.

- [ ] **Step 1: Write the script**

```ts
/**
 * Full-page screenshots of the seeded pages, desktop and mobile, for before/after comparisons:
 *   pnpm exec tsx scripts/screenshot-pages.ts <out-dir> [base-url]
 * Needs the site running (default http://localhost:3000). Reveal animations are forced visible.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import { presetConsent } from '../tests/helpers/consent'

const [outDir, base = 'http://localhost:3000'] = process.argv.slice(2)
if (!outDir) throw new Error('usage: tsx scripts/screenshot-pages.ts <out-dir> [base-url]')

const slugs = ['', 'about', 'pricing', 'contact', 'agent', 'mcp', 'build-with-ai', 'integrations', 'kpi-studio', 'governance', 'dashboards', 'flying-kpis', 'hotels', 'hotel-groups', 'agencies']
const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } }

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
for (const [name, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport })
  await presetConsent(context)
  const page = await context.newPage()
  for (const locale of ['de', 'en']) {
    for (const slug of slugs) {
      await page.goto(`${base}/${locale}/${slug}`, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.querySelectorAll('.reveal, .reveal-stagger > *').forEach((el) => el.setAttribute('data-in', '')))
      await page.waitForTimeout(300)
      await page.screenshot({ path: path.join(outDir, `${locale}-${slug || 'home'}-${name}.png`), fullPage: true })
    }
  }
  await context.close()
}
await browser.close()
```

- [ ] **Step 2: Take the baseline**

The dev app must be running (`docker compose up -d`).

Run: `pnpm exec tsx scripts/screenshot-pages.ts /tmp/sections-before`
Expected: 60 PNG files in `/tmp/sections-before` (15 slugs × 2 locales × 2 viewports). Keep them until Task 12.

- [ ] **Step 3: Commit**

```bash
git add scripts/screenshot-pages.ts
git commit -m "Script: full-page screenshots of all seeded pages"
```

---

### Task 2: Rhythm (group spacing)

**Files:**
- Create: `src/sections/rhythm.ts`
- Test: `tests/int/sections-rhythm.int.spec.ts`

**Interfaces:**
- Produces:
  - `type Gap = 'auto' | 'none' | 'tight' | 'normal' | 'large'`, `type ResolvedGap = Exclude<Gap, 'auto'>`, `type Background = 'default' | 'tinted' | 'dark' | 'accent'`
  - `type RhythmBlock = { blockType: string; header?: { heading?: string | null } | null; settings?: { background?: Background | null; gapTop?: Gap | null; gapBottom?: Gap | null } | null }`
  - `type Rhythm = { top: ResolvedGap; bottom: ResolvedGap; groupStart: boolean; groupEnd: boolean }`
  - `partSlugs = ['media', 'items', 'actions', 'integrationTree']`, `leaderSlugs = ['heading', 'split']`
  - `startsGroup(block: RhythmBlock, prev: RhythmBlock | undefined): boolean`
  - `resolveSpacing(blocks: RhythmBlock[]): Rhythm[]`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'

import { resolveSpacing, type RhythmBlock } from '@/sections/rhythm'

const b = (blockType: string, extra: Partial<RhythmBlock> = {}): RhythmBlock => ({ blockType, ...extra })
const tops = (blocks: RhythmBlock[]) => resolveSpacing(blocks).map((r) => r.top)
const bottoms = (blocks: RhythmBlock[]) => resolveSpacing(blocks).map((r) => r.bottom)

describe('resolveSpacing', () => {
  it('gives a lone block the full gap on both sides', () => {
    expect(resolveSpacing([b('heading')])).toEqual([{ top: 'normal', bottom: 'normal', groupStart: true, groupEnd: true }])
  })

  it('keeps heading, media, items and actions together as one group', () => {
    const page = [b('heading'), b('media'), b('items'), b('actions')]
    expect(tops(page)).toEqual(['normal', 'tight', 'tight', 'tight'])
    expect(bottoms(page)).toEqual(['none', 'none', 'none', 'normal'])
    expect(resolveSpacing(page).map((r) => [r.groupStart, r.groupEnd])).toEqual([[true, false], [false, false], [false, false], [false, true]])
  })

  it('starts a new group at every heading or split', () => {
    const page = [b('heading'), b('items'), b('split'), b('heading'), b('media')]
    expect(tops(page)).toEqual(['normal', 'tight', 'normal', 'normal', 'tight'])
    expect(bottoms(page)).toEqual(['none', 'normal', 'normal', 'none', 'normal'])
  })

  it('starts a new group when the background changes', () => {
    const page = [b('heading'), b('items', { settings: { background: 'tinted' } })]
    expect(tops(page)).toEqual(['normal', 'normal'])
    expect(bottoms(page)).toEqual(['normal', 'normal'])
  })

  it('lets an explicit gap win for its side only', () => {
    const page = [b('heading', { settings: { gapBottom: 'large' } }), b('media', { settings: { gapTop: 'none' } }), b('items')]
    expect(tops(page)).toEqual(['normal', 'none', 'tight'])
    expect(bottoms(page)).toEqual(['large', 'none', 'normal'])
  })

  it('treats "auto" like an unset gap', () => {
    expect(tops([b('heading'), b('media', { settings: { gapTop: 'auto' } })])).toEqual(['normal', 'tight'])
  })

  it('lets a widget without its own heading continue a heading group', () => {
    const page = [b('heading'), b('faq', { header: { heading: null } })]
    expect(tops(page)).toEqual(['normal', 'tight'])
  })

  it('starts a group at a widget with its own heading', () => {
    expect(tops([b('heading'), b('faq', { header: { heading: 'FAQ' } })])).toEqual(['normal', 'normal'])
  })

  it('starts a group at a widget without heading when the block above is a widget', () => {
    expect(tops([b('hero', { header: { heading: 'Hi' } }), b('logoWall')])).toEqual(['normal', 'normal'])
  })

  it('lets parts continue a widget', () => {
    expect(tops([b('faq', { header: { heading: 'FAQ' } }), b('actions')])).toEqual(['normal', 'tight'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-rhythm.int.spec.ts`
Expected: FAIL, cannot resolve `@/sections/rhythm`.

- [ ] **Step 3: Write the implementation**

`src/sections/rhythm.ts`:

```ts
/**
 * Vertical rhythm of a page built from flat blocks. Consecutive blocks that belong together form
 * a group: the group gets the full section gap at its outer edges and a tight gap between its
 * blocks. An explicit gap on a block always wins for that side, which is how an editor marks a
 * block as the first or last of a group.
 */
export type Gap = 'auto' | 'none' | 'tight' | 'normal' | 'large'
export type ResolvedGap = Exclude<Gap, 'auto'>
export type Background = 'default' | 'tinted' | 'dark' | 'accent'

export type RhythmBlock = {
  blockType: string
  header?: { heading?: string | null } | null
  settings?: { background?: Background | null; gapTop?: Gap | null; gapBottom?: Gap | null } | null
}

export type Rhythm = { top: ResolvedGap; bottom: ResolvedGap; groupStart: boolean; groupEnd: boolean }

/** Blocks that never open a group: they continue the block above them. */
export const partSlugs = ['media', 'items', 'actions', 'integrationTree'] as const
/** Blocks that always open a group. */
export const leaderSlugs = ['heading', 'split'] as const

const isPart = (b: RhythmBlock) => (partSlugs as readonly string[]).includes(b.blockType)
const isLeader = (b: RhythmBlock) => (leaderSlugs as readonly string[]).includes(b.blockType)
const background = (b: RhythmBlock): Background => b.settings?.background || 'default'

/**
 * A block opens a group when it is the first, changes the background, is a heading or split, or
 * is a widget with its own heading. A widget without a heading continues a group that a heading,
 * split or part started (a Heading block above an FAQ); after another widget it opens its own.
 */
export const startsGroup = (block: RhythmBlock, prev: RhythmBlock | undefined): boolean => {
  if (!prev) return true
  if (background(block) !== background(prev)) return true
  if (isLeader(block)) return true
  if (isPart(block)) return false
  if (block.header?.heading) return true
  return !(isLeader(prev) || isPart(prev))
}

/** Gaps for the visible blocks of a page, in order. Hidden blocks must be filtered out first. */
export const resolveSpacing = (blocks: RhythmBlock[]): Rhythm[] => {
  const starts = blocks.map((b, i) => startsGroup(b, blocks[i - 1]))
  return blocks.map((b, i) => {
    const groupStart = starts[i]
    const groupEnd = i === blocks.length - 1 || starts[i + 1]
    const top = b.settings?.gapTop
    const bottom = b.settings?.gapBottom
    return {
      top: top && top !== 'auto' ? top : groupStart ? 'normal' : 'tight',
      bottom: bottom && bottom !== 'auto' ? bottom : groupEnd ? 'normal' : 'none',
      groupStart,
      groupEnd,
    }
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-rhythm.int.spec.ts`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add src/sections/rhythm.ts tests/int/sections-rhythm.int.spec.ts
git commit -m "Sections: resolveSpacing groups flat blocks into sections"
```

---

### Task 3: Gap settings, Section, right-aligned headings, optional widget headings

**Files:**
- Modify: `src/fields/sectionSettings.ts`, `src/fields/sectionHeader.ts`, `src/components/Section/index.tsx`, `src/components/SectionHeading/index.tsx`, `src/blocks/RenderBlocks.tsx`
- Modify (heading optional): `src/blocks/FeatureTabs/config.ts:17`, `src/blocks/AgentShowcase/config.ts:16`, `src/blocks/PricingTeaser/config.ts:15`, `src/blocks/Faq/config.ts:19`, `src/blocks/IntegrationDirectory/config.ts:20`
- Test: `tests/int/sections-heading.int.spec.tsx` (created here, extended in Task 4)

**Interfaces:**
- Consumes: `resolveSpacing`, `RhythmBlock`, `ResolvedGap` (Task 2).
- Produces:
  - `sectionSettings()` group `settings` with `background`, `gapTop`, `gapBottom`, `anchor`, and the hidden legacy `spacing`.
  - `sectionHeader({ optionalHeading?, withAlign?, overrides? })`: align options `left` / `center` / `right`; `withAlign: false` omits the align field.
  - `<Section background top bottom groupStart groupEnd id className as>`; `top`/`bottom` are `ResolvedGap`.
  - `<SectionHeading align="right">` renders left-aligned below `lg`, right-aligned from `lg`.

- [ ] **Step 1: Write the failing test**

`tests/int/sections-heading.int.spec.tsx`:

```tsx
import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { SectionHeading } from '@/components/SectionHeading'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

afterEach(cleanup)

const subFieldNames = (field: unknown) => ((field as { fields: unknown[] }).fields as { name?: string; type: string; fields?: { name?: string }[] }[]).flatMap((f) => (f.type === 'row' ? (f.fields || []).map((x) => x.name) : [f.name]))

describe('SectionHeading', () => {
  it('right-aligns only from lg, so phones read it like left', () => {
    const { container } = render(<SectionHeading header={{ heading: 'Rechts', align: 'right' }} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('items-start')
    expect(root.className).toContain('lg:items-end')
    expect(root.className).toContain('lg:text-right')
  })
})

describe('section fields', () => {
  it('sectionSettings offers background, both gaps, anchor and keeps the old spacing hidden', () => {
    const settings = sectionSettings() as { fields: { type: string; name?: string; admin?: { hidden?: boolean } }[] }
    expect(subFieldNames(settings)).toEqual(['background', 'gapTop', 'gapBottom', 'anchor', 'spacing'])
    expect(settings.fields.find((f) => f.name === 'spacing')?.admin?.hidden).toBe(true)
  })

  it('sectionHeader offers left, centre and right, and can drop the align field', () => {
    const header = sectionHeader() as { fields: { name: string; options?: { value: string }[] }[] }
    expect(header.fields.find((f) => f.name === 'align')?.options?.map((o) => o.value)).toEqual(['left', 'center', 'right'])
    expect(subFieldNames(sectionHeader({ withAlign: false }))).toEqual(['eyebrow', 'heading', 'lead'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-heading.int.spec.tsx`
Expected: FAIL (no `lg:items-end`, field lists differ).

- [ ] **Step 3: Update `src/fields/sectionSettings.ts`**

Replace the whole file:

```ts
import type { Field, GroupField, SelectField, TextFieldSingleValidation } from 'payload'

import deepMerge from '@/utilities/deepMerge'

type Options = {
  defaultBackground?: 'default' | 'tinted' | 'dark' | 'accent'
  overrides?: Partial<GroupField>
}

const gapOptions: SelectField['options'] = [
  { label: { de: 'Automatisch', en: 'Automatic' }, value: 'auto' },
  { label: { de: 'Keiner', en: 'None' }, value: 'none' },
  { label: { de: 'Eng', en: 'Tight' }, value: 'tight' },
  { label: { de: 'Normal', en: 'Normal' }, value: 'normal' },
  { label: { de: 'Groß', en: 'Large' }, value: 'large' },
]

const gapDescription = {
  de: 'Automatisch: voller Abstand, wo ein Abschnitt beginnt oder endet, eng innerhalb.',
  en: 'Automatic: full space where a section starts or ends, tight inside one.',
}

/**
 * Background, space above and below, and anchor for a block. Rendered by `<Section>`; `auto`
 * gaps are resolved from the neighbouring blocks by `resolveSpacing`.
 */
export const sectionSettings = ({ defaultBackground = 'default', overrides = {} }: Options = {}): Field => {
  const field: GroupField = {
    name: 'settings',
    type: 'group',
    label: { de: 'Abschnitt', en: 'Section' },
    admin: { hideGutter: true },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'background',
            type: 'select',
            defaultValue: defaultBackground,
            label: { de: 'Hintergrund', en: 'Background' },
            admin: { width: '25%' },
            options: [
              { label: { de: 'Standard (dunkel)', en: 'Default (dark)' }, value: 'default' },
              { label: { de: 'Leicht abgehoben', en: 'Slightly raised' }, value: 'tinted' },
              { label: { de: 'Tiefer dunkel', en: 'Deeper dark' }, value: 'dark' },
              { label: { de: 'Gelb (Akzent)', en: 'Yellow (accent)' }, value: 'accent' },
            ],
          },
          {
            name: 'gapTop',
            type: 'select',
            defaultValue: 'auto',
            label: { de: 'Abstand oben', en: 'Space above' },
            admin: { width: '25%', description: gapDescription },
            options: gapOptions,
          },
          {
            name: 'gapBottom',
            type: 'select',
            defaultValue: 'auto',
            label: { de: 'Abstand unten', en: 'Space below' },
            admin: { width: '25%', description: gapDescription },
            options: gapOptions,
          },
          {
            name: 'anchor',
            type: 'text',
            label: { de: 'Anker (für Links wie #produkt)', en: 'Anchor (for links like #product)' },
            admin: { width: '25%' },
            validate: ((value) =>
              !value || /^[a-z0-9-]+$/.test(String(value))
                ? true
                : 'Nur Kleinbuchstaben, Zahlen und Bindestriche / lowercase letters, digits and hyphens only') as TextFieldSingleValidation,
          },
        ],
      },
      {
        // Replaced by gapTop / gapBottom; the section conversion moves its values over. Kept
        // hidden so the dev schema push never drops a populated column; phase 2 removes it.
        name: 'spacing',
        type: 'select',
        defaultValue: 'default',
        admin: { hidden: true },
        options: [
          { label: { de: 'Normal', en: 'Default' }, value: 'default' },
          { label: { de: 'Kompakt', en: 'Compact' }, value: 'compact' },
          { label: { de: 'Ohne', en: 'None' }, value: 'none' },
        ],
      },
    ],
  }
  return deepMerge(field, overrides)
}
```

- [ ] **Step 4: Update `src/fields/sectionHeader.ts`**

Change the options type and the align field:

```ts
type Options = {
  /** Make the heading optional (for blocks that can stand without a title). */
  optionalHeading?: boolean
  /** Leave out the align field (for blocks whose layout fixes the alignment). */
  withAlign?: boolean
  overrides?: Partial<GroupField>
}
```

Change the signature to `({ optionalHeading = false, withAlign = true, overrides = {} }: Options = {})`, and replace the `align` field object in `fields` with a conditional spread:

```ts
      ...(withAlign
        ? [
            {
              name: 'align',
              type: 'select',
              defaultValue: 'left',
              label: { de: 'Ausrichtung', en: 'Alignment' },
              options: [
                { label: { de: 'Links', en: 'Left' }, value: 'left' },
                { label: { de: 'Zentriert', en: 'Centred' }, value: 'center' },
                { label: { de: 'Rechts', en: 'Right' }, value: 'right' },
              ],
            } satisfies Field,
          ]
        : []),
```

- [ ] **Step 5: Update `src/components/SectionHeading/index.tsx`**

In `HeaderData` and `Props`, widen `align` to `'left' | 'center' | 'right'`. Replace the alignment class expression:

```tsx
        alignment === 'center'
          ? 'items-center text-center'
          : alignment === 'right'
            ? 'items-start lg:items-end lg:text-right'
            : 'items-start',
```

- [ ] **Step 6: Replace `src/components/Section/index.tsx`**

```tsx
import React from 'react'

import type { ResolvedGap } from '@/sections/rhythm'
import { cn } from '@/utilities/ui'

export type SectionBackground = 'default' | 'tinted' | 'dark' | 'accent'

type Props = {
  as?: 'section' | 'div' | 'header' | 'footer'
  background?: SectionBackground | null
  top?: ResolvedGap
  bottom?: ResolvedGap
  /** First / last block of its group: only there does a tinted band draw its hairline. */
  groupStart?: boolean
  groupEnd?: boolean
  id?: string | null
  className?: string
  children: React.ReactNode
}

const backgrounds: Record<SectionBackground, string> = {
  default: 'bg-surface text-ink',
  tinted: 'bg-surface-2 text-ink border-line',
  dark: 'bg-surface text-ink',
  accent: 'bg-surface text-ink',
}

const tops: Record<ResolvedGap, string> = {
  none: '',
  tight: 'pt-10 md:pt-12',
  normal: 'pt-20 md:pt-28',
  large: 'pt-28 md:pt-40',
}

const bottoms: Record<ResolvedGap, string> = {
  none: '',
  tight: 'pb-10 md:pb-12',
  normal: 'pb-20 md:pb-28',
  large: 'pb-28 md:pb-40',
}

/** Wraps every marketing block: background, vertical gaps, anchor id and token remap. */
export const Section: React.FC<Props> = ({
  as: Tag = 'section',
  background,
  top = 'normal',
  bottom = 'normal',
  groupStart = true,
  groupEnd = true,
  id,
  className,
  children,
}) => {
  const bg = background || 'default'
  const theme = bg === 'accent' ? 'accent' : bg === 'dark' ? 'dark' : undefined
  return (
    <Tag
      id={id || undefined}
      data-theme={theme}
      data-group-start={groupStart || undefined}
      className={cn(
        'relative overflow-x-clip',
        backgrounds[bg],
        bg === 'tinted' && groupStart && 'border-t',
        bg === 'tinted' && groupEnd && 'border-b',
        tops[top],
        bottoms[bottom],
        className,
      )}
    >
      {children}
    </Tag>
  )
}
```

- [ ] **Step 7: Wire `resolveSpacing` into `src/blocks/RenderBlocks.tsx`**

Add the import `import { resolveSpacing, type RhythmBlock } from '@/sections/rhythm'`. Replace the `Settings` type:

```ts
type Settings = {
  background?: 'default' | 'tinted' | 'dark' | 'accent' | null
  anchor?: string | null
}
```

After `if (blocks.length === 0) return null` add:

```ts
  const rhythm = resolveSpacing(blocks as unknown as RhythmBlock[])
```

and replace the `<Section ...>` opening tag with:

```tsx
          <Section
            background={settings?.background}
            bottom={rhythm[index].bottom}
            groupEnd={rhythm[index].groupEnd}
            groupStart={rhythm[index].groupStart}
            id={settings?.anchor}
            key={block.id || index}
            top={rhythm[index].top}
          >
```

- [ ] **Step 8: Make widget headings optional**

In each of `src/blocks/FeatureTabs/config.ts`, `src/blocks/AgentShowcase/config.ts`, `src/blocks/PricingTeaser/config.ts`, `src/blocks/Faq/config.ts`, `src/blocks/IntegrationDirectory/config.ts`, replace `sectionHeader(),` with `sectionHeader({ optionalHeading: true }),`.

- [ ] **Step 9: Regenerate types and check**

Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:types`
Then: `pnpm exec tsc --noEmit`
Expected: no errors. If a widget component now fails on `header.heading` being optional, guard it with `header?.heading &&` like `src/blocks/LogoWall/Component.tsx:38`.

- [ ] **Step 10: Run tests**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-heading.int.spec.tsx tests/int/sections-rhythm.int.spec.ts tests/int/blocks.int.spec.ts`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add src/fields/sectionSettings.ts src/fields/sectionHeader.ts src/components/Section/index.tsx src/components/SectionHeading/index.tsx src/blocks/RenderBlocks.tsx src/blocks/FeatureTabs/config.ts src/blocks/AgentShowcase/config.ts src/blocks/PricingTeaser/config.ts src/blocks/Faq/config.ts src/blocks/IntegrationDirectory/config.ts src/payload-types.ts tests/int/sections-heading.int.spec.tsx
git commit -m "Sections: gap settings with automatic group rhythm, right-aligned headings, optional widget headings"
```

---

### Task 4: ActionRow and the Heading block

**Files:**
- Create: `src/components/ActionRow/index.tsx`, `src/blocks/Heading/config.ts`, `src/blocks/Heading/Component.tsx`
- Modify: `src/collections/Pages/index.ts` (imports; `blocks` list after `Hero`), `src/blocks/registry.ts`, `src/blocks/RenderBlocks.tsx`
- Test: `tests/int/sections-heading.int.spec.tsx`

**Interfaces:**
- Consumes: `sectionHeader`, `sectionSettings`, `SectionHeading` (Task 3).
- Produces:
  - `ActionRow: React.FC<{ links?: ActionLink[] | null; align?: 'left' | 'center' | 'right'; size?: 'lg'; track?: string; className?: string }>` (returns `null` without usable links).
  - `type ActionLink = { link: { type?; newTab?; reference?; url?; label?: string | null; appearance?: 'default' | 'outline' | 'ghost' | 'link' | null }; id?: string | null }`
  - Block `heading` (`HeadingBlock`): `header { eyebrow, heading?, lead, align }`, `size: 'h2' | 'display'`, `links` (max 2), `settings`.
  - `HeadingBlock` component with `isFirst?: boolean`; root carries `data-align`.

- [ ] **Step 1: Add failing tests to `tests/int/sections-heading.int.spec.tsx`**

Add imports at the top:

```tsx
import { screen, within } from '@testing-library/react'

import { HeadingBlock } from '@/blocks/Heading/Component'
import { ActionRow } from '@/components/ActionRow'
import { LocaleProvider } from '@/providers/Locale'
```

and append:

```tsx
const inLocale = (ui: React.ReactElement) => render(<LocaleProvider locale="de">{ui}</LocaleProvider>)
const link = (label: string, appearance: 'default' | 'outline' | 'link') => ({ link: { type: 'custom' as const, url: '/x', label, appearance } })

describe('ActionRow', () => {
  it('renders nothing without links', () => {
    const { container } = inLocale(<ActionRow links={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('maps appearances to button variants and aligns the row', () => {
    const { container } = inLocale(<ActionRow align="center" links={[link('Demo', 'default'), link('Mehr', 'outline')]} />)
    const row = container.firstElementChild as HTMLElement
    expect(row.className).toContain('justify-center')
    expect(screen.getByRole('link', { name: 'Mehr' }).className).toContain('border-line-strong')
  })
})

describe('HeadingBlock', () => {
  const header = { eyebrow: 'Für Hotels', heading: 'Strategie auf Zahlen', lead: 'Welche Kanäle bringen Umsatz?', align: 'left' as const }

  it('renders nothing without heading and lead', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ eyebrow: 'x' }} />)
    expect(container.innerHTML).toBe('')
  })

  it('is an h1 on the first block, else an h2', () => {
    inLocale(<HeadingBlock blockType="heading" header={header} isFirst />)
    expect(screen.getByRole('heading', { level: 1, name: 'Strategie auf Zahlen' })).toBeTruthy()
    cleanup()
    inLocale(<HeadingBlock blockType="heading" header={header} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Strategie auf Zahlen' })).toBeTruthy()
  })

  it('left: heading in the wide column, lead and actions in the narrow one', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={header} links={[link('Demo', 'default')]} />)
    const side = container.querySelector('[data-part="side"]') as HTMLElement
    expect(side.className).toContain('lg:col-span-4')
    expect(side.className).not.toContain('lg:col-start-1')
    expect(within(side).getByText('Welche Kanäle bringen Umsatz?')).toBeTruthy()
    expect(within(side).getByRole('link', { name: 'Demo' })).toBeTruthy()
  })

  it('right: lead in the first columns, heading from column 5, on one row', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ ...header, align: 'right' }} />)
    expect((container.querySelector('[data-part="side"]') as HTMLElement).className).toContain('lg:col-start-1')
    expect((container.querySelector('[data-part="title"]') as HTMLElement).className).toContain('lg:col-start-5')
    expect(container.querySelector('[data-align="right"]')).toBeTruthy()
  })

  it('right: the heading comes first in the markup, so phones stack heading then lead', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ ...header, align: 'right' }} />)
    const parts = [...container.querySelectorAll('[data-part]')].map((el) => el.getAttribute('data-part'))
    expect(parts).toEqual(['title', 'side'])
  })

  it('center: one centred stack, actions centred', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ ...header, align: 'center' }} links={[link('Demo', 'default')]} />)
    expect(container.querySelector('[data-align="center"]')?.className).toContain('text-center')
    expect(screen.getByRole('link', { name: 'Demo' }).parentElement?.className).toContain('justify-center')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-heading.int.spec.tsx`
Expected: FAIL, cannot resolve `@/blocks/Heading/Component`.

- [ ] **Step 3: Write `src/components/ActionRow/index.tsx`**

```tsx
import React from 'react'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

type CMSLinkProps = React.ComponentProps<typeof CMSLink>

export type ActionLink = {
  link: Pick<CMSLinkProps, 'type' | 'newTab' | 'reference' | 'url'> & {
    label?: string | null
    appearance?: 'default' | 'outline' | 'ghost' | 'link' | null
  }
  id?: string | null
}

const variant = (appearance: ActionLink['link']['appearance']) =>
  appearance === 'outline' ? 'secondary' : appearance === 'link' ? 'link' : appearance === 'ghost' ? 'ghost' : 'primary'

/** Up to two buttons or links in a row, shared by the Heading, Split and Actions blocks. */
export const ActionRow: React.FC<{
  links?: ActionLink[] | null
  align?: 'left' | 'center' | 'right'
  size?: 'lg'
  /** Click-tracking location (data-track contract of @subneo/payload-consent). */
  track?: string
  className?: string
}> = ({ links, align = 'left', size, track, className }) => {
  const buttons = (links || []).filter((l) => l.link?.label)
  if (buttons.length === 0) return null
  return (
    <div className={cn('flex flex-wrap items-center gap-3', align === 'center' && 'justify-center', align === 'right' && 'justify-end', className)}>
      {buttons.map(({ link, id }, i) => (
        <CMSLink key={id || i} {...link} appearance={variant(link.appearance)} size={size} track={track ? { location: track } : undefined} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Write `src/blocks/Heading/config.ts`**

```ts
import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

/**
 * Eyebrow, heading and lead with up to two actions. Opens a section: media, items and actions
 * placed below it continue that section (see `resolveSpacing`).
 */
export const Heading: Block = {
  slug: 'heading',
  interfaceName: 'HeadingBlock',
  labels: {
    singular: { de: 'Überschrift', en: 'Heading' },
    plural: { de: 'Überschriften', en: 'Headings' },
  },
  fields: [
    sectionHeader({
      optionalHeading: true,
      overrides: {
        admin: {
          description: {
            de: 'Links: Überschrift links, Einleitung rechts. Rechts: gespiegelt. Zentriert: alles mittig untereinander.',
            en: 'Left: heading left, lead right. Right: mirrored. Centred: everything stacked in the middle.',
          },
        },
      },
    }),
    {
      name: 'size',
      type: 'radio',
      defaultValue: 'h2',
      label: { de: 'Größe', en: 'Size' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Normal', en: 'Normal' }, value: 'h2' },
        { label: { de: 'Groß (Abschluss)', en: 'Large (closing)' }, value: 'display' },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { maxRows: 2, label: { de: 'Aktionen (max. 2)', en: 'Actions (max. 2)' } },
    }),
    sectionSettings(),
  ],
}
```

- [ ] **Step 5: Write `src/blocks/Heading/Component.tsx`**

```tsx
import React from 'react'

import type { HeadingBlock as Props } from '@/payload-types'

import { ActionRow } from '@/components/ActionRow'
import { SectionHeading } from '@/components/SectionHeading'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

/**
 * `left`: heading in columns 1–8, lead and actions in 9–12 (the stacked FeatureStory header).
 * `right`: the mirror, lead and actions in 1–4, heading in 5–12. Both stack heading-first on
 * phones. `center`: one centred stack. `display` is the large closing size.
 */
export const HeadingBlock: React.FC<Props & { isFirst?: boolean }> = ({ header, size, links, isFirst }) => {
  if (!header?.heading && !header?.lead) return null
  const as = isFirst ? 'h1' : 'h2'
  const headingSize = size === 'display' ? 'display' : 'h2'
  const track = size === 'display' ? 'cta-section' : undefined
  const align = header.align || 'left'

  if (align === 'center') {
    return (
      <div className="container flex flex-col items-center gap-8 text-center" data-align="center">
        <SectionHeading align="center" as={as} className="reveal" header={header} size={headingSize} />
        <ActionRow align="center" className="reveal" links={links} size={size === 'display' ? 'lg' : undefined} track={track} />
      </div>
    )
  }

  const right = align === 'right'
  const hasSide = Boolean(header.lead) || (links || []).some((l) => l.link?.label)
  return (
    <div className="container" data-align={align}>
      <div className="reveal grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <SectionHeading
          align={right ? 'right' : 'left'}
          as={as}
          className={cn('lg:col-span-8 lg:row-start-1', right && 'lg:col-start-5')}
          data-part="title"
          header={{ ...header, lead: null }}
          size={headingSize}
        />
        {hasSide && (
          <div className={cn('flex flex-col gap-6 lg:col-span-4 lg:row-start-1 lg:pb-1', right && 'lg:col-start-1')} data-part="side">
            {header.lead && <p className="type-lead max-w-[48ch] text-ink-2">{withResi(header.lead)}</p>}
            <ActionRow links={links} size={size === 'display' ? 'lg' : undefined} track={track} />
          </div>
        )}
      </div>
    </div>
  )
}
```

`SectionHeading` must forward `data-part` to its root. In `src/components/SectionHeading/index.tsx` add `'data-part'?: string` to `Props`, destructure it as `'data-part': dataPart`, and put `data-part={dataPart}` on the root `<div>`.

- [ ] **Step 6: Register the block**

- `src/collections/Pages/index.ts`: add `import { Heading } from '../../blocks/Heading/config'` and insert `Heading,` right after `Hero,` in the `layout` blocks list.
- `src/blocks/registry.ts`: add `'heading',` after `'hero',`.
- `src/blocks/RenderBlocks.tsx`: add `import { HeadingBlock } from '@/blocks/Heading/Component'` and `heading: HeadingBlock,` after `hero: HeroBlock,`.

- [ ] **Step 7: Regenerate types, run tests, type-check**

Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:types`
Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-heading.int.spec.tsx tests/int/blocks.int.spec.ts`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/ActionRow/index.tsx src/components/SectionHeading/index.tsx src/blocks/Heading src/collections/Pages/index.ts src/blocks/registry.ts src/blocks/RenderBlocks.tsx src/payload-types.ts tests/int/sections-heading.int.spec.tsx
git commit -m "Sections: Heading block (left, right, centre) with shared ActionRow"
```

---

### Task 5: Media and Actions blocks

**Files:**
- Create: `src/blocks/MediaSection/config.ts`, `src/blocks/MediaSection/Component.tsx`, `src/blocks/Actions/config.ts`, `src/blocks/Actions/Component.tsx`
- Modify: `src/collections/Pages/index.ts`, `src/blocks/registry.ts`, `src/blocks/RenderBlocks.tsx`
- Test: `tests/int/sections-heading.int.spec.tsx`

**Interfaces:**
- Consumes: `ActionRow` (Task 4), `visual()` field, `Visual` component.
- Produces:
  - Block `media` (`MediaSectionBlock`): `visual`, `width: 'full' | 'narrow'`, `settings`.
  - Block `actions` (`ActionsBlock`): `links` (1–2), `align: 'left' | 'center' | 'right'`, `settings`.

- [ ] **Step 1: Add failing test**

Append to `tests/int/sections-heading.int.spec.tsx` (add `import { ActionsBlock } from '@/blocks/Actions/Component'`):

```tsx
describe('ActionsBlock', () => {
  it('right-aligns the row when asked', () => {
    const { container } = inLocale(<ActionsBlock align="right" blockType="actions" links={[link('Demo', 'default')]} />)
    expect(container.querySelector('.justify-end')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-heading.int.spec.tsx`
Expected: FAIL, cannot resolve `@/blocks/Actions/Component`.

- [ ] **Step 3: Write the Media block**

`src/blocks/MediaSection/config.ts`:

```ts
import type { Block } from 'payload'

import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

/** A built-in illustration or an uploaded image, full container width or narrow and centred. */
export const MediaSection: Block = {
  slug: 'media',
  interfaceName: 'MediaSectionBlock',
  labels: {
    singular: { de: 'Bild / Szene', en: 'Media / scene' },
    plural: { de: 'Bilder / Szenen', en: 'Media / scenes' },
  },
  fields: [
    visual({ defaultIllustration: 'dashboard' }),
    {
      name: 'width',
      type: 'radio',
      defaultValue: 'full',
      label: { de: 'Breite', en: 'Width' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Volle Breite', en: 'Full width' }, value: 'full' },
        { label: { de: 'Schmal, mittig', en: 'Narrow, centred' }, value: 'narrow' },
      ],
    },
    sectionSettings(),
  ],
}
```

`src/blocks/MediaSection/Component.tsx`:

```tsx
import React from 'react'

import type { MediaSectionBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { Visual } from '@/components/Illustrations'
import { cn } from '@/utilities/ui'

export const MediaSectionBlock: React.FC<Props & { locale?: Locale }> = ({ visual, width, locale }) => (
  <div className="container">
    <div className={cn('reveal', width === 'narrow' && 'mx-auto max-w-4xl')}>
      <Visual className="w-full" fallback="dashboard" locale={locale} visual={visual} />
    </div>
  </div>
)
```

- [ ] **Step 4: Write the Actions block**

`src/blocks/Actions/config.ts`:

```ts
import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { sectionSettings } from '@/fields/sectionSettings'

/** One or two buttons or links on their own row, e.g. under the points of a section. */
export const Actions: Block = {
  slug: 'actions',
  interfaceName: 'ActionsBlock',
  labels: {
    singular: { de: 'Aktionen (Buttons / Links)', en: 'Actions (buttons / links)' },
    plural: { de: 'Aktionen', en: 'Actions' },
  },
  fields: [
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { minRows: 1, maxRows: 2, label: { de: 'Aktionen (max. 2)', en: 'Actions (max. 2)' } },
    }),
    {
      name: 'align',
      type: 'radio',
      defaultValue: 'left',
      label: { de: 'Ausrichtung', en: 'Alignment' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Links', en: 'Left' }, value: 'left' },
        { label: { de: 'Zentriert', en: 'Centred' }, value: 'center' },
        { label: { de: 'Rechts', en: 'Right' }, value: 'right' },
      ],
    },
    sectionSettings(),
  ],
}
```

`src/blocks/Actions/Component.tsx`:

```tsx
import React from 'react'

import type { ActionsBlock as Props } from '@/payload-types'

import { ActionRow } from '@/components/ActionRow'

export const ActionsBlock: React.FC<Props> = ({ links, align }) => (
  <div className="container">
    <ActionRow align={align || 'left'} className="reveal" links={links} />
  </div>
)
```

- [ ] **Step 5: Register both blocks**

- `src/collections/Pages/index.ts`: import `MediaSection` from `'../../blocks/MediaSection/config'` and `Actions` from `'../../blocks/Actions/config'`; insert `MediaSection, Actions,` after `Heading,`.
- `src/blocks/registry.ts`: add `'media', 'actions',` after `'heading',`.
- `src/blocks/RenderBlocks.tsx`: import both components; add `media: MediaSectionBlock, actions: ActionsBlock,` after `heading: HeadingBlock,`.

- [ ] **Step 6: Regenerate types, run tests, type-check**

Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:types`
Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-heading.int.spec.tsx tests/int/blocks.int.spec.ts`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/blocks/MediaSection src/blocks/Actions src/collections/Pages/index.ts src/blocks/registry.ts src/blocks/RenderBlocks.tsx src/payload-types.ts tests/int/sections-heading.int.spec.tsx
git commit -m "Sections: Media and Actions blocks"
```

---

### Task 6: Items block

**Files:**
- Create: `src/blocks/Items/columns.ts`, `src/blocks/Items/config.ts`, `src/blocks/Items/Component.tsx`, `src/blocks/Items/Points.tsx`, `src/blocks/Items/Cards.tsx`, `src/blocks/Items/Steps.tsx`, `src/blocks/Items/Stats.tsx`, `src/blocks/Items/RowLabel.tsx`
- Modify: `src/collections/Pages/index.ts`, `src/blocks/registry.ts`, `src/blocks/RenderBlocks.tsx`
- Test: `tests/int/sections-items.int.spec.tsx`

**Interfaces:**
- Produces:
  - `itemStyles = ['points', 'cards', 'steps', 'stats']`, `type ItemStyle`, `type Columns = 2 | 3 | 4 | 5`
  - `resolveColumns(style: ItemStyle, setting: string | null | undefined, count: number): Columns`
  - `gridColumns: Record<Columns, string>`
  - Block `items` (`ItemsBlock`): `style`, `columns: 'auto' | '2' | '3' | '4' | '5'`, `frame: 'none' | 'panel'`, `divider: boolean`, `items[]` with `icon, value, suffix, title (required), size: 'sm' | 'lg', text, points[] { text }, links (max 1)`, `settings`.
  - `PointList: React.FC<{ items: PointRow[]; grid?: string; panel?: boolean; layout?: 'row' | 'column' }>`, `type PointRow = { icon?: string | null; title: string; text?: string | null; id?: string | null }` (Split uses it in Task 7).
  - `ItemRowLabel` admin component.

- [ ] **Step 1: Write the failing test**

`tests/int/sections-items.int.spec.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { ItemsBlock } from '@/blocks/Items/Component'
import { resolveColumns } from '@/blocks/Items/columns'
import { LocaleProvider } from '@/providers/Locale'

beforeAll(() => {
  // CountUp waits for the element to scroll into view; jsdom has no IntersectionObserver.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
  } as unknown as typeof IntersectionObserver
})
afterEach(cleanup)

const inLocale = (ui: React.ReactElement) => render(<LocaleProvider locale="de">{ui}</LocaleProvider>)
const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `r${i}`, title: `Titel ${i + 1}`, text: `Text ${i + 1}` }))

describe('resolveColumns', () => {
  it.each([
    ['points', 3, 3], ['points', 4, 4],
    ['cards', 5, 3], ['steps', 5, 3],
    ['stats', 2, 3], ['stats', 3, 3], ['stats', 4, 4], ['stats', 5, 5], ['stats', 6, 5],
  ] as const)('auto for %s with %i entries gives %i columns', (style, count, expected) => {
    expect(resolveColumns(style, 'auto', count)).toBe(expected)
  })

  it('an explicit setting wins', () => {
    expect(resolveColumns('points', '2', 4)).toBe(2)
  })
})

describe('ItemsBlock', () => {
  it('renders nothing without entries', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('points: one row, four columns for four entries, rule above when asked', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" divider items={rows(4)} style="points" />)
    expect(container.querySelector('ul')?.className).toContain('lg:grid-cols-4')
    expect(container.querySelector('[data-style="points"]')?.className).toContain('border-t')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('steps: numbers each entry', () => {
    inLocale(<ItemsBlock blockType="items" items={rows(3)} style="steps" />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('stats: value with suffix and the label', () => {
    inLocale(<ItemsBlock blockType="items" items={[{ id: 's', value: '40', suffix: '%', title: 'geringere Kosten' }]} style="stats" />)
    expect(screen.getByText('%')).toBeTruthy()
    expect(screen.getByText('geringere Kosten')).toBeTruthy()
  })

  it('cards: a double-width card spans two columns, its link renders', () => {
    const { container } = inLocale(
      <ItemsBlock
        blockType="items"
        items={[{ id: 'c', title: 'Karte', size: 'lg', links: [{ link: { type: 'custom', url: '/x', label: 'Mehr erfahren', appearance: 'link' } }] }]}
        style="cards"
      />,
    )
    expect(container.querySelector('li')?.className).toContain('sm:col-span-2')
    expect(screen.getByRole('link', { name: 'Mehr erfahren' })).toBeTruthy()
  })

  it('panel frame puts the row on one rounded surface', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" frame="panel" items={rows(3)} style="cards" />)
    expect(container.querySelector('[data-style="cards"]')?.className).toContain('rounded-[1.25rem]')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-items.int.spec.tsx`
Expected: FAIL, cannot resolve `@/blocks/Items/Component`.

- [ ] **Step 3: Write `src/blocks/Items/columns.ts`**

```ts
export const itemStyles = ['points', 'cards', 'steps', 'stats'] as const
export type ItemStyle = (typeof itemStyles)[number]
export type Columns = 2 | 3 | 4 | 5

/** `auto` repeats what each style looked like as a block of its own. */
export const resolveColumns = (style: ItemStyle, setting: string | null | undefined, count: number): Columns => {
  if (setting && setting !== 'auto') return Number(setting) as Columns
  if (style === 'points') return count >= 4 ? 4 : 3
  if (style === 'stats') return count >= 5 ? 5 : count === 4 ? 4 : 3
  return 3
}

/** Literal class names so Tailwind finds them. Phones stack, small screens show two. */
export const gridColumns: Record<Columns, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-5',
}
```

- [ ] **Step 4: Write `src/blocks/Items/config.ts`**

```ts
import type { Block, Condition } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionSettings } from '@/fields/sectionSettings'

import type { ItemStyle } from './columns'

/** Shows a row field only for the given styles of the surrounding block. */
const forStyles =
  (...styles: ItemStyle[]): Condition =>
  (_data, _siblingData, { blockData }) =>
    styles.includes(((blockData as { style?: ItemStyle } | undefined)?.style || 'points') as ItemStyle)

/**
 * A row of points, cards, numbered steps or numbers. Columns follow the entry count unless set;
 * `panel` puts the row on one rounded surface with hairline dividers.
 */
export const Items: Block = {
  slug: 'items',
  interfaceName: 'ItemsBlock',
  labels: {
    singular: { de: 'Punkte, Karten, Schritte oder Zahlen', en: 'Points, cards, steps or numbers' },
    plural: { de: 'Listen', en: 'Lists' },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'style',
          type: 'select',
          defaultValue: 'points',
          label: { de: 'Darstellung', en: 'Style' },
          admin: { width: '34%' },
          options: [
            { label: { de: 'Punkte (Icon, Titel, Text)', en: 'Points (icon, title, text)' }, value: 'points' },
            { label: { de: 'Karten', en: 'Cards' }, value: 'cards' },
            { label: { de: 'Schritte (nummeriert)', en: 'Steps (numbered)' }, value: 'steps' },
            { label: { de: 'Zahlen', en: 'Numbers' }, value: 'stats' },
          ],
        },
        {
          name: 'columns',
          type: 'select',
          defaultValue: 'auto',
          label: { de: 'Spalten', en: 'Columns' },
          admin: { width: '22%' },
          options: [
            { label: { de: 'Automatisch', en: 'Automatic' }, value: 'auto' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
          ],
        },
        {
          name: 'frame',
          type: 'select',
          defaultValue: 'none',
          label: { de: 'Rahmen', en: 'Frame' },
          admin: { width: '22%' },
          options: [
            { label: { de: 'Ohne', en: 'None' }, value: 'none' },
            { label: { de: 'Gemeinsame Fläche', en: 'Shared panel' }, value: 'panel' },
          ],
        },
        {
          name: 'divider',
          type: 'checkbox',
          defaultValue: false,
          label: { de: 'Linie darüber', en: 'Rule above' },
          admin: { width: '22%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      label: { de: 'Einträge', en: 'Entries' },
      labels: { singular: { de: 'Eintrag', en: 'Entry' }, plural: { de: 'Einträge', en: 'Entries' } },
      admin: { components: { RowLabel: '@/blocks/Items/RowLabel#ItemRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            iconSelect({ admin: { width: '25%', condition: forStyles('points', 'cards', 'steps') } }),
            {
              name: 'value',
              type: 'text',
              label: { de: 'Zahl (z. B. 40)', en: 'Number (e.g. 40)' },
              admin: { width: '20%', condition: forStyles('stats'), description: { de: 'Gilt für alle Sprachen.', en: 'Shared across languages.' } },
            },
            {
              name: 'suffix',
              type: 'text',
              label: { de: 'Zusatz (z. B. %)', en: 'Suffix (e.g. %)' },
              admin: { width: '15%', condition: forStyles('stats') },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              label: { de: 'Titel / Beschriftung', en: 'Title / label' },
              admin: { width: '40%' },
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'sm',
              label: { de: 'Breite', en: 'Width' },
              admin: { width: '20%', condition: forStyles('cards') },
              options: [
                { label: { de: 'Normal', en: 'Normal' }, value: 'sm' },
                { label: { de: 'Doppelt', en: 'Double' }, value: 'lg' },
              ],
            },
          ],
        },
        {
          name: 'text',
          type: 'textarea',
          localized: true,
          label: { de: 'Text (bei Zahlen: Quelle / Hinweis)', en: 'Text (for numbers: source / note)' },
        },
        {
          name: 'points',
          type: 'array',
          maxRows: 5,
          label: { de: 'Stichpunkte (optional)', en: 'Bullet points (optional)' },
          admin: { condition: forStyles('cards') },
          fields: [{ name: 'text', type: 'text', required: true, localized: true, label: { de: 'Punkt', en: 'Point' } }],
        },
        linkGroup({
          appearances: ['link'],
          localized: true,
          overrides: {
            maxRows: 1,
            label: { de: 'Link (optional)', en: 'Link (optional)' },
            admin: { condition: forStyles('cards', 'stats') },
          },
        }),
      ],
    },
    sectionSettings(),
  ],
}
```

- [ ] **Step 5: Write the style renderers**

`src/blocks/Items/Points.tsx`:

```tsx
import React from 'react'

import { Icon } from '@/components/Icon'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

export type PointRow = { icon?: string | null; title: string; text?: string | null; id?: string | null }

/** Icon, title and text. A row in the Items block, a column beside the scene in Split. */
export const PointList: React.FC<{ items: PointRow[]; grid?: string; panel?: boolean; layout?: 'row' | 'column' }> = ({
  items,
  grid,
  panel,
  layout = 'row',
}) => (
  <ul
    className={cn(
      layout === 'column' ? 'flex flex-col gap-5' : 'grid gap-x-8 gap-y-6',
      layout === 'row' && grid,
      panel && 'gap-0 divide-y divide-line lg:divide-x lg:divide-y-0',
    )}
  >
    {items.map((p, i) => (
      <li className={cn('flex gap-3.5', panel && 'p-6 md:p-8')} key={p.id || i}>
        <Icon className="mt-1 shrink-0 text-accent" name={p.icon} size={20} />
        <div className="flex flex-col gap-1">
          <p className="font-medium text-ink">{withResi(p.title)}</p>
          {p.text && <p className="type-small text-ink-2 pretty max-w-[40ch]">{withResi(p.text)}</p>}
        </div>
      </li>
    ))}
  </ul>
)
```

`src/blocks/Items/Cards.tsx`:

```tsx
import { Check } from 'lucide-react'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Icon, IconTile } from '@/components/Icon'
import { findMcpClient } from '@/integrations/clients'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import type { StyleProps } from './Component'

const tones = ['blue', 'yellow', 'coral', 'neutral'] as const

/**
 * Without a frame: separate cards (icon tile, title, text, bullet points, link). In a panel:
 * the "Warum Indicate" pillars, open cells divided by hairlines.
 */
export const Cards: React.FC<StyleProps> = ({ items, grid, panel }) => {
  if (panel) {
    return (
      <ul className={cn('grid divide-y divide-line lg:divide-x lg:divide-y-0', grid)}>
        {items.map((card, i) => (
          <li className="reveal flex flex-col gap-4 px-6 py-8 md:px-10 md:py-10" key={card.id || i} style={{ '--i': i } as React.CSSProperties}>
            {card.icon && <Icon className="text-accent" name={card.icon} size={26} />}
            <h3 className="type-h4 text-ink">{withResi(card.title)}</h3>
            {card.text && <p className="type-small text-ink-2 pretty">{withResi(card.text)}</p>}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul className={cn('reveal-stagger grid gap-4 md:gap-5', grid)}>
      {items.map((card, i) => {
        const link = (card.links || []).find((l) => l.link?.label)?.link
        // A card named after an AI assistant shows the vendor's mark instead of an icon.
        const client = findMcpClient(card.title)
        return (
          <li
            className={cn(
              'card-surface flex flex-col gap-4 p-6 md:p-7',
              card.size === 'lg' && 'sm:col-span-2',
              link && 'transition-colors duration-150 hover:border-line-strong',
            )}
            key={card.id || i}
            style={{ '--i': i } as React.CSSProperties}
          >
            {client?.logo ? (
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-btn border border-line bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element -- static vendor mark */}
                <img alt="" className="size-5" height={20} src={client.logo} width={20} />
              </span>
            ) : card.icon ? (
              <IconTile name={card.icon} tone={tones[i % tones.length]} />
            ) : null}
            <div className="flex flex-col gap-2">
              <h3 className="type-h4 text-ink">{withResi(card.title)}</h3>
              {card.text && <p className="type-small text-ink-2 pretty">{withResi(card.text)}</p>}
            </div>
            {(card.points || []).length > 0 && (
              <ul className="flex flex-col gap-2">
                {card.points!.map((p, pi) => (
                  <li className="flex items-start gap-2 type-small text-ink-2" key={p.id || pi}>
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-brand-blue-deep" strokeWidth={2} />
                    <span>{withResi(p.text)}</span>
                  </li>
                ))}
              </ul>
            )}
            {link && (
              <div className="mt-auto pt-2">
                <CMSLink {...link} appearance="link" className="type-small font-medium" size="sm" />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
```

`src/blocks/Items/Steps.tsx`:

```tsx
import React from 'react'

import { Icon } from '@/components/Icon'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import type { StyleProps } from './Component'

/** Numbered steps joined by a line on wide screens. */
export const Steps: React.FC<StyleProps> = ({ items, grid }) => (
  <ol className={cn('relative grid gap-10 md:gap-8', grid)}>
    <span aria-hidden="true" className="steps-line absolute left-6 right-6 top-6 hidden h-px bg-line-strong lg:block" />
    {items.map((step, i) => (
      <li className="reveal relative flex flex-col gap-5" key={step.id || i} style={{ '--i': i } as React.CSSProperties}>
        <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-full border border-line-strong bg-surface-2 font-display text-lg font-medium text-accent tnum">
          {i + 1}
        </span>
        <div className="flex flex-col gap-2 md:pr-8">
          <h3 className="flex items-center gap-2 type-h4 text-ink">
            {step.icon && <Icon className="text-ink-3" name={step.icon} size={20} />}
            {withResi(step.title)}
          </h3>
          {step.text && <p className="type-body text-ink-2 pretty max-w-[38ch]">{withResi(step.text)}</p>}
        </div>
      </li>
    ))}
  </ol>
)
```

`src/blocks/Items/Stats.tsx`:

```tsx
import React from 'react'

import { CMSLink } from '@/components/Link'
import { CountUp } from '@/components/CountUp'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import type { StyleProps } from './Component'

/**
 * Numbers that count up, with a label, an optional note and link. An entry without a number
 * shows its label large (the "For hotel groups" tiles). In a panel: bordered tiles.
 */
export const Stats: React.FC<StyleProps> = ({ items, grid, panel }) => (
  <ul className={cn('grid', grid, panel ? '' : 'reveal-stagger gap-8')}>
    {items.map((stat, i) => {
      const link = (stat.links || []).find((l) => l.link?.label)?.link
      return (
        <li
          className={cn(
            'flex flex-col gap-2',
            panel
              ? 'reveal border-b border-line p-6 sm:[&:nth-child(2n)]:border-l lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:nth-child(2n)]:border-l'
              : 'border-l border-line pl-5',
          )}
          key={stat.id || i}
          style={{ '--i': i } as React.CSSProperties}
        >
          {stat.value ? (
            <p className="type-stat text-ink">
              <CountUp value={stat.value} />
              {stat.suffix && <span className={panel ? 'text-accent' : 'text-brand-blue-deep'}>{stat.suffix}</span>}
            </p>
          ) : null}
          <p className={cn(stat.value ? 'type-body font-medium text-ink' : 'type-h4 text-ink')}>{withResi(stat.title)}</p>
          {stat.text && <p className="type-caption text-ink-3">{withResi(stat.text)}</p>}
          {link && <CMSLink {...link} appearance="inline" className="link-arrow mt-auto type-small" />}
        </li>
      )
    })}
  </ul>
)
```

- [ ] **Step 6: Write `src/blocks/Items/Component.tsx` and the row label**

```tsx
import React from 'react'

import type { ItemsBlock as Props } from '@/payload-types'

import { cn } from '@/utilities/ui'

import { Cards } from './Cards'
import { gridColumns, resolveColumns, type ItemStyle } from './columns'
import { PointList } from './Points'
import { Stats } from './Stats'
import { Steps } from './Steps'

export type ItemRow = NonNullable<Props['items']>[number]
export type StyleProps = { items: ItemRow[]; grid: string; panel: boolean }

/** One row of points, cards, steps or numbers; see `resolveColumns` for the automatic columns. */
export const ItemsBlock: React.FC<Props> = ({ style, columns, frame, divider, items }) => {
  const kind: ItemStyle = style || 'points'
  const list = (items || []).filter((i) => i.title)
  if (list.length === 0) return null
  const panel = frame === 'panel'
  const props: StyleProps = { items: list, grid: gridColumns[resolveColumns(kind, columns, list.length)], panel }
  return (
    <div className="container">
      <div
        className={cn(divider && 'border-t border-line pt-8', panel && 'overflow-hidden rounded-[1.25rem] border border-line bg-surface-2')}
        data-style={kind}
      >
        {kind === 'cards' ? <Cards {...props} /> : kind === 'steps' ? <Steps {...props} /> : kind === 'stats' ? <Stats {...props} /> : <PointList {...props} />}
      </div>
    </div>
  )
}
```

`src/blocks/Items/RowLabel.tsx`:

```tsx
'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const ItemRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string; value?: string; suffix?: string }>()
  const number = data?.value ? `${data.value}${data.suffix || ''} · ` : ''
  return <div>{data?.title ? `${number}${data.title}` : `Eintrag ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}
```

- [ ] **Step 7: Register the block**

- `src/collections/Pages/index.ts`: import `Items` from `'../../blocks/Items/config'`; insert `Items,` after `MediaSection,`.
- `src/blocks/registry.ts`: add `'items',` after `'media',`.
- `src/blocks/RenderBlocks.tsx`: import `ItemsBlock`; add `items: ItemsBlock,` after `media: MediaSectionBlock,`.

- [ ] **Step 8: Regenerate types and import map, run tests, type-check**

Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:types`
Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:importmap`
Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-items.int.spec.tsx tests/int/blocks.int.spec.ts`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/blocks/Items src/collections/Pages/index.ts src/blocks/registry.ts src/blocks/RenderBlocks.tsx src/payload-types.ts "src/app/(payload)/admin/importMap.js" tests/int/sections-items.int.spec.tsx
git commit -m "Sections: Items block (points, cards, steps, numbers; columns, panel, rule)"
```

---

### Task 7: Integration tree and Split blocks

**Files:**
- Create: `src/blocks/IntegrationTree/config.ts`, `src/blocks/IntegrationTree/Component.tsx`, `src/blocks/IntegrationTree/RowLabel.tsx` (copy), `src/blocks/Split/config.ts`, `src/blocks/Split/Component.tsx`
- Modify: `src/collections/Pages/index.ts`, `src/blocks/registry.ts`, `src/blocks/RenderBlocks.tsx`
- Test: `tests/int/sections-items.int.spec.tsx`

**Interfaces:**
- Consumes: `PointList` (Task 6), `ActionRow` (Task 4), `sectionHeader({ withAlign: false })` (Task 3).
- Produces:
  - Block `integrationTree` (`IntegrationTreeBlock`): `groups[] { title, items[] { name, logo } }`, `settings`.
  - Block `split` (`SplitBlock`): `header { eyebrow, heading, lead }`, `mediaSide: 'left' | 'right'`, `visual`, `points[] { icon, title, text }` (max 4), `links` (max 2), `settings`.

- [ ] **Step 1: Add a failing Split test**

Append to `tests/int/sections-items.int.spec.tsx` (add `import { SplitBlock } from '@/blocks/Split/Component'`):

```tsx
describe('SplitBlock', () => {
  it('puts the scene first on wide screens when it sits left, and lists the points in a column', () => {
    const { container } = inLocale(
      <SplitBlock
        blockType="split"
        header={{ heading: 'Text neben Szene' }}
        mediaSide="left"
        points={[{ id: 'p', title: 'Punkt eins' }]}
        visual={{ type: 'image', image: null }}
      />,
    )
    expect(container.querySelector('[data-part="text"]')?.className).toContain('lg:order-2')
    expect(container.querySelector('[data-part="media"]')?.className).toContain('lg:order-1')
    expect(container.querySelector('ul')?.className).toContain('flex-col')
    expect(screen.getByText('Punkt eins')).toBeTruthy()
  })
})
```

(`visual.type: 'image'` with no image falls back to the built-in illustration, which renders in jsdom like the other illustration tests; if it does not, pass `visual={{ type: 'illustration', illustration: 'builder' }}`.)

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-items.int.spec.tsx`
Expected: FAIL, cannot resolve `@/blocks/Split/Component`.

- [ ] **Step 3: Write the Integration tree block**

Run: `cp src/blocks/Integrations/RowLabel.tsx src/blocks/IntegrationTree/RowLabel.tsx` (phase 2 deletes the original).

`src/blocks/IntegrationTree/config.ts`:

```ts
import type { Block } from 'payload'

import { sectionSettings } from '@/fields/sectionSettings'

/**
 * The lit integration tree. Its tiles are the systems of the groups below; a system without an
 * uploaded logo takes the mark from the connector catalogue.
 */
export const IntegrationTree: Block = {
  slug: 'integrationTree',
  interfaceName: 'IntegrationTreeBlock',
  labels: {
    singular: { de: 'Integrations-Grafik', en: 'Integration tree' },
    plural: { de: 'Integrations-Grafiken', en: 'Integration trees' },
  },
  fields: [
    {
      name: 'groups',
      type: 'array',
      label: { de: 'Gruppen (z. B. PMS, Marketing)', en: 'Groups (e.g. PMS, marketing)' },
      labels: { singular: { de: 'Gruppe', en: 'Group' }, plural: { de: 'Gruppen', en: 'Groups' } },
      maxRows: 6,
      admin: { components: { RowLabel: '@/blocks/IntegrationTree/RowLabel#GroupRowLabel' } },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: { de: 'Gruppentitel', en: 'Group title' } },
        {
          name: 'items',
          type: 'array',
          label: { de: 'Systeme', en: 'Systems' },
          maxRows: 12,
          admin: { components: { RowLabel: '@/blocks/IntegrationTree/RowLabel#ItemRowLabel' } },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'name', type: 'text', required: true, label: { de: 'Name', en: 'Name' }, admin: { width: '60%' } },
                { name: 'logo', type: 'upload', relationTo: 'media', label: { de: 'Logo (optional)', en: 'Logo (optional)' }, admin: { width: '40%' } },
              ],
            },
          ],
        },
      ],
    },
    sectionSettings(),
  ],
}
```

`src/blocks/IntegrationTree/Component.tsx`:

```tsx
import React from 'react'

import type { IntegrationTreeBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { IntegrationTree, type TreeSystem } from '@/components/IntegrationTree'
import { findIntegrationByName, getIntegrations } from '@/integrations/getIntegrations'

export const IntegrationTreeBlock: React.FC<Props & { locale?: Locale }> = async ({ groups, locale }) => {
  const catalogue = await getIntegrations()
  const systems: TreeSystem[] = (groups || [])
    .filter((g) => g.title)
    .flatMap((g) => g.items || [])
    .map((item) => ({ name: item.name, logo: item.logo, logoSrc: findIntegrationByName(catalogue, item.name)?.logo }))
  if (systems.length === 0) return null
  return (
    <div className="container">
      <div className="reveal">
        <IntegrationTree className="mx-auto max-w-[64rem]" locale={locale} systems={systems} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write the Split block**

`src/blocks/Split/config.ts`:

```ts
import type { Block } from 'payload'

import { iconSelect } from '@/fields/iconSelect'
import { linkGroup } from '@/fields/linkGroup'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'
import { visual } from '@/fields/visual'

/** Text, up to four points and two actions beside a scene. The only composite section block. */
export const Split: Block = {
  slug: 'split',
  interfaceName: 'SplitBlock',
  labels: {
    singular: { de: 'Text neben Szene', en: 'Text beside scene' },
    plural: { de: 'Text neben Szene', en: 'Text beside scene' },
  },
  fields: [
    sectionHeader({ withAlign: false }),
    {
      name: 'mediaSide',
      type: 'radio',
      defaultValue: 'right',
      label: { de: 'Szene', en: 'Scene' },
      admin: { layout: 'horizontal' },
      options: [
        { label: { de: 'Rechts', en: 'Right' }, value: 'right' },
        { label: { de: 'Links', en: 'Left' }, value: 'left' },
      ],
    },
    visual({ defaultIllustration: 'builder' }),
    {
      name: 'points',
      type: 'array',
      label: { de: 'Punkte (max. 4)', en: 'Points (max. 4)' },
      labels: { singular: { de: 'Punkt', en: 'Point' }, plural: { de: 'Punkte', en: 'Points' } },
      maxRows: 4,
      admin: { components: { RowLabel: '@/blocks/Items/RowLabel#ItemRowLabel' } },
      fields: [
        {
          type: 'row',
          fields: [
            iconSelect({ admin: { width: '25%' } }),
            { name: 'title', type: 'text', required: true, localized: true, label: { de: 'Titel', en: 'Title' }, admin: { width: '75%' } },
          ],
        },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text (1–2 Sätze)', en: 'Text (1–2 sentences)' } },
      ],
    },
    linkGroup({
      appearances: ['default', 'outline', 'link'],
      localized: true,
      overrides: { maxRows: 2, label: { de: 'Aktionen (max. 2)', en: 'Actions (max. 2)' } },
    }),
    sectionSettings(),
  ],
}
```

`src/blocks/Split/Component.tsx`:

```tsx
import React from 'react'

import type { SplitBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { ActionRow } from '@/components/ActionRow'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual } from '@/components/Illustrations'
import { PointList } from '@/blocks/Items/Points'
import { cn } from '@/utilities/ui'

export const SplitBlock: React.FC<Props & { locale?: Locale; isFirst?: boolean }> = ({ header, mediaSide, visual, points, links, locale, isFirst }) => {
  const mediaLeft = mediaSide === 'left'
  const list = (points || []).filter((p) => p.title)
  return (
    <div className="container">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className={cn('reveal flex flex-col gap-8 lg:col-span-5', mediaLeft && 'lg:order-2')} data-part="text">
          <SectionHeading align="left" as={isFirst ? 'h1' : 'h2'} header={header} />
          {list.length > 0 && <PointList items={list} layout="column" />}
          <ActionRow links={links} />
        </div>
        <div className={cn('reveal lg:col-span-7', mediaLeft && 'lg:order-1')} data-part="media" style={{ '--i': 1 } as React.CSSProperties}>
          <Visual className="w-full" fallback="builder" locale={locale} visual={visual} />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Register both blocks**

- `src/collections/Pages/index.ts`: import `IntegrationTree` from `'../../blocks/IntegrationTree/config'` and `Split` from `'../../blocks/Split/config'`; insert `Actions, IntegrationTree, Split,` so the list starts `Hero, Heading, MediaSection, Items, Actions, IntegrationTree, Split,`.
- `src/blocks/registry.ts`: add `'integrationTree', 'split',` after `'actions',`.
- `src/blocks/RenderBlocks.tsx`: import both components; add `integrationTree: IntegrationTreeBlock, split: SplitBlock,`.

- [ ] **Step 6: Regenerate types and import map, run tests, type-check**

Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:types`
Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:importmap`
Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-items.int.spec.tsx tests/int/blocks.int.spec.ts`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/blocks/IntegrationTree src/blocks/Split src/collections/Pages/index.ts src/blocks/registry.ts src/blocks/RenderBlocks.tsx src/payload-types.ts "src/app/(payload)/admin/importMap.js" tests/int/sections-items.int.spec.tsx
git commit -m "Sections: Integration tree and Split blocks"
```

---

### Task 8: Hide the legacy blocks from the picker

**Files:**
- Modify: `src/blocks/registry.ts`, `src/collections/Pages/index.ts`
- Test: `tests/int/blocks.int.spec.ts`

**Interfaces:**
- Produces: `legacySectionSlugs = ['featureStory', 'ctaSection', 'pillars', 'cardGrid', 'steps', 'stats', 'integrations'] as const` in `src/blocks/registry.ts`; the layout field's `filterOptions` allows everything else, and everything when `req.context.allowLegacySections` is true.

- [ ] **Step 1: Write the failing test**

Append to `tests/int/blocks.int.spec.ts` (add `legacySectionSlugs` to the registry import, and export `findLayoutField` alongside `findLayoutBlocks`: same lookup, returning the field itself):

```ts
const findLayoutField = () => {
  const tabs = Pages.fields.find((f) => f.type === 'tabs')
  if (!tabs || tabs.type !== 'tabs') throw new Error('Pages has no tabs field')
  for (const tab of tabs.tabs) {
    const layout = tab.fields.find((f) => 'name' in f && f.name === 'layout')
    if (layout && layout.type === 'blocks') return layout
  }
  throw new Error('layout blocks field not found')
}

describe('legacy section blocks', () => {
  const filter = findLayoutField().filterOptions as (args: { req?: { context?: Record<string, unknown> } }) => true | string[]

  it('are not offered in the block picker', () => {
    const allowed = filter({ req: { context: {} } }) as string[]
    for (const slug of legacySectionSlugs) expect(allowed).not.toContain(slug)
    expect(allowed).toContain('heading')
    expect(allowed).toContain('faq')
  })

  it('stay writable for the conversion', () => {
    expect(filter({ req: { context: { allowLegacySections: true } } })).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/blocks.int.spec.ts`
Expected: FAIL (`legacySectionSlugs` not exported, `filterOptions` undefined).

- [ ] **Step 3: Implement**

`src/blocks/registry.ts`, append:

```ts
/**
 * Structural blocks replaced by the section blocks (Heading, Media, Items, Actions, Integration
 * tree, Split). Hidden from the block picker; the section conversion rewrites them and phase 2
 * deletes them.
 */
export const legacySectionSlugs = ['featureStory', 'ctaSection', 'pillars', 'cardGrid', 'steps', 'stats', 'integrations'] as const
```

`src/collections/Pages/index.ts`: import `{ blockSlugs, legacySectionSlugs }` from `'../../blocks/registry'` and add to the `layout` field (next to `required: true`):

```ts
              // Legacy section blocks stay readable but cannot be added; the conversion passes
              // `allowLegacySections` so it can still save pages that hold them.
              filterOptions: ({ req }) =>
                req?.context?.allowLegacySections
                  ? true
                  : blockSlugs.filter((slug) => !(legacySectionSlugs as readonly string[]).includes(slug)),
```

- [ ] **Step 4: Run tests and type-check**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/blocks.int.spec.ts`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/registry.ts src/collections/Pages/index.ts tests/int/blocks.int.spec.ts
git commit -m "Sections: hide the legacy structural blocks from the block picker"
```

---

### Task 9: Converter (pure)

**Files:**
- Create: `src/sections/legacy.ts`
- Test: `tests/int/sections-legacy.int.spec.ts`

**Interfaces:**
- Consumes: generated `HeadingBlock`, `MediaSectionBlock`, `ItemsBlock`, `ActionsBlock`, `IntegrationTreeBlock`, `SplitBlock`, `Media`, `Page`, `Post` from `@/payload-types`; `legacySectionSlugs` (Task 8); `Gap` (Task 2).
- Produces:
  - Types `LegacyFeatureStory`, `LegacyCtaSection`, `LegacyPillars`, `LegacyCardGrid`, `LegacySteps`, `LegacyStats`, `LegacyIntegrations`, union `LegacyBlock`, and `SectionBlock` (union of the six new block types).
  - `isLegacyBlock(block: unknown): block is LegacyBlock`
  - `splitLegacyBlock(block: LegacyBlock): SectionBlock[]`
  - `convertWidgetSpacing<B>(block: B): B`
  - `splitLegacyLayout(layout: readonly unknown[]): unknown[]`
  - `needsSectionConversion(layout: readonly unknown[] | null | undefined): boolean`
  - New block ids are `${old.id}-${part}` with part ∈ `heading`, `media`, `items`, `cards`, `stats`, `tree`, `actions`, `split`; no id when the old block had none.

- [ ] **Step 1: Write the failing test**

`tests/int/sections-legacy.int.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import {
  convertWidgetSpacing,
  needsSectionConversion,
  splitLegacyBlock,
  splitLegacyLayout,
  type LegacyBlock,
} from '@/sections/legacy'

const header = { eyebrow: 'Für Hotels', heading: 'Strategie auf Zahlen', lead: 'Welche Kanäle?', align: 'left' as const }
const link = (label: string, appearance: 'default' | 'outline' | 'link' = 'default') => ({ id: `l-${label}`, link: { type: 'custom' as const, url: '/x', label, appearance } })
const types = (blocks: { blockType: string }[]) => blocks.map((b) => b.blockType)
type Loose = Record<string, any>

describe('splitLegacyBlock', () => {
  it('featureStory stacked → heading, media, points with a rule, actions', () => {
    const out = splitLegacyBlock({
      blockType: 'featureStory', id: 'fs', blockName: 'Hotels', header, layout: 'stacked',
      visual: { type: 'illustration', illustration: 'portfolio' },
      points: [{ id: 'p1', icon: 'building', title: 'Ein Space', text: 'Pro Haus' }],
      links: [link('Demo'), link('Mehr', 'link')],
      settings: { background: 'tinted', spacing: 'compact', anchor: 'hotels' },
    }) as Loose[]
    expect(types(out)).toEqual(['heading', 'media', 'items', 'actions'])
    expect(out.map((b) => b.id)).toEqual(['fs-heading', 'fs-media', 'fs-items', 'fs-actions'])
    expect(out[0].header).toEqual({ eyebrow: 'Für Hotels', heading: 'Strategie auf Zahlen', lead: 'Welche Kanäle?', align: 'left' })
    expect(out[1]).toMatchObject({ visual: { illustration: 'portfolio' }, width: 'full' })
    expect(out[2]).toMatchObject({ style: 'points', divider: true, items: [{ id: 'p1', icon: 'building', title: 'Ein Space', text: 'Pro Haus' }] })
    expect(out[3]).toMatchObject({ align: 'left', links: [link('Demo'), link('Mehr', 'link')] })
    // Background on every part; anchor and old spacing only at the edges.
    expect(out.map((b) => b.settings)).toEqual([
      { background: 'tinted', gapTop: 'tight', gapBottom: 'auto', anchor: 'hotels' },
      { background: 'tinted', gapTop: 'auto', gapBottom: 'auto' },
      { background: 'tinted', gapTop: 'auto', gapBottom: 'auto' },
      { background: 'tinted', gapTop: 'auto', gapBottom: 'tight' },
    ])
    expect(out.every((b) => b.blockName === 'Hotels' && b.hidden === false)).toBe(true)
  })

  it('featureStory side by side → one split', () => {
    const out = splitLegacyBlock({ blockType: 'featureStory', id: 'fs', header, layout: 'visual-left', points: [], links: [] }) as Loose[]
    expect(types(out)).toEqual(['split'])
    expect(out[0]).toMatchObject({ id: 'fs-split', mediaSide: 'left', header: { eyebrow: 'Für Hotels', heading: 'Strategie auf Zahlen', lead: 'Welche Kanäle?' } })
    expect(out[0].header.align).toBeUndefined()
  })

  it('featureStory without points or links → heading and media only', () => {
    expect(types(splitLegacyBlock({ blockType: 'featureStory', header, layout: 'stacked' }))).toEqual(['heading', 'media'])
  })

  it('ctaSection → one large centred heading with the buttons; hidden stays hidden; dark default', () => {
    const out = splitLegacyBlock({ blockType: 'ctaSection', id: 'c', hidden: true, header: { ...header, align: 'left' }, links: [link('Demo')], note: 'gone' }) as Loose[]
    expect(types(out)).toEqual(['heading'])
    expect(out[0]).toMatchObject({ size: 'display', header: { align: 'center' }, links: [link('Demo')], hidden: true, settings: { background: 'dark' } })
  })

  it('pillars → heading, cards panel, numbers panel', () => {
    const out = splitLegacyBlock({
      blockType: 'pillars', id: 'why', header,
      pillars: [1, 2, 3, 4].map((n) => ({ id: `pi${n}`, icon: 'zap' as const, title: `Säule ${n}`, text: 'Text' })),
      tiles: [{ id: 't1', value: '30', suffix: '+', label: 'Anbindungen', links: [link('Alle', 'link')] }, { id: 't2', label: 'Für Agenturen' }],
    }) as Loose[]
    expect(types(out)).toEqual(['heading', 'items', 'items'])
    expect(out[0].header.align).toBe('center')
    expect(out[1]).toMatchObject({ id: 'why-cards', style: 'cards', frame: 'panel', columns: '4' })
    expect(out[2]).toMatchObject({ id: 'why-stats', style: 'stats', frame: 'panel', items: [{ id: 't1', value: '30', suffix: '+', title: 'Anbindungen', links: [link('Alle', 'link')] }, { id: 't2', title: 'Für Agenturen' }] })
  })

  it('pillars without tiles → no numbers block', () => {
    expect(types(splitLegacyBlock({ blockType: 'pillars', header, pillars: [{ title: 'A', text: 'a' }], tiles: [] }))).toEqual(['heading', 'items'])
  })

  it('cardGrid → heading and cards; columns from the layout; bento keeps large cards', () => {
    const cards = [{ id: 'k', title: 'Karte', size: 'lg' as const, points: [{ id: 'kp', text: 'Punkt' }], links: [link('Mehr', 'link')] }]
    const grid3 = splitLegacyBlock({ blockType: 'cardGrid', header, layout: 'grid-3', cards }) as Loose[]
    expect(grid3[1]).toMatchObject({ style: 'cards', columns: '3', items: [{ size: 'sm', points: [{ id: 'kp', text: 'Punkt' }] }] })
    expect(grid3[0].header.align).toBe('left')
    const bento = splitLegacyBlock({ blockType: 'cardGrid', header, layout: 'bento', cards }) as Loose[]
    expect(bento[1]).toMatchObject({ columns: '4', items: [{ size: 'lg' }] })
  })

  it('steps → centred heading and steps', () => {
    const out = splitLegacyBlock({ blockType: 'steps', header, steps: [{ id: 's', icon: 'plug', title: 'Verbinden', text: 'Klick' }] }) as Loose[]
    expect(types(out)).toEqual(['heading', 'items'])
    expect(out[1]).toMatchObject({ style: 'steps', items: [{ id: 's', icon: 'plug', title: 'Verbinden', text: 'Klick' }] })
  })

  it('stats without a heading → numbers only, tinted by default; note becomes the text', () => {
    const out = splitLegacyBlock({ blockType: 'stats', header: { heading: null }, items: [{ id: 'v', value: '40', suffix: '%', label: 'weniger', note: 'Quelle' }] }) as Loose[]
    expect(types(out)).toEqual(['items'])
    expect(out[0]).toMatchObject({ style: 'stats', items: [{ id: 'v', value: '40', suffix: '%', title: 'weniger', text: 'Quelle' }], settings: { background: 'tinted' } })
  })

  it('integrations → heading, tree, actions', () => {
    const groups = [{ id: 'g', title: 'PMS', items: [{ id: 'gi', name: 'Mews', logo: null }] }]
    const out = splitLegacyBlock({ blockType: 'integrations', id: 'int', header, groups, links: [link('Alle')] }) as Loose[]
    expect(types(out)).toEqual(['heading', 'integrationTree', 'actions'])
    expect(out[1]).toMatchObject({ id: 'int-tree', groups, hidden: false })
    expect(out[2].align).toBe('center')
  })

  it('integrations with an uploaded image → the image shows, the tree is kept hidden', () => {
    const out = splitLegacyBlock({ blockType: 'integrations', header, visual: { type: 'image', image: 7 }, groups: [{ title: 'PMS', items: [] }] }) as Loose[]
    expect(types(out)).toEqual(['heading', 'integrationTree', 'media'])
    expect(out[1].hidden).toBe(true)
    expect(out[2]).toMatchObject({ width: 'narrow', visual: { type: 'image', image: 7 } })
  })
})

describe('convertWidgetSpacing', () => {
  it('moves compact and none to both gaps and marks the block converted', () => {
    expect(convertWidgetSpacing({ blockType: 'hero', settings: { spacing: 'compact', gapTop: 'auto', gapBottom: 'auto' } })).toEqual({
      blockType: 'hero', settings: { spacing: 'default', gapTop: 'tight', gapBottom: 'tight' },
    })
    expect(convertWidgetSpacing({ blockType: 'faq', settings: { spacing: 'none' } })).toMatchObject({ settings: { gapTop: 'none', gapBottom: 'none' } })
  })

  it('leaves default spacing and already-set gaps alone (same object)', () => {
    const a = { blockType: 'faq', settings: { spacing: 'default' } }
    const b = { blockType: 'faq', settings: { spacing: 'compact', gapTop: 'large' } }
    expect(convertWidgetSpacing(a)).toBe(a)
    expect(convertWidgetSpacing(b)).toBe(b)
  })
})

describe('splitLegacyLayout', () => {
  it('replaces legacy blocks in place and passes other blocks through', () => {
    const faq = { blockType: 'faq', id: 'f' }
    const out = splitLegacyLayout([faq, { blockType: 'steps', id: 's', header, steps: [{ title: 'A', text: 'a' }] } as LegacyBlock, faq]) as Loose[]
    expect(types(out)).toEqual(['faq', 'heading', 'items', 'faq'])
    expect(out[0]).toBe(faq)
  })

  it('is idempotent', () => {
    const once = splitLegacyLayout([{ blockType: 'ctaSection', id: 'c', header, links: [] } as LegacyBlock, { blockType: 'hero', settings: { spacing: 'compact' } }])
    expect(splitLegacyLayout(once)).toEqual(once)
    expect(needsSectionConversion(once)).toBe(false)
  })

  it('needsSectionConversion spots legacy blocks and old widget spacing', () => {
    expect(needsSectionConversion([{ blockType: 'stats', items: [] }])).toBe(true)
    expect(needsSectionConversion([{ blockType: 'hero', settings: { spacing: 'compact' } }])).toBe(true)
    expect(needsSectionConversion([{ blockType: 'hero', settings: { spacing: 'default' } }])).toBe(false)
    expect(needsSectionConversion(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-legacy.int.spec.ts`
Expected: FAIL, cannot resolve `@/sections/legacy`.

- [ ] **Step 3: Write `src/sections/legacy.ts`**

```ts
/**
 * The seven structural blocks the section blocks replace, as stored, and the pure conversion into
 * section blocks. Used by the phase 1 migration, `scripts/convert-sections.ts` and the seed (which
 * still writes some sections in these shapes). Nothing here touches the database.
 */
import type {
  ActionsBlock,
  HeadingBlock,
  IntegrationTreeBlock,
  ItemsBlock,
  MediaSectionBlock,
  SplitBlock,
} from '@/payload-types'
import { legacySectionSlugs } from '@/blocks/registry'

import type { Background, Gap } from './rhythm'

export type SectionBlock = HeadingBlock | MediaSectionBlock | ItemsBlock | ActionsBlock | IntegrationTreeBlock | SplitBlock

type Id = string | null
type LinkRow = NonNullable<HeadingBlock['links']>[number]
type Visual = NonNullable<MediaSectionBlock['visual']>
type Header = { eyebrow?: string | null; heading?: string | null; lead?: string | null; align?: 'left' | 'center' | 'right' | null }
type Icon = NonNullable<ItemsBlock['items']>[number]['icon']
/** Card and tile links: text links only, like the Items rows they become. */
type ItemLinks = NonNullable<ItemsBlock['items']>[number]['links']
type TreeGroup = NonNullable<IntegrationTreeBlock['groups']>[number]
type OldSpacing = 'default' | 'compact' | 'none'
type Base = {
  id?: Id
  blockName?: string | null
  hidden?: boolean | null
  settings?: { background?: Background | null; spacing?: OldSpacing | null; anchor?: string | null } | null
}

export type LegacyFeatureStory = Base & {
  blockType: 'featureStory'
  header: Header
  layout?: 'stacked' | 'visual-right' | 'visual-left' | null
  visual?: Visual | null
  points?: { icon?: Icon; title: string; text?: string | null; id?: Id }[] | null
  links?: LinkRow[] | null
}
export type LegacyCtaSection = Base & { blockType: 'ctaSection'; header: Header; links?: LinkRow[] | null; note?: string | null }
export type LegacyPillars = Base & {
  blockType: 'pillars'
  header: Header
  pillars?: { icon?: Icon; title: string; text: string; id?: Id }[] | null
  tiles?: { value?: string | null; suffix?: string | null; label: string; links?: ItemLinks; id?: Id }[] | null
}
export type LegacyCardGrid = Base & {
  blockType: 'cardGrid'
  header: Header
  layout?: 'grid-3' | 'grid-4' | 'bento' | null
  cards?: {
    icon?: Icon
    title: string
    size?: 'sm' | 'lg' | null
    text?: string | null
    points?: { text: string; id?: Id }[] | null
    links?: ItemLinks
    id?: Id
  }[] | null
}
export type LegacySteps = Base & { blockType: 'steps'; header: Header; steps?: { icon?: Icon; title: string; text: string; id?: Id }[] | null }
export type LegacyStats = Base & {
  blockType: 'stats'
  header?: Header | null
  items?: { value: string; suffix?: string | null; label: string; note?: string | null; id?: Id }[] | null
}
export type LegacyIntegrations = Base & {
  blockType: 'integrations'
  header: Header
  visual?: Visual | null
  groups?: TreeGroup[] | null
  links?: LinkRow[] | null
}

export type LegacyBlock =
  | LegacyFeatureStory
  | LegacyCtaSection
  | LegacyPillars
  | LegacyCardGrid
  | LegacySteps
  | LegacyStats
  | LegacyIntegrations

type ItemRow = NonNullable<ItemsBlock['items']>[number]
type Part = [suffix: string, block: SectionBlock]

export const isLegacyBlock = (block: unknown): block is LegacyBlock =>
  (legacySectionSlugs as readonly string[]).includes((block as { blockType?: string } | null)?.blockType || '')

const gapFor = (spacing: OldSpacing | null | undefined): Gap => (spacing === 'compact' ? 'tight' : spacing === 'none' ? 'none' : 'auto')

/** The background each old block had when none was stored. */
const defaultBackground: Partial<Record<LegacyBlock['blockType'], Background>> = { stats: 'tinted', integrations: 'tinted', ctaSection: 'dark' }

/**
 * Common fields for the generated parts: background and hidden on every part (a part may also
 * hide itself), anchor and the old spacing only at the group's edges, ids derived from the old id
 * so every locale pass writes the same rows.
 */
const finish = (old: LegacyBlock, parts: Part[]): SectionBlock[] =>
  parts.map(([suffix, block], i) => {
    const settings: NonNullable<HeadingBlock['settings']> = {
      background: old.settings?.background || defaultBackground[old.blockType] || 'default',
      gapTop: i === 0 ? gapFor(old.settings?.spacing) : 'auto',
      gapBottom: i === parts.length - 1 ? gapFor(old.settings?.spacing) : 'auto',
      ...(i === 0 && old.settings?.anchor ? { anchor: old.settings.anchor } : {}),
    }
    return {
      ...block,
      ...(old.id ? { id: `${old.id}-${suffix}` } : {}),
      ...(old.blockName ? { blockName: old.blockName } : {}),
      hidden: Boolean(old.hidden) || block.hidden === true,
      settings,
    } as SectionBlock
  })

const headingPart = (header: Header | null | undefined, align: 'left' | 'center' | 'right', extra: Partial<HeadingBlock> = {}): Part[] =>
  header?.heading || header?.lead
    ? [['heading', { blockType: 'heading', header: { eyebrow: header.eyebrow ?? null, heading: header.heading ?? null, lead: header.lead ?? null, align }, size: 'h2', links: [], ...extra }]]
    : []

const itemsPart = (suffix: string, style: ItemsBlock['style'], items: ItemRow[], o: Partial<Pick<ItemsBlock, 'columns' | 'frame' | 'divider'>> = {}): Part[] =>
  items.length > 0 ? [[suffix, { blockType: 'items', style, columns: o.columns || 'auto', frame: o.frame || 'none', divider: o.divider || false, items }]] : []

const actionsPart = (links: LinkRow[] | null | undefined, align: ActionsBlock['align']): Part[] =>
  (links || []).length > 0 ? [['actions', { blockType: 'actions', links: links as LinkRow[], align }]] : []

/** One old block → its section blocks, in page order. See the mapping table in the spec. */
export const splitLegacyBlock = (old: LegacyBlock): SectionBlock[] => {
  switch (old.blockType) {
    case 'featureStory': {
      const visual = old.visual || { type: 'illustration' as const, illustration: 'builder' as const }
      if (old.layout === 'visual-left' || old.layout === 'visual-right') {
        return finish(old, [
          [
            'split',
            {
              blockType: 'split',
              header: { eyebrow: old.header.eyebrow ?? null, heading: old.header.heading || '', lead: old.header.lead ?? null },
              mediaSide: old.layout === 'visual-left' ? 'left' : 'right',
              visual,
              points: old.points || [],
              links: old.links || [],
            },
          ],
        ])
      }
      return finish(old, [
        ...headingPart(old.header, 'left'),
        ['media', { blockType: 'media', visual, width: 'full' }],
        ...itemsPart('items', 'points', (old.points || []).map((p) => ({ id: p.id, icon: p.icon, title: p.title, text: p.text })), { divider: true }),
        ...actionsPart(old.links, 'left'),
      ])
    }
    case 'ctaSection':
      return finish(old, headingPart(old.header, 'center', { size: 'display', links: old.links || [] }))
    case 'pillars': {
      const pillars = old.pillars || []
      return finish(old, [
        ...headingPart(old.header, 'center'),
        ...itemsPart('cards', 'cards', pillars.map((p) => ({ id: p.id, icon: p.icon, title: p.title, text: p.text })), {
          frame: 'panel',
          columns: pillars.length === 4 ? '4' : '3',
        }),
        ...itemsPart(
          'stats',
          'stats',
          (old.tiles || []).map((t) => ({ id: t.id, value: t.value, suffix: t.suffix, title: t.label, ...(t.links?.length ? { links: t.links } : {}) })),
          { frame: 'panel' },
        ),
      ])
    }
    case 'cardGrid':
      return finish(old, [
        ...headingPart(old.header, old.header.align || 'left'),
        ...itemsPart(
          'items',
          'cards',
          (old.cards || []).map((c) => ({
            id: c.id,
            icon: c.icon,
            title: c.title,
            text: c.text,
            size: old.layout === 'bento' ? c.size || 'sm' : 'sm',
            points: c.points || [],
            links: c.links || [],
          })),
          { columns: old.layout === 'grid-3' ? '3' : '4' },
        ),
      ])
    case 'steps':
      return finish(old, [
        ...headingPart(old.header, 'center'),
        ...itemsPart('items', 'steps', (old.steps || []).map((s) => ({ id: s.id, icon: s.icon, title: s.title, text: s.text }))),
      ])
    case 'stats':
      return finish(old, [
        ...headingPart(old.header, 'center'),
        ...itemsPart('items', 'stats', (old.items || []).map((s) => ({ id: s.id, value: s.value, suffix: s.suffix, title: s.label, text: s.note }))),
      ])
    case 'integrations': {
      const customImage = old.visual?.type === 'image' && Boolean(old.visual.image)
      // With an uploaded image the old block showed only the image; the tree keeps the groups, hidden.
      const tree: Part = ['tree', { blockType: 'integrationTree', groups: old.groups || [], hidden: customImage }]
      return finish(old, [
        ...headingPart(old.header, 'center'),
        tree,
        ...(customImage ? ([['media', { blockType: 'media', visual: old.visual as Visual, width: 'narrow' }]] as Part[]) : []),
        ...actionsPart(old.links, 'center'),
      ])
    }
  }
}

type WithSpacing = { settings?: { spacing?: OldSpacing | null; gapTop?: Gap | null; gapBottom?: Gap | null } | null }

/**
 * Widgets keep their block but move a non-default old spacing into both gaps. The old field is
 * reset to `default`, which marks the block as converted. Returns the same object when there is
 * nothing to do.
 */
export const convertWidgetSpacing = <B>(block: B): B => {
  const s = (block as WithSpacing).settings
  if (!s?.spacing || s.spacing === 'default') return block
  if ((s.gapTop && s.gapTop !== 'auto') || (s.gapBottom && s.gapBottom !== 'auto')) return block
  const gap = gapFor(s.spacing)
  return { ...block, settings: { ...s, spacing: 'default', gapTop: gap, gapBottom: gap } }
}

/** A whole layout: legacy blocks replaced in place, widget spacing converted, the rest untouched. */
export const splitLegacyLayout = (layout: readonly unknown[]): unknown[] =>
  layout.flatMap((block) => (isLegacyBlock(block) ? splitLegacyBlock(block) : [convertWidgetSpacing(block)]))

export const needsSectionConversion = (layout: readonly unknown[] | null | undefined): boolean =>
  (layout || []).some((block) => isLegacyBlock(block) || convertWidgetSpacing(block) !== block)
```

Note on the tests: `convertWidgetSpacing` on a block whose `spacing` is non-default but whose gaps are already set leaves it alone, so `needsSectionConversion` stays true for it. That only happens if an editor sets gaps on an unconverted widget; the conversion then keeps the editor's gaps. The test "leaves … already-set gaps alone" pins this behaviour.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-legacy.int.spec.ts`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: no errors. If a generated type rejects a literal (for example `size: 'h2'`), compare with `src/payload-types.ts` and use the generated value; do not widen the types with `any`.

- [ ] **Step 5: Commit**

```bash
git add src/sections/legacy.ts tests/int/sections-legacy.int.spec.ts
git commit -m "Sections: pure converter from the legacy structural blocks to section blocks"
```

---

### Task 10: Page conversion runner, dev script, DB test

**Files:**
- Create: `src/sections/convertPages.ts`, `scripts/convert-sections.ts`
- Test: `tests/int/sections-convert-db.int.spec.ts`

**Interfaces:**
- Consumes: `splitLegacyLayout`, `needsSectionConversion` (Task 9).
- Produces:
  - `convertSectionBlocks({ payload, req, pageIds? }): Promise<{ publishedPages: number; draftPages: number }>` (`req` must carry a transaction)
  - `runSectionConversion(payload, { pageIds? }?)`: same, in its own transaction.

- [ ] **Step 1: Write the runner**

`src/sections/convertPages.ts`:

```ts
import { createLocalReq, type Payload, type PayloadRequest, type Where } from 'payload'

import type { Page } from '@/payload-types'
import { locales } from '@/i18n/config'

import { needsSectionConversion, splitLegacyLayout } from './legacy'

/** `allowLegacySections` lets the layout's filterOptions accept pages that still hold old blocks. */
const context = { disableRevalidate: true, allowLegacySections: true }

/** Everything a page save needs back, minus the fields Payload manages itself. */
const pageData = ({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data }: Page) => data

/**
 * Rewrites every page whose published version or pending draft still holds legacy section blocks
 * or old widget spacing. As in `convertInlineTestimonials`, published and draft states are saved
 * separately and in full per locale: the published page stays published without picking up draft
 * edits, and the draft stays a draft on top. Block ids derive from the old ids, so each locale
 * pass fills the same rows. Idempotent. `req` must carry a transaction (a migration's does;
 * scripts and tests use `runSectionConversion`). `pageIds` limits the pages (tests).
 */
export const convertSectionBlocks = async ({ payload, req, pageIds }: { payload: Payload; req: PayloadRequest; pageIds?: (number | string)[] }) => {
  const read = { collection: 'pages', depth: 0, overrideAccess: true, showHiddenFields: true, req, context } as const
  const where: Where | undefined = pageIds ? { id: { in: pageIds } } : undefined
  const [primary] = locales
  const main = await payload.find({ ...read, where, locale: primary, pagination: false, draft: false })
  const latest = await payload.find({ ...read, where, locale: primary, pagination: false, draft: true })
  const ids = [...new Set([...main.docs, ...latest.docs].filter((d) => needsSectionConversion(d.layout)).map((d) => d.id))]

  let publishedPages = 0
  let draftPages = 0
  for (const id of ids) {
    // Read both states per locale before writing anything: the first write replaces the latest version.
    // `fallbackLocale: false` so an empty translation is not saved back as a copy of the default locale.
    // Sequential, not Promise.all: every call shares the one transaction connection.
    const readAll = async (draft: boolean) => {
      const docs: Page[] = []
      for (const locale of locales) docs.push(await payload.findByID({ ...read, id, locale, fallbackLocale: false, draft }))
      return docs
    }
    const publishedDocs = await readAll(false)
    const draftDocs = await readAll(true)
    const convert = (doc: Page) => ({ ...pageData(doc), layout: splitLegacyLayout(doc.layout || []) as Page['layout'] })

    if (publishedDocs[0]._status === 'published') {
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id, locale, fallbackLocale: false, data: { ...convert(publishedDocs[i]), _status: 'published' }, req, context })
      }
      publishedPages++
    }
    // Publishing made the published doc the latest version, so a pending draft is saved again on top.
    if (draftDocs[0]._status === 'draft') {
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id, locale, fallbackLocale: false, draft: true, data: { ...convert(draftDocs[i]), _status: 'draft' }, req, context })
      }
      draftPages++
    }
  }
  return { publishedPages, draftPages }
}

/** Runs the conversion in one transaction for callers that have none (the dev script, tests). */
export const runSectionConversion = async (payload: Payload, { pageIds }: { pageIds?: (number | string)[] } = {}) => {
  const req = await createLocalReq({ context }, payload)
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('[sections] the database adapter did not start a transaction')
  req.transactionID = transactionID
  try {
    const result = await convertSectionBlocks({ payload, req, pageIds })
    await payload.db.commitTransaction(transactionID)
    return result
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
```

`scripts/convert-sections.ts`:

```ts
/**
 * Converts the legacy structural blocks (and old widget spacing) on every page into section blocks:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/convert-sections.ts
 * Safe to run again. One transaction: any error rolls everything back and exits non-zero.
 * Production runs the same step inside the section_blocks migration.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { runSectionConversion } from '../src/sections/convertPages'

const payload = await getPayload({ config })
try {
  const result = await runSectionConversion(payload)
  payload.logger.info(`[sections] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error, msg: '[sections] conversion failed, rolled back' })
  process.exit(1)
}
```

- [ ] **Step 2: Write the DB test**

`tests/int/sections-convert-db.int.spec.ts`:

```ts
// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Page } from '@/payload-types'
import { runSectionConversion } from '@/sections/convertPages'

// Writes to the database in DATABASE_URL, so it is opt-in: SECTIONS_DB_TEST=1 and never the shared
// dev DB (`payload`). The conversion is scoped to the fixture page, which is deleted in afterAll.
const databaseName = (() => {
  try {
    return new URL(process.env.DATABASE_URL || '').pathname.slice(1)
  } catch {
    return ''
  }
})()
const enabled = process.env.SECTIONS_DB_TEST === '1' && databaseName !== '' && databaseName !== 'payload'
const describeDb = enabled ? describe : describe.skip

const run = `${Date.now()}`
const slug = `sections-db-fixture-${run}`
const context = { disableRevalidate: true, allowLegacySections: true }
type Loose = Record<string, any>

const story = (heading: string, lead: string) => ({
  blockType: 'featureStory',
  header: { eyebrow: 'Eyebrow', heading, lead, align: 'left' },
  layout: 'stacked',
  visual: { type: 'illustration', illustration: 'builder' },
  points: [{ icon: 'chart', title: `${heading} point`, text: 'Text' }],
  links: [{ link: { type: 'custom', url: '/contact', label: `${heading} link`, appearance: 'default' } }],
  settings: { background: 'default', spacing: 'compact', anchor: 'story' },
})

describeDb(`convertSectionBlocks against the database${enabled ? '' : ' (skipped: needs SECTIONS_DB_TEST=1 and a DATABASE_URL other than /payload)'}`, () => {
  let payload: Payload
  let pageId: number
  let first: Awaited<ReturnType<typeof runSectionConversion>>

  const read = (draft: boolean, locale: 'de' | 'en') =>
    payload.findByID({ collection: 'pages', id: pageId, locale, draft, depth: 0, showHiddenFields: true, context }) as unknown as Promise<Page>

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const created = await payload.create({
      collection: 'pages',
      locale: 'de',
      context,
      data: { title: `Sections ${run}`, slug, _status: 'published', layout: [story('Titel DE', 'Einleitung DE'), { blockType: 'ctaSection', header: { heading: 'Abschluss DE' }, links: [] }] } as never,
    })
    pageId = created.id
    // Same block and row ids, English values.
    const de = created as unknown as Loose
    await payload.update({
      collection: 'pages', id: pageId, locale: 'en', context,
      data: {
        _status: 'published',
        layout: [
          { ...de.layout[0], header: { ...de.layout[0].header, heading: 'Title EN', lead: 'Lead EN' }, points: [{ ...de.layout[0].points[0], title: 'Point EN' }], links: [{ ...de.layout[0].links[0], link: { ...de.layout[0].links[0].link, label: 'Link EN' } }] },
          { ...de.layout[1], header: { heading: 'Closing EN' } },
        ],
      } as never,
    })
    // A pending German draft that edits the closing heading.
    const published = await read(false, 'de')
    const layout = (published.layout || []) as Loose[]
    await payload.update({ collection: 'pages', id: pageId, locale: 'de', draft: true, context, data: { _status: 'draft', layout: [layout[0], { ...layout[1], header: { heading: 'Abschluss Entwurf' } }] } as never })

    first = await runSectionConversion(payload, { pageIds: [pageId] })
  })

  afterAll(async () => {
    if (payload && pageId) await payload.delete({ collection: 'pages', id: pageId, context })
  })

  it('converts the published page and its draft', () => {
    expect(first).toEqual({ publishedPages: 1, draftPages: 1 })
  })

  it('published, German: the section blocks in order, with values and settings', async () => {
    const layout = (await read(false, 'de')).layout as Loose[]
    expect(layout.map((b) => b.blockType)).toEqual(['heading', 'media', 'items', 'actions', 'heading'])
    expect(layout[0].header).toMatchObject({ heading: 'Titel DE', lead: 'Einleitung DE', align: 'left' })
    expect(layout[0].settings).toMatchObject({ gapTop: 'tight', anchor: 'story' })
    expect(layout[3].settings).toMatchObject({ gapBottom: 'tight' })
    expect(layout[4]).toMatchObject({ size: 'display', header: { heading: 'Abschluss DE', align: 'center' } })
  })

  it('published, English: every localised value survived', async () => {
    const layout = (await read(false, 'en')).layout as Loose[]
    expect(layout[0].header).toMatchObject({ heading: 'Title EN', lead: 'Lead EN' })
    expect(layout[2].items[0].title).toBe('Point EN')
    expect(layout[3].links[0].link.label).toBe('Link EN')
    expect(layout[4].header.heading).toBe('Closing EN')
  })

  it('the draft keeps its edit and stays a draft', async () => {
    const draft = await read(true, 'de')
    expect(draft._status).toBe('draft')
    expect((draft.layout as Loose[])[4].header.heading).toBe('Abschluss Entwurf')
    expect((await read(false, 'de'))._status).toBe('published')
  })

  it('running it again changes nothing', async () => {
    expect(await runSectionConversion(payload, { pageIds: [pageId] })).toEqual({ publishedPages: 0, draftPages: 0 })
  })
})
```

- [ ] **Step 3: Run the DB test against a scratch database**

The template copy needs the dev app stopped (no open connections to `payload`):

```bash
docker compose stop app
docker exec indicate-datacomdemo-postgres-1 psql -U payload -d postgres -c "CREATE DATABASE sections_test TEMPLATE payload"
docker compose start app
SECTIONS_DB_TEST=1 DATABASE_URL=postgres://payload:payload@localhost:5433/sections_test pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-convert-db.int.spec.ts
```

Expected: PASS (5 tests). Payload pushes the new schema into `sections_test` on start; that is expected there.

Then drop it: `docker exec indicate-datacomdemo-postgres-1 psql -U payload -d postgres -c "DROP DATABASE sections_test"`

- [ ] **Step 4: Run the default test suite (DB test skipped)**

Run: `pnpm test:int`
Expected: PASS, with `sections-convert-db` reported as skipped.

- [ ] **Step 5: Commit**

```bash
git add src/sections/convertPages.ts scripts/convert-sections.ts tests/int/sections-convert-db.int.spec.ts
git commit -m "Sections: convert published and draft pages per locale; dev script and DB test"
```

---

### Task 11: Seed through the converter

**Files:**
- Modify: `src/endpoints/seed/index.ts` (`upsertPage`), `src/endpoints/seed/pages.ts`, `src/endpoints/seed/content.ts`, `src/endpoints/seed/about.ts`

**Interfaces:**
- Consumes: `splitLegacyLayout`, `LegacyBlock` (Task 9).
- Produces: `type SeedBlock` and `type SeedPage` exported from `src/endpoints/seed/pages.ts`; every seeded layout passes through `splitLegacyLayout` before it is written.

- [ ] **Step 1: Route layouts through the converter in `upsertPage`**

In `src/endpoints/seed/index.ts` add `import { splitLegacyLayout } from '@/sections/legacy'` and, at the top of `upsertPage`, wrap `build`:

```ts
  // Seed content may still use the legacy section shapes; write what the migration would produce.
  const buildConverted = (locale: Locale): AnyData => {
    const data = build(locale)
    return Array.isArray(data.layout) ? { ...data, layout: splitLegacyLayout(data.layout) } : data
  }
```

Replace every `build(primary)` / `build(locale)` inside `upsertPage` with `buildConverted(primary)` / `buildConverted(locale)`. `withIds` copies ids by position from the primary doc, so the per-locale updates keep matching rows as before.

- [ ] **Step 2: Type seed layouts as legacy-or-current blocks**

In `src/endpoints/seed/pages.ts`:

```ts
import type { IconKey } from '@/components/Icon/options'
import type { LegacyBlock } from '@/sections/legacy'

type PageData = Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>
/** A block as the seed writes it: a current block or a legacy section block (converted on write). */
export type SeedBlock = PageData['layout'][number] | LegacyBlock
export type SeedPage = Omit<Partial<PageData>, 'layout'> & { layout?: SeedBlock[] }
type Block = SeedBlock
```

Delete the old `type IconKey = …steps…` line (the import replaces it). Change the return types `Partial<PageData>` to `SeedPage` for `page(...)` and `subpages(...)` (`Record<SubpageSlug, SeedPage>`). In `src/endpoints/seed/content.ts` change `homePage` (and any other builder whose `layout` holds `featureStory`, `integrations`, `pillars` or `ctaSection`) to return `SeedPage`, imported from `./pages`. Same for `aboutPage` in `src/endpoints/seed/about.ts`.

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no errors. A mismatch means a seed literal differs from the `Legacy*` type; compare the literal with the matching `Legacy*` type in `src/sections/legacy.ts` and with the old block's `config.ts`. If the seed is right and the `Legacy*` type is too narrow, widen that one field in `legacy.ts` to what the old config allowed; never silence it with `as never`.

- [ ] **Step 4: Add a seed conversion test**

Append to `tests/int/sections-legacy.int.spec.ts` (add `import { pick } from '@/endpoints/seed/content'`, `import { subpages } from '@/endpoints/seed/pages'`, `import { homePage } from '@/endpoints/seed/content'`, `import { legacySectionSlugs } from '@/blocks/registry'`):

```ts
describe('seed', () => {
  const refs = { contactPageId: 1, aboutPageId: 2, pricingPageId: 3, pages: {}, legal: {}, media: {}, links: { demoUrl: 'https://demo' }, testimonialTags: {} } as never

  it('every seeded layout converts to blocks without legacy slugs', () => {
    const layouts = [homePage(pick('de'), refs).layout || [], ...Object.values(subpages(pick('de'), refs)).map((p) => p.layout || [])]
    for (const layout of layouts) {
      const converted = splitLegacyLayout(layout) as { blockType: string }[]
      expect(converted.filter((b) => (legacySectionSlugs as readonly string[]).includes(b.blockType))).toEqual([])
    }
  })
})
```

If `homePage` or `subpages` needs more `refs` fields at runtime, add them to the literal with the same placeholder values as the existing ones (numbers or `{}`).

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/sections-legacy.int.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed/index.ts src/endpoints/seed/pages.ts src/endpoints/seed/content.ts src/endpoints/seed/about.ts tests/int/sections-legacy.int.spec.ts
git commit -m "Seed: write section blocks by passing layouts through the converter"
```

---

### Task 12: Phase 1 migration, dev conversion, visual check, e2e

**Files:**
- Create: `src/migrations/<stamp>_section_blocks.ts` and `.json` (generated), `tests/e2e/sections.e2e.spec.ts`
- Modify: `src/migrations/index.ts` (generated)

**Interfaces:**
- Consumes: `convertSectionBlocks` (Task 10), `scripts/screenshot-pages.ts` (Task 1).

- [ ] **Step 1: Generate the migration**

Run: `make migration NAME=section_blocks`
Expected: `src/migrations/<stamp>_section_blocks.ts` and `.json`, and `src/migrations/index.ts` updated.

Review the SQL: it must create the tables of `heading`, `media`, `items`, `actions`, `integration_tree`, `split` (plus `_pages_v_*` copies), add `settings_gap_top` / `settings_gap_bottom` to every block table, add the enum value `right` for header align, and drop NOT NULL on the widget heading columns if Payload emits that. It must contain **no** `DROP TABLE` and no `DROP COLUMN`. If it does, stop and find which config change caused it.

- [ ] **Step 2: Add the data step**

At the top of the migration add `import { convertSectionBlocks } from '../sections/convertPages'`, and at the end of `up` (after the generated `db.execute`):

```ts
  // Convert the legacy structural blocks and old widget spacing into section blocks (idempotent,
  // published and draft states per locale, inside this migration's transaction). A database
  // without pages (a fresh install) skips it: the current config may already expect columns that
  // later migrations add.
  const pages = await db.execute(sql`SELECT 1 FROM "pages" LIMIT 1`)
  if (pages.rows.length === 0) {
    payload.logger.info('[sections] no pages to convert')
    return
  }
  const result = await convertSectionBlocks({ payload, req })
  payload.logger.info(`[sections] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
```

Above `export async function down` add:

```ts
// Schema only. The converted content lives in the new tables, so a down loses it; roll back a
// deploy of this migration by restoring the pre-deploy database backup instead.
```

- [ ] **Step 3: Convert the dev database**

First back it up: `scripts/db-backup.sh` (writes `backups/payload-<stamp>.dump`; note the stamp). The dev app already pushed the new schema. Run:

```bash
NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload ./node_modules/.bin/payload run scripts/convert-sections.ts
```

Expected: `[sections] converted N published pages and M drafts` with N ≥ 15; exit 0. Run it again: `converted 0 published pages and 0 drafts`.

Check: `docker exec indicate-datacomdemo-postgres-1 psql -U payload -d payload -Atc "select count(*) from pages_blocks_feature_story"`
Expected: `0`.

- [ ] **Step 4: Screenshots after and compare**

Run: `pnpm exec tsx scripts/screenshot-pages.ts /tmp/sections-after`
Open each pair from `/tmp/sections-before` and `/tmp/sections-after` (Read tool on both PNGs) and check:
- Same sections in the same order on every page, same texts, same buttons, both locales.
- Intended differences only: the "Warum Indicate" heading now sits above its panel and the tiles are a second panel; a few gaps inside former blocks shift by up to 1rem; Integrations buttons are the default size instead of large.
- Anything else (a missing section, a wrong background, an empty gap of a full section inside a group, a broken mobile layout) is a bug: fix it in the component or converter, re-run the dev conversion only if the converter changed (first `docker compose stop app && scripts/db-restore.sh <stamp from Step 3> && docker compose start app`), and re-take the screenshots.

- [ ] **Step 5: Write the e2e test**

`tests/e2e/sections.e2e.spec.ts`:

```ts
import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { presetConsent } from '../helpers/consent'

const base = 'http://localhost:3000'
const run = `${Date.now()}`
const context = { disableRevalidate: true }
const link = (label: string, appearance: 'default' | 'outline' | 'link') => ({ link: { type: 'custom', url: '/contact', label, appearance } })

test.describe('Section blocks', () => {
  let payload: Payload

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    await payload.create({
      collection: 'pages', locale: 'de', context,
      data: {
        title: `Sections e2e ${run}`, slug: `sections-e2e-${run}`, _status: 'published',
        layout: [
          { blockType: 'heading', header: { eyebrow: 'Für Hotels', heading: `Links ${run}`, lead: 'Einleitung rechts', align: 'left' }, links: [link('Demo', 'default')] },
          { blockType: 'media', visual: { type: 'illustration', illustration: 'dashboard' } },
          { blockType: 'items', style: 'points', divider: true, items: [1, 2, 3, 4].map((n) => ({ icon: 'chart', title: `Punkt ${n}`, text: 'Text' })) },
          { blockType: 'actions', links: [link('Mehr', 'link')] },
          { blockType: 'heading', header: { heading: `Rechts ${run}`, lead: 'Einleitung links', align: 'right' } },
        ],
      } as never,
    })
  })

  test.afterAll(async () => {
    await payload.delete({ collection: 'pages', where: { slug: { equals: `sections-e2e-${run}` } }, context })
  })

  test('renders the group with automatic gaps and both heading variants', async ({ page, context: browser }) => {
    await presetConsent(browser)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${base}/de/sections-e2e-${run}`)

    await expect(page.getByRole('heading', { level: 1, name: `Links ${run}` })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Demo' })).toBeVisible()
    await expect(page.getByText('Punkt 4')).toBeVisible()

    const pads = await page.locator('main section').evaluateAll((els) => els.map((el) => [getComputedStyle(el).paddingTop, getComputedStyle(el).paddingBottom]))
    // heading → media → items → actions form one group (md: normal 112px, tight 48px); the second heading opens a new one.
    expect(pads.slice(-5)).toEqual([['112px', '0px'], ['48px', '0px'], ['48px', '0px'], ['48px', '112px'], ['112px', '112px']])

    // Right variant: the lead sits left of the heading.
    const lead = await page.getByText('Einleitung links').boundingBox()
    const heading = await page.getByRole('heading', { name: `Rechts ${run}` }).boundingBox()
    expect(lead!.x).toBeLessThan(heading!.x)
  })

  test('on a phone the right variant stacks heading above lead', async ({ page, context: browser }) => {
    await presetConsent(browser)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${base}/de/sections-e2e-${run}`)
    const lead = await page.getByText('Einleitung links').boundingBox()
    const heading = await page.getByRole('heading', { name: `Rechts ${run}` }).boundingBox()
    expect(heading!.y).toBeLessThan(lead!.y)
  })
})
```

If the page wraps blocks in something other than `main section`, adjust the locator to the element `<Section>` renders (a `section` with `data-group-start` on group starts) and keep the expectations.

Run: `pnpm exec playwright test --config=playwright.config.ts tests/e2e/sections.e2e.spec.ts tests/e2e/block-tools.e2e.spec.ts tests/e2e/frontend.e2e.spec.ts`
Expected: PASS.

- [ ] **Step 6: Full checks**

Run: `pnpm test:int` → PASS. Run: `pnpm exec tsc --noEmit` → no errors. Run: `pnpm lint` → no new errors.

- [ ] **Step 7: Commit**

```bash
git add src/migrations tests/e2e/sections.e2e.spec.ts
git commit -m "Migration: section blocks, with the conversion of existing pages"
```

Phase 1 is complete here and is deployed on its own (`make ship`, then the Ansible rollout). Before the deploy, tell the rollout owner: the migration rewrites every page in one transaction; take the usual pre-deploy backup, because a rollback means restoring it.

---

## Phase 2 (separate deploy, after phase 1 is live)

### Task 13: Remove the legacy blocks and the old spacing field

**Files:**
- Delete: `src/blocks/FeatureStory/`, `src/blocks/CtaSection/`, `src/blocks/Pillars/`, `src/blocks/CardGrid/`, `src/blocks/Steps/`, `src/blocks/Stats/`, `src/blocks/Integrations/`
- Modify: `src/collections/Pages/index.ts`, `src/blocks/registry.ts`, `src/blocks/RenderBlocks.tsx`, `src/fields/sectionSettings.ts`, `src/sections/legacy.ts`, `src/endpoints/seed/pages.ts`, `src/endpoints/seed/content.ts`, `src/endpoints/seed/about.ts`, `tests/int/blocks.int.spec.ts`, `tests/int/sections-heading.int.spec.tsx`
- Create: `src/migrations/<stamp>_drop_legacy_section_blocks.{ts,json}` (generated)

**Interfaces:**
- Consumes: everything from phase 1.
- Produces: `legacySectionSlugs` moves from `src/blocks/registry.ts` into `src/sections/legacy.ts` (the seed and converter still use it; the registry no longer lists these blocks).

- [ ] **Step 1: Confirm production ran phase 1**

On the production database (ask the rollout owner or use the Ansible host), check that the `section_blocks` migration is recorded in `payload_migrations` and that `select count(*) from pages_blocks_feature_story` is 0. Do not continue otherwise.

- [ ] **Step 2: Remove the code**

- Delete the seven block directories.
- `src/collections/Pages/index.ts`: remove their imports and list entries; remove `filterOptions` from `layout`.
- `src/blocks/registry.ts`: remove the seven slugs from `blockSlugs` and delete `legacySectionSlugs`.
- `src/sections/legacy.ts`: replace the registry import with a local `export const legacySectionSlugs = ['featureStory', 'ctaSection', 'pillars', 'cardGrid', 'steps', 'stats', 'integrations'] as const`.
- `src/blocks/RenderBlocks.tsx`: remove the seven imports and map entries.
- `src/fields/sectionSettings.ts`: delete the hidden `spacing` field and its comment.
- `src/sections/legacy.ts`: `convertWidgetSpacing` keeps working on seed data (it reads `spacing` from untyped input); leave it.
- Seed: replace `spacing: 'compact'` with `gapTop: 'tight', gapBottom: 'tight'`, `spacing: 'none'` with `gapTop: 'none', gapBottom: 'none'`, and drop `spacing: 'default'` in current (non-legacy) blocks; `defaults` in `pages.ts` becomes `{ background: 'default' as const }`. Legacy literals (typed `Legacy*`) keep their `spacing`.
- Tests: in `tests/int/blocks.int.spec.ts` delete the "legacy section blocks" describe and `findLayoutField`; in `tests/int/sections-heading.int.spec.tsx` expect `['background', 'gapTop', 'gapBottom', 'anchor']` and drop the hidden-spacing assertion. Update the `legacySectionSlugs` import in `tests/int/sections-legacy.int.spec.ts` to `@/sections/legacy`.

- [ ] **Step 3: Regenerate and check**

Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:types`
Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:importmap`
Run: `pnpm exec tsc --noEmit` → no errors. Run: `pnpm test:int` → PASS.

- [ ] **Step 4: Generate the drop migration and add the guard**

Run: `make migration NAME=drop_legacy_section_blocks`
Review: it drops the fourteen `pages_blocks_*` / `_pages_v_blocks_*` tables of the seven blocks (and their child tables and enums) and the `settings_spacing` columns and enums; nothing else.

At the top of `up`, before the generated SQL:

```ts
  // Refuse to drop blocks that are still in use: that happens when this image is deployed without
  // the phase 1 release (section_blocks) having converted the pages first.
  const left = await db.execute(sql`
    SELECT 1 FROM "pages_blocks_feature_story" UNION ALL SELECT 1 FROM "pages_blocks_cta_section"
    UNION ALL SELECT 1 FROM "pages_blocks_pillars" UNION ALL SELECT 1 FROM "pages_blocks_card_grid"
    UNION ALL SELECT 1 FROM "pages_blocks_steps" UNION ALL SELECT 1 FROM "pages_blocks_stats"
    UNION ALL SELECT 1 FROM "pages_blocks_integrations"
    UNION ALL SELECT 1 FROM "_pages_v_blocks_feature_story" b JOIN "_pages_v" v ON v."id" = b."_parent_id" WHERE v."latest"
    UNION ALL SELECT 1 FROM "_pages_v_blocks_cta_section" b JOIN "_pages_v" v ON v."id" = b."_parent_id" WHERE v."latest"
    UNION ALL SELECT 1 FROM "_pages_v_blocks_pillars" b JOIN "_pages_v" v ON v."id" = b."_parent_id" WHERE v."latest"
    UNION ALL SELECT 1 FROM "_pages_v_blocks_card_grid" b JOIN "_pages_v" v ON v."id" = b."_parent_id" WHERE v."latest"
    UNION ALL SELECT 1 FROM "_pages_v_blocks_steps" b JOIN "_pages_v" v ON v."id" = b."_parent_id" WHERE v."latest"
    UNION ALL SELECT 1 FROM "_pages_v_blocks_stats" b JOIN "_pages_v" v ON v."id" = b."_parent_id" WHERE v."latest"
    UNION ALL SELECT 1 FROM "_pages_v_blocks_integrations" b JOIN "_pages_v" v ON v."id" = b."_parent_id" WHERE v."latest"
    LIMIT 1`)
  if (left.rows.length > 0) {
    throw new Error('[sections] legacy section blocks are still in use; deploy the phase 1 release (section_blocks migration) first')
  }
```

Older version-history rows are dropped with the tables (accepted in the spec).

- [ ] **Step 5: Apply the drop to the dev database by hand**

The TTY-less dev push cannot drop populated tables, so do it before the app sees the new config:

1. `docker compose stop app`
2. Copy the SQL statements of the migration's `up` (the generated part, not the guard) into `/tmp/drop-legacy.sql`, wrapped in `BEGIN;` … `COMMIT;`.
3. `docker exec -i indicate-datacomdemo-postgres-1 psql -U payload -d payload -v ON_ERROR_STOP=1 < /tmp/drop-legacy.sql`
4. `docker compose start app`, wait for it to come up, and check its log has no push prompt: `docker compose logs --tail 50 app`.

- [ ] **Step 6: Verify**

Run: `pnpm exec tsx scripts/screenshot-pages.ts /tmp/sections-phase2` and compare with `/tmp/sections-after`: identical.
Run: `pnpm exec playwright test --config=playwright.config.ts tests/e2e/sections.e2e.spec.ts tests/e2e/block-tools.e2e.spec.ts` → PASS.
Run: `pnpm lint` → no new errors.

- [ ] **Step 7: Commit**

```bash
git add -u src/blocks src/collections/Pages/index.ts src/fields/sectionSettings.ts src/sections/legacy.ts src/endpoints/seed tests/int src/payload-types.ts "src/app/(payload)/admin/importMap.js"
git add src/migrations
git commit -m "Sections phase 2: remove the legacy structural blocks and the old spacing field"
```

(`git add -u src/blocks` stages the deleted directories; check `git status` shows no unrelated files before committing.)
