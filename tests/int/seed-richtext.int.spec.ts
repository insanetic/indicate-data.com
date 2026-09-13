import { describe, expect, it } from 'vitest'

import { richText } from '@/endpoints/seed/lexical'

describe('richText seed helper', () => {
  it('converts headings, paragraphs, lists, rules and quotes', () => {
    const doc = richText(`## Titel

Ein Absatz
über zwei Zeilen.

- eins
- zwei

1. erstens
2. zweitens

---

> Zitat`)
    const types = doc.root.children.map((n) => n.type)
    expect(types).toEqual(['heading', 'paragraph', 'list', 'list', 'horizontalrule', 'quote'])
    expect(doc.root.children[0]).toMatchObject({ tag: 'h2', children: [{ type: 'text', text: 'Titel' }] })
    expect(doc.root.children[1].children?.[0]).toMatchObject({ text: 'Ein Absatz über zwei Zeilen.' })
    expect(doc.root.children[2]).toMatchObject({ listType: 'bullet', tag: 'ul' })
    expect(doc.root.children[2].children).toHaveLength(2)
    expect(doc.root.children[3]).toMatchObject({ listType: 'number', tag: 'ol' })
    expect(doc.root.children[3].children?.[1]).toMatchObject({ type: 'listitem', value: 2 })
  })

  it('converts bold and links inline', () => {
    const doc = richText('Text mit **fett** und [Link](https://example.com) Ende.')
    const inline = doc.root.children[0].children!
    expect(inline.map((n) => n.type)).toEqual(['text', 'text', 'text', 'link', 'text'])
    expect(inline[1]).toMatchObject({ text: 'fett', format: 1 })
    expect(inline[3]).toMatchObject({
      type: 'link',
      fields: { linkType: 'custom', url: 'https://example.com', newTab: true },
      children: [{ type: 'text', text: 'Link' }],
    })
  })

  it('converts pipe tables with a header row', () => {
    const doc = richText(`| Dienst | Daten |
|---|---|
| Google | Sessions |`)
    const table = doc.root.children[0]
    expect(table.type).toBe('table')
    expect(table.children).toHaveLength(2)
    expect(table.children?.[0].children?.[0]).toMatchObject({ type: 'tablecell', headerState: 1 })
    expect(table.children?.[1].children?.[1]).toMatchObject({ type: 'tablecell', headerState: 0 })
  })
})
