import { describe, expect, it } from 'vitest'

import { resolveSpacing, type RhythmBlock } from '@/sections/rhythm'

const b = (blockType: string, extra: Partial<RhythmBlock> = {}): RhythmBlock => ({ blockType, ...extra })
const tops = (blocks: RhythmBlock[]) => resolveSpacing(blocks).map((r) => r.top)
const bottoms = (blocks: RhythmBlock[]) => resolveSpacing(blocks).map((r) => r.bottom)

describe('resolveSpacing', () => {
  it('gives a lone block the full gap on both sides', () => {
    expect(resolveSpacing([b('heading')])).toEqual([{ top: 'normal', bottom: 'normal', groupStart: true, groupEnd: true }])
  })

  it('keeps heading, media, items and actions together as one group', () => {
    const page = [b('heading'), b('media'), b('items'), b('actions')]
    expect(tops(page)).toEqual(['normal', 'tight', 'tight', 'tight'])
    expect(bottoms(page)).toEqual(['none', 'none', 'none', 'normal'])
    expect(resolveSpacing(page).map((r) => [r.groupStart, r.groupEnd])).toEqual([[true, false], [false, false], [false, false], [false, true]])
  })

  it('starts a new group at every heading or split', () => {
    const page = [b('heading'), b('items'), b('split'), b('heading'), b('media')]
    expect(tops(page)).toEqual(['normal', 'tight', 'normal', 'normal', 'tight'])
    expect(bottoms(page)).toEqual(['none', 'normal', 'normal', 'none', 'normal'])
  })

  it('starts a new group when the background changes', () => {
    const page = [b('heading'), b('items', { settings: { background: 'tinted' } })]
    expect(tops(page)).toEqual(['normal', 'normal'])
    expect(bottoms(page)).toEqual(['normal', 'normal'])
  })

  it('lets an explicit gap win for its side only', () => {
    const page = [b('heading', { settings: { gapBottom: 'large' } }), b('media', { settings: { gapTop: 'none' } }), b('items')]
    expect(tops(page)).toEqual(['normal', 'none', 'tight'])
    expect(bottoms(page)).toEqual(['large', 'none', 'normal'])
  })

  it('treats "auto" like an unset gap', () => {
    expect(tops([b('heading'), b('media', { settings: { gapTop: 'auto' } })])).toEqual(['normal', 'tight'])
  })

  it('lets a widget without its own heading continue a heading group', () => {
    const page = [b('heading'), b('faq', { header: { heading: null } })]
    expect(tops(page)).toEqual(['normal', 'tight'])
  })

  it('starts a group at a widget with its own heading', () => {
    expect(tops([b('heading'), b('faq', { header: { heading: 'FAQ' } })])).toEqual(['normal', 'normal'])
  })

  it('starts a group at a widget without heading when the block above is a widget', () => {
    expect(tops([b('hero', { header: { heading: 'Hi' } }), b('logoWall')])).toEqual(['normal', 'normal'])
  })

  it('lets parts continue a widget', () => {
    expect(tops([b('faq', { header: { heading: 'FAQ' } }), b('actions')])).toEqual(['normal', 'tight'])
  })
})
