// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Page } from '@/payload-types'
import { runInlineTestimonialConversion } from '@/utilities/convertInlineTestimonials'

// Runs against the database in DATABASE_URL (the clone, never the shared dev DB). Everything it
// creates carries a unique fixture name and is deleted in afterAll.
const run = `${Date.now()}`
const person = `Task8 Fixture ${run}`
const company = 'Task8 Fixture Co'
const slug = `task8-db-fixture-${run}`
const context = { disableRevalidate: true }

type Loose = Record<string, any>
const testimonialsBlock = (page: Page) => (page.layout || []).find((b) => b.blockType === 'testimonials') as Loose
const withoutLayout = ({ layout: _l, updatedAt: _u, createdAt: _c, _status: _s, ...rest }: Page) => rest

describe('convertInlineTestimonials against the database', () => {
  let payload: Payload
  let pageId: number
  let publishedBefore: Page
  let draftBefore: Page
  let result: Awaited<ReturnType<typeof runInlineTestimonialConversion>>

  const read = (draft: boolean) => payload.findByID({ collection: 'pages', id: pageId, locale: 'all', draft, depth: 0, showHiddenFields: true, context }) as unknown as Promise<Page>

  beforeAll(async () => {
    payload = await getPayload({ config: await config })

    // Published page with a legacy block, in both locales.
    const page = await payload.create({
      collection: 'pages',
      locale: 'de',
      context,
      data: { title: 'Fixture live', slug, _status: 'published', layout: [{ blockType: 'testimonials', header: { heading: 'Live' }, items: [{ name: person, company, quote: 'Live quote DE', role: 'Rolle' }] }] } as any,
    })
    pageId = page.id
    const en = await payload.findByID({ collection: 'pages', id: pageId, locale: 'en', depth: 0, showHiddenFields: true, context })
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'en',
      context,
      data: { _status: 'published', layout: (en.layout || []).map((b: Loose) => ({ ...b, items: b.items.map((i: Loose) => ({ ...i, quote: 'Live quote EN', role: 'Role' })) })) } as any,
    })

    // Pending draft: another field and the block's quote text diverge.
    const de = await payload.findByID({ collection: 'pages', id: pageId, locale: 'de', depth: 0, showHiddenFields: true, context })
    await payload.update({
      collection: 'pages',
      id: pageId,
      locale: 'de',
      draft: true,
      context,
      data: { title: 'Fixture draft WIP', layout: (de.layout || []).map((b: Loose) => ({ ...b, items: b.items.map((i: Loose) => ({ ...i, quote: 'Draft quote DE' })) })) } as any,
    })

    publishedBefore = await read(false)
    draftBefore = await read(true)
    expect(publishedBefore._status).toBe('published')
    expect(draftBefore._status).toBe('draft')

    result = await runInlineTestimonialConversion(payload)
  }, 180_000)

  afterAll(async () => {
    if (!payload) return
    if (pageId) await payload.delete({ collection: 'pages', id: pageId, context })
    await payload.delete({ collection: 'testimonials', where: { name: { equals: person } }, context })
  }, 60_000)

  it('creates the person from the published block', async () => {
    const created = await payload.find({ collection: 'testimonials', where: { name: { equals: person } }, locale: 'all', depth: 0, context })
    expect(created.docs).toHaveLength(1)
    expect(created.docs[0]).toMatchObject({ company, _status: 'published', quote: { de: 'Live quote DE', en: 'Live quote EN' }, role: { de: 'Rolle', en: 'Role' } })
    expect(result.created).toBeGreaterThanOrEqual(1)
  })

  it('keeps the page published and changes nothing but the converted block', async () => {
    const after = await read(false)
    const [fixture] = (await payload.find({ collection: 'testimonials', where: { name: { equals: person } }, depth: 0, context })).docs
    expect(after._status).toBe('published')
    expect(withoutLayout(after)).toEqual(withoutLayout(publishedBefore))
    const { mode, testimonials, items, ...block } = testimonialsBlock(after)
    const { mode: _m, testimonials: _t, items: _i, ...blockBefore } = testimonialsBlock(publishedBefore)
    expect({ mode, testimonials, items }).toEqual({ mode: 'manual', testimonials: [fixture.id], items: [] })
    expect(block).toEqual(blockBefore)
  })

  it('keeps the draft as the latest version with its edits, leaving the changed block for review', async () => {
    const after = await read(true)
    expect(after._status).toBe('draft')
    expect(after.title).toBe('Fixture draft WIP')
    expect(testimonialsBlock(after)).toEqual(testimonialsBlock(draftBefore))
    expect(testimonialsBlock(after).items[0].quote).toMatchObject({ de: 'Draft quote DE', en: 'Live quote EN' })
    expect(result.needsReview).toContainEqual({ pageId, blockId: testimonialsBlock(draftBefore).id, reason: expect.stringContaining(person.toLowerCase()) })
  })

  it('changes nothing on a second run', async () => {
    const again = await runInlineTestimonialConversion(payload)
    expect({ created: again.created, reused: again.reused, blocks: again.blocks, draftBlocks: again.draftBlocks }).toEqual({ created: 0, reused: 0, blocks: 0, draftBlocks: 0 })
    expect((await read(true)).title).toBe('Fixture draft WIP')
    expect((await read(false))._status).toBe('published')
  })
})
