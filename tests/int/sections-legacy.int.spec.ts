import { describe, expect, it } from 'vitest'

import {
  convertWidgetSpacing,
  needsSectionConversion,
  splitLegacyBlock,
  splitLegacyLayout,
  type LegacyBlock,
} from '@/sections/legacy'

const header = { eyebrow: 'Für Hotels', heading: 'Strategie auf Zahlen', lead: 'Welche Kanäle?', align: 'left' as const }
const link = <A extends 'default' | 'outline' | 'link' = 'default'>(label: string, appearance: A = 'default' as A) => ({ id: `l-${label}`, link: { type: 'custom' as const, url: '/x', label, appearance } })
const types = (blocks: { blockType?: string }[]) => blocks.map((b) => b.blockType)
type Loose = Record<string, any>

describe('splitLegacyBlock', () => {
  it('featureStory stacked → heading, media, points with a rule, actions', () => {
    const out = splitLegacyBlock({
      blockType: 'featureStory', id: 'fs', blockName: 'Hotels', header, layout: 'stacked',
      visual: { type: 'illustration', illustration: 'portfolio' },
      points: [{ id: 'p1', icon: 'building', title: 'Ein Space', text: 'Pro Haus' }],
      links: [link('Demo'), link('Mehr', 'link')],
      settings: { background: 'tinted', spacing: 'compact', anchor: 'hotels' },
    }) as Loose[]
    expect(types(out)).toEqual(['heading', 'media', 'items', 'actions'])
    expect(out.map((b) => b.id)).toEqual(['fs-heading', 'fs-media', 'fs-items', 'fs-actions'])
    expect(out[0].header).toEqual({ eyebrow: 'Für Hotels', heading: 'Strategie auf Zahlen', lead: 'Welche Kanäle?', align: 'left' })
    expect(out[1]).toMatchObject({ visual: { illustration: 'portfolio' }, width: 'full' })
    expect(out[2]).toMatchObject({ style: 'points', divider: true, items: [{ id: 'p1', icon: 'building', title: 'Ein Space', text: 'Pro Haus' }] })
    expect(out[3]).toMatchObject({ align: 'left', links: [link('Demo'), link('Mehr', 'link')] })
    // Background on every part; anchor and old spacing only at the edges.
    expect(out.map((b) => b.settings)).toEqual([
      { background: 'tinted', gapTop: 'tight', gapBottom: 'auto', anchor: 'hotels' },
      { background: 'tinted', gapTop: 'auto', gapBottom: 'auto' },
      { background: 'tinted', gapTop: 'auto', gapBottom: 'auto' },
      { background: 'tinted', gapTop: 'auto', gapBottom: 'tight' },
    ])
    expect(out.every((b) => b.blockName === 'Hotels' && b.hidden === false)).toBe(true)
  })

  it('featureStory side by side → one split', () => {
    const out = splitLegacyBlock({ blockType: 'featureStory', id: 'fs', header, layout: 'visual-left', points: [], links: [] }) as Loose[]
    expect(types(out)).toEqual(['split'])
    expect(out[0]).toMatchObject({ id: 'fs-split', mediaSide: 'left', header: { eyebrow: 'Für Hotels', heading: 'Strategie auf Zahlen', lead: 'Welche Kanäle?' } })
    expect(out[0].header.align).toBeUndefined()
  })

  it('featureStory without points or links → heading and media only', () => {
    expect(types(splitLegacyBlock({ blockType: 'featureStory', header, layout: 'stacked' }))).toEqual(['heading', 'media'])
  })

  it('ctaSection → one large centred heading with the buttons; hidden stays hidden; dark default', () => {
    const out = splitLegacyBlock({ blockType: 'ctaSection', id: 'c', hidden: true, header: { ...header, align: 'left' }, links: [link('Demo')], note: 'gone' }) as Loose[]
    expect(types(out)).toEqual(['heading'])
    expect(out[0]).toMatchObject({ size: 'display', header: { align: 'center' }, links: [link('Demo')], hidden: true, settings: { background: 'dark' } })
  })

  it('pillars → heading, cards panel, numbers panel', () => {
    const out = splitLegacyBlock({
      blockType: 'pillars', id: 'why', header,
      pillars: [1, 2, 3, 4].map((n) => ({ id: `pi${n}`, icon: 'zap' as const, title: `Säule ${n}`, text: 'Text' })),
      tiles: [{ id: 't1', value: '30', suffix: '+', label: 'Anbindungen', links: [link('Alle', 'link')] }, { id: 't2', label: 'Für Agenturen' }],
    }) as Loose[]
    expect(types(out)).toEqual(['heading', 'items', 'items'])
    expect(out[0].header.align).toBe('center')
    expect(out[1]).toMatchObject({ id: 'why-cards', style: 'cards', frame: 'panel', columns: '4' })
    expect(out[2]).toMatchObject({ id: 'why-stats', style: 'stats', frame: 'panel', items: [{ id: 't1', value: '30', suffix: '+', title: 'Anbindungen', links: [link('Alle', 'link')] }, { id: 't2', title: 'Für Agenturen' }] })
  })

  it('pillars without tiles → no numbers block', () => {
    expect(types(splitLegacyBlock({ blockType: 'pillars', header, pillars: [{ title: 'A', text: 'a' }], tiles: [] }))).toEqual(['heading', 'items'])
  })

  it('cardGrid → heading and cards; columns from the layout; bento keeps large cards', () => {
    const cards = [{ id: 'k', title: 'Karte', size: 'lg' as const, points: [{ id: 'kp', text: 'Punkt' }], links: [link('Mehr', 'link')] }]
    const grid3 = splitLegacyBlock({ blockType: 'cardGrid', header, layout: 'grid-3', cards }) as Loose[]
    expect(grid3[1]).toMatchObject({ style: 'cards', columns: '3', items: [{ size: 'sm', points: [{ id: 'kp', text: 'Punkt' }] }] })
    expect(grid3[0].header.align).toBe('left')
    const bento = splitLegacyBlock({ blockType: 'cardGrid', header, layout: 'bento', cards }) as Loose[]
    expect(bento[1]).toMatchObject({ columns: '4', items: [{ size: 'lg' }] })
  })

  it('steps → centred heading and steps', () => {
    const out = splitLegacyBlock({ blockType: 'steps', header, steps: [{ id: 's', icon: 'plug', title: 'Verbinden', text: 'Klick' }] }) as Loose[]
    expect(types(out)).toEqual(['heading', 'items'])
    expect(out[1]).toMatchObject({ style: 'steps', items: [{ id: 's', icon: 'plug', title: 'Verbinden', text: 'Klick' }] })
  })

  it('stats without a heading → numbers only, tinted by default; note becomes the text', () => {
    const out = splitLegacyBlock({ blockType: 'stats', header: { heading: null }, items: [{ id: 'v', value: '40', suffix: '%', label: 'weniger', note: 'Quelle' }] }) as Loose[]
    expect(types(out)).toEqual(['items'])
    expect(out[0]).toMatchObject({ style: 'stats', items: [{ id: 'v', value: '40', suffix: '%', title: 'weniger', text: 'Quelle' }], settings: { background: 'tinted' } })
  })

  it('integrations → heading, tree, actions', () => {
    const groups = [{ id: 'g', title: 'PMS', items: [{ id: 'gi', name: 'Mews', logo: null }] }]
    const out = splitLegacyBlock({ blockType: 'integrations', id: 'int', header, groups, links: [link('Alle')] }) as Loose[]
    expect(types(out)).toEqual(['heading', 'integrationTree', 'actions'])
    expect(out[1]).toMatchObject({ id: 'int-tree', groups, hidden: false })
    expect(out[2].align).toBe('center')
  })

  it('integrations with an uploaded image → the image shows, the tree is kept hidden', () => {
    const out = splitLegacyBlock({ blockType: 'integrations', header, visual: { type: 'image', image: 7 }, groups: [{ title: 'PMS', items: [] }] }) as Loose[]
    expect(types(out)).toEqual(['heading', 'integrationTree', 'media'])
    expect(out[1].hidden).toBe(true)
    expect(out[2]).toMatchObject({ width: 'narrow', visual: { type: 'image', image: 7 } })
  })
})

describe('convertWidgetSpacing', () => {
  it('moves compact and none to both gaps and marks the block converted', () => {
    expect(convertWidgetSpacing({ blockType: 'hero', settings: { spacing: 'compact', gapTop: 'auto', gapBottom: 'auto' } })).toEqual({
      blockType: 'hero', settings: { spacing: 'default', gapTop: 'tight', gapBottom: 'tight' },
    })
    expect(convertWidgetSpacing({ blockType: 'faq', settings: { spacing: 'none' } })).toMatchObject({ settings: { gapTop: 'none', gapBottom: 'none' } })
  })

  it('leaves default spacing and already-set gaps alone (same object)', () => {
    const a = { blockType: 'faq', settings: { spacing: 'default' } }
    const b = { blockType: 'faq', settings: { spacing: 'compact', gapTop: 'large' } }
    expect(convertWidgetSpacing(a)).toBe(a)
    expect(convertWidgetSpacing(b)).toBe(b)
  })
})

describe('splitLegacyLayout', () => {
  it('replaces legacy blocks in place and passes other blocks through', () => {
    const faq = { blockType: 'faq', id: 'f' }
    const out = splitLegacyLayout([faq, { blockType: 'steps', id: 's', header, steps: [{ title: 'A', text: 'a' }] } as LegacyBlock, faq]) as Loose[]
    expect(types(out)).toEqual(['faq', 'heading', 'items', 'faq'])
    expect(out[0]).toBe(faq)
  })

  it('is idempotent', () => {
    const once = splitLegacyLayout([{ blockType: 'ctaSection', id: 'c', header, links: [] } as LegacyBlock, { blockType: 'hero', settings: { spacing: 'compact' } }])
    expect(splitLegacyLayout(once)).toEqual(once)
    expect(needsSectionConversion(once)).toBe(false)
  })

  it('needsSectionConversion spots legacy blocks and old widget spacing', () => {
    expect(needsSectionConversion([{ blockType: 'stats', items: [] }])).toBe(true)
    expect(needsSectionConversion([{ blockType: 'hero', settings: { spacing: 'compact' } }])).toBe(true)
    expect(needsSectionConversion([{ blockType: 'hero', settings: { spacing: 'default' } }])).toBe(false)
    expect(needsSectionConversion(null)).toBe(false)
  })
})
