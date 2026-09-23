// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Page } from '@/payload-types'
import { runInlineTestimonialConversion } from '@/utilities/convertInlineTestimonials'

// Writes to the database in DATABASE_URL, so it is opt-in: TESTIMONIALS_DB_TEST=1 and never the
// shared dev DB (`payload`). The conversion is scoped to the fixture page; everything the test
// creates carries a unique fixture name and is deleted in afterAll.
const databaseName = (() => {
  try {
    return new URL(process.env.DATABASE_URL || '').pathname.slice(1)
  } catch {
    return ''
  }
})()
const enabled = process.env.TESTIMONIALS_DB_TEST === '1' && databaseName !== '' && databaseName !== 'payload'
const describeDb = enabled ? describe : describe.skip

const run = `${Date.now()}`
const person = `Task8 Fixture ${run}`
const company = 'Task8 Fixture Co'
const slug = `task8-db-fixture-${run}`
const outsider = `${person} outside`
const context = { disableRevalidate: true }

type Loose = Record<string, any>
const testimonialsBlock = (page: Page) => (page.layout || []).find((b) => b.blockType === 'testimonials') as Loose
const withoutLayout = ({ layout: _l, updatedAt: _u, createdAt: _c, _status: _s, ...rest }: Page) => rest

describeDb(`convertInlineTestimonials against the database${enabled ? '' : ' (skipped: needs TESTIMONIALS_DB_TEST=1 and a DATABASE_URL other than /payload)'}`, () => {
  let payload: Payload
  let pageId: number
  let outsideId: number
  let outsideBefore: Page
  let publishedBefore: Page
  let draftBefore: Page
  let result: Awaited<ReturnType<typeof runInlineTestimonialConversion>>

  const read = (draft: boolean, id = pageId) => payload.findByID({ collection: 'pages', id, locale: 'all', draft, depth: 0, showHiddenFields: true, context }) as unknown as Promise<Page>

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

    // A second legacy page outside the scope: the conversion must not touch it.
    const outside = await payload.create({
      collection: 'pages',
      locale: 'de',
      context,
      data: { title: 'Fixture outside', slug: `${slug}-outside`, _status: 'published', layout: [{ blockType: 'testimonials', items: [{ name: outsider, company, quote: 'Outside quote', role: 'Rolle' }] }] } as any,
    })
    outsideId = outside.id
    outsideBefore = await read(false, outsideId)

    publishedBefore = await read(false)
    draftBefore = await read(true)
    expect(publishedBefore._status).toBe('published')
    expect(draftBefore._status).toBe('draft')

    result = await runInlineTestimonialConversion(payload, { pageIds: [pageId] })
  }, 180_000)

  afterAll(async () => {
    if (!payload) return
    for (const id of [pageId, outsideId]) if (id) await payload.delete({ collection: 'pages', id, context })
    await payload.delete({ collection: 'testimonials', where: { name: { in: [person, outsider] } }, context })
  }, 60_000)

  it('creates the person from the published block', async () => {
    const created = await payload.find({ collection: 'testimonials', where: { name: { equals: person } }, locale: 'all', depth: 0, context })
    expect(created.docs).toHaveLength(1)
    expect(created.docs[0]).toMatchObject({ company, _status: 'published', quote: { de: 'Live quote DE', en: 'Live quote EN' }, role: { de: 'Rolle', en: 'Role' } })
    expect({ created: result.created, reused: result.reused, blocks: result.blocks, draftBlocks: result.draftBlocks }).toEqual({ created: 1, reused: 0, blocks: 1, draftBlocks: 0 })
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
    const again = await runInlineTestimonialConversion(payload, { pageIds: [pageId] })
    expect({ created: again.created, reused: again.reused, blocks: again.blocks, draftBlocks: again.draftBlocks }).toEqual({ created: 0, reused: 0, blocks: 0, draftBlocks: 0 })
    expect((await read(true)).title).toBe('Fixture draft WIP')
    expect((await read(false))._status).toBe('published')
  })

  it('leaves a legacy page outside the scope untouched', async () => {
    expect(await read(false, outsideId)).toEqual(outsideBefore)
    const created = await payload.find({ collection: 'testimonials', where: { name: { equals: outsider } }, depth: 0, context })
    expect(created.docs).toHaveLength(0)
  })
})
