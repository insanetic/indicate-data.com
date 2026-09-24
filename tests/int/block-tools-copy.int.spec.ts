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
