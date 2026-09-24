import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { Document } from '@/blocks/Document/config'
import { SectionHeading } from '@/components/SectionHeading'
import { sectionHeader } from '@/fields/sectionHeader'
import { sectionSettings } from '@/fields/sectionSettings'

afterEach(cleanup)

const subFieldNames = (field: unknown) => ((field as { fields: unknown[] }).fields as { name?: string; type: string; fields?: { name?: string }[] }[]).flatMap((f) => (f.type === 'row' ? (f.fields || []).map((x) => x.name) : [f.name]))

describe('SectionHeading', () => {
  it('right-aligns only from lg, so phones read it like left', () => {
    const { container } = render(<SectionHeading header={{ heading: 'Rechts', align: 'right' }} />)
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('items-start')
    expect(root.className).toContain('lg:items-end')
    expect(root.className).toContain('lg:text-right')
  })
})

describe('section fields', () => {
  it('sectionSettings offers background, both gaps, anchor and keeps the old spacing hidden', () => {
    const settings = sectionSettings() as { fields: { type: string; name?: string; admin?: { hidden?: boolean } }[] }
    expect(subFieldNames(settings)).toEqual(['background', 'gapTop', 'gapBottom', 'anchor', 'spacing'])
    expect(settings.fields.find((f) => f.name === 'spacing')?.admin?.hidden).toBe(true)
  })

  it('sectionHeader offers left, centre and right, and can drop the align field', () => {
    const header = sectionHeader() as { fields: { name: string; options?: { value: string }[] }[] }
    expect(header.fields.find((f) => f.name === 'align')?.options?.map((o) => o.value)).toEqual(['left', 'center', 'right'])
    expect(subFieldNames(sectionHeader({ withAlign: false }))).toEqual(['eyebrow', 'heading', 'lead'])
  })

  it('Document draws its own padding, so both of its gaps default to none', () => {
    const settings = Document.fields.find((f) => 'name' in f && f.name === 'settings') as { fields: { type: string; fields?: { name?: string; defaultValue?: unknown }[] }[] }
    const row = settings.fields.find((f) => f.type === 'row')!
    const defaults = Object.fromEntries((row.fields || []).map((f) => [f.name, f.defaultValue]))
    expect(defaults.gapTop).toBe('none')
    expect(defaults.gapBottom).toBe('none')
  })
})
