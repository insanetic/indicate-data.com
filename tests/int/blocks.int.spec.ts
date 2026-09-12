import { describe, expect, it } from 'vitest'

import { Pages } from '@/collections/Pages'
import { blockSlugs } from '@/blocks/registry'

const findLayoutBlocks = () => {
  const tabs = Pages.fields.find((f) => f.type === 'tabs')
  if (!tabs || tabs.type !== 'tabs') throw new Error('Pages has no tabs field')
  for (const tab of tabs.tabs) {
    const layout = tab.fields.find((f) => 'name' in f && f.name === 'layout')
    if (layout && layout.type === 'blocks') return layout.blocks
  }
  throw new Error('layout blocks field not found')
}

describe('page blocks', () => {
  it('every configured block is listed in the registry (and vice versa)', () => {
    const configured = findLayoutBlocks()
      .map((b) => ('slug' in b ? b.slug : String(b)))
      .sort()
    expect(configured).toEqual([...blockSlugs].sort())
  })
})
