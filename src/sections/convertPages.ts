import { createLocalReq, type Payload, type PayloadRequest, type Where } from 'payload'

import type { Page } from '@/payload-types'
import { locales } from '@/i18n/config'

import { headerTextIds, needsSectionConversion, splitLegacyLayout } from './legacy'

/** `allowLegacySections` lets the layout's filterOptions accept pages that still hold old blocks. */
const context = { disableRevalidate: true, allowLegacySections: true }

/** Everything a page save needs back, minus the fields Payload manages itself. */
const pageData = ({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data }: Page) => data

/**
 * Rewrites every page whose published version or pending draft still holds legacy section blocks
 * or old widget spacing. As in `convertInlineTestimonials`, published and draft states are saved
 * separately and in full per locale: the published page stays published without picking up draft
 * edits, and the draft stays a draft on top. Block ids derive from the old ids and the heading
 * parts are decided across locales (`headerTextIds`), so each locale pass fills the same rows.
 * Idempotent. `req` must carry a transaction (a migration's does; scripts and tests use
 * `runSectionConversion`). `pageIds` limits the pages (tests).
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
    // The block structure is shared by all locales: a legacy block gets its heading part when any
    // locale of that state has a heading or lead, so every locale pass writes the same blocks.
    const publishedHeader = headerTextIds(publishedDocs.map((d) => d.layout || []))
    const draftHeader = headerTextIds(draftDocs.map((d) => d.layout || []))
    const convert = (doc: Page, withHeader: ReadonlySet<string>) => ({
      ...pageData(doc),
      layout: splitLegacyLayout(doc.layout || [], { withHeader }) as Page['layout'],
    })

    if (publishedDocs[0]._status === 'published') {
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id, locale, fallbackLocale: false, data: { ...convert(publishedDocs[i], publishedHeader), _status: 'published' }, req, context })
      }
      publishedPages++
    } else if (publishedDocs[0]._status === 'draft') {
      // Never published: a `draft: true` save only writes a version, so the main row would keep
      // the legacy blocks. A plain save with `_status: 'draft'` rewrites it and stays a draft.
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id, locale, fallbackLocale: false, data: { ...convert(publishedDocs[i], publishedHeader), _status: 'draft' }, req, context })
      }
    }
    // Publishing (or the main-row save above) made that state the latest version, so a pending draft is saved again on top. the published doc the latest version, so a pending draft is saved again on top.
    if (draftDocs[0]._status === 'draft') {
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id, locale, fallbackLocale: false, draft: true, data: { ...convert(draftDocs[i], draftHeader), _status: 'draft' }, req, context })
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
