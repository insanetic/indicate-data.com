# Legal Document Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A reusable "document with sidebar" page layout (CMS block + sidebar collection), the six legal documents migrated verbatim from indicate-data.io in German and English, and a new marketing-style About page.

**Architecture:** A new `sidebars` collection holds grouped link lists. A new `document` layout block (header, meta dates, binding language, rich-text body, optional sidebar relationship, change history) is rendered by server components: sticky sidebar nav, article with anchored headings, sticky table of contents with scroll-spy, translation notice, print styles. Content is seeded through the existing idempotent seed script from a small markdown-to-Lexical helper.

**Tech Stack:** Payload 3.89 (Postgres, Lexical), Next 16 App Router, React server/client components, Tailwind v4 utilities from `globals.css`, vitest (`tests/int/*.int.spec.ts`, jsdom), Playwright for screenshots.

**Spec:** `docs/superpowers/specs/2026-09-13-legal-document-pages-design.md`

## Global Constraints

- Schema changes must be additive only (new collection, new block, new fields). Never rename or remove a field: the dev server runs in Docker without a TTY and hangs on destructive pushes.
- All CMS text fields are localised (`localized: true`) except dates, version, binding language and internal titles.
- Legal texts are copied verbatim from indicate-data.io; only typos fixed (e.g. "hat die deutschen Version" → "hat die deutsche Version"). No rewording.
- The About page must never mention team size or headcount and must contain no invented numbers.
- Copy tone: German formal second person ("Sie"), short sentences, no negative copy, no em dashes in UI copy.
- Motion: no reveal animations on document pages; marker transitions 200 ms, none under `prefers-reduced-motion`.
- Run from repo root. Type check: `pnpm exec tsc --noEmit`. Unit tests: `pnpm test:int` (or `pnpm exec vitest run --config ./vitest.config.mts tests/int/<file>`). Lint: `pnpm lint`.
- Regenerate types after schema changes: `pnpm generate:types` (writes `src/payload-types.ts`).
- Seeding from the host: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload ./node_modules/.bin/payload run scripts/seed.ts`, then `docker exec indicate-datacomdemo-app-1 rm -rf /app/.next/dev/cache/fetch-cache && docker compose restart app`.
- `git add` only the paths listed in each task. Other uncommitted changes in the tree (integration directory work) belong to a parallel effort; if a listed shared file (`registry.ts`, `RenderBlocks.tsx`, `Pages/index.ts`, seed files, `payload-types.ts`) also carries foreign hunks, commit it anyway and say so in the commit body.

---

## File structure

| Path | Responsibility |
|---|---|
| `src/utilities/lexical/headings.ts` | `slugify`, `HeadingIds`, `nodeText`, `extractHeadings` over Lexical JSON |
| `src/endpoints/seed/lexical.ts` | existing `paragraphs()`, new `richText(md)` markdown-subset → Lexical |
| `src/collections/Sidebars/index.ts`, `RowLabel.tsx` | `sidebars` collection |
| `src/blocks/Document/config.ts` | `document` block fields |
| `src/blocks/Document/Component.tsx` | server composition of the document layout |
| `src/components/DocumentLayout/SidebarNav.tsx` | client: grouped links, current page marker, contact card, mobile disclosure |
| `src/components/DocumentLayout/Toc.tsx` | client: on-page TOC with scroll-spy |
| `src/components/DocumentLayout/DocumentMeta.tsx` | server: dates, version, language tag |
| `src/components/DocumentLayout/TranslationNotice.tsx` | server: notice + `shouldShowTranslationNotice` |
| `src/components/RichText/index.tsx` | `headingIds` option: ids + hover anchor on headings |
| `src/i18n/dictionaries.ts` | new UI strings |
| `src/app/(frontend)/globals.css` | `.prose-document`, heading anchors, print styles |
| `src/endpoints/seed/legal.ts` | six legal documents DE/EN + sidebar seed |
| `src/endpoints/seed/about.ts` | About page seed |
| `src/endpoints/seed/index.ts`, `content.ts` | wiring, footer links |
| `tests/int/lexical-headings.int.spec.ts`, `tests/int/seed-richtext.int.spec.ts`, `tests/int/translation-notice.int.spec.ts` | unit tests |

---

### Task 1: Heading extraction utilities

**Files:**
- Create: `src/utilities/lexical/headings.ts`
- Test: `tests/int/lexical-headings.int.spec.ts`

**Interfaces:**
- Produces:
  - `slugify(text: string): string`
  - `class HeadingIds { next(text: string): string }` (unique ids per document)
  - `nodeText(node: LexicalNode): string`
  - `extractHeadings(doc?: { root?: LexicalNode } | null): DocHeading[]` where `DocHeading = { id: string; text: string; level: 2 | 3 }`

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/lexical-headings.int.spec.ts
import { describe, expect, it } from 'vitest'

import { HeadingIds, extractHeadings, slugify } from '@/utilities/lexical/headings'

const h = (tag: 'h2' | 'h3' | 'h4', text: string) => ({
  type: 'heading',
  tag,
  children: [{ type: 'text', text }],
})
const p = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] })

describe('slugify', () => {
  it('lowercases, strips accents and punctuation', () => {
    expect(slugify('Haftung für Links')).toBe('haftung-fur-links')
    expect(slugify('1. Geltungsbereich')).toBe('1-geltungsbereich')
    expect(slugify('Größe & Maß')).toBe('grosse-mass')
    expect(slugify('   ')).toBe('abschnitt')
  })
})

describe('HeadingIds', () => {
  it('de-duplicates with a counter', () => {
    const ids = new HeadingIds()
    expect(ids.next('Kontakt')).toBe('kontakt')
    expect(ids.next('Kontakt')).toBe('kontakt-2')
    expect(ids.next('Kontakt')).toBe('kontakt-3')
  })
})

describe('extractHeadings', () => {
  it('returns h2 and h3 with ids in document order, skipping h4', () => {
    const doc = { root: { type: 'root', children: [h('h2', 'Eins'), p('x'), h('h3', 'Eins'), h('h4', 'Tief'), h('h2', 'Zwei')] } }
    expect(extractHeadings(doc)).toEqual([
      { id: 'eins', text: 'Eins', level: 2 },
      { id: 'eins-2', text: 'Eins', level: 3 },
      { id: 'zwei', text: 'Zwei', level: 2 },
    ])
  })

  it('handles empty documents', () => {
    expect(extractHeadings(null)).toEqual([])
    expect(extractHeadings({ root: { type: 'root', children: [] } })).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lexical-headings.int.spec.ts`
Expected: FAIL, cannot resolve `@/utilities/lexical/headings`.

- [ ] **Step 3: Implement**

```ts
// src/utilities/lexical/headings.ts
export type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  children?: LexicalNode[]
}

export type DocHeading = { id: string; text: string; level: 2 | 3 }

/** URL-safe id from heading text: lowercase ASCII, hyphens, never empty. */
export const slugify = (text: string): string => {
  const slug = text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'abschnitt'
}

/** Hands out unique ids for one document: `kontakt`, `kontakt-2`, `kontakt-3`. */
export class HeadingIds {
  private seen = new Map<string, number>()

  next(text: string): string {
    const base = slugify(text)
    const count = (this.seen.get(base) || 0) + 1
    this.seen.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  }
}

/** Concatenated text of a node and its descendants. */
export const nodeText = (node: LexicalNode): string =>
  typeof node.text === 'string' ? node.text : (node.children || []).map(nodeText).join('')

const LEVELS: Record<string, 2 | 3> = { h2: 2, h3: 3 }

/**
 * h2/h3 headings of a Lexical document with the same ids `RichText` renders
 * (both use `HeadingIds`, so the TOC and the anchors always match).
 */
export const extractHeadings = (doc?: { root?: LexicalNode } | null): DocHeading[] => {
  if (!doc?.root) return []
  const ids = new HeadingIds()
  const out: DocHeading[] = []
  const walk = (node: LexicalNode) => {
    if (node.type === 'heading' && node.tag) {
      const text = nodeText(node).trim()
      const level = LEVELS[node.tag]
      // Every heading consumes an id so numbering matches RichText, which ids h4 too.
      const id = ids.next(text)
      if (level) out.push({ id, text, level })
      return
    }
    for (const child of node.children || []) walk(child)
  }
  walk(doc.root)
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/lexical-headings.int.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utilities/lexical/headings.ts tests/int/lexical-headings.int.spec.ts
git commit -m "feat(lexical): heading ids and table-of-contents extraction"
```

---

### Task 2: Markdown-subset seed helper `richText()`

**Files:**
- Modify: `src/endpoints/seed/lexical.ts`
- Test: `tests/int/seed-richtext.int.spec.ts`

**Interfaces:**
- Produces: `richText(md: string)` returning a Lexical document `{ root: { ... } }` usable as any `richText` field value in the seed.
- Grammar (blocks separated by blank lines): `## `, `### `, `#### ` headings; lines starting `- ` bullet list; lines starting `N. ` numbered list; `> ` quote; `---` horizontal rule; lines starting `|` pipe table (first row header, a `|---|` separator row is ignored); anything else paragraph (consecutive lines joined with a space). Inline: `**bold**`, `[label](url)`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/seed-richtext.int.spec.ts
import { describe, expect, it } from 'vitest'

import { richText } from '@/endpoints/seed/lexical'

describe('richText seed helper', () => {
  it('converts headings, paragraphs, lists, rules and quotes', () => {
    const doc = richText(`## Titel

Ein Absatz
über zwei Zeilen.

- eins
- zwei

1. erstens
2. zweitens

---

> Zitat`)
    const types = doc.root.children.map((n) => n.type)
    expect(types).toEqual(['heading', 'paragraph', 'list', 'list', 'horizontalrule', 'quote'])
    expect(doc.root.children[0]).toMatchObject({ tag: 'h2', children: [{ type: 'text', text: 'Titel' }] })
    expect(doc.root.children[1].children?.[0]).toMatchObject({ text: 'Ein Absatz über zwei Zeilen.' })
    expect(doc.root.children[2]).toMatchObject({ listType: 'bullet', tag: 'ul' })
    expect(doc.root.children[2].children).toHaveLength(2)
    expect(doc.root.children[3]).toMatchObject({ listType: 'number', tag: 'ol' })
    expect(doc.root.children[3].children?.[1]).toMatchObject({ type: 'listitem', value: 2 })
  })

  it('converts bold and links inline', () => {
    const doc = richText('Text mit **fett** und [Link](https://example.com) Ende.')
    const inline = doc.root.children[0].children!
    expect(inline.map((n) => n.type)).toEqual(['text', 'text', 'text', 'link', 'text'])
    expect(inline[1]).toMatchObject({ text: 'fett', format: 1 })
    expect(inline[3]).toMatchObject({
      type: 'link',
      fields: { linkType: 'custom', url: 'https://example.com', newTab: true },
      children: [{ type: 'text', text: 'Link' }],
    })
  })

  it('converts pipe tables with a header row', () => {
    const doc = richText(`| Dienst | Daten |
|---|---|
| Google | Sessions |`)
    const table = doc.root.children[0]
    expect(table.type).toBe('table')
    expect(table.children).toHaveLength(2)
    expect(table.children?.[0].children?.[0]).toMatchObject({ type: 'tablecell', headerState: 1 })
    expect(table.children?.[1].children?.[1]).toMatchObject({ type: 'tablecell', headerState: 0 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/seed-richtext.int.spec.ts`
Expected: FAIL, `richText` is not exported.

- [ ] **Step 3: Implement**

Append to `src/endpoints/seed/lexical.ts` (keep the existing `paragraphs` export):

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SeedNode = Record<string, any> & { type: string; children?: SeedNode[] }

const base = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }

const text = (t: string, format = 0): SeedNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text: t,
  version: 1,
})

/** `**bold**` and `[label](url)` inside one line of text. */
export const inline = (line: string): SeedNode[] => {
  const out: SeedNode[] = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  for (const m of line.matchAll(re)) {
    if (m.index! > last) out.push(text(line.slice(last, m.index)))
    if (m[1] !== undefined) out.push(text(m[1], 1))
    else
      out.push({
        type: 'link',
        ...base,
        version: 3,
        fields: { linkType: 'custom', url: m[3], newTab: /^https?:/.test(m[3]) },
        children: [text(m[2])],
      })
    last = m.index! + m[0].length
  }
  if (last < line.length) out.push(text(line.slice(last)))
  return out
}

const paragraph = (line: string): SeedNode => ({ type: 'paragraph', ...base, textFormat: 0, children: inline(line) })

const list = (items: string[], ordered: boolean): SeedNode => ({
  type: 'list',
  ...base,
  listType: ordered ? 'number' : 'bullet',
  tag: ordered ? 'ol' : 'ul',
  start: 1,
  children: items.map((item, i) => ({ type: 'listitem', ...base, value: i + 1, children: inline(item) })),
})

const cell = (content: string, header: boolean): SeedNode => ({
  type: 'tablecell',
  ...base,
  headerState: header ? 1 : 0,
  colSpan: 1,
  rowSpan: 1,
  backgroundColor: null,
  children: [paragraph(content)],
})

const table = (rows: string[]): SeedNode => {
  const cells = rows
    .filter((r) => !/^\|?\s*:?-{2,}/.test(r))
    .map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
  return {
    type: 'table',
    ...base,
    children: cells.map((row, ri) => ({ type: 'tablerow', ...base, children: row.map((c) => cell(c, ri === 0)) })),
  }
}

/**
 * Tiny markdown subset → Lexical, for seeding long documents. Blocks are separated by blank
 * lines: `##`/`###`/`####` headings, `- ` bullets, `1. ` numbers, `> ` quotes, `---` rules,
 * `|` tables, everything else a paragraph. Inline: `**bold**`, `[label](url)`.
 */
export const richText = (md: string): { root: SeedNode } => {
  const blocks = md
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)

  const children: SeedNode[] = blocks.map((block) => {
    const lines = block.split('\n').map((l) => l.trim())
    const first = lines[0]
    const heading = first.match(/^(#{2,4})\s+(.+)$/)
    if (heading && lines.length === 1) {
      return { type: 'heading', ...base, tag: `h${heading[1].length}`, children: inline(heading[2]) }
    }
    if (first === '---') return { type: 'horizontalrule', version: 1 }
    if (lines.every((l) => /^- /.test(l))) return list(lines.map((l) => l.slice(2)), false)
    if (lines.every((l) => /^\d+\. /.test(l))) return list(lines.map((l) => l.replace(/^\d+\. /, '')), true)
    if (lines.every((l) => l.startsWith('|'))) return table(lines)
    if (lines.every((l) => l.startsWith('> '))) {
      return { type: 'quote', ...base, children: inline(lines.map((l) => l.slice(2)).join(' ')) }
    }
    return paragraph(lines.join(' '))
  })

  return { root: { type: 'root', ...base, children } }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/seed-richtext.int.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed/lexical.ts tests/int/seed-richtext.int.spec.ts
git commit -m "feat(seed): markdown-subset to Lexical helper for long documents"
```

---

### Task 3: `sidebars` collection

**Files:**
- Create: `src/collections/Sidebars/index.ts`, `src/collections/Sidebars/RowLabel.tsx`
- Modify: `src/payload.config.ts:69` (collections array)
- Regenerate: `src/payload-types.ts`

**Interfaces:**
- Produces collection slug `sidebars` with fields `title`, `groups[]{ title, links[]{ link } }`, `contact{ enabled, title, text, email }`. Generated type `Sidebar` in `payload-types.ts`.

- [ ] **Step 1: Create the collection**

```ts
// src/collections/Sidebars/index.ts
import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { link } from '@/fields/link'

/**
 * Grouped link lists shown beside long documents (legal, help, company). A page's
 * `document` block picks one; several pages share the same sidebar.
 */
export const Sidebars: CollectionConfig<'sidebars'> = {
  slug: 'sidebars',
  labels: { singular: { de: 'Seitenleiste', en: 'Sidebar' }, plural: { de: 'Seitenleisten', en: 'Sidebars' } },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    group: { de: 'Website', en: 'Site' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: { de: 'Interner Name (z. B. Rechtliches)', en: 'Internal name (e.g. Legal)' },
    },
    {
      name: 'groups',
      type: 'array',
      label: { de: 'Gruppen', en: 'Groups' },
      labels: { singular: { de: 'Gruppe', en: 'Group' }, plural: { de: 'Gruppen', en: 'Groups' } },
      minRows: 1,
      maxRows: 8,
      admin: { components: { RowLabel: '@/collections/Sidebars/RowLabel#GroupRowLabel' } },
      fields: [
        { name: 'title', type: 'text', required: true, localized: true, label: { de: 'Gruppentitel', en: 'Group title' } },
        {
          name: 'links',
          type: 'array',
          label: { de: 'Links', en: 'Links' },
          maxRows: 12,
          admin: { components: { RowLabel: '@/collections/Sidebars/RowLabel#LinkRowLabel' } },
          fields: [link({ appearances: false, localized: true })],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: { de: 'Kontaktkarte am Ende', en: 'Contact card at the end' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: false, label: { de: 'Anzeigen', en: 'Show' } },
        { name: 'title', type: 'text', localized: true, label: { de: 'Titel', en: 'Title' } },
        { name: 'text', type: 'textarea', localized: true, label: { de: 'Text', en: 'Text' } },
        { name: 'email', type: 'email', label: 'E-Mail' },
      ],
    },
  ],
}
```

```tsx
// src/collections/Sidebars/RowLabel.tsx
'use client'

import { useRowLabel } from '@payloadcms/ui'

export const GroupRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <span>{data?.title || `Gruppe ${(rowNumber ?? 0) + 1}`}</span>
}

export const LinkRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ link?: { label?: string } }>()
  return <span>{data?.link?.label || `Link ${(rowNumber ?? 0) + 1}`}</span>
}
```

Compare with `src/Footer/RowLabel.tsx` and copy its import style if it differs.

- [ ] **Step 2: Register and regenerate types**

In `src/payload.config.ts` add `import { Sidebars } from './collections/Sidebars'` and change the collections line to `collections: [Pages, Posts, Media, Categories, Sidebars, Users],`.

Run: `pnpm generate:types && pnpm exec tsc --noEmit`
Expected: `payload-types.ts` gains `export interface Sidebar`, type check passes. Check `grep -n "interface Sidebar" src/payload-types.ts` prints a line.

- [ ] **Step 3: Verify the dev server accepted the schema**

Run: `docker compose logs --tail 40 app`
Expected: no drizzle prompt hanging; if the log shows a prompt or the app is down, run `docker compose restart app` and re-check. New tables `sidebars`, `sidebars_groups`, `sidebars_groups_links` are additive, so no prompt is expected.

- [ ] **Step 4: Commit**

```bash
git add src/collections/Sidebars src/payload.config.ts src/payload-types.ts
git commit -m "feat(cms): sidebars collection for grouped document navigation"
```

---

### Task 4: `document` block config, registration and minimal renderer

**Files:**
- Create: `src/blocks/Document/config.ts`, `src/blocks/Document/Component.tsx` (minimal; completed in Task 8)
- Modify: `src/blocks/registry.ts` (add `'document'`), `src/blocks/RenderBlocks.tsx` (import + map entry), `src/collections/Pages/index.ts` (blocks array)
- Regenerate: `src/payload-types.ts`
- Test: existing `tests/int/blocks.int.spec.ts` must still pass.

**Interfaces:**
- Produces generated type `DocumentBlock` with: `header`, `sidebar?: number | Sidebar | null`, `body`, `meta?: { lastUpdated?, effectiveFrom?, version? }`, `bindingLanguage?: 'none' | 'de' | 'en'`, `history?: { date, note }[]`, `showToc?: boolean`, `settings`.

- [ ] **Step 1: Block config**

```ts
// src/blocks/Document/config.ts
import type { Block } from 'payload'
import {
  BlockquoteFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

/** Long-form text page (terms, privacy, imprint, help article) with sidebar, dates and TOC. */
export const Document: Block = {
  slug: 'document',
  interfaceName: 'DocumentBlock',
  labels: {
    singular: { de: 'Dokument mit Seitenleiste', en: 'Document with sidebar' },
    plural: { de: 'Dokumente', en: 'Documents' },
  },
  fields: [
    sectionHeader(),
    {
      name: 'sidebar',
      type: 'relationship',
      relationTo: 'sidebars',
      label: { de: 'Seitenleiste (optional)', en: 'Sidebar (optional)' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'meta',
          type: 'group',
          label: { de: 'Stand', en: 'Dates' },
          admin: { hideGutter: true },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'lastUpdated', type: 'date', label: { de: 'Stand (zuletzt geändert)', en: 'Last updated' }, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
                { name: 'effectiveFrom', type: 'date', label: { de: 'Gültig ab', en: 'Effective from' }, admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } } },
                { name: 'version', type: 'text', label: { de: 'Version (z. B. 2.1)', en: 'Version (e.g. 2.1)' }, admin: { width: '33%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'bindingLanguage',
          type: 'select',
          defaultValue: 'de',
          label: { de: 'Verbindliche Sprache', en: 'Binding language' },
          admin: {
            width: '50%',
            description: {
              de: 'Andere Sprachen zeigen einen Hinweis, dass nur diese Fassung gilt.',
              en: 'Other languages show a note that only this version is binding.',
            },
          },
          options: [
            { label: { de: 'Keine (alle Fassungen gleichwertig)', en: 'None (all versions equal)' }, value: 'none' },
            { label: 'Deutsch', value: 'de' },
            { label: 'English', value: 'en' },
          ],
        },
        {
          name: 'showToc',
          type: 'checkbox',
          defaultValue: true,
          label: { de: 'Inhaltsverzeichnis anzeigen', en: 'Show table of contents' },
          admin: { width: '50%', style: { alignSelf: 'flex-end' } },
        },
      ],
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      localized: true,
      label: { de: 'Text', en: 'Text' },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlockquoteFeature(),
          HorizontalRuleFeature(),
          EXPERIMENTAL_TableFeature(),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'history',
      type: 'array',
      label: { de: 'Änderungshistorie (frühere Fassungen)', en: 'Change history (previous versions)' },
      labels: { singular: { de: 'Eintrag', en: 'Entry' }, plural: { de: 'Einträge', en: 'Entries' } },
      maxRows: 20,
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'date', type: 'date', required: true, label: { de: 'Datum', en: 'Date' }, admin: { width: '30%', date: { pickerAppearance: 'dayOnly' } } },
            { name: 'note', type: 'text', required: true, localized: true, label: { de: 'Was sich geändert hat', en: 'What changed' }, admin: { width: '70%' } },
          ],
        },
      ],
    },
    sectionSettings({ overrides: { fields: undefined } }),
  ],
}
```

Replace the last line with plain `sectionSettings()` and instead set the spacing default by passing the override properly: `sectionSettings()` returns a group whose `fields[0].fields[1]` is the spacing select. Simplest correct approach: call `sectionSettings()` and after it, in this file:

```ts
const settings = sectionSettings()
if (settings.type === 'group') {
  const row = settings.fields[0]
  if (row.type === 'row') {
    const spacing = row.fields.find((f) => 'name' in f && f.name === 'spacing')
    if (spacing && spacing.type === 'select') spacing.defaultValue = 'none'
  }
}
```
and use `settings` as the last field. (The block draws its own vertical rhythm because its header band is tinted.)

- [ ] **Step 2: Minimal component and registration**

```tsx
// src/blocks/Document/Component.tsx  (minimal, replaced in Task 8)
import React from 'react'

import type { DocumentBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import RichText from '@/components/RichText'
import { SectionHeading } from '@/components/SectionHeading'

export const DocumentBlock: React.FC<Props & { locale: Locale }> = ({ header, body }) => (
  <div className="container py-16">
    <SectionHeading as="h1" size="display" header={header} />
    <RichText data={body} enableGutter={false} />
  </div>
)
```

- `src/blocks/registry.ts`: add `'document',` after `'ctaSection',`.
- `src/blocks/RenderBlocks.tsx`: `import { DocumentBlock } from '@/blocks/Document/Component'` and add `document: DocumentBlock,` to `blockComponents`.
- `src/collections/Pages/index.ts`: `import { Document } from '../../blocks/Document/config'` and add `Document,` after `CtaSection,` in the `blocks` array.

- [ ] **Step 3: Regenerate types, type check, run the registry test**

Run: `pnpm generate:types && pnpm exec tsc --noEmit && pnpm exec vitest run --config ./vitest.config.mts tests/int/blocks.int.spec.ts`
Expected: `grep -n "interface DocumentBlock" src/payload-types.ts` prints a line; tsc passes; test PASS.

- [ ] **Step 4: Check the dev server**

Run: `docker compose logs --tail 40 app`
Expected: new block tables created without prompts. Otherwise `docker compose restart app`.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Document src/blocks/registry.ts src/blocks/RenderBlocks.tsx src/collections/Pages/index.ts src/payload-types.ts
git commit -m "feat(cms): document block with sidebar, dates, binding language and history"
```

---

### Task 5: Dictionary strings and translation-notice rule

**Files:**
- Modify: `src/i18n/dictionaries.ts`
- Create: `src/components/DocumentLayout/TranslationNotice.tsx`
- Test: `tests/int/translation-notice.int.spec.ts`

**Interfaces:**
- Produces dictionary keys: `onThisPage`, `moreDocuments`, `lastUpdated`, `effectiveFrom`, `version`, `bindingVersion`, `translationNotice` (with `{language}` placeholder), `readBindingVersion`, `previousVersions`, `copyLink`, `contactQuestions`, `print`.
- Produces `shouldShowTranslationNotice(locale: Locale, binding: 'none' | 'de' | 'en' | null | undefined): binding is Locale` and `<TranslationNotice locale binding slug />`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/translation-notice.int.spec.ts
import { describe, expect, it } from 'vitest'

import { shouldShowTranslationNotice } from '@/components/DocumentLayout/TranslationNotice'
import { getDictionary } from '@/i18n/dictionaries'

describe('shouldShowTranslationNotice', () => {
  it('shows only when reading a non-binding language', () => {
    expect(shouldShowTranslationNotice('en', 'de')).toBe(true)
    expect(shouldShowTranslationNotice('de', 'de')).toBe(false)
    expect(shouldShowTranslationNotice('de', 'en')).toBe(true)
    expect(shouldShowTranslationNotice('en', 'none')).toBe(false)
    expect(shouldShowTranslationNotice('en', null)).toBe(false)
    expect(shouldShowTranslationNotice('en', undefined)).toBe(false)
  })
})

describe('document dictionary', () => {
  it('has the notice with a language placeholder in both languages', () => {
    for (const locale of ['de', 'en'] as const) {
      const d = getDictionary(locale)
      expect(d.translationNotice).toContain('{language}')
      expect(d.onThisPage).toBeTruthy()
      expect(d.previousVersions).toBeTruthy()
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/translation-notice.int.spec.ts`
Expected: FAIL (module missing / keys undefined).

- [ ] **Step 3: Add strings and the component**

In `src/i18n/dictionaries.ts` add to `de` (after `yourHotelData`):

```ts
  onThisPage: 'Auf dieser Seite',
  moreDocuments: 'Weitere Dokumente',
  lastUpdated: 'Stand',
  effectiveFrom: 'Gültig ab',
  version: 'Version',
  bindingVersion: 'Verbindliche Fassung',
  translationNotice: 'Diese Übersetzung dient nur zur Information. Verbindlich ist allein die Fassung auf {language}.',
  readBindingVersion: 'Verbindliche Fassung lesen',
  previousVersions: 'Frühere Fassungen',
  copyLink: 'Link zu diesem Abschnitt',
  contactQuestions: 'Fragen dazu?',
  print: 'Drucken',
```

and to `en`:

```ts
  onThisPage: 'On this page',
  moreDocuments: 'More documents',
  lastUpdated: 'Last updated',
  effectiveFrom: 'Effective from',
  version: 'Version',
  bindingVersion: 'Binding version',
  translationNotice: 'This translation is for information only. Only the {language} version is legally binding.',
  readBindingVersion: 'Read the binding version',
  previousVersions: 'Previous versions',
  copyLink: 'Link to this section',
  contactQuestions: 'Questions?',
  print: 'Print',
```

```tsx
// src/components/DocumentLayout/TranslationNotice.tsx
import { Languages } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { isLocale, localeLabels, type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'

export type BindingLanguage = 'none' | Locale | null | undefined

/** True when the reader's language is not the legally binding one. */
export const shouldShowTranslationNotice = (locale: Locale, binding: BindingLanguage): binding is Locale =>
  isLocale(binding) && binding !== locale

type Props = { locale: Locale; binding: BindingLanguage; slug: string }

/** Calm bordered note above a translated document, linking to the binding version. */
export const TranslationNotice: React.FC<Props> = ({ locale, binding, slug }) => {
  if (!shouldShowTranslationNotice(locale, binding)) return null
  const dict = getDictionary(locale)
  const language = localeLabels[binding]
  return (
    <aside
      className="flex flex-col gap-3 rounded-md border border-line bg-surface-2 px-5 py-4 type-small text-ink-2 sm:flex-row sm:items-center sm:justify-between"
      role="note"
    >
      <p className="flex items-start gap-3">
        <Languages aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
        <span>{dict.translationNotice.replace('{language}', language)}</span>
      </p>
      <Link className="shrink-0 font-medium text-ink underline-offset-4 hover:underline" href={`/${binding}/${slug}`} hrefLang={binding}>
        {dict.readBindingVersion} ({language})
      </Link>
    </aside>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/translation-notice.int.spec.ts && pnpm exec tsc --noEmit`
Expected: PASS, tsc clean.

- [ ] **Step 5: Commit**

```bash
git add src/i18n/dictionaries.ts src/components/DocumentLayout/TranslationNotice.tsx tests/int/translation-notice.int.spec.ts
git commit -m "feat(i18n): document page strings and translation notice"
```

---

### Task 6: Heading ids and hover anchors in `RichText`

**Files:**
- Modify: `src/components/RichText/index.tsx`
- Modify: `src/app/(frontend)/globals.css` (heading anchor style, after the `.prose` rules)

**Interfaces:**
- Produces prop `headingIds?: boolean` on `RichText`. When true, every heading gets `id` from `HeadingIds` (same sequence as `extractHeadings`) and a trailing `<a class="heading-anchor" href="#id">`.

- [ ] **Step 1: Extend the converters**

In `src/components/RichText/index.tsx`:

```tsx
import type { SerializedHeadingNode } from '@payloadcms/richtext-lexical'
import { HeadingIds, nodeText } from '@/utilities/lexical/headings'
```

Turn `jsxConverters` into a factory that optionally receives an id source:

```tsx
const makeConverters =
  (ids?: HeadingIds, copyLabel = 'Link zu diesem Abschnitt'): JSXConvertersFunction<NodeTypes> =>
  ({ defaultConverters }) => {
    const linkConverters = LinkJSXConverter({ internalDocToHref })
    return {
      ...defaultConverters,
      ...linkConverters,
      ...(ids
        ? {
            heading: ({ node, nodesToJSX }: { node: SerializedHeadingNode; nodesToJSX: (a: { nodes: SerializedHeadingNode['children'] }) => React.ReactNode }) => {
              const Tag = node.tag
              const id = ids.next(nodeText(node as never).trim())
              return (
                <Tag className="group/heading scroll-mt-28" id={id}>
                  {nodesToJSX({ nodes: node.children })}
                  <a aria-label={copyLabel} className="heading-anchor" href={`#${id}`}>
                    #
                  </a>
                </Tag>
              )
            },
          }
        : {}),
      link: ({ node, nodesToJSX }) => { /* unchanged */ },
      blocks: { /* unchanged */ },
    }
  }

const jsxConverters = makeConverters()
```

Keep the existing `link` and `blocks` bodies exactly as they are. Extend the props and component:

```tsx
type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
  /** Give headings ids (and a hover anchor) so a table of contents can link to them. */
  headingIds?: boolean
  copyLinkLabel?: string
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, headingIds = false, copyLinkLabel, ...rest } = props
  const converters = headingIds ? makeConverters(new HeadingIds(), copyLinkLabel) : jsxConverters
  return (
    <ConvertRichText
      converters={converters}
      ...
```

- [ ] **Step 2: Anchor styling**

Append to `globals.css` after the `.prose :where(h1, h2, h3, h4)` rule:

```css
/* Hover anchor on document headings (RichText `headingIds`). */
.heading-anchor {
  margin-left: 0.4em;
  color: var(--ink-3);
  font-weight: 400;
  text-decoration: none;
  opacity: 0;
  transition: opacity 150ms ease;
}
.group\/heading:hover .heading-anchor,
.heading-anchor:focus-visible {
  opacity: 1;
}
@media (hover: none) {
  .heading-anchor {
    opacity: 0.6;
  }
}
```

- [ ] **Step 3: Type check and existing tests**

Run: `pnpm exec tsc --noEmit && pnpm test:int`
Expected: clean. If `SerializedHeadingNode` typing of `nodesToJSX` conflicts, type the converter parameter as the same shape `defaultConverters.heading` has (`Parameters<NonNullable<typeof defaultConverters.heading>>[0]`).

- [ ] **Step 4: Commit**

```bash
git add src/components/RichText/index.tsx "src/app/(frontend)/globals.css"
git commit -m "feat(richtext): heading ids with hover anchors"
```

---

### Task 7: Sidebar navigation, table of contents and meta components

**Files:**
- Create: `src/components/DocumentLayout/SidebarNav.tsx` (client), `src/components/DocumentLayout/Toc.tsx` (client), `src/components/DocumentLayout/DocumentMeta.tsx` (server)

**Interfaces:**
- Consumes: `Sidebar` type (Task 3), `DocHeading` (Task 1), dictionary keys (Task 5), `resolveLinkHref` from `@/components/Link`, `LocaleLink`, `useLocale` from `@/providers/Locale`, `splitLocale` from `@/i18n/href`.
- Produces:
  - `SidebarNav({ groups: SidebarGroup[]; contact?: SidebarContact | null; labels: { more: string; questions: string } })` where `SidebarGroup = { title: string; links: { href: string; label: string; newTab?: boolean }[] }`, `SidebarContact = { title?: string | null; text?: string | null; email?: string | null }`.
  - `Toc({ headings: DocHeading[]; label: string })`.
  - `DocumentMeta({ locale, meta, binding, labels })`.
  - `sidebarGroupsFromDoc(sidebar: Sidebar): SidebarGroup[]` (pure, exported from `SidebarNav.tsx` is not allowed in a client file; put it in `DocumentMeta.tsx`'s sibling `src/components/DocumentLayout/sidebarData.ts`).

- [ ] **Step 1: Pure data mapper**

```ts
// src/components/DocumentLayout/sidebarData.ts
import type { Sidebar } from '@/payload-types'

import { resolveLinkHref } from '@/components/Link'

export type SidebarLink = { href: string; label: string; newTab?: boolean }
export type SidebarGroup = { title: string; links: SidebarLink[] }
export type SidebarContact = { title?: string | null; text?: string | null; email?: string | null }

/** Flattens a CMS sidebar into plain groups the client component can render. */
export const sidebarGroupsFromDoc = (sidebar: Sidebar): SidebarGroup[] =>
  (sidebar.groups || []).map((group) => ({
    title: group.title,
    links: (group.links || []).flatMap((entry) => {
      const href = resolveLinkHref(entry.link)
      return href ? [{ href, label: entry.link.label, newTab: Boolean(entry.link.newTab) }] : []
    }),
  }))
```

- [ ] **Step 2: Sidebar nav (client)**

```tsx
// src/components/DocumentLayout/SidebarNav.tsx
'use client'

import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'

import { LocaleLink } from '@/components/LocaleLink'
import { splitLocale } from '@/i18n/href'
import { cn } from '@/utilities/ui'
import type { SidebarContact, SidebarGroup } from './sidebarData'

type Props = {
  groups: SidebarGroup[]
  contact?: SidebarContact | null
  labels: { more: string; questions: string }
}

/**
 * Grouped document links with the current page marked. Sticky column from `lg`,
 * a disclosure titled "More documents" below that.
 */
export const SidebarNav: React.FC<Props> = ({ groups, contact, labels }) => {
  const pathname = usePathname()
  const current = splitLocale(pathname || '/').path

  const list = (
    <nav aria-label={labels.more} className="flex flex-col gap-7">
      {groups.map((group, gi) => (
        <div className="flex flex-col gap-2" key={gi}>
          <p className="type-caption font-medium uppercase tracking-wider text-ink-3">{group.title}</p>
          <ul className="flex flex-col border-l border-line">
            {group.links.map((link) => {
              const active = link.href === current
              return (
                <li key={link.href + link.label}>
                  <LocaleLink
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      '-ml-px block border-l py-1.5 pl-4 type-small transition-colors duration-150',
                      active ? 'border-accent text-ink' : 'border-transparent text-ink-2 hover:border-line-strong hover:text-ink',
                    )}
                    href={link.href}
                    {...(link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                  >
                    {link.label}
                  </LocaleLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      {contact && (contact.title || contact.email) && (
        <div className="rounded-md border border-line bg-surface-2 p-4">
          <p className="type-small font-medium text-ink">{contact.title || labels.questions}</p>
          {contact.text && <p className="mt-1 type-caption text-ink-2">{contact.text}</p>}
          {contact.email && (
            <a className="mt-2 block type-caption text-accent underline-offset-4 hover:underline" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          )}
        </div>
      )}
    </nav>
  )

  return (
    <>
      <div className="hidden lg:block">{list}</div>
      <details className="group rounded-md border border-line bg-surface-2 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 type-small font-medium text-ink [&::-webkit-details-marker]:hidden">
          {labels.more}
          <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="border-t border-line px-4 py-4">{list}</div>
      </details>
    </>
  )
}
```

- [ ] **Step 3: Table of contents with scroll-spy (client)**

```tsx
// src/components/DocumentLayout/Toc.tsx
'use client'

import { ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import type { DocHeading } from '@/utilities/lexical/headings'
import { cn } from '@/utilities/ui'

type Props = { headings: DocHeading[]; label: string }

/** "On this page" list. The marker follows the heading nearest the top of the viewport. */
export const Toc: React.FC<Props> = ({ headings, label }) => {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null)

  useEffect(() => {
    const elements = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => Boolean(el))
    if (elements.length === 0) return
    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top)
          else visible.delete(entry.target.id)
        }
        if (visible.size > 0) {
          const [top] = [...visible.entries()].sort((a, b) => a[1] - b[1])
          setActive(top[0])
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  const list = (
    <ol className="relative flex flex-col border-l border-line">
      {headings.map((h) => {
        const isActive = h.id === active
        return (
          <li key={h.id}>
            <a
              aria-current={isActive ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l py-1 type-caption leading-5 transition-colors duration-200 motion-reduce:transition-none',
                h.level === 3 ? 'pl-7' : 'pl-4',
                isActive ? 'border-accent text-ink' : 'border-transparent text-ink-3 hover:text-ink',
              )}
              href={`#${h.id}`}
            >
              {h.text}
            </a>
          </li>
        )
      })}
    </ol>
  )

  return (
    <>
      <nav aria-label={label} className="hidden xl:block">
        <p className="mb-3 type-caption font-medium uppercase tracking-wider text-ink-3">{label}</p>
        {list}
      </nav>
      <details className="group rounded-md border border-line bg-surface-2 xl:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 type-small font-medium text-ink [&::-webkit-details-marker]:hidden">
          {label}
          <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="border-t border-line px-4 py-4">{list}</div>
      </details>
    </>
  )
}
```

- [ ] **Step 4: Meta row (server)**

```tsx
// src/components/DocumentLayout/DocumentMeta.tsx
import { BadgeCheck } from 'lucide-react'
import React from 'react'

import { localeLabels, localeTags, type Locale } from '@/i18n/config'
import type { BindingLanguage } from './TranslationNotice'

type Meta = { lastUpdated?: string | null; effectiveFrom?: string | null; version?: string | null }
type Props = {
  locale: Locale
  meta?: Meta | null
  binding: BindingLanguage
  labels: { lastUpdated: string; effectiveFrom: string; version: string; bindingVersion: string }
}

const formatDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(localeTags[locale], { dateStyle: 'long' }).format(new Date(iso))

/** "Stand · Gültig ab · Version" plus a tag when this is the binding language. */
export const DocumentMeta: React.FC<Props> = ({ locale, meta, binding, labels }) => {
  const items: { label: string; value: React.ReactNode }[] = []
  if (meta?.lastUpdated) items.push({ label: labels.lastUpdated, value: <time dateTime={meta.lastUpdated.slice(0, 10)}>{formatDate(meta.lastUpdated, locale)}</time> })
  if (meta?.effectiveFrom) items.push({ label: labels.effectiveFrom, value: <time dateTime={meta.effectiveFrom.slice(0, 10)}>{formatDate(meta.effectiveFrom, locale)}</time> })
  if (meta?.version) items.push({ label: labels.version, value: meta.version })
  const isBinding = binding === locale

  if (items.length === 0 && !isBinding) return null

  return (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 type-small tabular-nums text-ink-2">
      {items.map((item) => (
        <div className="flex gap-2" key={item.label}>
          <dt className="text-ink-3">{item.label}</dt>
          <dd className="text-ink">{item.value}</dd>
        </div>
      ))}
      {isBinding && (
        <div className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 type-caption text-ink-2">
          <BadgeCheck aria-hidden="true" className="size-3.5 text-accent" strokeWidth={2} />
          <dt className="sr-only">{labels.bindingVersion}</dt>
          <dd>
            {labels.bindingVersion} · {localeLabels[locale]}
          </dd>
        </div>
      )}
    </dl>
  )
}
```

- [ ] **Step 5: Type check**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/DocumentLayout
git commit -m "feat(document): sidebar nav, table of contents and meta components"
```

---

### Task 8: Document block renderer, typography and print styles

**Files:**
- Modify: `src/blocks/Document/Component.tsx` (replace the Task 4 stub)
- Modify: `src/app/(frontend)/globals.css` (append `.prose-document` and print rules)

**Interfaces:**
- Consumes everything from Tasks 1, 5, 6, 7. `RenderBlocks` passes `locale`; `block.id` and page slug are not passed, so the block reads the slug for the notice link from `headers()`? No: pass it through. Modify `RenderBlocks` to also pass `slug?: string` (add prop `slug` to `RenderBlocks` and to `<Block ... slug={slug} />`; update `src/app/(frontend)/[locale]/[slug]/page.tsx` to pass `slug={decodedSlug}`). Blocks that ignore the prop are unaffected.

- [ ] **Step 1: Pass the slug through `RenderBlocks`**

In `src/blocks/RenderBlocks.tsx` change the props type to `{ blocks: Block[]; locale: Locale; slug?: string }`, destructure `slug`, and render `<Block {...block} locale={locale} slug={slug} />` in the non-legacy branch. In `src/app/(frontend)/[locale]/[slug]/page.tsx` change the call to `<RenderBlocks blocks={layout} locale={locale} slug={decodedSlug} />`.

- [ ] **Step 2: The renderer**

```tsx
// src/blocks/Document/Component.tsx
import { Printer } from 'lucide-react'
import React from 'react'

import type { DocumentBlock as Props, Sidebar } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import RichText from '@/components/RichText'
import { SectionHeading } from '@/components/SectionHeading'
import { DocumentMeta } from '@/components/DocumentLayout/DocumentMeta'
import { SidebarNav } from '@/components/DocumentLayout/SidebarNav'
import { Toc } from '@/components/DocumentLayout/Toc'
import { TranslationNotice } from '@/components/DocumentLayout/TranslationNotice'
import { sidebarGroupsFromDoc } from '@/components/DocumentLayout/sidebarData'
import { getDictionary } from '@/i18n/dictionaries'
import { localeTags } from '@/i18n/config'
import { extractHeadings } from '@/utilities/lexical/headings'

const formatDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(localeTags[locale], { dateStyle: 'long' }).format(new Date(iso))

/** Long-form document: tinted header band, sidebar, article with anchored headings, TOC, history. */
export const DocumentBlock: React.FC<Props & { locale: Locale; slug?: string }> = ({
  header,
  sidebar,
  meta,
  bindingLanguage,
  showToc,
  body,
  history,
  locale,
  slug = '',
}) => {
  const dict = getDictionary(locale)
  const sidebarDoc = sidebar && typeof sidebar === 'object' ? (sidebar as Sidebar) : null
  const groups = sidebarDoc ? sidebarGroupsFromDoc(sidebarDoc) : []
  const hasSidebar = groups.length > 0
  const headings = showToc === false ? [] : extractHeadings(body)
  const hasToc = headings.length > 1
  const entries = (history || []).filter((h) => h.date && h.note)

  return (
    <article className="document">
      <header className="border-b border-line bg-surface-2">
        <div className="container py-12 md:py-16">
          <div className={hasSidebar ? 'lg:ml-[calc(16rem+4rem)]' : ''}>
            <SectionHeading as="h1" size="display" header={header} align="left" />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <DocumentMeta
                binding={bindingLanguage}
                labels={{ lastUpdated: dict.lastUpdated, effectiveFrom: dict.effectiveFrom, version: dict.version, bindingVersion: dict.bindingVersion }}
                locale={locale}
                meta={meta}
              />
              <PrintButton label={dict.print} />
            </div>
          </div>
        </div>
      </header>

      <div className="container py-10 md:py-14">
        <div className={hasSidebar ? 'grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16' : ''}>
          {hasSidebar && (
            <div className="lg:sticky lg:top-24 lg:self-start print:hidden">
              <SidebarNav contact={sidebarDoc?.contact?.enabled ? sidebarDoc.contact : null} groups={groups} labels={{ more: dict.moreDocuments, questions: dict.contactQuestions }} />
            </div>
          )}
          <div className={hasToc ? 'grid gap-10 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16' : ''}>
            <div className="flex min-w-0 flex-col gap-8">
              <div className="print:hidden">
                <TranslationNotice binding={bindingLanguage} locale={locale} slug={slug} />
              </div>
              <RichText
                className="prose-document max-w-[70ch]"
                copyLinkLabel={dict.copyLink}
                data={body}
                enableGutter={false}
                headingIds
              />
              {entries.length > 0 && (
                <details className="max-w-[70ch] border-t border-line pt-6">
                  <summary className="cursor-pointer type-small font-medium text-ink">{dict.previousVersions}</summary>
                  <ol className="mt-4 flex flex-col gap-2 type-small text-ink-2">
                    {entries.map((h, i) => (
                      <li className="flex gap-4" key={h.id || i}>
                        <time className="shrink-0 tabular-nums text-ink-3" dateTime={h.date.slice(0, 10)}>
                          {formatDate(h.date, locale)}
                        </time>
                        <span>{h.note}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </div>
            {hasToc && (
              <div className="xl:sticky xl:top-24 xl:self-start xl:order-last print:hidden -order-1 xl:order-none">
                <Toc headings={headings} label={dict.onThisPage} />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/** Plain print trigger; hidden when printing. */
const PrintButton: React.FC<{ label: string }> = ({ label }) => (
  <form action="javascript:window.print()" className="print:hidden">
    <button className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 type-caption text-ink-2 transition-colors duration-150 hover:border-line-strong hover:text-ink" type="submit">
      <Printer aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
      {label}
    </button>
  </form>
)
```

`form action="javascript:…"` is blocked by CSP in some setups; if `pnpm lint` or the browser console objects, replace `PrintButton` with a tiny client component `src/components/DocumentLayout/PrintButton.tsx` (`'use client'`, `onClick={() => window.print()}`) and import it.

On `< xl` the TOC disclosure must appear above the article: the `-order-1 xl:order-none` classes do that inside the grid.

- [ ] **Step 3: Typography and print CSS**

Append to `globals.css`:

```css
/* ------------------------------------------------------------------ */
/* Long documents (terms, privacy, imprint)                              */
/* ------------------------------------------------------------------ */

.prose-document {
  --tw-prose-body: var(--ink-2);
  font-size: 1.0625rem;
  line-height: 1.7;
}
.prose-document :where(p, li) {
  text-wrap: pretty;
}
.prose-document :where(h2) {
  margin-top: 2.75em;
  font-size: 1.5rem;
}
.prose-document :where(h3) {
  margin-top: 2em;
  font-size: 1.2rem;
}
.prose-document :where(h2, h3, h4) {
  scroll-margin-top: 6.5rem;
}
.prose-document :where(ol) {
  font-variant-numeric: tabular-nums;
}
.prose-document :where(a:not(.heading-anchor)) {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: color-mix(in oklch, var(--accent) 50%, transparent);
}
.prose-document :where(a:not(.heading-anchor)):hover {
  text-decoration-color: var(--accent);
}
.prose-document .lexical-table-container {
  overflow-x: auto;
  margin-block: 1.5em;
}
.prose-document :where(table) {
  width: 100%;
  font-size: 0.9375rem;
}
.prose-document :where(th, td) {
  padding: 0.6em 0.9em;
  border: 1px solid var(--line);
  vertical-align: top;
  text-align: left;
}
.prose-document :where(th) {
  background: var(--surface-2);
  color: var(--ink);
  font-weight: 500;
}
.prose-document :where(blockquote) {
  border-left: 2px solid var(--accent);
  padding-left: 1em;
  font-style: normal;
  color: var(--ink-2);
}

@media print {
  :root {
    --ink: #000;
    --ink-2: #222;
    --ink-3: #555;
    --surface: #fff;
    --surface-2: #fff;
    --line: #bbb;
    --accent: #000;
  }
  header.sticky,
  footer,
  .skip-link,
  .print\:hidden {
    display: none !important;
  }
  .document .container {
    max-width: none;
    padding: 0;
  }
  .prose-document {
    max-width: none;
    font-size: 11pt;
  }
  .prose-document a[href^='http']::after {
    content: ' (' attr(href) ')';
    font-size: 0.85em;
    color: #555;
  }
  .heading-anchor {
    display: none;
  }
}
```

- [ ] **Step 4: Type check, lint**

Run: `pnpm exec tsc --noEmit && pnpm lint`
Expected: clean.

- [ ] **Step 5: Smoke render through the admin**

Create one test page in the admin (http://localhost:3000/admin → Pages → new: title "Test-Dokument", slug `test-dokument`, layout block "Dokument mit Seitenleiste", a heading and two paragraphs, publish) and open `/de/test-dokument`. Expected: tinted header band, meta tag "Verbindliche Fassung · Deutsch", article, no sidebar (none chosen), TOC hidden (fewer than two headings). Delete the test page afterwards from the admin.

- [ ] **Step 6: Commit**

```bash
git add src/blocks/Document/Component.tsx src/blocks/RenderBlocks.tsx "src/app/(frontend)/[locale]/[slug]/page.tsx" "src/app/(frontend)/globals.css"
git commit -m "feat(document): document block layout, typography and print styles"
```

---

### Task 9: Extract the six legal texts verbatim

**Files:**
- Create: `src/endpoints/seed/legal/terms-of-service.ts`, `privacy-policy.ts`, `gdpr.ts`, `service-description.ts`, `cookie-policy.ts`, `imprint.ts`
- Each exports `{ de: string; en: string }` markdown strings in the Task 2 grammar.

**Interfaces:**
- Produces: `export const termsOfService = { de: '…', en: '…' }` etc. (camelCase of the slug).

- [ ] **Step 1: Pull the page texts**

Use the browser tools (load `mcp__claude-in-chrome__tabs_context_mcp`, `mcp__claude-in-chrome__tabs_create_mcp`, `mcp__claude-in-chrome__navigate`, `mcp__claude-in-chrome__get_page_text` in one ToolSearch). For each URL pair, navigate and read the page text:

| Export | German URL | English URL |
|---|---|---|
| `termsOfService` | https://indicate-data.io/de/compliance/terms-of-service | https://indicate-data.io/en/compliance/terms-of-service |
| `privacyPolicy` | https://indicate-data.io/de/compliance/privacy-policy | https://indicate-data.io/en/compliance/privacy-policy |
| `gdpr` | https://indicate-data.io/de/compliance/gdpr | https://indicate-data.io/en/compliance/gdpr |
| `serviceDescription` | https://indicate-data.io/de/compliance/service-description | https://indicate-data.io/en/compliance/service-description |
| `cookiePolicy` | https://indicate-data.io/de/compliance/cookie-policy | https://indicate-data.io/en/compliance/cookie-policy |
| `imprint` | https://indicate-data.io/de/imprint | https://indicate-data.io/en/imprint |

If the browser tools are unavailable, use `WebFetch` with the prompt "Return the complete page main content verbatim as markdown, every heading and paragraph, no summary" in chunks (ask for sections 1–5, then 6–10, and so on) until the whole document is reproduced.

- [ ] **Step 2: Write the markdown files**

Rules while transcribing:
- Keep the wording exactly. Fix only typos: "hat die deutschen Version Gültigkeit" → "hat die deutsche Version Gültigkeit".
- Drop the site chrome (header, sidebar, footer), the page title (it becomes the block heading), and the "Zuletzt aktualisiert / Gültig ab" lines (they become `meta` dates). Also drop the translation disclaimer paragraph: the layout renders it.
- Numbered section titles become `## 1. Geltungsbereich` (keep the number in the text); sub-sections `###`.
- Lists become `- ` or `1. `; per-service data lists in the service description become one `###` per service with a `- ` list.
- Bold defined terms with `**…**`; links `[text](url)`; e-mail addresses `[compliance@indicate-data.io](mailto:compliance@indicate-data.io)`.

File shape:

```ts
// src/endpoints/seed/legal/privacy-policy.ts
/** Verbatim from indicate-data.io (DE original, EN translation), typos fixed only. */
export const privacyPolicy = {
  de: `## 1. Einleitung

…`,
  en: `## 1. Introduction

…`,
}
```

Escape backticks inside the text as `\``.

- [ ] **Step 3: Verify the conversion**

Add a temporary check to the existing test file `tests/int/seed-richtext.int.spec.ts`:

```ts
import { privacyPolicy } from '@/endpoints/seed/legal/privacy-policy'
import { termsOfService } from '@/endpoints/seed/legal/terms-of-service'
import { gdpr } from '@/endpoints/seed/legal/gdpr'
import { serviceDescription } from '@/endpoints/seed/legal/service-description'
import { cookiePolicy } from '@/endpoints/seed/legal/cookie-policy'
import { imprint } from '@/endpoints/seed/legal/imprint'

describe('legal documents', () => {
  it.each(Object.entries({ privacyPolicy, termsOfService, gdpr, serviceDescription, cookiePolicy, imprint }))(
    '%s converts in both languages with at least one heading',
    (_name, doc) => {
      for (const md of [doc.de, doc.en]) {
        const out = richText(md)
        expect(out.root.children.length).toBeGreaterThan(2)
        expect(out.root.children.some((n) => n.type === 'heading')).toBe(true)
        expect(md).not.toMatch(/deutschen Version Gültigkeit/)
      }
    },
  )
})
```

Keep this test (it is cheap and guards the seed).

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/seed-richtext.int.spec.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/endpoints/seed/legal tests/int/seed-richtext.int.spec.ts
git commit -m "content: legal documents from indicate-data.io (DE original, EN translation)"
```

---

### Task 10: Seed the sidebar, the legal pages and the footer links

**Files:**
- Create: `src/endpoints/seed/legal.ts`
- Modify: `src/endpoints/seed/index.ts`, `src/endpoints/seed/content.ts` (footer `legalLinks`, `Refs`)

**Interfaces:**
- Consumes: `richText` (Task 2), the six document exports (Task 9), `upsertPage`, `Refs`, `T`, `pick`.
- Produces: `legalSlugs = ['terms-of-service','privacy-policy','gdpr','service-description','cookie-policy','imprint'] as const`, `legalPage(t, slug, sidebarId)`, `legalSidebar(t, pageIds)`; `Refs` gains `legal: Record<LegalSlug, number>`.

- [ ] **Step 1: Seed builders**

```ts
// src/endpoints/seed/legal.ts
import type { Page, Sidebar } from '@/payload-types'

import type { T } from './content'
import { richText } from './lexical'
import { cookiePolicy } from './legal/cookie-policy'
import { gdpr } from './legal/gdpr'
import { imprint } from './legal/imprint'
import { privacyPolicy } from './legal/privacy-policy'
import { serviceDescription } from './legal/service-description'
import { termsOfService } from './legal/terms-of-service'

export const legalSlugs = ['terms-of-service', 'privacy-policy', 'gdpr', 'service-description', 'cookie-policy', 'imprint'] as const
export type LegalSlug = (typeof legalSlugs)[number]

type PageData = Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>
type Doc = { de: string; en: string }

const docs: Record<LegalSlug, { doc: Doc; lastUpdated?: string; effectiveFrom?: string }> = {
  'terms-of-service': { doc: termsOfService },
  'privacy-policy': { doc: privacyPolicy, lastUpdated: '2026-08-17', effectiveFrom: '2026-08-31' },
  gdpr: { doc: gdpr, lastUpdated: '2024-03-30', effectiveFrom: '2024-04-02' },
  'service-description': { doc: serviceDescription, lastUpdated: '2024-03-30', effectiveFrom: '2024-04-02' },
  'cookie-policy': { doc: cookiePolicy, lastUpdated: '2024-03-30', effectiveFrom: '2024-04-02' },
  imprint: { doc: imprint },
}

/** Page titles, as they appear in the sidebar, footer and browser tab. */
export const legalNames = (t: T): Record<LegalSlug, string> => ({
  'terms-of-service': t('Nutzungsbedingungen', 'Terms of service'),
  'privacy-policy': t('Datenschutzrichtlinie', 'Privacy policy'),
  gdpr: 'DSGVO',
  'service-description': t('Leistungsbeschreibung', 'Service description'),
  'cookie-policy': t('Cookie-Richtlinie', 'Cookie policy'),
  imprint: t('Impressum', 'Imprint'),
})

const leads = (t: T): Record<LegalSlug, string> => ({
  'terms-of-service': t('Die Bedingungen für die Nutzung von Indicate.', 'The terms for using Indicate.'),
  'privacy-policy': t('Welche Daten wir erheben, wofür wir sie nutzen und welche Rechte Sie haben.', 'What data we collect, what we use it for and which rights you have.'),
  gdpr: t('Wie Indicate die Datenschutz-Grundverordnung umsetzt.', 'How Indicate implements the General Data Protection Regulation.'),
  'service-description': t('Welche Schnittstellen Indicate anbindet und welche Daten dabei übertragen werden.', 'Which interfaces Indicate connects and which data is transferred.'),
  'cookie-policy': t('Welche Cookies wir einsetzen und wie Sie sie steuern.', 'Which cookies we use and how you control them.'),
  imprint: t('Angaben gemäß § 5 TMG.', 'Legal notice according to German law.'),
})

const seoDescriptions = leads

export const legalPage = (t: T, slug: LegalSlug, sidebarId: number, locale: 'de' | 'en'): Partial<PageData> => {
  const entry = docs[slug]
  return {
    title: legalNames(t)[slug],
    slug,
    _status: 'published',
    hero: { type: 'none' },
    seo: { title: `${legalNames(t)[slug]} · Indicate Data`, description: seoDescriptions(t)[slug] },
    layout: [
      {
        blockType: 'document',
        blockName: legalNames(t)[slug],
        header: { eyebrow: t('Rechtliches', 'Legal'), heading: legalNames(t)[slug], lead: leads(t)[slug], align: 'left' },
        sidebar: sidebarId,
        meta: { lastUpdated: entry.lastUpdated || null, effectiveFrom: entry.effectiveFrom || null, version: null },
        bindingLanguage: 'de',
        showToc: true,
        body: richText(entry.doc[locale]) as unknown as Page['layout'][number] extends infer B ? (B extends { blockType: 'document' } ? B['body'] : never) : never,
        history: [],
        settings: { background: 'default', spacing: 'none', anchor: null },
      },
    ],
  }
}
```

If the `body` cast is too clever for the type checker, type it as `richText(entry.doc[locale]) as unknown as DocumentBlock['body']` with `import type { DocumentBlock } from '@/payload-types'`.

```ts
/** Sidebar "Rechtliches": the live site's grouping plus a contact card. */
export const legalSidebar = (t: T, pages: Record<LegalSlug, number>): Partial<Sidebar> => {
  const names = legalNames(t)
  const ref = (slug: LegalSlug) => ({
    link: { type: 'reference' as const, reference: { relationTo: 'pages' as const, value: pages[slug] }, label: names[slug] },
  })
  return {
    title: 'Rechtliches',
    groups: [
      { title: t('Bedingungen', 'Terms'), links: [ref('terms-of-service')] },
      { title: t('Datenschutz', 'Privacy'), links: [ref('privacy-policy'), ref('gdpr'), ref('service-description')] },
      { title: 'Compliance', links: [ref('cookie-policy')] },
      { title: t('Kontakt', 'Contact'), links: [ref('imprint')] },
    ],
    contact: {
      enabled: true,
      title: t('Fragen zum Datenschutz?', 'Questions about privacy?'),
      text: t('Schreiben Sie unserem Compliance-Team.', 'Write to our compliance team.'),
      email: 'compliance@indicate-data.io',
    },
  }
}
```

- [ ] **Step 2: Wire the seed**

In `src/endpoints/seed/content.ts` extend `Refs`:

```ts
export type Refs = {
  contactPageId: number
  pages: Record<SubpageSlug, number>
  /** Ids of the legal pages, keyed by slug (see ./legal). */
  legal: Record<LegalSlug, number>
  media: Record<string, number>
  links: { appUrl: string; demoUrl: string; helpUrl: string; docsUrl: string }
}
```
with `import type { LegalSlug } from './legal'`, and replace the footer `legalLinks`:

```ts
  legalLinks: [
    pageRef(refs.legal.imprint, t('Impressum', 'Imprint')),
    pageRef(refs.legal['privacy-policy'], t('Datenschutz', 'Privacy')),
    pageRef(refs.legal['terms-of-service'], t('AGB', 'Terms')),
    pageRef(refs.legal['cookie-policy'], t('Cookies', 'Cookies')),
  ],
```

In `src/endpoints/seed/index.ts`:
1. Import `legalPage, legalSidebar, legalSlugs, type LegalSlug` from `./legal`.
2. After the contact page and before the subpages, seed the legal pages in two passes (pages first with a placeholder sidebar id is impossible because `sidebar` is required to exist; so: create the sidebar first with empty groups, then the pages, then update the sidebar with the links):

```ts
  payload.logger.info('— Sidebar: Rechtliches')
  const sidebarId = await upsertSidebar(payload, req, 'Rechtliches', () => ({ title: 'Rechtliches', groups: [{ title: '—', links: [] }] }))

  const legalIds = {} as Record<LegalSlug, number>
  for (const slug of legalSlugs) {
    payload.logger.info(`— Page /${slug}`)
    legalIds[slug] = await upsertPage(payload, req, slug, (locale) => legalPage(pick(locale), slug, sidebarId, locale))
  }
  await upsertSidebar(payload, req, 'Rechtliches', (locale) => legalSidebar(pick(locale), legalIds))
```
3. Add `legal: legalIds` to the `draft` refs object.
4. Add the helper:

```ts
async function upsertSidebar(
  payload: Payload,
  req: PayloadRequest,
  title: string,
  build: (locale: Locale) => AnyData,
): Promise<number> {
  const [primary, ...rest] = locales
  const existing = await payload.find({ collection: 'sidebars', where: { title: { equals: title } }, limit: 1, depth: 0 })
  const doc = existing.docs[0]
    ? await payload.update({ collection: 'sidebars', id: existing.docs[0].id, data: build(primary), locale: primary, depth: 0, req, context })
    : await payload.create({ collection: 'sidebars', data: build(primary) as RequiredDataFromCollectionSlug<'sidebars'>, locale: primary, depth: 0, req, context })
  for (const locale of rest) {
    await payload.update({ collection: 'sidebars', id: doc.id, data: withIds(build(locale), doc), locale, depth: 0, req, context })
  }
  return doc.id
}
```
5. Update the doc comment of `seed` to mention legal pages and the sidebar.

- [ ] **Step 3: Type check and seed**

Run:
```bash
pnpm exec tsc --noEmit
NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload ./node_modules/.bin/payload run scripts/seed.ts
docker exec indicate-datacomdemo-app-1 rm -rf /app/.next/dev/cache/fetch-cache && docker compose restart app
```
Expected: log lines "— Sidebar: Rechtliches", six "— Page /…" lines, "Seeded database successfully!".

- [ ] **Step 4: Verify in the browser**

Open http://localhost:3000/de/privacy-policy and http://localhost:3000/en/privacy-policy. Expected: sidebar with four groups and the contact card, current page marked, TOC with numbered sections, meta row "Stand 17. August 2026 · Gültig ab 31. August 2026 · Verbindliche Fassung · Deutsch" on DE, translation notice on EN linking to `/de/privacy-policy`. Footer legal links point to `/de/imprint` etc.

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed/legal.ts src/endpoints/seed/index.ts src/endpoints/seed/content.ts
git commit -m "content: seed legal pages, legal sidebar and internal footer links"
```

---

### Task 11: About page

**Files:**
- Create: `src/endpoints/seed/about.ts`
- Modify: `src/endpoints/seed/index.ts` (upsert after the subpages, before home), `src/endpoints/seed/content.ts` (footer "Unternehmen" column gets "Über uns" first; `Refs` gains `aboutPageId: number`)

**Interfaces:**
- Consumes the block helpers pattern from `pages.ts` (copy the private helpers `hero`, `story`, `cards`, `logos`, `testimonials`, `closing` into `about.ts`, or export them from `pages.ts` and import them: exporting is preferred; add `export` to those six helpers plus `defaults`).
- Produces `aboutPage(t: T, refs: Refs): Partial<PageData>` with slug `about`.

- [ ] **Step 1: Write the page**

```ts
// src/endpoints/seed/about.ts
import type { Page } from '@/payload-types'

import type { Refs, T } from './content'
import { cards, closing, hero, logos, story, testimonials } from './pages'

type PageData = Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>

/**
 * "Über uns": why Indicate exists and how we work, told through hospitality focus, German
 * engineering under GDPR and a direct line to the people who build the product.
 */
export const aboutPage = (t: T, refs: Refs): Partial<PageData> => ({
  title: t('Über uns', 'About us'),
  slug: 'about',
  _status: 'published',
  hero: { type: 'none' },
  seo: {
    title: t('Über Indicate: Agentic Analytics aus Offenburg', 'About Indicate: agentic analytics from Offenburg'),
    description: t(
      'Indicate baut Analytics für Hotels, Hotelgruppen und ihre Agenturen. Entwickelt in Deutschland, betrieben nach DSGVO, mit direktem Draht zum Team.',
      'Indicate builds analytics for hotels, hotel groups and their agencies. Built in Germany, run under GDPR, with a direct line to the team.',
    ),
  },
  layout: [
    hero(t, refs, {
      eyebrow: t('Über Indicate', 'About Indicate'),
      heading: t('Wir bauen die Zahlenbasis der Hotellerie.', 'We build the numbers hospitality runs on.'),
      lead: t('Ein Datenmodell für PMS, Vertrieb und Marketing, und Antworten, die jeder im Haus versteht.', 'One data model for PMS, distribution and marketing, and answers everyone in the hotel understands.'),
      illustration: 'stage',
      secondary: { url: '/contact', label: t('Kontakt aufnehmen', 'Get in touch') },
    }),
    {
      blockType: 'pillars',
      blockName: t('Was uns antreibt', 'What drives us'),
      header: {
        eyebrow: t('Was uns antreibt', 'What drives us'),
        heading: t('Vier Dinge, an denen wir jede Entscheidung messen.', 'Four things we measure every decision against.'),
        align: 'left',
      },
      pillars: [
        { icon: 'check', title: t('Zahlen, denen man trauen kann', 'Numbers you can trust'), text: t('Jede Kennzahl hat eine Definition, eine Quelle und eine Version. Wer eine Zahl sieht, kann nachlesen, woher sie kommt.', 'Every KPI has a definition, a source and a version. Anyone who sees a number can read where it comes from.') },
        { icon: 'message', title: t('Antworten in normaler Sprache', 'Answers in plain language'), text: t('Analytics soll nicht nur Analysten dienen. Fragen, Dashboards und Reports funktionieren für alle im Haus.', 'Analytics should not be for analysts only. Questions, dashboards and reports work for everyone in the hotel.') },
        { icon: 'shield', title: t('Ihre Daten bleiben Ihre Daten', 'Your data stays your data'), text: t('Gastdaten verlassen Indicate nur, wenn Sie es ausdrücklich freigeben. Rollen, 2FA und Audit-Log sind Standard.', 'Guest data leaves Indicate only when you explicitly release it. Roles, 2FA and an audit log come as standard.') },
        { icon: 'building', title: t('Mit Hotels gebaut', 'Built with hotels'), text: t('Jede Funktion entsteht aus dem Alltag von Hotels, Hotelgruppen und ihren Agenturen, nicht aus einer Roadmap am Whiteboard.', 'Every feature comes from the daily work of hotels, hotel groups and their agencies, not from a whiteboard roadmap.') },
      ],
      tiles: [],
      settings: { background: 'tinted', spacing: 'default' },
    },
    story({
      name: t('Aus der Hotellerie', 'From hospitality'),
      eyebrow: t('Fokus', 'Focus'),
      heading: t('Eine Branche, in der Tiefe.', 'One industry, in depth.'),
      lead: t('Indicate kennt PMS, Channel-Manager, Gästekommunikation und Kampagnen. Deshalb sind Kennzahlen am ersten Tag fertig und nicht ein Projekt.', 'Indicate knows PMS, channel managers, guest communication and campaigns. That is why KPIs are ready on day one instead of being a project.'),
      illustration: 'sources',
      points: [
        { icon: 'bed', title: t('Hotels', 'Hotels'), text: t('Auslastung, ADR, Kanäle und Kampagnen in einem Bild.', 'Occupancy, ADR, channels and campaigns in one picture.') },
        { icon: 'buildings', title: t('Hotelgruppen', 'Hotel groups'), text: t('Alle Häuser nebeneinander, ein Login, ein Standard.', 'Every property side by side, one login, one standard.') },
        { icon: 'briefcase', title: t('Agenturen & Berater', 'Agencies & consultants'), text: t('Alle Kunden in einem Arbeitsplatz, Routine automatisiert.', 'Every client in one workspace, routine automated.') },
      ],
    }),
    story({
      name: t('Entwickelt in Deutschland', 'Built in Germany'),
      eyebrow: t('Herkunft', 'Origin'),
      heading: t('Entwickelt in Offenburg. Betrieben nach DSGVO.', 'Built in Offenburg. Run under GDPR.'),
      lead: t('Indicate Data ist eine GmbH mit Sitz in Baden-Württemberg. Verträge, Support und Datenschutz sprechen Ihre Sprache.', 'Indicate Data is a German company based in Baden-Württemberg. Contracts, support and data protection speak your language.'),
      illustration: 'governance',
      background: 'tinted',
      points: [
        { icon: 'lock', title: t('DSGVO ab Werk', 'GDPR by default'), text: t('Auftragsverarbeitung, Löschkonzepte und Rollen sind Teil des Produkts.', 'Processing agreements, deletion rules and roles are part of the product.') },
        { icon: 'globe', title: t('Deutsch und Englisch', 'German and English'), text: t('App, Dokumentation und Support in beiden Sprachen.', 'App, documentation and support in both languages.') },
        { icon: 'eye', title: t('Nachvollziehbar', 'Traceable'), text: t('Audit-Log und Versionen zeigen, wer was wann geändert hat.', 'Audit log and versions show who changed what and when.') },
      ],
      links: [{ link: { type: 'custom', url: '/governance', label: t('Mehr zu Data Governance', 'More about data governance'), appearance: 'link' } }],
    }),
    logos(t),
    cards({
      name: t('So arbeiten wir mit Ihnen', 'How we work with you'),
      eyebrow: t('Zusammenarbeit', 'Working together'),
      heading: t('Direkter Draht statt Ticketnummer.', 'A direct line instead of a ticket number.'),
      lead: t('Sie sprechen mit den Menschen, die Indicate bauen. Das prägt, wie wir Onboarding, Support und Roadmap organisieren.', 'You talk to the people who build Indicate. That shapes how we run onboarding, support and the roadmap.'),
      layout: 'grid-4',
      cards: [
        { icon: 'upload', title: t('Onboarding mit Ihren Daten', 'Onboarding with your data'), text: t('Wir verbinden Ihre Systeme gemeinsam und prüfen die ersten Kennzahlen mit Ihnen.', 'We connect your systems together and check the first KPIs with you.') },
        { icon: 'message', title: t('Support, der antwortet', 'Support that answers'), text: t('Fragen landen bei Menschen, die das Produkt kennen, nicht in einer Warteschlange.', 'Questions reach people who know the product, not a queue.') },
        { icon: 'target', title: t('Roadmap aus der Praxis', 'Roadmap from practice'), text: t('Was Hotels und Agenturen brauchen, entscheidet, was als Nächstes kommt.', 'What hotels and agencies need decides what comes next.') },
        { icon: 'users', title: t('Partner statt Anbieter', 'Partner, not vendor'), text: t('Wir arbeiten mit Agenturen und Softwarepartnern, damit Ihre Daten dort ankommen, wo Sie sie brauchen.', 'We work with agencies and software partners so your data arrives where you need it.') },
      ],
    }),
    testimonials(t),
    closing(t, refs, t('Lernen Sie Indicate kennen.', 'Get to know Indicate.'), t('Eine halbe Stunde mit Ihren Zahlen sagt mehr als jede Seite über uns.', 'Half an hour with your numbers says more than any page about us.')),
  ],
})
```

Check every icon key exists in `src/components/Icon/options.ts` (`check, message, shield, building, bed, buildings, briefcase, lock, globe, eye, upload, target, users` all do). If `hero`'s `secondary` needs `external: false`, it is internal by default.

- [ ] **Step 2: Export the helpers from `pages.ts`**

Add `export` before `const defaults`, `const hero`, `const story`, `const cards`, `const logos`, `const testimonials`, `const closing` in `src/endpoints/seed/pages.ts`.

- [ ] **Step 3: Wire the seed and the footer**

`src/endpoints/seed/index.ts`: after the subpage loop and before building `refs`:

```ts
  payload.logger.info('— Page /about')
  const aboutPageId = await upsertPage(payload, req, 'about', (locale) => aboutPage(pick(locale), draft))
  const refs: Refs = { ...draft, pages: pageIds, aboutPageId }
```
`draft` needs `aboutPageId: 0` as a placeholder, and `Refs` gains `aboutPageId: number`. Import `aboutPage` from `./about`.

`src/endpoints/seed/content.ts`, footer "Unternehmen" column: insert `pageRef(refs.aboutPageId, t('Über uns', 'About us')),` as the first link.

- [ ] **Step 4: Type check, seed, verify**

Run the seed and cache-clear commands from Task 10 Step 3. Open http://localhost:3000/de/about and http://localhost:3000/en/about. Expected: hero, four pillars, two stacked stories, logo marquee, four cards, testimonials, yellow closing. No headcount anywhere (grep the file: `grep -n "sechs\|six\|klein\|small team" src/endpoints/seed/about.ts` prints nothing).

- [ ] **Step 5: Commit**

```bash
git add src/endpoints/seed/about.ts src/endpoints/seed/pages.ts src/endpoints/seed/index.ts src/endpoints/seed/content.ts
git commit -m "content: new About page with marketing focus"
```

---

### Task 12: Visual verification and polish pass

**Files:**
- Create (scratch only, not committed): `<scratchpad>/shots.mjs`
- Possibly modify: `src/blocks/Document/Component.tsx`, `src/components/DocumentLayout/*`, `globals.css` for fixes found.

- [ ] **Step 1: Screenshots**

```js
// <scratchpad>/shots.mjs — run with: node <scratchpad>/shots.mjs  (from the repo root)
import { chromium } from '/Users/stan/Workspace/GitHub/indicateio/indicate-data.com.demo/node_modules/@playwright/test/index.mjs'

const base = 'http://localhost:3000'
const pages = ['/de/privacy-policy', '/en/privacy-policy', '/de/imprint', '/de/service-description', '/de/about']
const browser = await chromium.launch()
for (const width of [1440, 1024, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.querySelectorAll('.reveal, .reveal-stagger > *').forEach((el) => el.setAttribute('data-in', '')))
    await page.screenshot({ path: `shot-${width}-${path.replace(/\//g, '_')}.png`, fullPage: true })
  }
  if (width === 1440) {
    await page.goto(base + '/de/privacy-policy', { waitUntil: 'networkidle' })
    await page.emulateMedia({ media: 'print' })
    await page.screenshot({ path: 'shot-print-privacy.png', fullPage: true })
  }
  await page.close()
}
await browser.close()
```

Run it from the scratchpad directory and open every PNG with the Read tool.

- [ ] **Step 2: Checklist**

Fix anything that fails, re-run the script:
- 1440: sidebar, article and TOC in three columns; active sidebar link has the yellow rail; TOC marker on the first heading; header band spans full width and its text aligns with the article column.
- 1024: sidebar + article, TOC disclosure above the article.
- 390: sidebar disclosure, TOC disclosure, article; no horizontal scroll (`document.documentElement.scrollWidth <= 390`).
- EN privacy page shows the translation notice with a link to `/de/privacy-policy`; DE shows the "Verbindliche Fassung · Deutsch" tag.
- Print: white, no header/footer/sidebar/TOC, external links show URLs.
- Tables in the service description scroll horizontally on 390.
- About: no reveal glitch, closing section yellow, all links resolve (click through `/governance`, `/contact`).

- [ ] **Step 3: Run everything**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm test:int`
Expected: all clean.

- [ ] **Step 4: Commit fixes**

```bash
git add src/blocks/Document src/components/DocumentLayout "src/app/(frontend)/globals.css"
git commit -m "fix(document): polish from visual review"
```
(Skip if nothing changed.)

- [ ] **Step 5: Update memory**

Add to `indicate-site-content-workflow.md` in the memory directory: legal pages live in `src/endpoints/seed/legal/*.ts` as markdown, converted by `richText()`; the sidebar is a `sidebars` document named "Rechtliches"; terms and imprint have no dates yet. Update the spec's status line to "implemented".

---

## Self-review notes

- Spec coverage: 3.1 → Task 3; 3.2 → Task 4; 3.3 → Tasks 10/11; 4.1 → Tasks 1, 5, 6, 7, 8; 4.2 → Task 8; 4.3 → Task 5; 5 → Tasks 2, 9, 10; 6 → Task 11; 7 → Tasks 1, 2, 5, 9, 12.
- Names used across tasks: `HeadingIds`, `extractHeadings`, `nodeText`, `slugify` (Task 1) used in Tasks 6, 8; `richText` (Task 2) used in Tasks 9, 10; `shouldShowTranslationNotice`, `BindingLanguage` (Task 5) used in Tasks 7, 8; `sidebarGroupsFromDoc`, `SidebarGroup`, `SidebarContact` (Task 7) used in Task 8; `legalSlugs`, `LegalSlug`, `legalPage`, `legalSidebar` (Task 10); `aboutPage` (Task 11); `RenderBlocks` `slug` prop (Task 8).
