import { describe, expect, it } from 'vitest'

import { visibleBlocks } from '@/plugins/blockTools/visibleBlocks'

describe('visibleBlocks', () => {
  it('drops blocks switched to hidden and keeps order', () => {
    const blocks = [
      { id: 'a', hidden: false },
      { id: 'b', hidden: true },
      { id: 'c' },
      { id: 'd', hidden: null },
    ]
    expect(visibleBlocks(blocks).map((b) => b.id)).toEqual(['a', 'c', 'd'])
  })

  it('returns an empty list when every block is hidden', () => {
    expect(visibleBlocks([{ id: 'a', hidden: true }])).toEqual([])
  })

  it('treats a missing layout as empty', () => {
    expect(visibleBlocks(null)).toEqual([])
    expect(visibleBlocks(undefined)).toEqual([])
  })

  it('makes the first visible block the first entry (isFirst)', () => {
    const blocks = [
      { id: 'hero', hidden: true },
      { id: 'faq', hidden: false },
    ]
    expect(visibleBlocks(blocks)[0].id).toBe('faq')
  })
})
