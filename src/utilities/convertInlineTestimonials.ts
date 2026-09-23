import type { Payload, PayloadRequest } from 'payload'

import type { Page } from '@/payload-types'
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
 * A page may be passed twice, published and latest draft, so blocks that only exist in the draft
 * are converted too; a block present in both is assigned once, from the first occurrence.
 */
export const collectInlineTestimonials = (pages: PageLike[]) => {
  const entries = new Map<string, InlineEntry>()
  const assignments: { pageId: number; blockId: string; keys: string[] }[] = []
  for (const page of pages) {
    for (const raw of page.layout || []) {
      const block = raw as Block
      if (block.blockType !== 'testimonials' || !block.id) continue
      if ((block.testimonials || []).length > 0) continue
      if (assignments.some((a) => a.pageId === page.id && a.blockId === block.id)) continue
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
 * Pure layout rewrite for one page: every assigned block switches to manual mode, references its
 * testimonials in the original order and has its inline `items` emptied. The quotes now live in
 * the collection, and hidden inline rows left behind could otherwise take over again as the
 * legacy fallback once an editor clears the selection. Other blocks pass through untouched.
 */
export const applyAssignments = (layout: unknown[], forPage: { blockId: string; keys: string[] }[], idByKey: Map<string, number>): unknown[] =>
  layout.map((raw) => {
    const block = raw as Block
    const a = forPage.find((x) => x.blockId === block.id)
    return a ? { ...block, mode: 'manual' as const, testimonials: a.keys.map((k) => idByKey.get(k) as number), items: [] } : raw
  })

/** Everything a page save needs back, minus the fields Payload manages itself. */
const pageData = ({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data }: Page) => data

/**
 * Moves inline quotes into the testimonials collection and switches those blocks to manual mode
 * pointing at them. Idempotent: existing testimonials are matched by name + company, converted
 * blocks are skipped. The inline rows are emptied once copied; the hidden `items` column itself
 * stays until a later schema cleanup.
 *
 * Pages with a pending draft need care: a plain update builds on the latest version, so it would
 * save the draft's `_status` (unpublishing the page) and merge the draft's edits into what we
 * write. So the published state and the pending draft are converted separately, each re-saved in
 * full per locale: the published doc stays published without picking up draft edits, and the
 * draft stays a draft with the converted block. Never-published pages only get the draft save.
 * Every call passes `req`: inside a migration the new tables exist only in its transaction.
 */
export const convertInlineTestimonials = async ({ payload, req }: { payload: Payload; req: PayloadRequest }) => {
  const context = { disableRevalidate: true }
  const [primary, ...rest] = locales
  const read = { collection: 'pages', depth: 0, overrideAccess: true, showHiddenFields: true, req, context } as const
  const published = await payload.find({ ...read, locale: 'all', pagination: false, draft: false })
  const latest = await payload.find({ ...read, locale: 'all', pagination: false, draft: true })
  const { entries, assignments } = collectInlineTestimonials([...published.docs, ...latest.docs] as unknown as PageLike[])

  const existing = await payload.find({ collection: 'testimonials', depth: 0, pagination: false, overrideAccess: true, draft: true, req, context })
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
    const forPage = assignments.filter((a) => a.pageId === pageId)
    // Read both states per locale before writing anything: the first write replaces the latest version.
    // `fallbackLocale: false` so an empty translation is not saved back as a copy of the default locale.
    // Sequential, not Promise.all: inside a migration every call shares one transaction connection.
    const readAll = async (draft: boolean) => {
      const docs: Page[] = []
      for (const locale of locales) docs.push(await payload.findByID({ ...read, id: pageId, locale, fallbackLocale: false, draft }))
      return docs
    }
    const publishedDocs = await readAll(false)
    const draftDocs = await readAll(true)
    const isPublished = publishedDocs[0]._status === 'published'
    const hasDraft = draftDocs[0]._status === 'draft'
    const convert = (doc: Page) => ({ ...pageData(doc), layout: applyAssignments(doc.layout || [], forPage, idByKey) as Page['layout'] })

    // Primary locale first, then the others: block ids match, so each pass fills its locale in the same rows.
    if (isPublished) {
      for (const [i, locale] of [primary, ...rest].entries()) {
        await payload.update({ collection: 'pages', id: pageId, locale, fallbackLocale: false, data: { ...convert(publishedDocs[i]), _status: 'published' }, req, context })
      }
    }
    if (hasDraft) {
      for (const [i, locale] of [primary, ...rest].entries()) {
        await payload.update({ collection: 'pages', id: pageId, locale, fallbackLocale: false, draft: true, data: { ...convert(draftDocs[i]), _status: 'draft' }, req, context })
      }
    }
  }

  return { created, reused: entries.length - created, blocks: assignments.length }
}
