import { describe, expect, it } from 'vitest'

import { findUsage } from '@subneo/payload-testimonials'

const pool = [1, 2, 3, 4].map((id) => ({ id, name: `P${id}`, quote: 'q' }))

describe('findUsage', () => {
  const docs = [
    { id: 10, title: 'Home', layout: [{ blockType: 'testimonials', mode: 'manual', testimonials: [2], header: { heading: 'Stimmen' } }] },
    { id: 11, title: 'Hotels', layout: [{ blockType: 'hero' }, { blockType: 'testimonials', mode: 'auto', pinned: [3], count: 1, seed: 'x' }] },
    { id: 12, title: 'All', layout: [{ blockType: 'testimonials', mode: 'auto', count: 6, seed: 'y' }] },
    { id: 13, title: 'Empty', layout: null },
  ]

  it('reports manual, pinned and auto uses with the block heading', () => {
    const u = findUsage({ docs, field: 'layout', blockSlug: 'testimonials', pool, testimonialId: 2 })
    expect(u).toContainEqual({ docId: 10, docTitle: 'Home', blockIndex: 0, heading: 'Stimmen', reason: 'manual', shown: true })
    expect(u).toContainEqual({ docId: 12, docTitle: 'All', blockIndex: 0, heading: null, reason: 'auto', shown: true })
    expect(u.find((x) => x.docId === 11)).toBeUndefined()
  })

  it('reports a pinned reference', () => {
    const u = findUsage({ docs, field: 'layout', blockSlug: 'testimonials', pool, testimonialId: '3' })
    expect(u).toContainEqual(expect.objectContaining({ docId: 11, blockIndex: 1, reason: 'pinned', shown: true }))
  })

  it('reports references that are currently not shown (not in the pool)', () => {
    const u = findUsage({ docs, field: 'layout', blockSlug: 'testimonials', pool: pool.filter((t) => t.id !== 2), testimonialId: 2 })
    expect(u).toEqual([{ docId: 10, docTitle: 'Home', blockIndex: 0, heading: 'Stimmen', reason: 'manual', shown: false }])
  })
})
