import { describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: vi.fn(),
}))

import { getTestimonials, loadPool } from '@subneo/payload-testimonials/server'

const docs = [
  { id: 1, name: 'A', quote: 'qa', _status: 'published' },
  { id: 2, name: 'B', quote: 'qb', _status: 'published' },
  { id: 3, name: 'C', quote: 'qc', _status: 'published' },
]

// Typed so `find.mock.calls[n][0]` is the find options, not an empty tuple.
type FindFn = (options: Record<string, unknown>) => Promise<unknown>

const fakePayload = (impl?: FindFn) => {
  const find = vi.fn<FindFn>(impl || (async () => ({ docs })))
  const error = vi.fn()
  return { payload: { find, logger: { error, debug: vi.fn() } } as never, find, error }
}

describe('loadPool', () => {
  it('asks for published docs only, unless in draft mode', async () => {
    const { payload, find } = fakePayload()
    await loadPool({ payload, locale: 'en' })
    expect(find.mock.calls[0][0]).toMatchObject({ collection: 'testimonials', locale: 'en', draft: false, pagination: false, where: { _status: { equals: 'published' } } })
    await loadPool({ payload, draft: true })
    expect(find.mock.calls[1][0].where).toBeUndefined()
    expect(find.mock.calls[1][0].draft).toBe(true)
  })

  it('only populates slug and title of linked docs', async () => {
    const { payload, find } = fakePayload()
    await loadPool({ payload, linkCollections: ['pages', 'posts'] })
    expect(find.mock.calls[0][0].populate).toEqual({ pages: { slug: true, title: true }, posts: { slug: true, title: true } })
  })
})

describe('getTestimonials', () => {
  it('resolves a manual block', async () => {
    const { payload } = fakePayload()
    const r = await getTestimonials({ payload, block: { mode: 'manual', testimonials: [3, 1] } })
    expect(r.map((s) => s.testimonial.id)).toEqual([3, 1])
  })

  it('dedupes against earlier blocks of the layout', async () => {
    const { payload } = fakePayload()
    const layout = [
      { blockType: 'testimonials', mode: 'manual', testimonials: [1] },
      { blockType: 'testimonials', mode: 'auto', seed: 's', count: 6 },
    ]
    const r = await getTestimonials({ payload, block: layout[1] as never, layout, blockIndex: 1 })
    expect(r.map((s) => s.testimonial.id).sort()).toEqual([2, 3])
  })

  it('logs and returns [] when loading fails', async () => {
    const { payload, error } = fakePayload(async () => {
      throw new Error('db down')
    })
    expect(await getTestimonials({ payload, block: { mode: 'auto' } })).toEqual([])
    expect(error).toHaveBeenCalled()
  })
})

import { legacySelection } from '@/blocks/Testimonials/legacy'

describe('legacySelection', () => {
  it('uses inline items when the block has no references yet', () => {
    const r = legacySelection({ mode: 'auto', items: [{ id: 'a', quote: 'q', name: 'N', company: 'C' }] } as never)
    expect(r?.map((s) => s.testimonial.name)).toEqual(['N'])
  })
  it('returns null once the block references testimonials', () => {
    expect(legacySelection({ mode: 'manual', testimonials: [1], items: [{ id: 'a', quote: 'q', name: 'N' }] } as never)).toBeNull()
  })
  it('returns null without inline items', () => {
    expect(legacySelection({ mode: 'auto', items: [] } as never)).toBeNull()
  })
})
