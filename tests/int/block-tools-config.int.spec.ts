import type { Block, Config, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { blockSlugs } from '@/blocks/registry'
import { Pages } from '@/collections/Pages'
import { blockToolsPlugin } from '@/plugins/blockTools'

const layoutBlocks = (fields: Field[]): Block[] => {
  for (const f of fields) {
    if (f.type === 'blocks' && f.name === 'layout') return f.blocks
    if (f.type === 'tabs') for (const tab of f.tabs) if (!('name' in tab && tab.name)) {
      const found = layoutBlocks(tab.fields)
      if (found.length) return found
    }
  }
  return []
}

const apply = (config: Partial<Config>, collections = { pages: { field: 'layout' } }) =>
  blockToolsPlugin({ collections })(config as Config) as Config

const pagesOut = () => apply({ collections: [Pages] }).collections!.find((c) => c.slug === 'pages')!

describe('blockToolsPlugin', () => {
  it('gives every layout block a non-localised hidden value and the toolbar, first', () => {
    const blocks = layoutBlocks(pagesOut().fields)
    expect(blocks.map((b) => b.slug).sort()).toEqual([...blockSlugs].sort())
    for (const block of blocks) {
      const [hidden, toolbar] = block.fields
      // The toolbar's switch edits `hidden`; the checkbox itself stays out of sight.
      expect(hidden).toMatchObject({ name: 'hidden', type: 'checkbox', defaultValue: false, admin: { hidden: true } })
      expect('localized' in hidden && hidden.localized).toBeFalsy()
      expect(toolbar).toMatchObject({ name: 'blockToolbar', type: 'ui', admin: { components: { Field: '@/plugins/blockTools/admin#BlockToolbar' } } })
    }
  })

  it('sets the row label with the block label as client prop', () => {
    const faq = layoutBlocks(pagesOut().fields).find((b) => b.slug === 'faq')!
    expect(faq.admin?.components?.Label).toEqual({
      path: '@/plugins/blockTools/admin#BlockRowLabel',
      clientProps: { label: { de: 'Häufige Fragen (FAQ)', en: 'FAQ' } },
    })
  })

  it('registers the copy-block endpoint on the collection', () => {
    expect(pagesOut().endpoints).toEqual(expect.arrayContaining([expect.objectContaining({ path: '/copy-block', method: 'post' })]))
  })

  it('leaves the original config objects untouched', () => {
    apply({ collections: [Pages] })
    const faq = layoutBlocks(Pages.fields).find((b) => b.slug === 'faq')!
    const hasHidden = faq.fields.some((f) => 'name' in f && f.name === 'hidden')
    expect(hasHidden).toBe(false)
    expect(faq.admin?.components?.Label).toBeUndefined()
  })

  it('throws for an unknown collection, a missing field, a non-blocks field and an existing Label', () => {
    const base = { slug: 'pages', fields: [{ name: 'layout', type: 'blocks', blocks: [{ slug: 'a', fields: [] }] }] }
    expect(() => apply({ collections: [base as never] }, { nope: { field: 'layout' } } as never)).toThrow(/nope/)
    expect(() => apply({ collections: [base as never] }, { pages: { field: 'other' } })).toThrow(/other/)
    expect(() => apply({ collections: [{ slug: 'pages', fields: [{ name: 'layout', type: 'text' }] } as never] })).toThrow(/not a blocks field/)
    const withLabel = { slug: 'pages', fields: [{ name: 'layout', type: 'blocks', blocks: [{ slug: 'a', fields: [], admin: { components: { Label: 'x#Y' } } }] }] }
    expect(() => apply({ collections: [withLabel as never] })).toThrow(/Label/)
  })
})
