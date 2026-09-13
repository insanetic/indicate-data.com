import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

// The code block pulls in Payload's admin UI (and its .scss), which Vitest cannot load.
// Legal documents contain no code blocks, so a stub keeps the import graph loadable.
vi.mock('@/blocks/Code/Component', () => ({ CodeBlock: () => null }))

import RichText from '@/components/RichText'
import { privacyPolicy } from '@/endpoints/seed/legal/privacy-policy'
import { richText } from '@/endpoints/seed/lexical'
import { extractHeadings } from '@/utilities/lexical/headings'

/**
 * The TOC links to ids produced by `extractHeadings`, the article renders ids produced by
 * `RichText`. Both use `HeadingIds`, and this test keeps them from drifting apart.
 */
describe('heading ids', () => {
  const doc = richText(privacyPolicy.de)
  const headings = extractHeadings(doc)

  it('the privacy policy has headings to link to', () => {
    expect(headings.length).toBeGreaterThan(5)
  })

  it('every id the TOC links to exists as an anchor in the rendered article', () => {
    const html = renderToStaticMarkup(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(RichText, { data: doc as any, enableGutter: false, headingIds: true }),
    )
    for (const heading of headings) expect(html).toContain(`id="${heading.id}"`)
  })

  it('hands out unique ids', () => {
    const ids = headings.map((h) => h.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
