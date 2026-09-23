import { describe, expect, it } from 'vitest'

import { countEligible, fnv1a, score, selectForLayout, selectTestimonials, type Testimonial } from '@subneo/payload-testimonials'

const t = (id: number, extra: Partial<Testimonial> = {}): Testimonial => ({ id, name: `P${id}`, quote: `Q${id}`, ...extra })
const pool = (n: number, extra: (i: number) => Partial<Testimonial> = () => ({})) =>
  Array.from({ length: n }, (_, i) => t(i + 1, extra(i + 1)))
const ids = (s: { testimonial: Testimonial }[]) => s.map((x) => String(x.testimonial.id))

describe('hash', () => {
  it('is stable', () => {
    expect(fnv1a('abc')).toBe(fnv1a('abc'))
    expect(fnv1a('abc')).not.toBe(fnv1a('abd'))
  })
  it('spreads adjacent ids evenly (no bias towards low ids)', () => {
    const wins: Record<string, number> = {}
    for (let s = 0; s < 2000; s++) {
      const top = ['1', '2', '3', '4', '5'].sort((a, b) => score(`seed${s}`, b) - score(`seed${s}`, a))[0]
      wins[top] = (wins[top] || 0) + 1
    }
    for (const k of ['1', '2', '3', '4', '5']) expect(wins[k]).toBeGreaterThan(300) // ~400 expected
  })
})

describe('selectTestimonials — auto', () => {
  it('is deterministic for the same seed', () => {
    const block = { mode: 'auto' as const, seed: 'home', count: 3 }
    expect(ids(selectTestimonials({ pool: pool(10), block }))).toEqual(ids(selectTestimonials({ pool: pool(10), block })))
  })

  it('differs between seeds (at least sometimes)', () => {
    const picks = new Set<string>()
    for (let s = 0; s < 20; s++) picks.add(ids(selectTestimonials({ pool: pool(10), block: { seed: `s${s}`, count: 3 } })).join())
    expect(picks.size).toBeGreaterThan(5)
  })

  it('adding a testimonial changes at most one slot, and only to the newcomer', () => {
    for (let s = 0; s < 200; s++) {
      const block = { seed: `s${s}`, count: 3 }
      const before = ids(selectTestimonials({ pool: pool(10), block }))
      const after = ids(selectTestimonials({ pool: pool(11), block }))
      const lost = before.filter((id) => !after.includes(id))
      const gained = after.filter((id) => !before.includes(id))
      expect(lost.length).toBeLessThanOrEqual(1)
      expect(gained).toEqual(lost.length ? ['11'] : [])
    }
  })

  it('removing a testimonial that is not shown changes nothing', () => {
    for (let s = 0; s < 200; s++) {
      const block = { seed: `s${s}`, count: 3 }
      const before = ids(selectTestimonials({ pool: pool(10), block }))
      const hidden = pool(10).find((x) => !before.includes(String(x.id)))!
      const after = ids(selectTestimonials({ pool: pool(10).filter((x) => x.id !== hidden.id), block }))
      expect(after).toEqual(before)
    }
  })

  it('puts pinned first in their order and counts them toward count', () => {
    const r = selectTestimonials({ pool: pool(10), block: { seed: 'x', count: 3, pinned: [7, 2] } })
    expect(ids(r).slice(0, 2)).toEqual(['7', '2'])
    expect(r.map((x) => x.reason)).toEqual(['pinned', 'pinned', 'auto'])
    expect(r).toHaveLength(3)
  })

  it('skips excluded ones', () => {
    const r = selectTestimonials({ pool: pool(4), block: { seed: 'x', count: 6, exclude: [2, { id: 3 }] } })
    expect(ids(r).sort()).toEqual(['1', '4'])
  })

  it('filters by tags: any / all / none', () => {
    const p = [t(1, { tags: [10] }), t(2, { tags: [10, 20] }), t(3, { tags: [{ id: 20 }] }), t(4)]
    const pick = (block: object) => ids(selectTestimonials({ pool: p, block: { seed: 'x', count: 6, ...block } })).sort()
    expect(pick({ tags: [10] })).toEqual(['1', '2'])
    expect(pick({ tags: [10, 20], tagMatch: 'any' })).toEqual(['1', '2', '3'])
    expect(pick({ tags: [10, 20], tagMatch: 'all' })).toEqual(['2'])
    expect(pick({ tags: [] })).toEqual(['1', '2', '3', '4'])
  })

  it('clamps count: null → 3, 0 → 1, 99 → 6, more than pool → pool size', () => {
    expect(selectTestimonials({ pool: pool(10), block: { seed: 'x', count: null } })).toHaveLength(3)
    expect(selectTestimonials({ pool: pool(10), block: { seed: 'x', count: 0 } })).toHaveLength(1)
    expect(selectTestimonials({ pool: pool(10), block: { seed: 'x', count: 99 } })).toHaveLength(6)
    expect(selectTestimonials({ pool: pool(2), block: { seed: 'x', count: 5 } })).toHaveLength(2)
  })

  it('falls back to the block id when seed is missing', () => {
    const a = ids(selectTestimonials({ pool: pool(10), block: { id: 'blk1', count: 3 } }))
    const b = ids(selectTestimonials({ pool: pool(10), block: { id: 'blk1', seed: 'blk1', count: 3 } }))
    expect(a).toEqual(b)
  })

  it('compares mixed id types as strings', () => {
    const r = selectTestimonials({ pool: pool(5), block: { seed: 'x', count: 2, pinned: ['4'], exclude: ['1', 2, 3, 5] } })
    expect(ids(r)).toEqual(['4'])
  })

  it('skips pinned ids that are not in the pool (deleted/unpublished)', () => {
    const p = [t(1)]
    const r = selectTestimonials({ pool: p, block: { seed: 'x', count: 3, pinned: [99, 1] } })
    expect(ids(r)).toEqual(['1'])
  })

  it('returns [] for an empty pool', () => {
    expect(selectTestimonials({ pool: [], block: { seed: 'x' } })).toEqual([])
  })

  it('skips alreadyShown in auto mode', () => {
    const r = selectTestimonials({ pool: pool(3), block: { seed: 'x', count: 6 }, alreadyShown: new Set(['2']) })
    expect(ids(r).sort()).toEqual(['1', '3'])
  })
})

describe('selectTestimonials — pinned and alreadyShown', () => {
  it('shows a pinned testimonial even when an earlier block shows it; automatic picks still skip it', () => {
    const r = selectTestimonials({ pool: pool(4), block: { seed: 'x', count: 3, pinned: [2] }, alreadyShown: new Set(['2', '3']) })
    expect(r[0]).toMatchObject({ testimonial: { id: 2 }, reason: 'pinned' })
    expect(ids(r).slice(1).sort()).toEqual(['1', '4'])
  })
})

describe('selectTestimonials — manual', () => {
  it('keeps the chosen order, ignores tags/count/alreadyShown, drops missing', () => {
    const r = selectTestimonials({
      pool: pool(5),
      block: { mode: 'manual', testimonials: [5, { id: 1 }, 99, 3], tags: [123], count: 1 },
      alreadyShown: new Set(['5']),
    })
    expect(ids(r)).toEqual(['5', '1', '3'])
    expect(r.every((x) => x.reason === 'manual')).toBe(true)
  })
})

describe('countEligible', () => {
  it('counts pool matches for the filter (ignoring count)', () => {
    const p = [t(1, { tags: [10] }), t(2, { tags: [10] }), t(3)]
    expect(countEligible({ pool: p, block: { tags: [10], count: 1 } })).toBe(2)
  })
})

describe('selectForLayout', () => {
  it('dedupes later auto blocks against earlier ones and ignores other block types', () => {
    const layout = [
      { blockType: 'hero' },
      { blockType: 'testimonials', mode: 'manual', testimonials: [1, 2] },
      { blockType: 'testimonials', mode: 'auto', seed: 'x', count: 6 },
    ]
    const map = selectForLayout({ layout, pool: pool(4) })
    expect(map.has(0)).toBe(false)
    expect(ids(map.get(1)!)).toEqual(['1', '2'])
    expect(ids(map.get(2)!).sort()).toEqual(['3', '4'])
  })

  it('shows a pinned testimonial in a later auto block although an earlier manual block shows it', () => {
    const layout = [
      { blockType: 'testimonials', mode: 'manual', testimonials: [2] },
      { blockType: 'testimonials', mode: 'auto', seed: 'x', count: 2, pinned: [2] },
    ]
    const later = selectForLayout({ layout, pool: pool(4) }).get(1)!
    expect(later[0]).toMatchObject({ testimonial: { id: 2 }, reason: 'pinned' })
    expect(later).toHaveLength(2)
    expect(later[1].reason).toBe('auto')
  })
})
