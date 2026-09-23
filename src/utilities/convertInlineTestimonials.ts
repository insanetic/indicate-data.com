import { createLocalReq, type Payload, type PayloadRequest, type Where } from 'payload'

import type { Page } from '@/payload-types'
import { locales, type Locale } from '@/i18n/config'

type Localised = Partial<Record<Locale, string | null>> | string | null | undefined
type InlineItem = { name?: string | null; company?: string | null; quote?: Localised; role?: Localised; avatar?: unknown; logo?: unknown }
type Block = { blockType?: string; id?: string | null; items?: InlineItem[] | null; testimonials?: unknown[] | null; seed?: string | null }
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
export type Assignment = { pageId: number; blockId: string; keys: string[] }
export type NeedsReview = { pageId: number; blockId: string; reason: string }
/** What the collection holds (or is about to hold) for one person. */
export type Held = {
  name: string
  company: string | null
  avatar: number | null
  logo: number | null
  quote: Partial<Record<Locale, string>>
  role: Partial<Record<Locale, string>>
}

export const keyOf = (name?: string | null, company?: string | null) => `${(name || '').trim().toLowerCase()}|${(company || '').trim().toLowerCase()}`

const perLocale = (value: Localised): Partial<Record<Locale, string>> => {
  if (!value) return {}
  if (typeof value === 'string') return { [locales[0]]: value }
  return Object.fromEntries(Object.entries(value).filter(([, v]) => Boolean(v))) as Partial<Record<Locale, string>>
}
const mediaId = (v: unknown) => (typeof v === 'number' ? v : v && typeof v === 'object' ? ((v as { id?: number }).id ?? null) : null)

/**
 * Testimonials blocks that still carry inline quotes, reference nothing yet and have no seed.
 * Rows saved before the switch have no seed; converted, new and reshuffled blocks always do, so a
 * converted block whose selection an editor later cleared is not converted again.
 */
const legacyBlocks = (page: PageLike) =>
  (page.layout || [])
    .map((raw) => raw as Block)
    .filter((b) => b.blockType === 'testimonials' && b.id && !b.seed && (b.testimonials || []).length === 0)
    .map((b) => ({ id: b.id as string, items: (b.items || []).filter((i) => i.name && i.quote) }))
    .filter((b) => b.items.length > 0)

/**
 * Pure part of the conversion for published pages: which people exist (deduped by name +
 * company) and which blocks point at them. Pages must be read with `locale: 'all'` so localised
 * fields arrive as `{ de, en }`. Blocks that already reference testimonials are skipped
 * (idempotent). Only published content creates testimonials; drafts go through `reviewDraftBlocks`.
 */
export const collectInlineTestimonials = (pages: PageLike[]) => {
  const entries = new Map<string, InlineEntry>()
  const assignments: Assignment[] = []
  for (const page of pages) {
    for (const block of legacyBlocks(page)) {
      const keys: string[] = []
      for (const i of block.items) {
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

const sameText = (a: Partial<Record<Locale, string>>, b: Partial<Record<Locale, string>>) =>
  locales.every((l) => (a[l] || '').trim() === (b[l] || '').trim())

/**
 * Pure check of pending drafts (read with `locale: 'all'`). A draft block is converted only when
 * converting loses nothing: every person is one the collection holds, with the same name, company,
 * avatar and logo, the same quote and role in every locale (text compared after trimming), and, if the published block with the same id is being
 * converted, the same people in the same order. Anything else is an editor's pending edit: the
 * block stays as it is (the legacy fallback keeps rendering it in the draft) and is listed for
 * review. Draft-only people never create testimonials.
 */
export const reviewDraftBlocks = (drafts: PageLike[], held: Map<string, Held>, published: Assignment[]) => {
  const assignments: Assignment[] = []
  const needsReview: NeedsReview[] = []
  for (const page of drafts) {
    for (const block of legacyBlocks(page)) {
      const keys = block.items.map((i) => keyOf(i.name, i.company))
      const flag = (reason: string) => needsReview.push({ pageId: page.id, blockId: block.id, reason })
      const unknown = keys.find((k) => !held.has(k))
      if (unknown) {
        flag(`draft names a person the collection does not hold: ${unknown}`)
        continue
      }
      const changed = block.items.find((i, n) => {
        const h = held.get(keys[n]) as Held
        return (
          (i.name || '').trim() !== h.name.trim() ||
          (i.company || '').trim() !== (h.company || '').trim() ||
          mediaId(i.avatar) !== h.avatar ||
          mediaId(i.logo) !== h.logo ||
          !sameText(perLocale(i.quote), h.quote) ||
          !sameText(perLocale(i.role), h.role)
        )
      })
      if (changed) {
        flag(`draft person differs from the collection (name, company, avatar, logo, quote or role): ${keyOf(changed.name, changed.company)}`)
        continue
      }
      const live = published.find((a) => a.pageId === page.id && a.blockId === block.id)
      if (live && JSON.stringify(live.keys) !== JSON.stringify(keys)) {
        flag(`draft people or order differ from the published block: ${keys.join(', ')}`)
        continue
      }
      assignments.push({ pageId: page.id, blockId: block.id, keys })
    }
  }
  return { assignments, needsReview }
}

/**
 * Pure layout rewrite for one page: every assigned block switches to manual mode, references its
 * testimonials in the original order and gets a seed (its id) when it has none. The inline
 * `items` stay, so the migration can be rolled back and the previous image still finds its quotes;
 * the seed is what stops them from acting as the legacy fallback again. A later schema cleanup
 * removes them. Other blocks pass through untouched.
 */
export const applyAssignments = (layout: unknown[], forPage: { blockId: string; keys: string[] }[], idByKey: Map<string, number>): unknown[] =>
  layout.map((raw) => {
    const block = raw as Block
    const a = forPage.find((x) => x.blockId === block.id)
    return a ? { ...block, mode: 'manual' as const, testimonials: a.keys.map((k) => idByKey.get(k) as number), seed: block.seed || block.id } : raw
  })

/** Everything a page save needs back, minus the fields Payload manages itself. */
const pageData = ({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data }: Page) => data

/**
 * Moves inline quotes into the testimonials collection and switches those blocks to manual mode
 * pointing at them. Idempotent: existing testimonials are matched by name + company, converted
 * blocks are skipped. The inline rows are kept (see `applyAssignments`) until a later schema
 * cleanup.
 *
 * Published and pending-draft states are handled separately. A plain update builds on the latest
 * version, so it would save the draft's `_status` (unpublishing the page) and merge the draft's
 * edits into what we write. Instead each state is re-saved in full per locale: the published doc
 * stays published without picking up draft edits, and the draft stays a draft. Draft blocks are
 * only converted when `reviewDraftBlocks` finds nothing to lose; the rest come back in
 * `needsReview`. Never-published pages only get the draft save.
 *
 * The per-locale saves are only safe together, so `req` must carry a transaction: a migration's
 * `req` does, scripts use `runInlineTestimonialConversion`. Every call passes that `req`.
 *
 * `pageIds` limits which pages are read and converted (tests pass their fixture so nothing else
 * is touched); existing testimonials are always matched across the whole collection.
 */
export const convertInlineTestimonials = async ({ payload, req, pageIds }: { payload: Payload; req: PayloadRequest; pageIds?: (number | string)[] }) => {
  const context = { disableRevalidate: true }
  const [primary, ...rest] = locales
  const read = { collection: 'pages', depth: 0, overrideAccess: true, showHiddenFields: true, req, context } as const
  const where: Where | undefined = pageIds ? { id: { in: pageIds } } : undefined
  const mainRows = await payload.find({ ...read, where, locale: 'all', pagination: false, draft: false })
  const latest = await payload.find({ ...read, where, locale: 'all', pagination: false, draft: true })
  const published = mainRows.docs.filter((d) => d._status === 'published') as unknown as PageLike[]
  const drafts = latest.docs.filter((d) => d._status === 'draft') as unknown as PageLike[]
  const { entries, assignments } = collectInlineTestimonials(published)

  const existing = await payload.find({ collection: 'testimonials', locale: 'all', depth: 0, pagination: false, overrideAccess: true, draft: true, req, context })
  const idByKey = new Map(existing.docs.map((d) => [keyOf(d.name, d.company), d.id]))
  const held = new Map<string, Held>(
    existing.docs.map((d) => [
      keyOf(d.name, d.company),
      { name: d.name, company: d.company || null, avatar: mediaId(d.avatar), logo: mediaId(d.logo), quote: perLocale(d.quote as Localised), role: perLocale(d.role as Localised) },
    ]),
  )
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
    held.set(e.key, { name: e.name, company: e.company, avatar: e.avatar, logo: e.logo, quote: e.quote, role: e.role })
    created++
  }
  const review = reviewDraftBlocks(drafts, held, assignments)

  for (const pageId of [...new Set([...assignments, ...review.assignments].map((a) => a.pageId))]) {
    const forPublished = assignments.filter((a) => a.pageId === pageId)
    const forDraft = review.assignments.filter((a) => a.pageId === pageId)
    // Read both states per locale before writing anything: the first write replaces the latest version.
    // `fallbackLocale: false` so an empty translation is not saved back as a copy of the default locale.
    // Sequential, not Promise.all: every call shares the one transaction connection.
    const readAll = async (draft: boolean) => {
      const docs: Page[] = []
      for (const locale of locales) docs.push(await payload.findByID({ ...read, id: pageId, locale, fallbackLocale: false, draft }))
      return docs
    }
    const publishedDocs = await readAll(false)
    const draftDocs = await readAll(true)
    const publishes = forPublished.length > 0 && publishedDocs[0]._status === 'published'
    const hasDraft = draftDocs[0]._status === 'draft'
    const convert = (doc: Page, forState: Assignment[]) => ({ ...pageData(doc), layout: applyAssignments(doc.layout || [], forState, idByKey) as Page['layout'] })

    // Primary locale first, then the others: block ids match, so each pass fills its locale in the same rows.
    if (publishes) {
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id: pageId, locale, fallbackLocale: false, data: { ...convert(publishedDocs[i], forPublished), _status: 'published' }, req, context })
      }
    }
    // Publishing made the published doc the latest version, so a pending draft is saved again on
    // top, even when none of its blocks could be converted.
    if (hasDraft && (publishes || forDraft.length > 0)) {
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id: pageId, locale, fallbackLocale: false, draft: true, data: { ...convert(draftDocs[i], forDraft), _status: 'draft' }, req, context })
      }
    }
  }

  return { created, reused: entries.length - created, blocks: assignments.length, draftBlocks: review.assignments.length, needsReview: review.needsReview }
}

/**
 * Runs the conversion in one transaction for callers that have none (the host script, tests):
 * the per-locale saves briefly leave draft values in the published row, so a failure halfway must
 * roll everything back instead of leaving them live.
 */
export const runInlineTestimonialConversion = async (payload: Payload, { pageIds }: { pageIds?: (number | string)[] } = {}) => {
  const req = await createLocalReq({ context: { disableRevalidate: true } }, payload)
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('[testimonials] the database adapter did not start a transaction')
  req.transactionID = transactionID
  try {
    const result = await convertInlineTestimonials({ payload, req, pageIds })
    await payload.db.commitTransaction(transactionID)
    return result
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}
