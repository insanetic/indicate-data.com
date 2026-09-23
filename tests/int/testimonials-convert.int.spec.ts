import { describe, expect, it } from 'vitest'

import { applyAssignments, collectInlineTestimonials, keyOf } from '@/utilities/convertInlineTestimonials'

const item = (id: string, name: string, company: string, de: string, en: string) => ({
  id,
  name,
  company,
  quote: { de, en },
  role: { de: 'Vorstand', en: 'Board member' },
  avatar: null,
  logo: null,
})

describe('collectInlineTestimonials', () => {
  const pages = [
    { id: 1, layout: [{ blockType: 'testimonials', id: 'b1', items: [item('i1', 'Armin Biebl', 'Familotel AG', 'Q1', 'E1'), item('i2', 'Ilona', 'Familotel AG', 'Q2', 'E2')] }] },
    { id: 2, layout: [{ blockType: 'hero', id: 'h' }, { blockType: 'testimonials', id: 'b2', items: [item('i3', ' armin biebl ', 'Familotel AG', 'Q1', 'E1')] }] },
    { id: 3, layout: [{ blockType: 'testimonials', id: 'b3', items: [item('i4', 'X', '', 'Q', 'E')], testimonials: [5] }] },
    { id: 4, layout: null },
  ]

  it('dedupes people by name + company and keeps both locales', () => {
    const { entries } = collectInlineTestimonials(pages)
    expect(entries.map((e) => e.key)).toEqual([keyOf('Armin Biebl', 'Familotel AG'), keyOf('Ilona', 'Familotel AG')])
    expect(entries[0].quote).toEqual({ de: 'Q1', en: 'E1' })
  })

  it('assigns every unconverted block, skipping already converted ones', () => {
    const { assignments } = collectInlineTestimonials(pages)
    expect(assignments).toEqual([
      { pageId: 1, blockId: 'b1', keys: [keyOf('Armin Biebl', 'Familotel AG'), keyOf('Ilona', 'Familotel AG')] },
      { pageId: 2, blockId: 'b2', keys: [keyOf('Armin Biebl', 'Familotel AG')] },
    ])
  })
})

describe('collectInlineTestimonials with published and draft layouts', () => {
  const armin = keyOf('Armin Biebl', 'Familotel AG')
  const ilona = keyOf('Ilona', 'Familotel AG')
  const block = (id: string, ...items: ReturnType<typeof item>[]) => ({ blockType: 'testimonials', id, items })
  const published = { id: 1, layout: [{ blockType: 'hero', id: 'h' }, block('b1', item('i1', 'Armin Biebl', 'Familotel AG', 'Q1', 'E1'))] }
  const draft = {
    id: 1,
    layout: [{ blockType: 'hero', id: 'h' }, { blockType: 'featureStory', id: 'f' }, block('b1', item('i1', 'Armin Biebl', 'Familotel AG', 'Q1', 'E1')), block('b7', item('i7', 'Ilona', 'Familotel AG', 'Q2', 'E2'))],
  }

  it('assigns a block found in both the published and the draft layout once', () => {
    const { assignments } = collectInlineTestimonials([published, draft])
    expect(assignments.filter((a) => a.blockId === 'b1')).toEqual([{ pageId: 1, blockId: 'b1', keys: [armin] }])
  })

  it('also converts a block that only exists in the draft', () => {
    const { entries, assignments } = collectInlineTestimonials([published, draft])
    expect(assignments).toEqual([
      { pageId: 1, blockId: 'b1', keys: [armin] },
      { pageId: 1, blockId: 'b7', keys: [ilona] },
    ])
    expect(entries.map((e) => e.key)).toEqual([armin, ilona])
  })
})

describe('applyAssignments', () => {
  const armin = keyOf('Armin Biebl', 'Familotel AG')
  const ilona = keyOf('Ilona', 'Familotel AG')
  const idByKey = new Map([
    [armin, 11],
    [ilona, 12],
  ])
  const hero = { blockType: 'hero', id: 'h', title: 'Hi' }
  const converted = { blockType: 'testimonials', id: 'b1', mode: 'auto', items: [item('i1', 'Ilona', 'Familotel AG', 'Q', 'E'), item('i2', 'Armin Biebl', 'Familotel AG', 'Q', 'E')] }
  const untouched = { blockType: 'testimonials', id: 'b9', mode: 'auto', items: [item('i3', 'X', '', 'Q', 'E')] }

  it('switches a converted block to manual, references ids in order and empties its inline items', () => {
    const [, block] = applyAssignments([hero, converted, untouched], [{ blockId: 'b1', keys: [ilona, armin] }], idByKey) as Record<string, unknown>[]
    expect(block).toMatchObject({ blockType: 'testimonials', id: 'b1', mode: 'manual', testimonials: [12, 11], items: [] })
  })

  it('passes blocks that are not converted and blocks of other types through unchanged', () => {
    const layout = applyAssignments([hero, converted, untouched], [{ blockId: 'b1', keys: [ilona, armin] }], idByKey)
    expect(layout[0]).toBe(hero)
    expect(layout[2]).toBe(untouched)
    expect(untouched.items).toHaveLength(1)
  })

  it('applies the assignments to a divergent draft layout by block id', () => {
    const feature = { blockType: 'featureStory', id: 'f', title: 'Draft only' }
    const draftLayout = [feature, untouched, hero, converted]
    const layout = applyAssignments(draftLayout, [{ blockId: 'b1', keys: [ilona, armin] }], idByKey) as Record<string, unknown>[]
    expect(layout.map((b) => b.id)).toEqual(['f', 'b9', 'h', 'b1'])
    expect(layout[0]).toBe(feature)
    expect(layout[1]).toBe(untouched)
    expect(layout[3]).toMatchObject({ mode: 'manual', testimonials: [12, 11], items: [] })
  })
})
