import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { ItemsBlock } from '@/blocks/Items/Component'
import { gridClasses, resolveColumns } from '@/blocks/Items/columns'
import { SplitBlock } from '@/blocks/Split/Component'
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
    ['points', 2, 2], ['points', 3, 3], ['points', 4, 4],
    ['cards', 5, 3], ['steps', 2, 2], ['steps', 5, 3],
    ['stats', 2, 2], ['stats', 3, 3], ['stats', 4, 4], ['stats', 5, 5], ['stats', 6, 5],
  ] as const)('auto for %s with %i entries gives %i columns', (style, count, expected) => {
    expect(resolveColumns(style, 'auto', count)).toBe(expected)
  })

  it('an explicit setting wins', () => {
    expect(resolveColumns('points', '2', 4)).toBe(2)
  })
})

describe('gridClasses', () => {
  it.each([
    // Steps: three across from md, as the old Steps block.
    ['steps', false, 2, 'md:grid-cols-2'],
    ['steps', false, 3, 'md:grid-cols-3'],
    ['steps', true, 4, 'md:grid-cols-4'],
    ['steps', false, 5, 'md:grid-cols-5'],
    // Panel cells (Pillars) go straight from one column to N at md.
    ['cards', true, 3, 'md:grid-cols-3'],
    ['cards', true, 4, 'md:grid-cols-4'],
    ['points', true, 3, 'md:grid-cols-3'],
    // Separate cards follow the old CardGrid layouts.
    ['cards', false, 2, 'sm:grid-cols-2'],
    ['cards', false, 3, 'md:grid-cols-3'],
    ['cards', false, 4, 'sm:grid-cols-2 lg:grid-cols-4'],
    ['cards', false, 5, 'sm:grid-cols-2 lg:grid-cols-5'],
    // Points without a panel (FeatureStory) and numbers (Pillars tiles) keep two on small screens.
    ['points', false, 3, 'sm:grid-cols-2 lg:grid-cols-3'],
    ['points', false, 4, 'sm:grid-cols-2 lg:grid-cols-4'],
    ['stats', false, 3, 'sm:grid-cols-2 lg:grid-cols-3'],
    ['stats', true, 5, 'sm:grid-cols-2 lg:grid-cols-5'],
    ['stats', false, 2, 'sm:grid-cols-2'],
  ] as const)('%s (panel %s, %i columns) → %s', (style, panel, columns, expected) => {
    expect(gridClasses(style, panel, columns)).toBe(expected)
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

  it('points: the row fades in like the other styles', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" items={rows(3)} style="points" />)
    expect(container.querySelector('ul')?.className).toContain('reveal')
  })

  it('steps: numbers each entry', () => {
    inLocale(<ItemsBlock blockType="items" items={rows(3)} style="steps" />)
    expect(screen.getByText('1')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('steps: the connecting line shows from md, where the steps sit side by side', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" items={rows(3)} style="steps" />)
    const line = container.querySelector('.steps-line')
    expect(line?.className).toContain('md:block')
    expect(line?.className).not.toContain('lg:block')
  })

  it('stats: value with suffix and the label', () => {
    inLocale(<ItemsBlock blockType="items" items={[{ id: 's', value: '40', suffix: '%', title: 'geringere Kosten' }]} style="stats" />)
    expect(screen.getByText('%')).toBeTruthy()
    expect(screen.getByText('geringere Kosten').className).toContain('type-body font-medium')
  })

  it('stats in a panel: a numbered tile labels it small, a tile without a number large', () => {
    inLocale(
      <ItemsBlock
        blockType="items"
        frame="panel"
        items={[
          { id: 'a', value: '40', suffix: '%', title: 'geringere Kosten' },
          { id: 'b', title: 'Für Hotelgruppen' },
        ]}
        style="stats"
      />,
    )
    expect(screen.getByText('geringere Kosten').className).toContain('type-small text-ink-2')
    expect(screen.getByText('Für Hotelgruppen').className).toContain('type-h4')
  })

  it('cards: a double-width card spans two columns, its link renders', () => {
    const { container } = inLocale(
      <ItemsBlock
        blockType="items"
        items={[{ id: 'c', title: 'Karte', size: 'lg', links: [{ link: { type: 'custom', url: '/x', label: 'Mehr erfahren', appearance: 'link' } }] }]}
        style="cards"
      />,
    )
    // md, not sm: three cards stay one column below md, and a span there would add a column.
    expect(container.querySelector('li')?.className).toContain('md:col-span-2')
    expect(container.querySelector('li')?.className).not.toContain('sm:col-span-2')
    expect(screen.getByRole('link', { name: 'Mehr erfahren' })).toBeTruthy()
  })

  it('panel frame puts the row on one rounded surface', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" frame="panel" items={rows(3)} style="cards" />)
    expect(container.querySelector('[data-style="cards"]')?.className).toContain('rounded-[1.25rem]')
  })

  it.each(['cards', 'points'] as const)('%s in a panel: hairlines turn vertical from md', (style) => {
    const { container } = inLocale(<ItemsBlock blockType="items" frame="panel" items={rows(3)} style={style} />)
    const list = container.querySelector('ul')!.className
    expect(list).toContain('md:grid-cols-3')
    expect(list).toContain('md:divide-x md:divide-y-0')
    expect(list).not.toContain('lg:divide-x')
  })
})

describe('SplitBlock', () => {
  it('puts the scene first on wide screens when it sits left, and lists the points in a column', () => {
    const { container } = inLocale(
      <SplitBlock
        blockType="split"
        header={{ heading: 'Text neben Szene' }}
        mediaSide="left"
        points={[{ id: 'p', title: 'Punkt eins' }]}
        visual={{ type: 'image', image: null }}
      />,
    )
    expect(container.querySelector('[data-part="text"]')?.className).toContain('lg:order-2')
    expect(container.querySelector('[data-part="media"]')?.className).toContain('lg:order-1')
    expect(container.querySelector('ul')?.className).toContain('flex-col')
    expect(screen.getByText('Punkt eins')).toBeTruthy()
  })

  it('renders without a heading (lead only)', () => {
    const { container } = inLocale(<SplitBlock blockType="split" header={{ heading: null, lead: 'Nur Einleitung' }} visual={{ type: 'image', image: null }} />)
    expect(container.querySelector('h1, h2')).toBeNull()
    expect(screen.getByText('Nur Einleitung')).toBeTruthy()
  })
})
