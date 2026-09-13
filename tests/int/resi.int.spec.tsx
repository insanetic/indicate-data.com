import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { mentionsResi, withResi } from '@/components/Resi'
import { pick } from '@/endpoints/seed/content'
import { subpages } from '@/endpoints/seed/pages'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'

describe('withResi', () => {
  it('leaves text without the name untouched', () => {
    expect(withResi('Der Agent antwortet.')).toBe('Der Agent antwortet.')
    expect(withResi(null)).toBeNull()
  })

  it('wraps every whole-word mention in the gradient name', () => {
    const { container } = render(<p>{withResi('Sag hallo zu Resi. Resi antwortet, Resident nicht.')}</p>)
    const names = container.querySelectorAll('.resi-name')
    expect(names).toHaveLength(2)
    expect(container.textContent).toBe('Sag hallo zu Resi. Resi antwortet, Resident nicht.')
  })

  it('recognises a mention', () => {
    expect(mentionsResi('Meet Resi.')).toBe(true)
    expect(mentionsResi('Resident')).toBe(false)
  })
})

describe('seeded copy', () => {
  it('never names Resi inside rich text, where the gradient cannot be applied', () => {
    for (const locale of ['de', 'en'] as const) {
      const refs = { contactPageId: 0, aboutPageId: 0, pages: {} as never, legal: {} as never, media: {}, links: { appUrl: '', demoUrl: '', helpUrl: '', docsUrl: '' } }
      for (const page of Object.values(subpages(pick(locale), refs))) {
        for (const block of page.layout || []) {
          if (block.blockType !== 'faq') continue
          for (const item of block.items || []) {
            expect(lexicalToPlainText(item.answer)).not.toMatch(/\bResi\b/)
          }
        }
      }
    }
  })
})
