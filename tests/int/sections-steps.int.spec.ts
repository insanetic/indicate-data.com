import { describe, expect, it } from 'vitest'

import { needsStepsConversion, stepsToSplit } from '@/sections/steps'

const heading = (o: Record<string, unknown> = {}) => ({
  id: 'h1', blockType: 'heading', hidden: false,
  header: { eyebrow: 'So funktioniert es', heading: 'Vom Satz zum Dashboard', lead: 'Kein leeres Blatt.', align: 'center' },
  size: 'h2', links: [{ id: 'l1', link: { type: 'custom', url: '/demo', label: 'Demo', appearance: 'default' } }],
  settings: { background: 'tinted', gapTop: 'large', gapBottom: 'auto', anchor: 'how' }, ...o,
})
const items = (o: Record<string, unknown> = {}) => ({
  id: 'i1', blockType: 'items', style: 'steps', hidden: false, blockName: 'So funktioniert es',
  items: [
    { id: 'a', icon: 'message', title: 'Beschreiben', text: 'Eins' },
    { id: 'b', icon: 'zap', title: 'Prüfen', text: 'Zwei' },
    { id: 'c', icon: 'sparkles', title: 'Zusammenfassen', text: 'Drei' },
  ],
  settings: { background: 'tinted', gapTop: 'auto', gapBottom: 'tight' }, ...o,
})
const other = { id: 'x', blockType: 'items', style: 'points', items: [] }

describe('stepsToSplit', () => {
  it('merges a heading and its steps into one Split in steps mode', () => {
    const [split] = stepsToSplit([heading(), items()], 'build-with-ai') as any[]
    expect(split).toMatchObject({
      id: 'h1-split', blockType: 'split', blockName: 'So funktioniert es', hidden: false,
      header: { eyebrow: 'So funktioniert es', heading: 'Vom Satz zum Dashboard', lead: 'Kein leeres Blatt.' },
      mediaSide: 'right', pointStyle: 'steps',
      visual: { type: 'illustration', illustration: 'dashboard' },
      links: [{ id: 'l1', link: { label: 'Demo' } }],
      settings: { background: 'tinted', gapTop: 'large', gapBottom: 'tight', anchor: 'how' },
    })
    expect(split.points.map((p: any) => [p.id, p.icon, p.title, p.ownVisual])).toEqual([
      ['a', 'message', 'Beschreiben', false], ['b', 'zap', 'Prüfen', false], ['c', 'sparkles', 'Zusammenfassen', true],
    ])
    expect(split.points[2].visual).toEqual({ type: 'illustration', illustration: 'alerts' })
    expect(split.header).not.toHaveProperty('align')
  })

  it('keeps the blocks around it in place', () => {
    const out = stepsToSplit([other, heading(), items(), other], 'x') as any[]
    expect(out.map((b) => b.blockType)).toEqual(['items', 'split', 'items'])
  })

  it('a steps row without a heading becomes a Split with an empty header', () => {
    const [split] = stepsToSplit([items()], 'x') as any[]
    expect(split).toMatchObject({ id: 'i1-split', header: { eyebrow: null, heading: null, lead: null }, links: [] })
  })

  it('a heading followed by something else stays a heading', () => {
    const out = stepsToSplit([heading(), other, items({ id: 'i2' })], 'x') as any[]
    expect(out.map((b) => b.blockType)).toEqual(['heading', 'items', 'split'])
  })

  it('unknown pages get the builder scene and no per-step scenes', () => {
    const [split] = stepsToSplit([heading(), items()], 'unknown') as any[]
    expect(split.visual.illustration).toBe('builder')
    expect(split.points.every((p: any) => p.ownVisual === false)).toBe(true)
  })

  it('only the steps are hidden: the heading stays visible, the Split is hidden with an empty header', () => {
    const out = stepsToSplit([heading(), items({ hidden: true })], 'x') as any[]
    expect(out.map((b) => [b.blockType, b.hidden])).toEqual([['heading', false], ['split', true]])
    expect(out[1].header.heading).toBeNull()
  })

  it('only the heading is hidden: the Split is visible without the header', () => {
    const [split, ...rest] = stepsToSplit([heading({ hidden: true }), items()], 'x') as any[]
    expect(rest).toHaveLength(0)
    expect(split.hidden).toBe(false)
    expect(split.header.heading).toBeNull()
    expect(split.links).toEqual([])
  })

  it('ids are stable: two locales with different text give the same ids', () => {
    const de = stepsToSplit([heading(), items()], 'kpi-studio') as any[]
    const en = stepsToSplit([heading({ header: { heading: 'From sentence' } }), items({ items: items().items.map((r: any) => ({ ...r, title: `${r.title} EN` })) })], 'kpi-studio') as any[]
    expect(de.map((b) => b.id)).toEqual(en.map((b) => b.id))
    expect(de[0].points.map((p: any) => p.id)).toEqual(en[0].points.map((p: any) => p.id))
  })

  it('is idempotent', () => {
    const once = stepsToSplit([heading(), items()], 'x')
    expect(stepsToSplit(once, 'x')).toEqual(once)
    expect(needsStepsConversion(once)).toBe(false)
    expect(needsStepsConversion([heading(), items()])).toBe(true)
    expect(needsStepsConversion(null)).toBe(false)
  })
})
