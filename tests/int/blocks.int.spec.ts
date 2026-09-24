import { describe, expect, it } from 'vitest'

import { Pages } from '@/collections/Pages'
import { blockSlugs, legacySectionSlugs } from '@/blocks/registry'

const findLayoutField = () => {
  const tabs = Pages.fields.find((f) => f.type === 'tabs')
  if (!tabs || tabs.type !== 'tabs') throw new Error('Pages has no tabs field')
  for (const tab of tabs.tabs) {
    const layout = tab.fields.find((f) => 'name' in f && f.name === 'layout')
    if (layout && layout.type === 'blocks') return layout
  }
  throw new Error('layout blocks field not found')
}

const findLayoutBlocks = () => findLayoutField().blocks

describe('page blocks', () => {
  it('every configured block is listed in the registry (and vice versa)', () => {
    const configured = findLayoutBlocks()
      .map((b) => ('slug' in b ? b.slug : String(b)))
      .sort()
    expect(configured).toEqual([...blockSlugs].sort())
  })
})

describe('legacy section blocks', () => {
  const filter = findLayoutField().filterOptions as (args: { req?: { context?: Record<string, unknown> } }) => true | string[]

  it('are not offered in the block picker', () => {
    const allowed = filter({ req: { context: {} } }) as string[]
    for (const slug of legacySectionSlugs) expect(allowed).not.toContain(slug)
    expect(allowed).toContain('heading')
    expect(allowed).toContain('faq')
  })

  it('stay writable for the conversion', () => {
    expect(filter({ req: { context: { allowLegacySections: true } } })).toBe(true)
  })
})
