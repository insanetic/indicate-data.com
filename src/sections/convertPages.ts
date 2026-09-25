import { createLocalReq, type Payload, type PayloadRequest, type Where } from 'payload'

import type { Page } from '@/payload-types'
import { locales } from '@/i18n/config'

import { headerTextIds, needsSectionConversion, splitLegacyLayout } from './legacy'
import { needsStepsConversion, stepsToSplit } from './steps'

/** `allowLegacySections` lets the layout's filterOptions accept pages that still hold old blocks. */
const context = { disableRevalidate: true, allowLegacySections: true }

/** Everything a page save needs back, minus the fields Payload manages itself. */
const pageData = ({ id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data }: Page) => data

type Prepare = (docs: Page[]) => (doc: Page) => unknown[]

/**
 * Rewrites every page whose published version or pending draft `needs` it. As in
 * `convertInlineTestimonials`, published and draft states are saved separately and in full per
 * locale: the published page stays published without picking up draft edits, and the draft stays
 * a draft on top. `prepare` sees all locales of one state first (so structure decisions can span
 * locales, e.g. `headerTextIds`) and returns the per-doc layout rewrite; the same rewrite is used
 * for that state's every locale, so each locale pass fills the same rows. Idempotent. `req` must
 * carry a transaction (a migration's does; scripts and tests use `runSectionConversion` /
 * `runStepsConversion`). `pageIds` limits the pages (tests).
 */
export const convertPageLayouts = async ({
  payload,
  req,
  pageIds,
  needs,
  prepare,
}: {
  payload: Payload
  req: PayloadRequest
  pageIds?: (number | string)[]
  needs: (layout: Page['layout']) => boolean
  prepare: Prepare
}) => {
  const read = { collection: 'pages', depth: 0, overrideAccess: true, showHiddenFields: true, req, context } as const
  const where: Where | undefined = pageIds ? { id: { in: pageIds } } : undefined
  const [primary] = locales
  const main = await payload.find({ ...read, where, locale: primary, pagination: false, draft: false })
  const latest = await payload.find({ ...read, where, locale: primary, pagination: false, draft: true })
  const ids = [...new Set([...main.docs, ...latest.docs].filter((d) => needs(d.layout)).map((d) => d.id))]

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
    const publishedConvert = prepare(publishedDocs)
    const draftConvert = prepare(draftDocs)
    const convert = (doc: Page, rewrite: (doc: Page) => unknown[]) => ({
      ...pageData(doc),
      layout: rewrite(doc) as Page['layout'],
    })

    if (publishedDocs[0]._status === 'published') {
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id, locale, fallbackLocale: false, data: { ...convert(publishedDocs[i], publishedConvert), _status: 'published' }, req, context })
      }
      publishedPages++
    } else if (publishedDocs[0]._status === 'draft') {
      // Never published: a `draft: true` save only writes a version, so the main row would keep
      // the legacy blocks. A plain save with `_status: 'draft'` rewrites it and stays a draft.
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id, locale, fallbackLocale: false, data: { ...convert(publishedDocs[i], publishedConvert), _status: 'draft' }, req, context })
      }
    }
    // Publishing (or the main-row save above) made that state the latest version, so a pending
    // draft is saved again on top.
    if (draftDocs[0]._status === 'draft') {
      for (const [i, locale] of locales.entries()) {
        await payload.update({ collection: 'pages', id, locale, fallbackLocale: false, draft: true, data: { ...convert(draftDocs[i], draftConvert), _status: 'draft' }, req, context })
      }
      draftPages++
    }
  }
  return { publishedPages, draftPages }
}

/** Converts every page's legacy section blocks and old widget spacing into section blocks. */
export const convertSectionBlocks = ({ payload, req, pageIds }: { payload: Payload; req: PayloadRequest; pageIds?: (number | string)[] }) =>
  convertPageLayouts({
    payload,
    req,
    pageIds,
    needs: needsSectionConversion,
    prepare: (docs) => {
      // The block structure is shared by all locales: a legacy block gets its heading part when any
      // locale of that state has a heading or lead, so every locale pass writes the same blocks.
      const withHeader = headerTextIds(docs.map((d) => d.layout || []))
      return (doc) => splitLegacyLayout(doc.layout || [], { withHeader })
    },
  })

/** Converts every "heading + Items steps" pair into a Split block in steps mode. */
export const convertStepSections = ({ payload, req, pageIds }: { payload: Payload; req: PayloadRequest; pageIds?: (number | string)[] }) =>
  convertPageLayouts({ payload, req, pageIds, needs: needsStepsConversion, prepare: () => (doc) => stepsToSplit(doc.layout || [], doc.slug) })

/** Runs `fn` in one transaction for callers that have none (dev scripts, tests). */
const inTransaction = async <T>(payload: Payload, fn: (req: PayloadRequest) => Promise<T>): Promise<T> => {
  const req = await createLocalReq({ context }, payload)
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) throw new Error('[sections] the database adapter did not start a transaction')
  req.transactionID = transactionID
  try {
    const result = await fn(req)
    await payload.db.commitTransaction(transactionID)
    return result
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID)
    throw error
  }
}

export const runSectionConversion = (payload: Payload, o: { pageIds?: (number | string)[] } = {}) => inTransaction(payload, (req) => convertSectionBlocks({ payload, req, ...o }))
export const runStepsConversion = (payload: Payload, o: { pageIds?: (number | string)[] } = {}) => inTransaction(payload, (req) => convertStepSections({ payload, req, ...o }))
