import { describe, expect, it } from 'vitest'

import { parsePreviewBody, previewSelection, selectForLayout, type Testimonial } from '@subneo/payload-testimonials'

const t = (id: number, extra: Partial<Testimonial> = {}): Testimonial => ({ id, name: `P${id}`, title: `P${id}`, quote: `Q${id}`, ...extra })
const pool = Array.from({ length: 6 }, (_, i) => t(i + 1, { tags: i % 2 ? [10] : [] }))
const localeCodes = ['de', 'en']

const layout = [
  { blockType: 'hero', id: 'h' },
  { blockType: 'testimonials', id: 'b1', mode: 'manual', testimonials: [6] },
  { blockType: 'testimonials', id: 'b2', mode: 'auto', seed: 'second', count: 3 },
]

describe('previewSelection', () => {
  it('matches what the site shows for a later block on a two-block page', () => {
    const site = selectForLayout({ layout, pool }).get(2)!
    const parsed = parsePreviewBody({ layout, blockIndex: 2, block: layout[2], locale: 'de' }, { localeCodes })
    if (!parsed.ok) throw new Error(parsed.error)
    const preview = previewSelection({ pool, request: parsed.request })
    expect(preview.items.map((i) => [String(i.id), i.reason])).toEqual(site.map((s) => [String(s.testimonial.id), s.reason]))
    // On its own the block would pick 6; on the page the earlier block already shows it.
    const alone = previewSelection({ pool, request: { block: layout[2] as never } })
    expect(alone.items.map((i) => i.id)).toContain(6)
    expect(preview.items.map((i) => i.id)).not.toContain(6)
    expect(preview.items).toHaveLength(3)
  })

  it('counts matching testimonials for the block itself, ignoring earlier blocks', () => {
    const tagged = [layout[1], { ...layout[2], tags: [10] }]
    const preview = previewSelection({ pool, request: { block: tagged[1] as never, layout: tagged, blockIndex: 1 } })
    expect(preview.matching).toBe(3)
  })

  it('falls back to the block alone when no layout is sent', () => {
    const preview = previewSelection({ pool, request: { block: { mode: 'manual', testimonials: [4, 2] } } })
    expect(preview.items).toEqual([
      { id: 4, title: 'P4', reason: 'manual' },
      { id: 2, title: 'P2', reason: 'manual' },
    ])
    expect(preview.matching).toBe(6)
  })
})

describe('parsePreviewBody', () => {
  const parse = (body: unknown, fallbackLocale?: string) => parsePreviewBody(body, { localeCodes, fallbackLocale })

  it('accepts a layout with a block index inside it', () => {
    const r = parse({ layout, blockIndex: 1, locale: 'en' })
    expect(r).toEqual({ ok: true, request: { block: layout[1], layout, blockIndex: 1, locale: 'en' } })
  })

  it('rejects a block index that is not a non-negative integer below the layout length', () => {
    for (const blockIndex of [-1, 1.5, 3, '1', undefined]) expect(parse({ layout, blockIndex }).ok).toBe(false)
  })

  it('rejects a layout that is not an array, and a block index without a layout', () => {
    expect(parse({ layout: { 0: {} }, blockIndex: 0 }).ok).toBe(false)
    expect(parse({ blockIndex: 0, block: {} }).ok).toBe(false)
  })

  it('keeps a known locale and falls back to the request locale otherwise', () => {
    expect(parse({ block: {}, locale: 'en' }, 'de')).toMatchObject({ ok: true, request: { locale: 'en' } })
    expect(parse({ block: {}, locale: 'fr' }, 'de')).toMatchObject({ ok: true, request: { locale: 'de' } })
    expect(parse({ block: {}, locale: 42 })).toMatchObject({ ok: true, request: { locale: undefined } })
  })

  it('treats a missing body or block as an empty block', () => {
    expect(parse(undefined)).toEqual({ ok: true, request: { block: {}, locale: undefined } })
    expect(parse({ block: 'x' })).toEqual({ ok: true, request: { block: {}, locale: undefined } })
  })
})
