import { describe, expect, it } from 'vitest'

import { HeadingIds, extractHeadings, slugify } from '@/utilities/lexical/headings'

const h = (tag: 'h2' | 'h3' | 'h4', text: string) => ({
  type: 'heading',
  tag,
  children: [{ type: 'text', text }],
})
const p = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] })

describe('slugify', () => {
  it('lowercases, strips accents and punctuation', () => {
    expect(slugify('Haftung für Links')).toBe('haftung-fur-links')
    expect(slugify('1. Geltungsbereich')).toBe('1-geltungsbereich')
    expect(slugify('Größe & Maß')).toBe('grosse-mass')
    expect(slugify('   ')).toBe('abschnitt')
  })
})

describe('HeadingIds', () => {
  it('de-duplicates with a counter', () => {
    const ids = new HeadingIds()
    expect(ids.next('Kontakt')).toBe('kontakt')
    expect(ids.next('Kontakt')).toBe('kontakt-2')
    expect(ids.next('Kontakt')).toBe('kontakt-3')
  })
})

describe('extractHeadings', () => {
  it('returns h2 and h3 with ids in document order, skipping h4', () => {
    const doc = { root: { type: 'root', children: [h('h2', 'Eins'), p('x'), h('h3', 'Eins'), h('h4', 'Tief'), h('h2', 'Zwei')] } }
    expect(extractHeadings(doc)).toEqual([
      { id: 'eins', text: 'Eins', level: 2 },
      { id: 'eins-2', text: 'Eins', level: 3 },
      { id: 'zwei', text: 'Zwei', level: 2 },
    ])
  })

  it('handles empty documents', () => {
    expect(extractHeadings(null)).toEqual([])
    expect(extractHeadings({ root: { type: 'root', children: [] } })).toEqual([])
  })
})
