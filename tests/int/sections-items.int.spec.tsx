import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { ItemsBlock } from '@/blocks/Items/Component'
import { resolveColumns } from '@/blocks/Items/columns'
import { LocaleProvider } from '@/providers/Locale'

beforeAll(() => {
  // CountUp waits for the element to scroll into view; jsdom has no IntersectionObserver.
  globalThis.IntersectionObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
  } as unknown as typeof IntersectionObserver
  // CountUp checks for reduced motion first; jsdom has no matchMedia either.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
})
afterEach(cleanup)

const inLocale = (ui: React.ReactElement) => render(<LocaleProvider locale="de">{ui}</LocaleProvider>)
const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `r${i}`, title: `Titel ${i + 1}`, text: `Text ${i + 1}` }))

describe('resolveColumns', () => {
  it.each([
    ['points', 3, 3], ['points', 4, 4],
    ['cards', 5, 3], ['steps', 5, 3],
    ['stats', 2, 3], ['stats', 3, 3], ['stats', 4, 4], ['stats', 5, 5], ['stats', 6, 5],
  ] as const)('auto for %s with %i entries gives %i columns', (style, count, expected) => {
    expect(resolveColumns(style, 'auto', count)).toBe(expected)
  })

  it('an explicit setting wins', () => {
    expect(resolveColumns('points', '2', 4)).toBe(2)
  })
})

describe('ItemsBlock', () => {
  it('renders nothing without entries', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" items={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('points: one row, four columns for four entries, rule above when asked', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" divider items={rows(4)} style="points" />)
    expect(container.querySelector('ul')?.className).toContain('lg:grid-cols-4')
    expect(container.querySelector('[data-style="points"]')?.className).toContain('border-t')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('steps: numbers each entry', () => {
    inLocale(<ItemsBlock blockType="items" items={rows(3)} style="steps" />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('stats: value with suffix and the label', () => {
    inLocale(<ItemsBlock blockType="items" items={[{ id: 's', value: '40', suffix: '%', title: 'geringere Kosten' }]} style="stats" />)
    expect(screen.getByText('%')).toBeTruthy()
    expect(screen.getByText('geringere Kosten')).toBeTruthy()
  })

  it('cards: a double-width card spans two columns, its link renders', () => {
    const { container } = inLocale(
      <ItemsBlock
        blockType="items"
        items={[{ id: 'c', title: 'Karte', size: 'lg', links: [{ link: { type: 'custom', url: '/x', label: 'Mehr erfahren', appearance: 'link' } }] }]}
        style="cards"
      />,
    )
    expect(container.querySelector('li')?.className).toContain('sm:col-span-2')
    expect(screen.getByRole('link', { name: 'Mehr erfahren' })).toBeTruthy()
  })

  it('panel frame puts the row on one rounded surface', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" frame="panel" items={rows(3)} style="cards" />)
    expect(container.querySelector('[data-style="cards"]')?.className).toContain('rounded-[1.25rem]')
  })
})
