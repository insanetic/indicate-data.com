import type { Config, CollectionConfig, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { createTestimonialsBlock, testimonialsPlugin } from '@subneo/payload-testimonials'

import { Testimonials } from '@/blocks/Testimonials/config'

const base = { collections: [], localization: { locales: ['de', 'en'], defaultLocale: 'de' } } as unknown as Config
// Unnamed layout fields (rows) are flattened; named groups are not, so `link.doc` still needs the group's fields.
const flatten = (fields: Field[]): Field[] =>
  fields.flatMap((f) => (!('name' in f) && 'fields' in f ? flatten(f.fields as Field[]) : [f]))
const byName = (fields: Field[], name: string) =>
  flatten(fields).find((f) => 'name' in f && f.name === name) as Field & Record<string, unknown>
// Field names in order, with rows flattened (unnamed fields show their type).
const flat = (fields: Field[]): string[] => flatten(fields).map((f) => ('name' in f ? f.name : f.type))
const collection = (config: Config, slug: string) => (config.collections as CollectionConfig[]).find((c) => c.slug === slug)!

describe('testimonialsPlugin', () => {
  it('adds both collections with drafts on testimonials', async () => {
    const config = await testimonialsPlugin()(base)
    const t = collection(config, 'testimonials')
    expect(collection(config, 'testimonial-tags')).toBeDefined()
    expect(t.versions).toMatchObject({ drafts: true })
    expect(t.admin?.useAsTitle).toBe('title')
  })

  it('localises quote and role only when the config is localised', async () => {
    const localised = collection(await testimonialsPlugin()(base), 'testimonials')
    expect(byName(localised.fields, 'quote').localized).toBe(true)
    expect(byName(localised.fields, 'role').localized).toBe(true)
    expect(byName(localised.fields, 'name').localized).toBeFalsy()
    const plain = collection(await testimonialsPlugin()({ collections: [] } as unknown as Config), 'testimonials')
    expect(byName(plain.fields, 'quote').localized).toBeFalsy()
  })

  it('points tags and link docs at the configured collections', async () => {
    const t = collection(await testimonialsPlugin({ slugs: { tags: 'cohorts' }, linkCollections: ['pages'] })(base), 'testimonials')
    expect(byName(t.fields, 'tags').relationTo).toBe('cohorts')
    const link = byName(t.fields, 'link') as unknown as { fields: Field[] }
    expect(byName(link.fields, 'doc').relationTo).toEqual(['pages'])
  })

  it('omits the internal link option when linkCollections is empty', async () => {
    const t = collection(await testimonialsPlugin({ linkCollections: [] })(base), 'testimonials')
    const link = byName(t.fields, 'link') as unknown as { fields: Field[] }
    expect(byName(link.fields, 'doc')).toBeUndefined()
  })

  it('fills the stored title from name and company', async () => {
    const t = collection(await testimonialsPlugin()(base), 'testimonials')
    const hook = t.hooks!.beforeChange![0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await (hook as any)({ data: { company: 'Familotel AG' }, originalDoc: { name: 'Armin Biebl' } })
    expect(data.title).toBe('Armin Biebl – Familotel AG')
  })

  it('hides the internal note from anonymous readers', async () => {
    const t = collection(await testimonialsPlugin()(base), 'testimonials')
    const read = (byName(t.fields, 'internalNote').access as { read: (args: unknown) => boolean }).read
    expect(read({ req: {} })).toBe(false)
    expect(read({ req: { user: {} } })).toBe(true)
  })

  describe('anonymous read', () => {
    it('is exactly the published filter', async () => {
      const t = collection(await testimonialsPlugin()(base), 'testimonials')
      const read = t.access!.read as (args: unknown) => unknown
      expect(read({ req: {} })).toEqual({ _status: { equals: 'published' } })
    })

    it('gives a logged-in user everything', async () => {
      const t = collection(await testimonialsPlugin()(base), 'testimonials')
      const read = t.access!.read as (args: unknown) => unknown
      expect(read({ req: { user: { id: 1 } } })).toBe(true)
    })
  })

  it('lets an access override replace only the key it names', async () => {
    const create = () => false
    const t = collection(await testimonialsPlugin({ access: { create } })(base), 'testimonials')
    expect(t.access?.create).toBe(create)
    const read = t.access!.read as (args: unknown) => unknown
    expect(read({ req: {} })).toEqual({ _status: { equals: 'published' } })
    expect(t.access?.update).toBeTypeOf('function')
    expect(t.access?.delete).toBeTypeOf('function')
  })

  it('does nothing when disabled', async () => {
    const config = await testimonialsPlugin({ enabled: false })(base)
    expect(config.collections).toHaveLength(0)
  })
})

describe('createTestimonialsBlock', () => {
  const block = createTestimonialsBlock({ before: [{ name: 'header', type: 'text' }], after: [{ name: 'settings', type: 'text' }] })
  const names = flat(block.fields)

  it('orders before → own fields → after', () => {
    expect(names[0]).toBe('header')
    expect(names.at(-1)).toBe('settings')
    expect(names).toEqual(expect.arrayContaining(['mode', 'testimonials', 'tags', 'tagMatch', 'count', 'pinned', 'exclude', 'seed', 'preview']))
  })

  it('defaults to auto mode and a random seed', () => {
    expect(byName(block.fields, 'mode').defaultValue).toBe('auto')
    const seed = byName(block.fields, 'seed').defaultValue as () => string
    expect(typeof seed()).toBe('string')
    expect(seed()).not.toBe(seed())
  })

  it('shows manual/auto fields conditionally', () => {
    const cond = (name: string) => (byName(block.fields, name).admin as { condition: (d: unknown, s: unknown) => boolean }).condition
    expect(cond('testimonials')({}, { mode: 'manual' })).toBe(true)
    expect(cond('testimonials')({}, { mode: 'auto' })).toBe(false)
    expect(cond('count')({}, { mode: 'auto' })).toBe(true)
    expect(cond('tagMatch')({}, { mode: 'auto', tags: [1] })).toBe(false)
    expect(cond('tagMatch')({}, { mode: 'auto', tags: [1, 2] })).toBe(true)
  })
})

describe('site Testimonials block', () => {
  it('keeps the slug and interface and the legacy inline items (hidden)', () => {
    expect(Testimonials.slug).toBe('testimonials')
    expect(Testimonials.interfaceName).toBe('TestimonialsBlock')
    const items = byName(Testimonials.fields, 'items')
    expect(items.type).toBe('array')
    expect((items.admin as { hidden?: boolean }).hidden).toBe(true)
  })
})
