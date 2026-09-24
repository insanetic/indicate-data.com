# Block Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Editors can hide any page block (kept in the admin, never rendered) and copy a block with all its content to another page's draft.

**Architecture:** A local Payload plugin `src/plugins/blockTools/` adds a `hidden` checkbox, a "Copy to page…" UI field and a custom row label to every block of `pages.layout`, and registers `POST /api/pages/copy-block`. The frontend filters hidden blocks once in `RenderBlocks`. The copy runs server-side per locale in one transaction with a shared old→new id map.

**Tech Stack:** Payload 3.90.1 (Postgres adapter, drafts, localization de/en), Next 16, React 19, vitest (jsdom, `tests/int/`), Playwright (`tests/e2e/`).

**Spec:** `docs/superpowers/specs/2026-09-24-block-tools-design.md`

## Global Constraints

- Hide applies to all languages: `hidden` is a non-localised checkbox, `defaultValue: false`.
- Hiding is ordinary content: no hook or access rule treats `hidden` specially; it goes through draft → publish.
- Local plugin in `src/plugins/blockTools/`, not a `packages/` package.
- Scope: the `layout` blocks field of `pages`. Lexical blocks in Posts are out of scope.
- The copy appends to the end of the target page's **draft** (`draft: true`); the target's published version is not changed.
- Per locale, default locale first, `fallbackLocale: false`, `depth: 0`, `overrideAccess: false`, `user: req.user`, one transaction.
- The same old→new id map for every locale; new ids are 24 hex chars (ObjectId format).
- Admin copy is bilingual German/English, e.g. "Ausgeblendet / Hidden", "Auf der Website ausblenden / Hide on website".
- Dev DB schema is applied by push (no TTY: keep it additive). Production gets a migration via `make migration NAME=block_hidden`.
- Shared checkout: another session has uncommitted testimonials work (`packages/payload-plugin-testimonials/**`, `tests/int/testimonials-*.int.spec.ts`). Never stage those files; always `git add` explicit paths. Check `git diff` of regenerated files (`src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`, migrations) for hunks that aren't ours before committing, and ask the user if there are any.

## Review Focus

1. **Copying into a page that already has a pending draft**: the block lands in that draft (not a copy of the published version), and the published version stays the same. Pinned in Task 6 (DB test).
2. **Copying the same block twice**: gives two independent blocks with different ids; neither overwrites the other. Pinned in Task 2 (unit).
3. **Blocks with nested arrays and localised rich text**: every nested row gets a new id, and de and en share them. An English field that is empty stays empty (no German fallback). Pinned in Task 2 (unit).
4. **All blocks hidden, or the first block hidden**: the page renders without crashing; `isFirst` goes to the first visible block. Pinned in Task 1 (unit on `visibleBlocks`) plus Task 6 (e2e).
5. **Block not in the saved source (unsaved new block), request without login, same page as target**: 404 with a "save first" message, 401, and 400 respectively; nothing is written. Pinned in Task 2 (unit).

---

## File Structure

| File | Responsibility |
| --- | --- |
| `src/plugins/blockTools/visibleBlocks.ts` | Pure filter: blocks without `hidden === true` |
| `src/plugins/blockTools/copyBlock.ts` | `remapIds`, `newRowId`, `parseCopyBody`, `copyBlockToPage` (server logic, no HTTP) |
| `src/plugins/blockTools/endpoint.ts` | `createCopyBlockEndpoint`: auth, body, transaction, error → status |
| `src/plugins/blockTools/useL.ts` | Admin de/en string picker |
| `src/plugins/blockTools/BlockRowLabel.tsx` | Client: default block header + "Hidden" pill |
| `src/plugins/blockTools/CopyToPage.tsx` | Client: button + drawer + page picker, calls the endpoint |
| `src/plugins/blockTools/admin.ts` | Re-exports the two client components (import map target) |
| `src/plugins/blockTools/plugin.ts` | `blockToolsPlugin`: finds the blocks field, adds fields/Label/endpoint |
| `src/plugins/blockTools/index.ts` | Public server exports |
| `src/blocks/RenderBlocks.tsx` | Modify: filter with `visibleBlocks` |
| `src/plugins/index.ts` | Modify: register the plugin |
| `tests/int/block-tools-visible.int.spec.ts` | Task 1 |
| `tests/int/block-tools-copy.int.spec.ts` | Task 2 |
| `tests/int/block-tools-config.int.spec.ts` | Task 4 |
| `tests/int/block-tools-db.int.spec.ts` | Task 6 (opt-in DB test) |
| `tests/e2e/block-tools.e2e.spec.ts` | Task 6 |

---

### Task 1: Frontend filter for hidden blocks

**Files:**
- Create: `src/plugins/blockTools/visibleBlocks.ts`
- Modify: `src/blocks/RenderBlocks.tsx:77-84`
- Test: `tests/int/block-tools-visible.int.spec.ts`

**Interfaces:**
- Produces: `visibleBlocks<T extends { hidden?: boolean | null }>(blocks: T[] | null | undefined): T[]`

- [ ] **Step 1: Write the failing test**

`tests/int/block-tools-visible.int.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { visibleBlocks } from '@/plugins/blockTools/visibleBlocks'

describe('visibleBlocks', () => {
  it('drops blocks switched to hidden and keeps order', () => {
    const blocks = [
      { id: 'a', hidden: false },
      { id: 'b', hidden: true },
      { id: 'c' },
      { id: 'd', hidden: null },
    ]
    expect(visibleBlocks(blocks).map((b) => b.id)).toEqual(['a', 'c', 'd'])
  })

  it('returns an empty list when every block is hidden', () => {
    expect(visibleBlocks([{ id: 'a', hidden: true }])).toEqual([])
  })

  it('treats a missing layout as empty', () => {
    expect(visibleBlocks(null)).toEqual([])
    expect(visibleBlocks(undefined)).toEqual([])
  })

  it('makes the first visible block the first entry (isFirst)', () => {
    const blocks = [
      { id: 'hero', hidden: true },
      { id: 'faq', hidden: false },
    ]
    expect(visibleBlocks(blocks)[0].id).toBe('faq')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --config ./vitest.config.mts tests/int/block-tools-visible.int.spec.ts`
Expected: FAIL, cannot resolve `@/plugins/blockTools/visibleBlocks`.

- [ ] **Step 3: Implement**

`src/plugins/blockTools/visibleBlocks.ts`:

```ts
/** Blocks that render on the website: everything an editor has not switched to hidden. */
export const visibleBlocks = <T extends { hidden?: boolean | null }>(blocks: T[] | null | undefined): T[] =>
  Array.isArray(blocks) ? blocks.filter((block) => block?.hidden !== true) : []
```

In `src/blocks/RenderBlocks.tsx`, add the import next to the other `@/` imports:

```ts
import { visibleBlocks } from '@/plugins/blockTools/visibleBlocks'
```

and replace the start of the component:

```tsx
export const RenderBlocks: React.FC<{
  blocks: Block[]
  locale: Locale
  slug?: string
}> = ({ blocks: allBlocks, locale, slug }) => {
  // Hidden blocks never render; everything below (isFirst, the testimonials layout) sees only visible ones.
  const blocks = visibleBlocks(allBlocks)
  if (blocks.length === 0) return null
```

The rest stays unchanged: `layout: blocks`, `blockIndex: index` and `isFirst={index === 0}` now refer to the filtered list.

- [ ] **Step 4: Run tests and typecheck**

Run: `pnpm vitest run --config ./vitest.config.mts tests/int/block-tools-visible.int.spec.ts && pnpm tsc --noEmit -p .`
Expected: 4 passed; tsc clean. (`Page['layout']` blocks have no `hidden` yet; they still satisfy the optional constraint.)

- [ ] **Step 5: Commit**

```bash
git add src/plugins/blockTools/visibleBlocks.ts src/blocks/RenderBlocks.tsx tests/int/block-tools-visible.int.spec.ts
git commit -m "Block tools: skip hidden blocks when rendering a page"
```

---

### Task 2: Copy logic and endpoint

**Files:**
- Create: `src/plugins/blockTools/copyBlock.ts`
- Create: `src/plugins/blockTools/endpoint.ts`
- Test: `tests/int/block-tools-copy.int.spec.ts`

**Interfaces:**
- Produces:
  - `type IdMap = Map<string, string>`
  - `newRowId(): string` (24 hex chars)
  - `remapIds<T>(value: T, ids: IdMap, next?: () => string): T`
  - `parseCopyBody(data: unknown): { ok: true; body: CopyBody } | { ok: false; error: string }` with `CopyBody = { sourceId: number | string; targetId: number | string; blockId: string }`
  - `copyBlockToPage(args: CopyBlockArgs): Promise<CopyBlockResult>` with
    `CopyBlockArgs = CopyBody & { collection: CollectionSlug; field: string; req: PayloadRequest; newId?: () => string }` and
    `CopyBlockResult = { targetId: number | string; title: string; blockId: string }`. Throws `APIError` (400/404) or Payload's `Forbidden`/`NotFound`.
  - `createCopyBlockEndpoint(o: { collection: CollectionSlug; field: string }): Endpoint` with path `/copy-block`, method `post`.

- [ ] **Step 1: Write the failing tests**

`tests/int/block-tools-copy.int.spec.ts`. The fake payload models Postgres: a block's structure (ids, order) is shared across locales, and localised leaves (`heading`, `question`) are stored per locale. Writing locale X with a block that is new in the other locale adds it there with localised leaves `null`.

```ts
// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { APIError } from 'payload'

import { copyBlockToPage, parseCopyBody, remapIds } from '@/plugins/blockTools/copyBlock'

type Loose = Record<string, any>
const LOCALIZED = new Set(['heading', 'question'])

/** Blank localised leaves: what another locale sees of a block that was only written in one. */
const blankLocalized = (value: any): any => {
  if (Array.isArray(value)) return value.map(blankLocalized)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, LOCALIZED.has(k) ? null : blankLocalized(v)]))
}

const faq = (id: string, heading: string | null, question: string | null) => ({
  id,
  blockType: 'faq',
  hidden: false,
  heading,
  items: [{ id: `${id}-item`, question }],
})

const makeFake = () => {
  const docs: Record<string, Record<string, Loose>> = {
    '1': {
      de: { id: 1, title: 'Quelle', layout: [faq('aaaaaaaaaaaaaaaaaaaaaaaa', 'Überschrift', 'Frage')] },
      en: { id: 1, title: 'Source', layout: [faq('aaaaaaaaaaaaaaaaaaaaaaaa', 'Heading', null)] },
    },
    '2': {
      de: { id: 2, title: 'Ziel', layout: [faq('bbbbbbbbbbbbbbbbbbbbbbbb', 'Ziel DE', 'Q')] },
      en: { id: 2, title: 'Target', layout: [faq('bbbbbbbbbbbbbbbbbbbbbbbb', 'Target EN', 'Q')] },
    },
  }
  const findByID = vi.fn(async ({ id, locale }: Loose) => {
    const doc = docs[String(id)]?.[locale]
    if (!doc) throw new APIError('Not Found', 404)
    return structuredClone(doc)
  })
  const update = vi.fn(async ({ id, locale, data }: Loose) => {
    const perLocale = docs[String(id)]
    perLocale[locale] = { ...perLocale[locale], ...structuredClone(data) }
    for (const other of Object.keys(perLocale)) {
      if (other === locale) continue
      const known = new Map(perLocale[other].layout.map((b: Loose) => [b.id, b]))
      perLocale[other].layout = data.layout.map((b: Loose) => known.get(b.id) ?? blankLocalized(structuredClone(b)))
    }
    return structuredClone(perLocale[locale])
  })
  const payload = {
    config: { localization: { defaultLocale: 'de', localeCodes: ['en', 'de'] } },
    collections: { pages: { config: { admin: { useAsTitle: 'title' } } } },
    findByID,
    update,
  }
  const req = { payload, user: { id: 7 } } as never
  let n = 0
  const newId = () => (++n).toString(16).padStart(24, 'f')
  return { docs, findByID, update, req, newId }
}

const args = (fake: ReturnType<typeof makeFake>, over: Loose = {}) => ({
  collection: 'pages' as const,
  field: 'layout',
  sourceId: 1,
  targetId: 2,
  blockId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
  req: fake.req,
  newId: fake.newId,
  ...over,
})

describe('remapIds', () => {
  it('replaces every string id, nested ones too, and reuses the map', () => {
    const ids = new Map<string, string>()
    let n = 0
    const next = () => `new${++n}`
    const a = remapIds({ id: 'x', rows: [{ id: 'y', ref: 5 }], rel: { relationTo: 'media', value: 3 } }, ids, next)
    const b = remapIds({ id: 'x', rows: [{ id: 'y' }] }, ids, next)
    expect(a).toEqual({ id: 'new1', rows: [{ id: 'new2', ref: 5 }], rel: { relationTo: 'media', value: 3 } })
    expect(b).toEqual({ id: 'new1', rows: [{ id: 'new2' }] })
  })

  it('does not change the input', () => {
    const input = { id: 'x' }
    remapIds(input, new Map())
    expect(input).toEqual({ id: 'x' })
  })
})

describe('parseCopyBody', () => {
  it('accepts numeric or string ids and a block id', () => {
    expect(parseCopyBody({ sourceId: 1, targetId: '2', blockId: 'abc' })).toEqual({ ok: true, body: { sourceId: 1, targetId: '2', blockId: 'abc' } })
  })
  it.each([undefined, {}, { sourceId: 1, targetId: 2 }, { sourceId: 1, targetId: 2, blockId: '' }, { sourceId: null, targetId: 2, blockId: 'a' }])(
    'rejects %j',
    (data) => expect(parseCopyBody(data).ok).toBe(false),
  )
})

describe('copyBlockToPage', () => {
  it('appends the block to the end of the target, with new ids shared by de and en', async () => {
    const fake = makeFake()
    const result = await copyBlockToPage(args(fake))
    const de = fake.docs['2'].de.layout
    const en = fake.docs['2'].en.layout
    expect(de.map((b: Loose) => b.id)).toEqual(['bbbbbbbbbbbbbbbbbbbbbbbb', result.blockId])
    expect(en.map((b: Loose) => b.id)).toEqual(['bbbbbbbbbbbbbbbbbbbbbbbb', result.blockId])
    expect(result.blockId).not.toBe('aaaaaaaaaaaaaaaaaaaaaaaa')
    expect(de[1].items[0].id).toBe(en[1].items[0].id)
    expect(de[1].items[0].id).not.toBe('aaaaaaaaaaaaaaaaaaaaaaaa-item')
  })

  it('copies each language and leaves an empty English field empty', async () => {
    const fake = makeFake()
    await copyBlockToPage(args(fake))
    expect(fake.docs['2'].de.layout[1]).toMatchObject({ heading: 'Überschrift', items: [{ question: 'Frage' }] })
    expect(fake.docs['2'].en.layout[1]).toMatchObject({ heading: 'Heading', items: [{ question: null }] })
  })

  it('keeps the other blocks of the target in both languages', async () => {
    const fake = makeFake()
    await copyBlockToPage(args(fake))
    expect(fake.docs['2'].de.layout[0].heading).toBe('Ziel DE')
    expect(fake.docs['2'].en.layout[0].heading).toBe('Target EN')
  })

  it('reads and writes drafts, default locale first, no fallback, as the user', async () => {
    const fake = makeFake()
    await copyBlockToPage(args(fake))
    expect(fake.update.mock.calls.map(([o]: Loose[]) => o.locale)).toEqual(['de', 'en'])
    for (const [o] of [...fake.findByID.mock.calls, ...fake.update.mock.calls] as Loose[][]) {
      expect(o).toMatchObject({ collection: 'pages', depth: 0, draft: true, fallbackLocale: false, overrideAccess: false, user: { id: 7 } })
      expect(o.req).toBe(fake.req)
    }
    expect(fake.update.mock.calls.every(([o]: Loose[]) => o.id === 2)).toBe(true)
  })

  it('returns the target title in the default locale', async () => {
    const fake = makeFake()
    expect(await copyBlockToPage(args(fake))).toMatchObject({ targetId: 2, title: 'Ziel' })
  })

  it('copying twice gives two independent blocks', async () => {
    const fake = makeFake()
    const first = await copyBlockToPage(args(fake))
    const second = await copyBlockToPage(args(fake))
    expect(first.blockId).not.toBe(second.blockId)
    expect(fake.docs['2'].de.layout.map((b: Loose) => b.id)).toEqual(['bbbbbbbbbbbbbbbbbbbbbbbb', first.blockId, second.blockId])
  })

  it('rejects copying onto the same page without touching anything', async () => {
    const fake = makeFake()
    await expect(copyBlockToPage(args(fake, { targetId: '1' }))).rejects.toMatchObject({ status: 400 })
    expect(fake.findByID).not.toHaveBeenCalled()
  })

  it('404s with a save-first hint when the block is not in the saved source', async () => {
    const fake = makeFake()
    await expect(copyBlockToPage(args(fake, { blockId: 'cccccccccccccccccccccccc' }))).rejects.toMatchObject({ status: 404, message: expect.stringMatching(/save/i) })
    expect(fake.update).not.toHaveBeenCalled()
  })

  it('passes a missing target through as 404', async () => {
    const fake = makeFake()
    await expect(copyBlockToPage(args(fake, { targetId: 99 }))).rejects.toMatchObject({ status: 404 })
    expect(fake.update).not.toHaveBeenCalled()
  })
})

describe('copy-block endpoint', () => {
  it('401s without a user', async () => {
    const { createCopyBlockEndpoint } = await import('@/plugins/blockTools/endpoint')
    const endpoint = createCopyBlockEndpoint({ collection: 'pages', field: 'layout' })
    const res = await endpoint.handler({ user: null } as never)
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run --config ./vitest.config.mts tests/int/block-tools-copy.int.spec.ts`
Expected: FAIL, cannot resolve `@/plugins/blockTools/copyBlock`.

- [ ] **Step 3: Implement `copyBlock.ts`**

```ts
import { randomBytes } from 'crypto'
import { APIError, type CollectionSlug, type PayloadRequest } from 'payload'

export type IdMap = Map<string, string>

export type CopyBody = { sourceId: number | string; targetId: number | string; blockId: string }

export type CopyBlockArgs = CopyBody & {
  collection: CollectionSlug
  /** Name of the blocks field, e.g. `layout`. */
  field: string
  req: PayloadRequest
  /** Id generator; tests pass a deterministic one. */
  newId?: () => string
}

export type CopyBlockResult = { targetId: number | string; title: string; blockId: string }

/** New ObjectId-shaped id (24 hex chars), the format Payload uses for block and array rows. */
export const newRowId = () => randomBytes(12).toString('hex')

/**
 * Deep copy of `value` with every string `id` replaced through `ids`. Unseen ids get a new one and are
 * added to the map, so passing the same map for each locale gives the same ids in every language.
 */
export const remapIds = <T>(value: T, ids: IdMap, next: () => string = newRowId): T => {
  if (Array.isArray(value)) return value.map((item) => remapIds(item, ids, next)) as T
  if (!value || typeof value !== 'object') return value
  const out: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    if (key === 'id' && typeof child === 'string') {
      if (!ids.has(child)) ids.set(child, next())
      out[key] = ids.get(child)
    } else {
      out[key] = remapIds(child, ids, next)
    }
  }
  return out as T
}

const isDocId = (value: unknown): value is number | string =>
  (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && value !== '')

export const parseCopyBody = (data: unknown): { ok: true; body: CopyBody } | { ok: false; error: string } => {
  const { sourceId, targetId, blockId } = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  if (!isDocId(sourceId) || !isDocId(targetId) || typeof blockId !== 'string' || blockId === '') {
    return { ok: false, error: 'Expected { sourceId, targetId, blockId }' }
  }
  return { ok: true, body: { sourceId, targetId, blockId } }
}

type Row = { id?: unknown }
const rowsOf = (doc: unknown, field: string): Row[] => {
  const value = (doc as Record<string, unknown> | null)?.[field]
  return Array.isArray(value) ? (value as Row[]) : []
}

/**
 * Appends a copy of one block of the source document to the end of the target document's draft,
 * one locale at a time (default first) so every language is copied without fallback text.
 * Run it inside a transaction: a failure in a later locale must undo the earlier ones.
 */
export const copyBlockToPage = async ({ collection, field, sourceId, targetId, blockId, req, newId = newRowId }: CopyBlockArgs): Promise<CopyBlockResult> => {
  if (String(sourceId) === String(targetId)) {
    throw new APIError('Source and target are the same page; use Duplicate on the block instead.', 400)
  }
  const { payload } = req
  const localization = payload.config.localization
  const locales: (string | undefined)[] = localization
    ? [localization.defaultLocale, ...localization.localeCodes.filter((code) => code !== localization.defaultLocale)]
    : [undefined]
  const useAsTitle = payload.collections[collection]?.config.admin?.useAsTitle || 'id'
  const common = { collection, depth: 0, draft: true, fallbackLocale: false as const, overrideAccess: false, user: req.user, req }

  const ids: IdMap = new Map()
  let title = ''
  for (const locale of locales) {
    const source = await payload.findByID({ ...common, id: sourceId, locale: locale as never })
    const block = rowsOf(source, field).find((row) => row.id === blockId)
    if (!block) throw new APIError('Block not found on the source page. Save the page first, then copy.', 404)
    const target = await payload.findByID({ ...common, id: targetId, locale: locale as never })
    const copied = remapIds(block, ids, newId)
    // After the first locale the copy already exists on the target (structure is shared); replace it in place.
    const others = rowsOf(target, field).filter((row) => row.id !== copied.id)
    await payload.update({ ...common, id: targetId, locale: locale as never, data: { [field]: [...others, copied] } as never })
    if (!title) title = String((target as Record<string, unknown>)[useAsTitle] ?? targetId)
  }
  return { targetId, title, blockId: String(ids.get(blockId)) }
}
```

- [ ] **Step 4: Implement `endpoint.ts`**

```ts
import { addDataAndFileToRequest, APIError, commitTransaction, initTransaction, killTransaction, type CollectionSlug, type Endpoint } from 'payload'

import { copyBlockToPage, parseCopyBody } from './copyBlock'

/** POST /api/<collection>/copy-block — `{ sourceId, targetId, blockId }` → appends the block to the target's draft. */
export const createCopyBlockEndpoint = ({ collection, field }: { collection: CollectionSlug; field: string }): Endpoint => ({
  path: '/copy-block',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    await addDataAndFileToRequest(req)
    const parsed = parseCopyBody(req.data)
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 })

    const shouldCommit = await initTransaction(req)
    try {
      const result = await copyBlockToPage({ ...parsed.body, collection, field, req })
      if (shouldCommit) await commitTransaction(req)
      return Response.json(result)
    } catch (error) {
      await killTransaction(req)
      const status = error instanceof APIError ? error.status : 500
      if (status >= 500) req.payload.logger.error({ err: error, msg: 'blockTools: copy-block failed' })
      return Response.json({ error: status >= 500 ? 'Copy failed' : (error as Error).message }, { status })
    }
  },
})
```

(`Forbidden` and `NotFound` from Payload extend `APIError`, so access errors come back as 403/404.)

- [ ] **Step 5: Run tests and typecheck**

Run: `pnpm vitest run --config ./vitest.config.mts tests/int/block-tools-copy.int.spec.ts && pnpm tsc --noEmit -p .`
Expected: all pass; tsc clean. If `payload.collections[collection]` doesn't typecheck with a generic `CollectionSlug`, cast: `(payload.collections as Record<string, { config: { admin?: { useAsTitle?: string } } } | undefined>)[collection]`.

- [ ] **Step 6: Commit**

```bash
git add src/plugins/blockTools/copyBlock.ts src/plugins/blockTools/endpoint.ts tests/int/block-tools-copy.int.spec.ts
git commit -m "Block tools: copy a block to another page's draft, all locales, one transaction"
```

---

### Task 3: Admin components

**Files:**
- Create: `src/plugins/blockTools/useL.ts`
- Create: `src/plugins/blockTools/BlockRowLabel.tsx`
- Create: `src/plugins/blockTools/CopyToPage.tsx`
- Create: `src/plugins/blockTools/admin.ts`

**Interfaces:**
- Consumes: endpoint `POST {api}/{collectionSlug}/copy-block` from Task 2, response `CopyBlockResult` or `{ error }`.
- Produces: import-map paths `@/plugins/blockTools/admin#BlockRowLabel` (client prop `label: StaticLabel`) and `@/plugins/blockTools/admin#CopyToPage` (UI field; uses the `path` prop).

These are client components with no unit tests; they're verified by typecheck here and by the e2e and browser checks in Tasks 6–7.

- [ ] **Step 1: `useL.ts`**

```ts
'use client'

import { useTranslation } from '@payloadcms/ui'

/** Picks the German or English string for the admin UI language. */
export const useL = () => {
  const { i18n } = useTranslation()
  return (de: string, en: string) => (i18n.language === 'de' ? de : en)
}
```

- [ ] **Step 2: `BlockRowLabel.tsx`**

Rebuilds Payload's default block header (`blocks-field__block-number`, type pill, editable `SectionTitle`) so nothing is lost, and adds the hidden pill.

```tsx
'use client'

import { Pill, SectionTitle, useDocumentInfo, useFormFields, useRowLabel, useTranslation } from '@payloadcms/ui'
import type { StaticLabel } from 'payload'
import React from 'react'

import { useL } from './useL'

const baseClass = 'blocks-field'

const labelText = (label: StaticLabel | undefined, language: string): string => {
  if (!label) return ''
  if (typeof label === 'string') return label
  return label[language] ?? Object.values(label)[0] ?? ''
}

/** Default block row header (number, block type, editable block name) plus a pill when the block is hidden. */
export const BlockRowLabel: React.FC<{ label?: StaticLabel }> = ({ label }) => {
  const { path, rowNumber } = useRowLabel()
  const { i18n } = useTranslation()
  const { docPermissions } = useDocumentInfo()
  const hidden = useFormFields(([fields]) => fields[`${path}.hidden`]?.value === true)
  const l = useL()

  return (
    <>
      <span className={`${baseClass}__block-number`}>{String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
      <Pill className={`${baseClass}__block-pill`} pillStyle="white" size="small">
        {labelText(label, i18n.language)}
      </Pill>
      <SectionTitle path={`${path}.blockName`} readOnly={docPermissions?.update === false} />
      {hidden && (
        <Pill pillStyle="warning" size="small">
          {l('Ausgeblendet', 'Hidden')}
        </Pill>
      )}
    </>
  )
}
```

- [ ] **Step 3: `CopyToPage.tsx`**

```tsx
'use client'

import {
  Button,
  Drawer,
  ReactSelect,
  type ReactSelectOption,
  toast,
  useConfig,
  useDocumentInfo,
  useFormFields,
  useFormModified,
  useModal,
} from '@payloadcms/ui'
import React, { useState } from 'react'

import { useL } from './useL'

/** "Copy to page…": appends this block (as last saved) to another document's draft via the copy-block endpoint. */
export const CopyToPage: React.FC<{ path: string }> = ({ path }) => {
  const rowPath = path.slice(0, path.lastIndexOf('.'))
  const blockId = useFormFields(([fields]) => fields[`${rowPath}.id`]?.value as string | undefined)
  const { id, collectionSlug } = useDocumentInfo()
  const modified = useFormModified()
  const { config } = useConfig()
  const { openModal, closeModal } = useModal()
  const l = useL()
  const [options, setOptions] = useState<ReactSelectOption[]>([])
  const [target, setTarget] = useState<ReactSelectOption | null>(null)
  const [busy, setBusy] = useState(false)

  const drawerSlug = `copy-block-${blockId}`
  const api = `${config.serverURL}${config.routes.api}/${collectionSlug}`
  const useAsTitle = config.collections.find((c) => c.slug === collectionSlug)?.admin?.useAsTitle || 'id'

  const open = () => {
    setTarget(null)
    openModal(drawerSlug)
    const query = `depth=0&draft=true&pagination=false&sort=${useAsTitle}&select[${useAsTitle}]=true&where[id][not_equals]=${id}`
    fetch(`${api}?${query}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { docs: [] }))
      .then((d: { docs: Record<string, unknown>[] }) =>
        setOptions(d.docs.map((doc) => ({ label: String(doc[useAsTitle] || `#${doc.id}`), value: String(doc.id) }))),
      )
      .catch(() => setOptions([]))
  }

  const copy = async () => {
    if (!target) return
    setBusy(true)
    try {
      const res = await fetch(`${api}/copy-block`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId: id, targetId: target.value, blockId }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || res.statusText)
      closeModal(drawerSlug)
      toast.success(
        <span>
          {l('Kopiert nach', 'Copied to')}{' '}
          <a href={`${config.routes.admin}/collections/${collectionSlug}/${body.targetId}`}>{body.title}</a>
          {l(' (Entwurf)', ' (draft)')}
        </span>,
      )
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const disabled = !id || !blockId || modified

  return (
    <div className="field-type" style={{ alignSelf: 'flex-end' }}>
      <Button buttonStyle="secondary" disabled={disabled} margin={false} onClick={open} size="small">
        {l('Auf andere Seite kopieren…', 'Copy to page…')}
      </Button>
      {modified && <div className="field-description">{l('Erst speichern, dann kopieren.', 'Save first, then copy.')}</div>}
      <Drawer slug={drawerSlug} title={l('Block auf andere Seite kopieren', 'Copy block to another page')}>
        <p>{l('Der Block wird ans Ende des Entwurfs der Zielseite angehängt.', "The block is appended to the end of the target page's draft.")}</p>
        <ReactSelect
          onChange={(value) => setTarget(Array.isArray(value) ? (value[0] ?? null) : value)}
          options={options}
          value={target ?? undefined}
        />
        <div style={{ marginTop: '1rem' }}>
          <Button disabled={!target || busy} onClick={copy}>
            {busy ? '…' : l('Kopieren', 'Copy')}
          </Button>
        </div>
      </Drawer>
    </div>
  )
}
```

- [ ] **Step 4: `admin.ts`**

```ts
export { BlockRowLabel } from './BlockRowLabel'
export { CopyToPage } from './CopyToPage'
```

- [ ] **Step 5: Typecheck**

Run: `pnpm tsc --noEmit -p .`
Expected: clean. If `Button` lacks the `margin` prop in 3.90.1, remove it. If `ReactSelect`'s `value` rejects `undefined`, pass `value={target ?? []}`.

- [ ] **Step 6: Commit**

```bash
git add src/plugins/blockTools/useL.ts src/plugins/blockTools/BlockRowLabel.tsx src/plugins/blockTools/CopyToPage.tsx src/plugins/blockTools/admin.ts
git commit -m "Block tools: row label with hidden pill, copy-to-page drawer"
```

---

### Task 4: Plugin, registration, generated files

**Files:**
- Create: `src/plugins/blockTools/plugin.ts`
- Create: `src/plugins/blockTools/index.ts`
- Modify: `src/plugins/index.ts` (import; add the plugin before `unlocalizedCollections`)
- Regenerate: `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`
- Test: `tests/int/block-tools-config.int.spec.ts`

**Interfaces:**
- Consumes: `createCopyBlockEndpoint` (Task 2), component paths (Task 3).
- Produces: `blockToolsPlugin(options: BlockToolsOptions): Plugin` with `BlockToolsOptions = { collections: Partial<Record<CollectionSlug, { field: string }>> }`; export `BLOCK_TOOLS_COMPONENTS = '@/plugins/blockTools/admin'`.

- [ ] **Step 1: Write the failing test**

`tests/int/block-tools-config.int.spec.ts`:

```ts
import type { Block, Config, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { blockSlugs } from '@/blocks/registry'
import { Pages } from '@/collections/Pages'
import { blockToolsPlugin } from '@/plugins/blockTools'

const layoutBlocks = (fields: Field[]): Block[] => {
  for (const f of fields) {
    if (f.type === 'blocks' && f.name === 'layout') return f.blocks
    if (f.type === 'tabs') for (const tab of f.tabs) if (!('name' in tab && tab.name)) {
      const found = layoutBlocks(tab.fields)
      if (found.length) return found
    }
  }
  return []
}

const apply = (config: Partial<Config>, collections = { pages: { field: 'layout' } }) =>
  blockToolsPlugin({ collections })(config as Config) as Config

const pagesOut = () => apply({ collections: [Pages] }).collections!.find((c) => c.slug === 'pages')!

describe('blockToolsPlugin', () => {
  it('gives every layout block a non-localised hidden checkbox and the copy button, first', () => {
    const blocks = layoutBlocks(pagesOut().fields)
    expect(blocks.map((b) => b.slug).sort()).toEqual([...blockSlugs].sort())
    for (const block of blocks) {
      const row = block.fields[0]
      expect(row.type).toBe('row')
      if (row.type !== 'row') continue
      const [hidden, copy] = row.fields
      expect(hidden).toMatchObject({ name: 'hidden', type: 'checkbox', defaultValue: false })
      expect('localized' in hidden && hidden.localized).toBeFalsy()
      expect(copy).toMatchObject({ name: 'copyToPage', type: 'ui', admin: { components: { Field: '@/plugins/blockTools/admin#CopyToPage' } } })
    }
  })

  it('sets the row label with the block label as client prop', () => {
    const faq = layoutBlocks(pagesOut().fields).find((b) => b.slug === 'faq')!
    expect(faq.admin?.components?.Label).toEqual({
      path: '@/plugins/blockTools/admin#BlockRowLabel',
      clientProps: { label: { de: 'Häufige Fragen (FAQ)', en: 'FAQ' } },
    })
  })

  it('registers the copy-block endpoint on the collection', () => {
    expect(pagesOut().endpoints).toEqual(expect.arrayContaining([expect.objectContaining({ path: '/copy-block', method: 'post' })]))
  })

  it('leaves the original config objects untouched', () => {
    apply({ collections: [Pages] })
    const faq = layoutBlocks(Pages.fields).find((b) => b.slug === 'faq')!
    const hasHidden = faq.fields.some((f) => f.type === 'row' && f.fields.some((x) => 'name' in x && x.name === 'hidden'))
    expect(hasHidden).toBe(false)
    expect(faq.admin?.components?.Label).toBeUndefined()
  })

  it('throws for an unknown collection, a missing field, a non-blocks field and an existing Label', () => {
    const base = { slug: 'pages', fields: [{ name: 'layout', type: 'blocks', blocks: [{ slug: 'a', fields: [] }] }] }
    expect(() => apply({ collections: [base as never] }, { nope: { field: 'layout' } } as never)).toThrow(/nope/)
    expect(() => apply({ collections: [base as never] }, { pages: { field: 'other' } })).toThrow(/other/)
    expect(() => apply({ collections: [{ slug: 'pages', fields: [{ name: 'layout', type: 'text' }] } as never] })).toThrow(/not a blocks field/)
    const withLabel = { slug: 'pages', fields: [{ name: 'layout', type: 'blocks', blocks: [{ slug: 'a', fields: [], admin: { components: { Label: 'x#Y' } } }] }] }
    expect(() => apply({ collections: [withLabel as never] })).toThrow(/Label/)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run --config ./vitest.config.mts tests/int/block-tools-config.int.spec.ts`
Expected: FAIL, cannot resolve `@/plugins/blockTools`.

- [ ] **Step 3: Implement `plugin.ts`**

```ts
import type { Block, BlocksField, CollectionConfig, CollectionSlug, Field, Plugin } from 'payload'

import { createCopyBlockEndpoint } from './endpoint'

export const BLOCK_TOOLS_COMPONENTS = '@/plugins/blockTools/admin'

export type BlockToolsOptions = {
  /** Collections and the name of their blocks field, e.g. `{ pages: { field: 'layout' } }`. */
  collections: Partial<Record<CollectionSlug, { field: string }>>
}

const toolsRow: Field = {
  type: 'row',
  fields: [
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      label: { de: 'Auf der Website ausblenden', en: 'Hide on website' },
      admin: {
        width: '50%',
        description: {
          de: 'Bleibt gespeichert und kann jederzeit wieder eingeblendet werden.',
          en: 'Stays saved; unhide any time.',
        },
      },
    },
    {
      name: 'copyToPage',
      type: 'ui',
      admin: { components: { Field: `${BLOCK_TOOLS_COMPONENTS}#CopyToPage` } },
    },
  ],
}

const withTools = (block: Block): Block => {
  if (block.admin?.components?.Label) {
    throw new Error(`blockTools: block "${block.slug}" already has admin.components.Label`)
  }
  const singular = block.labels?.singular
  return {
    ...block,
    admin: {
      ...block.admin,
      components: {
        ...block.admin?.components,
        Label: {
          path: `${BLOCK_TOOLS_COMPONENTS}#BlockRowLabel`,
          clientProps: { label: typeof singular === 'function' || !singular ? block.slug : singular },
        },
      },
    },
    fields: [toolsRow, ...block.fields],
  }
}

const withToolsOnField = (field: BlocksField): BlocksField => {
  if (field.blockReferences) throw new Error(`blockTools: "${field.name}" uses blockReferences, which is not supported`)
  return { ...field, blocks: field.blocks.map(withTools) }
}

/** Finds the named blocks field at the top level or inside rows, collapsibles and unnamed tabs. */
const mapBlocksField = (fields: Field[], name: string): { fields: Field[]; found: boolean } => {
  let found = false
  const next = fields.map((f): Field => {
    if (found) return f
    if ('name' in f && f.name === name) {
      if (f.type !== 'blocks') throw new Error(`blockTools: "${name}" is not a blocks field`)
      found = true
      return withToolsOnField(f)
    }
    if (f.type === 'row' || f.type === 'collapsible') {
      const inner = mapBlocksField(f.fields, name)
      if (inner.found) {
        found = true
        return { ...f, fields: inner.fields }
      }
    }
    if (f.type === 'tabs') {
      const tabs = f.tabs.map((tab) => {
        if (found || ('name' in tab && tab.name)) return tab
        const inner = mapBlocksField(tab.fields, name)
        if (!inner.found) return tab
        found = true
        return { ...tab, fields: inner.fields }
      })
      if (found) return { ...f, tabs }
    }
    return f
  })
  return { fields: next, found }
}

/**
 * Adds "hide on website" and "copy to page" to every block of the configured blocks fields:
 * a `hidden` checkbox and a copy button on each block, a row label that shows hidden blocks,
 * and `POST /api/<collection>/copy-block`. Rendering code filters with `visibleBlocks`.
 */
export const blockToolsPlugin =
  (options: BlockToolsOptions): Plugin =>
  (config) => {
    const collections = config.collections || []
    for (const slug of Object.keys(options.collections)) {
      if (!collections.some((c) => c.slug === slug)) throw new Error(`blockTools: unknown collection "${slug}"`)
    }
    return {
      ...config,
      collections: collections.map((collection): CollectionConfig => {
        const o = options.collections[collection.slug as CollectionSlug]
        if (!o) return collection
        const { fields, found } = mapBlocksField(collection.fields, o.field)
        if (!found) throw new Error(`blockTools: collection "${collection.slug}" has no field "${o.field}"`)
        return {
          ...collection,
          fields,
          endpoints: [...(collection.endpoints || []), createCopyBlockEndpoint({ collection: collection.slug as CollectionSlug, field: o.field })],
        }
      }),
    }
  }
```

`src/plugins/blockTools/index.ts`:

```ts
export { BLOCK_TOOLS_COMPONENTS, blockToolsPlugin, type BlockToolsOptions } from './plugin'
export { visibleBlocks } from './visibleBlocks'
```

- [ ] **Step 4: Run the config test**

Run: `pnpm vitest run --config ./vitest.config.mts tests/int/block-tools-config.int.spec.ts tests/int/blocks.int.spec.ts`
Expected: all pass.

- [ ] **Step 5: Register the plugin**

In `src/plugins/index.ts` add the import:

```ts
import { blockToolsPlugin } from './blockTools'
```

and in the `plugins` array, directly after `testimonialsPlugin(),`:

```ts
  // Hide any page block without deleting it, and copy blocks to other pages (see spec 2026-09-24-block-tools).
  blockToolsPlugin({ collections: { pages: { field: 'layout' } } }),
```

- [ ] **Step 6: Regenerate types and the import map**

Run: `pnpm generate:types && pnpm generate:importmap`
Expected: every `*Block` interface in `src/payload-types.ts` gains `hidden?: boolean | null`; `importMap.js` gains `BlockRowLabel` and `CopyToPage` from `@/plugins/blockTools/admin`.

Then: `git diff --stat src/payload-types.ts "src/app/(payload)/admin/importMap.js"` and `git diff src/payload-types.ts | grep '^[+-]' | grep -v hidden`. Anything that isn't `hidden` or `copyToPage` comes from the other session's work. Stop and ask the user before committing those hunks.

- [ ] **Step 7: Full check**

Run: `pnpm tsc --noEmit -p . && pnpm lint && pnpm test:int`
Expected: clean; all int specs pass (DB specs skipped).

- [ ] **Step 8: Commit**

```bash
git add src/plugins/blockTools/plugin.ts src/plugins/blockTools/index.ts src/plugins/index.ts src/payload-types.ts "src/app/(payload)/admin/importMap.js" tests/int/block-tools-config.int.spec.ts
git commit -m "Block tools plugin: hidden checkbox, copy button and row label on every page block"
```

---

### Task 5: Dev schema and production migration

**Files:**
- Create: `src/migrations/<stamp>_block_hidden.ts` (+ `.json`), `src/migrations/index.ts` (generated)

- [ ] **Step 1: Let the dev push apply the column**

The Docker app picks up the config change (additive: one `hidden boolean default false` column per `pages_blocks_*` and `_pages_v_blocks_*` table). Check that it applied:

Run: `docker compose logs --since 5m app | grep -iE "error|pull|push" | tail -20` and
`psql postgres://payload:payload@localhost:5433/payload -c "\d pages_blocks_faq" | grep hidden`
Expected: a `hidden | boolean | ... default false` line; no push errors. If the app is stuck on a prompt, `docker compose restart app`.

- [ ] **Step 2: Generate the production migration**

Run: `make migration NAME=block_hidden`
Then review the SQL: it must contain only `ALTER TABLE ... ADD COLUMN "hidden" boolean DEFAULT false` statements (up) and the matching `DROP COLUMN` (down) for the block and version tables. If it contains anything else (e.g. testimonials changes from the other session), stop and ask the user.

- [ ] **Step 3: Commit**

```bash
git add src/migrations/
git status --short src/migrations
git commit -m "Migration: hidden column on page blocks"
```

---

### Task 6: DB integration test and e2e

**Files:**
- Create: `tests/int/block-tools-db.int.spec.ts`
- Create: `tests/e2e/block-tools.e2e.spec.ts`

**Interfaces:**
- Consumes: `copyBlockToPage` (Task 2), the running app with the plugin (Tasks 4–5), `paragraphs` from `@/endpoints/seed/lexical`, `login`/`seedTestUser` from `tests/helpers`.

- [ ] **Step 1: DB test (opt-in, never on the shared `payload` DB)**

`tests/int/block-tools-db.int.spec.ts`:

```ts
// @vitest-environment node
import { commitTransaction, getPayload, initTransaction, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { paragraphs } from '@/endpoints/seed/lexical'
import config from '@/payload.config'
import { copyBlockToPage } from '@/plugins/blockTools/copyBlock'

// Writes to the database in DATABASE_URL: opt-in with BLOCK_TOOLS_DB_TEST=1, never the shared dev DB (`payload`).
const databaseName = (() => {
  try {
    return new URL(process.env.DATABASE_URL || '').pathname.slice(1)
  } catch {
    return ''
  }
})()
const enabled = process.env.BLOCK_TOOLS_DB_TEST === '1' && databaseName !== '' && databaseName !== 'payload'
const describeDb = enabled ? describe : describe.skip

const run = `${Date.now()}`
const context = { disableRevalidate: true }
type Loose = Record<string, any>

const faq = (heading: string, question: string) => ({
  blockType: 'faq',
  header: { heading },
  items: [{ question, answer: paragraphs([question]) }],
})

describeDb(`copyBlockToPage against the database${enabled ? '' : ' (skipped: needs BLOCK_TOOLS_DB_TEST=1 and a DATABASE_URL other than /payload)'}`, () => {
  let payload: Payload
  let user: Loose
  let sourceId: number
  let targetId: number

  const read = (id: number, locale: 'de' | 'en', draft: boolean) =>
    payload.findByID({ collection: 'pages', id, locale, draft, depth: 0, fallbackLocale: false, context }) as Promise<Loose>

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    user = (await payload.find({ collection: 'users', limit: 1 })).docs[0]
    const source = await payload.create({ collection: 'pages', locale: 'de', context, data: { title: `BT source ${run}`, slug: `bt-source-${run}`, _status: 'published', layout: [faq('Quelle DE', 'Frage DE')] } as never })
    sourceId = source.id
    const src = await read(sourceId, 'de', false)
    await payload.update({ collection: 'pages', id: sourceId, locale: 'en', context, data: { layout: [{ ...src.layout[0], header: { heading: 'Source EN' }, items: [{ ...src.layout[0].items[0], question: 'Question EN' }] }] } as never })
    const target = await payload.create({ collection: 'pages', locale: 'de', context, data: { title: `BT target ${run}`, slug: `bt-target-${run}`, _status: 'published', layout: [faq('Ziel live', 'Q')] } as never })
    targetId = target.id
    // A pending draft on the target that differs from the published version.
    const tgt = await read(targetId, 'de', false)
    await payload.update({ collection: 'pages', id: targetId, locale: 'de', draft: true, context, data: { layout: [{ ...tgt.layout[0], header: { heading: 'Ziel Entwurf' } }] } as never })
  })

  afterAll(async () => {
    if (!payload) return
    await payload.delete({ collection: 'pages', where: { slug: { in: [`bt-source-${run}`, `bt-target-${run}`] } }, context })
  })

  it('appends to the pending draft in both languages and leaves the published version alone', async () => {
    const req = { payload, user: { ...user, collection: 'users' }, context } as unknown as PayloadRequest
    const shouldCommit = await initTransaction(req)
    const result = await copyBlockToPage({ collection: 'pages', field: 'layout', sourceId, targetId, blockId: (await read(sourceId, 'de', true)).layout[0].id, req })
    if (shouldCommit) await commitTransaction(req)

    const draftDe = await read(targetId, 'de', true)
    const draftEn = await read(targetId, 'en', true)
    expect(draftDe.layout.map((b: Loose) => b.header.heading)).toEqual(['Ziel Entwurf', 'Quelle DE'])
    expect(draftEn.layout[1]).toMatchObject({ id: result.blockId, header: { heading: 'Source EN' }, items: [{ question: 'Question EN' }] })
    expect(draftDe.layout[1].items[0].id).toBe(draftEn.layout[1].items[0].id)

    const published = await read(targetId, 'de', false)
    expect(published.layout.map((b: Loose) => b.header.heading)).toEqual(['Ziel live'])

    const source = await read(sourceId, 'de', true)
    expect(source.layout).toHaveLength(1)
  })
})
```

Run it against a scratch copy (stop the app first, see memory `testimonials-package`):

```bash
docker compose stop app
psql postgres://payload:payload@localhost:5433/payload -c "CREATE DATABASE block_tools_scratch TEMPLATE payload"
docker compose start app
BLOCK_TOOLS_DB_TEST=1 DATABASE_URL=postgres://payload:payload@localhost:5433/block_tools_scratch pnpm vitest run --config ./vitest.config.mts tests/int/block-tools-db.int.spec.ts
psql postgres://payload:payload@localhost:5433/payload -c "DROP DATABASE block_tools_scratch"
```

Expected: 1 passed. Without the env var, `pnpm test:int` reports it as skipped.

- [ ] **Step 2: E2E**

`tests/e2e/block-tools.e2e.spec.ts`. It creates two scratch pages through the local API and deletes them afterwards.

```ts
import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import { paragraphs } from '../../src/endpoints/seed/lexical'
import config from '../../src/payload.config.js'
import { presetConsent } from '../helpers/consent'
import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

const base = 'http://localhost:3000'
const run = `${Date.now()}`
const context = { disableRevalidate: true }
const faq = (heading: string, hidden = false) => ({ blockType: 'faq', hidden, header: { heading }, items: [{ question: `${heading}?`, answer: paragraphs(['A']) }] })

test.describe('Block tools', () => {
  let payload: Payload
  let pageId: number
  let otherId: number

  test.beforeAll(async () => {
    await seedTestUser()
    payload = await getPayload({ config })
    const page = await payload.create({ collection: 'pages', locale: 'de', context, data: { title: `BT e2e ${run}`, slug: `bt-e2e-${run}`, _status: 'published', layout: [faq(`Versteckt ${run}`, true), faq(`Sichtbar ${run}`)] } as never })
    pageId = page.id
    const other = await payload.create({ collection: 'pages', locale: 'de', context, data: { title: `BT e2e Ziel ${run}`, slug: `bt-e2e-ziel-${run}`, _status: 'published', layout: [faq(`Ziel ${run}`)] } as never })
    otherId = other.id
  })

  test.afterAll(async () => {
    await payload.delete({ collection: 'pages', where: { slug: { in: [`bt-e2e-${run}`, `bt-e2e-ziel-${run}`] } }, context })
    await cleanupTestUser()
  })

  test('a hidden block does not render, the visible one does', async ({ page, context: browser }) => {
    await presetConsent(browser)
    await page.goto(`${base}/de/bt-e2e-${run}`)
    await expect(page.getByText(`Sichtbar ${run}`)).toBeVisible()
    await expect(page.getByText(`Versteckt ${run}`)).toHaveCount(0)
  })

  test('the admin marks the hidden block and can copy a block to another page', async ({ page }) => {
    await login({ page, user: testUser })
    await page.goto(`${base}/admin/collections/pages/${pageId}`)
    await page.getByRole('tab', { name: /Inhalt|Content/ }).click()
    await expect(page.locator('.blocks-field__block-header').first().getByText(/Ausgeblendet|Hidden/)).toBeVisible()
    await expect(page.locator('.blocks-field__block-header').nth(1).getByText(/Ausgeblendet|Hidden/)).toHaveCount(0)

    // Expand the second block and copy it.
    await page.locator('.blocks-field__block-header').nth(1).click()
    await page.getByRole('button', { name: /Auf andere Seite kopieren|Copy to page/ }).last().click()
    await page.locator('.rs__control').last().click()
    await page.getByText(`BT e2e Ziel ${run}`, { exact: true }).click()
    await page.getByRole('button', { name: /^(Kopieren|Copy)$/ }).click()
    await expect(page.getByText(/Kopiert nach|Copied to/)).toBeVisible()

    const draft = (await payload.findByID({ collection: 'pages', id: otherId, draft: true, depth: 0, locale: 'de' })) as { layout: { header: { heading: string } }[] }
    expect(draft.layout.map((b) => b.header.heading)).toEqual([`Ziel ${run}`, `Sichtbar ${run}`])
  })
})
```

Run: `pnpm test:e2e tests/e2e/block-tools.e2e.spec.ts`
Expected: 2 passed. If a selector doesn't match the 3.90 admin DOM (tab name, `.rs__control`), fix the selector against the page (Playwright trace), not the assertion.

- [ ] **Step 3: Commit**

```bash
git add tests/int/block-tools-db.int.spec.ts tests/e2e/block-tools.e2e.spec.ts
git commit -m "Block tools: DB integration test and e2e for hide and copy"
```

---

### Task 7: Manual check in the running app

- [ ] **Step 1:** In the admin (http://localhost:3000/admin), open a real page, e.g. the home page, and check (browser tools or manually):
  - The collapsed row headers look like before (number, type pill, editable block name); the block name can still be edited.
  - Tick "Auf der Website ausblenden" on one block → the "Ausgeblendet" pill appears in the header right away. Live preview drops the block after autosave. **Untick it again and don't publish** (shared dev content).
  - "Auf andere Seite kopieren…" is disabled while there are unsaved changes and enabled after autosave. Don't copy onto real pages; the e2e test covered that.
- [ ] **Step 2:** Final `pnpm tsc --noEmit -p . && pnpm lint && pnpm test:int` and report the results.
