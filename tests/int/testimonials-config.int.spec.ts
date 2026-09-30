import type { Block, Config, CollectionConfig, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { createTestimonialsBlock, getPluginOptions, testimonialsPlugin } from '@subneo/payload-testimonials'

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

  describe('overrides', () => {
    it('merge access key by key', async () => {
      const create = () => false
      const t = collection(await testimonialsPlugin({ testimonialsOverrides: { access: { create } } })(base), 'testimonials')
      expect(t.access?.create).toBe(create)
      const read = t.access!.read as (args: unknown) => unknown
      expect(read({ req: {} })).toEqual({ _status: { equals: 'published' } })
      expect(t.access?.update).toBeTypeOf('function')
      expect(t.access?.delete).toBeTypeOf('function')
    })

    it('extend the default fields and keep the slug', async () => {
      const config = await testimonialsPlugin({
        slugs: { tags: 'cohorts' },
        testimonialsOverrides: { fields: ({ defaultFields }) => [...defaultFields, { name: 'rating', type: 'number' }] },
        tagsOverrides: { slug: 'ignored', admin: { hidden: true } } as never,
      })(base)
      const t = collection(config, 'testimonials')
      expect(flat(t.fields)).toEqual(expect.arrayContaining(['quote', 'name', 'rating']))
      const tags = collection(config, 'cohorts')
      expect(tags.admin).toMatchObject({ hidden: true, useAsTitle: 'title' })
      expect(tags.access?.read).toBeTypeOf('function')
    })

    it('append hooks after the plugin ones', async () => {
      const mine = () => undefined
      const t = collection(await testimonialsPlugin({ testimonialsOverrides: { hooks: { afterChange: [mine] } } })(base), 'testimonials')
      expect(t.hooks?.afterChange).toHaveLength(2)
      expect(t.hooks?.afterChange?.[1]).toBe(mine)
      expect(t.hooks?.beforeChange).toHaveLength(1)
    })
  })

  describe('block wiring', () => {
    const pages = (block = createTestimonialsBlock({ slug: 'quotes' })) =>
      ({
        slug: 'pages',
        admin: { useAsTitle: 'title' },
        fields: [
          { name: 'title', type: 'text' },
          { type: 'tabs', tabs: [{ label: 'Content', fields: [{ name: 'layout', type: 'blocks', blocks: [block] }] }] },
          { name: 'extra', type: 'group', fields: [{ name: 'sections', type: 'blocks', blocks: [block] }] },
          { name: 'rows', type: 'array', fields: [{ name: 'inner', type: 'blocks', blocks: [block] }] },
        ],
      }) as CollectionConfig

    const wired = (config: Config) => {
      const tabs = collection(config, 'pages').fields[1] as unknown as { tabs: { fields: { blocks: { fields: Field[] }[] }[] }[] }
      return tabs.tabs[0].fields[0].blocks[0]
    }

    it('points the block at the configured slugs and preview path', async () => {
      const config = await testimonialsPlugin({
        slugs: { testimonials: 'quotes-db', tags: 'cohorts' },
        componentPaths: { selectionPreview: 'my/Preview#P' },
      })({ ...base, collections: [pages()] })
      const block = wired(config)
      expect(byName(block.fields, 'testimonials').relationTo).toBe('quotes-db')
      expect(byName(block.fields, 'pinned').relationTo).toBe('quotes-db')
      expect(byName(block.fields, 'exclude').relationTo).toBe('quotes-db')
      expect(byName(block.fields, 'tags').relationTo).toBe('cohorts')
      const preview = byName(block.fields, 'preview').admin as { components: { Field: { path: string; clientProps: unknown } } }
      expect(preview.components.Field).toEqual({ path: 'my/Preview#P', clientProps: { apiSlug: 'quotes-db' } })
    })

    it('leaves the original block object untouched', async () => {
      const block = createTestimonialsBlock()
      await testimonialsPlugin({ slugs: { testimonials: 'other' } })({ ...base, collections: [pages(block)] })
      expect(byName(block.fields, 'testimonials').relationTo).toBe('testimonials')
    })

    it('stores the options with the found locations in config.custom', async () => {
      const config = await testimonialsPlugin({ cacheTag: 'q' })({ ...base, collections: [pages()] })
      const o = getPluginOptions(config)
      expect(o.cacheTag).toBe('q')
      // The array row is not addressable by path, so it is wired but not listed.
      expect(o.locations).toEqual([
        { collection: 'pages', path: 'layout', blockSlug: 'quotes' },
        { collection: 'pages', path: 'extra.sections', blockSlug: 'quotes' },
      ])
      expect(byName(collection(config, 'testimonials').fields, 'usage')).toBeDefined()
    })

    it('wires a block referenced from config.blocks', async () => {
      const config = await testimonialsPlugin({ slugs: { testimonials: 'q' } })({
        ...base,
        blocks: [createTestimonialsBlock()],
        collections: [{ slug: 'pages', fields: [{ name: 'layout', type: 'blocks', blocks: [], blockReferences: ['testimonials'] }] } as unknown as CollectionConfig],
      })
      expect(byName((config.blocks as Block[])[0].fields, 'testimonials').relationTo).toBe('q')
      expect(getPluginOptions(config).locations).toEqual([{ collection: 'pages', path: 'layout', blockSlug: 'testimonials' }])
    })

    it('has no usage panel when the block is used nowhere', async () => {
      const t = collection(await testimonialsPlugin()(base), 'testimonials')
      expect(byName(t.fields, 'usage')).toBeUndefined()
    })
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
