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

  describe('a page that was never published', () => {
    let draftId: number
    let converted: Awaited<ReturnType<typeof runSectionConversion>>
    const readMain = (locale: 'de' | 'en') =>
      payload.findByID({ collection: 'pages', id: draftId, locale, fallbackLocale: false, draft: false, depth: 0, showHiddenFields: true, context }) as unknown as Promise<Page>

    beforeAll(async () => {
      const created = await payload.create({
        collection: 'pages',
        locale: 'de',
        context,
        data: { title: `Sections draft ${run}`, slug: `${slug}-draft`, _status: 'draft', layout: [story('Entwurf DE', 'Einleitung DE')] } as never,
      })
      draftId = created.id
      const block = (created as unknown as Loose).layout[0]
      await payload.update({
        collection: 'pages', id: draftId, locale: 'en', context,
        data: { _status: 'draft', layout: [{ ...block, header: { ...block.header, heading: 'Draft EN', lead: 'Lead EN' } }] } as never,
      })
      converted = await runSectionConversion(payload, { pageIds: [draftId] })
    })

    afterAll(async () => {
      if (payload && draftId) await payload.delete({ collection: 'pages', id: draftId, context })
    })

    it('converts the main row in both locales and stays a draft', async () => {
      expect(converted).toEqual({ publishedPages: 0, draftPages: 1 })
      const de = await readMain('de')
      const en = await readMain('en')
      expect(de._status).toBe('draft')
      expect((de.layout as Loose[]).map((b) => b.blockType)).toEqual(['heading', 'media', 'items', 'actions'])
      expect((en.layout as Loose[]).map((b) => b.blockType)).toEqual(['heading', 'media', 'items', 'actions'])
      expect((de.layout as Loose[])[0].header).toMatchObject({ heading: 'Entwurf DE', lead: 'Einleitung DE' })
      expect((en.layout as Loose[])[0].header).toMatchObject({ heading: 'Draft EN', lead: 'Lead EN' })
      const latest = (await payload.findByID({ collection: 'pages', id: draftId, locale: 'de', draft: true, depth: 0, context })) as unknown as Page
      expect(latest._status).toBe('draft')
      expect((latest.layout as Loose[]).map((b) => b.blockType)).toEqual(['heading', 'media', 'items', 'actions'])
    })

    it('running it again changes nothing', async () => {
      expect(await runSectionConversion(payload, { pageIds: [draftId] })).toEqual({ publishedPages: 0, draftPages: 0 })
    })
  })

  describe('a heading filled in one locale only', () => {
    let statsId: number
    let converted: Awaited<ReturnType<typeof runSectionConversion>>
    const readStats = (locale: 'de' | 'en') =>
      payload.findByID({ collection: 'pages', id: statsId, locale, fallbackLocale: false, depth: 0, showHiddenFields: true, context }) as unknown as Promise<Page>

    beforeAll(async () => {
      const created = await payload.create({
        collection: 'pages',
        locale: 'de',
        context,
        data: {
          title: `Sections stats ${run}`,
          slug: `${slug}-stats`,
          _status: 'published',
          layout: [{ blockType: 'stats', header: { heading: 'Zahlen DE' }, items: [{ value: '40', suffix: '%', label: 'Weniger DE' }, { value: '3', label: 'Tage DE' }] }],
        } as never,
      })
      statsId = created.id
      // English: same rows, no heading.
      const block = (created as unknown as Loose).layout[0]
      await payload.update({
        collection: 'pages', id: statsId, locale: 'en', context,
        data: {
          _status: 'published',
          layout: [{ ...block, header: { heading: null }, items: [{ ...block.items[0], label: 'Less EN' }, { ...block.items[1], label: 'Days EN' }] }],
        } as never,
      })
      converted = await runSectionConversion(payload, { pageIds: [statsId] })
    })

    afterAll(async () => {
      if (payload && statsId) await payload.delete({ collection: 'pages', id: statsId, context })
    })

    it('gives both locales the same blocks and keeps the German heading', async () => {
      expect(converted).toEqual({ publishedPages: 1, draftPages: 0 })
      const de = (await readStats('de')).layout as Loose[]
      const en = (await readStats('en')).layout as Loose[]
      expect(de.map((b) => b.blockType)).toEqual(['heading', 'items'])
      expect(en.map((b) => b.blockType)).toEqual(['heading', 'items'])
      expect(en.map((b) => b.id)).toEqual(de.map((b) => b.id))
      expect(de[0].header.heading).toBe('Zahlen DE')
      expect(en[0].header.heading ?? null).toBeNull()
      expect(en[1].items.map((i: Loose) => i.title)).toEqual(['Less EN', 'Days EN'])
    })
  })
})
