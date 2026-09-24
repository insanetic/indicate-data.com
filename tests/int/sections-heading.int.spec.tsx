import { cleanup, render, screen, within } from '@testing-library/react'
import React from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { Document } from '@/blocks/Document/config'
import { HeadingBlock } from '@/blocks/Heading/Component'
import { ActionRow } from '@/components/ActionRow'
import { LocaleProvider } from '@/providers/Locale'
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

const inLocale = (ui: React.ReactElement) => render(<LocaleProvider locale="de">{ui}</LocaleProvider>)
const link = (label: string, appearance: 'default' | 'outline' | 'link') => ({ link: { type: 'custom' as const, url: '/x', label, appearance } })

describe('ActionRow', () => {
  it('renders nothing without links', () => {
    const { container } = inLocale(<ActionRow links={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('maps appearances to button variants and aligns the row', () => {
    const { container } = inLocale(<ActionRow align="center" links={[link('Demo', 'default'), link('Mehr', 'outline')]} />)
    const row = container.firstElementChild as HTMLElement
    expect(row.className).toContain('justify-center')
    expect(screen.getByRole('link', { name: 'Mehr' }).className).toContain('border-line-strong')
  })
})

describe('HeadingBlock', () => {
  const header = { eyebrow: 'Für Hotels', heading: 'Strategie auf Zahlen', lead: 'Welche Kanäle bringen Umsatz?', align: 'left' as const }

  it('renders nothing without heading and lead', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ eyebrow: 'x' }} />)
    expect(container.innerHTML).toBe('')
  })

  it('is an h1 on the first block, else an h2', () => {
    inLocale(<HeadingBlock blockType="heading" header={header} isFirst />)
    expect(screen.getByRole('heading', { level: 1, name: 'Strategie auf Zahlen' })).toBeTruthy()
    cleanup()
    inLocale(<HeadingBlock blockType="heading" header={header} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Strategie auf Zahlen' })).toBeTruthy()
  })

  it('left: heading in the wide column, lead and actions in the narrow one', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={header} links={[link('Demo', 'default')]} />)
    const side = container.querySelector('[data-part="side"]') as HTMLElement
    expect(side.className).toContain('lg:col-span-4')
    expect(side.className).not.toContain('lg:col-start-1')
    expect(within(side).getByText('Welche Kanäle bringen Umsatz?')).toBeTruthy()
    expect(within(side).getByRole('link', { name: 'Demo' })).toBeTruthy()
  })

  it('right: lead in the first columns, heading from column 5, on one row', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ ...header, align: 'right' }} />)
    expect((container.querySelector('[data-part="side"]') as HTMLElement).className).toContain('lg:col-start-1')
    expect((container.querySelector('[data-part="title"]') as HTMLElement).className).toContain('lg:col-start-5')
    expect(container.querySelector('[data-align="right"]')).toBeTruthy()
  })

  it('right: the heading comes first in the markup, so phones stack heading then lead', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ ...header, align: 'right' }} />)
    const parts = [...container.querySelectorAll('[data-part]')].map((el) => el.getAttribute('data-part'))
    expect(parts).toEqual(['title', 'side'])
  })

  it('left without a lead: one column, actions under the heading', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ ...header, lead: null }} links={[link('Demo', 'default')]} />)
    expect(container.querySelector('[data-part="side"]')).toBeNull()
    const title = container.querySelector('[data-part="title"]') as HTMLElement
    expect(within(title).getByRole('link', { name: 'Demo' })).toBeTruthy()
  })

  it('right without a lead: actions right-aligned from lg only', () => {
    inLocale(<HeadingBlock blockType="heading" header={{ ...header, lead: null, align: 'right' }} links={[link('Demo', 'default')]} />)
    const row = screen.getByRole('link', { name: 'Demo' }).parentElement as HTMLElement
    expect(row.className.split(' ')).toContain('lg:justify-end')
    expect(row.className.split(' ')).not.toContain('justify-end')
  })

  it('left without a heading: eyebrow and lead stay, no side column', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ ...header, heading: null }} />)
    expect(screen.getByText('Für Hotels')).toBeTruthy()
    expect(screen.getByText('Welche Kanäle bringen Umsatz?')).toBeTruthy()
    expect(container.querySelector('[data-part="side"]')).toBeNull()
  })

  it('center: one centred stack, actions centred', () => {
    const { container } = inLocale(<HeadingBlock blockType="heading" header={{ ...header, align: 'center' }} links={[link('Demo', 'default')]} />)
    expect(container.querySelector('[data-align="center"]')?.className).toContain('text-center')
    expect(screen.getByRole('link', { name: 'Demo' }).parentElement?.className).toContain('justify-center')
  })
})
