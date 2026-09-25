import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'

import { ItemsBlock } from '@/blocks/Items/Component'
import { gridClasses, resolveColumns, statSpan } from '@/blocks/Items/columns'
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
    ['steps', 2, 'md:grid-cols-2'],
    ['steps', 3, 'md:grid-cols-3'],
    ['steps', 5, 'md:grid-cols-5'],
    // Cards follow the old CardGrid layouts.
    ['cards', 2, 'sm:grid-cols-2'],
    ['cards', 3, 'md:grid-cols-3'],
    ['cards', 4, 'sm:grid-cols-2 lg:grid-cols-4'],
    ['cards', 5, 'sm:grid-cols-2 lg:grid-cols-5'],
    // Points keep two on small screens.
    ['points', 3, 'sm:grid-cols-2 lg:grid-cols-3'],
    ['points', 4, 'sm:grid-cols-2 lg:grid-cols-4'],
    // Numbers: two on small screens, a 60-track grid from lg; the entries set their span.
    ['stats', 3, 'sm:grid-cols-2 lg:grid-cols-60'],
    ['stats', 5, 'sm:grid-cols-2 lg:grid-cols-60'],
  ] as const)('%s with %i columns → %s', (style, columns, expected) => {
    expect(gridClasses(style, columns)).toBe(expected)
  })
})

describe('statSpan', () => {
  it.each([
    // Automatic takes one of the block's columns.
    [null, 2, 'lg:col-span-30'],
    ['auto', 3, 'lg:col-span-20'],
    ['auto', 4, 'lg:col-span-15'],
    [undefined, 5, 'lg:col-span-12'],
    // A set width wins over the columns.
    ['half', 5, 'lg:col-span-30'],
    ['third', 5, 'lg:col-span-20'],
    ['full', 3, 'sm:col-span-2 lg:col-span-60'],
  ] as const)('%s in %i columns → %s', (width, columns, expected) => {
    expect(statSpan(width, columns)).toBe(expected)
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

  it('stats: a word stands in for the number at number size, never counts', () => {
    inLocale(<ItemsBlock blockType="items" frame="panel" items={[{ id: 'w', word: 'DSGVO', title: 'Gehostet in Deutschland' }]} style="stats" />)
    expect(screen.getByText('DSGVO').className).toContain('type-stat')
    expect(screen.getByText('Gehostet in Deutschland').className).toContain('type-small text-ink-2')
  })

  it('stats: a number wins over a word', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" items={[{ id: 'n', value: '15', word: 'Jahre', title: 'Historie' }]} style="stats" />)
    expect(container.querySelector('.type-stat')?.textContent).toBe('15')
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

  it('stats: panel frame puts the row on one rounded surface', () => {
    const { container } = inLocale(<ItemsBlock blockType="items" frame="panel" items={[{ id: 's', value: '13', title: 'Monate' }]} style="stats" />)
    expect(container.querySelector('[data-style="stats"]')?.className).toContain('rounded-[1.25rem]')
  })

  it.each(['cards', 'points'] as const)('%s: one shape, no surface or border even with a panel frame, icon above the title', (style) => {
    const { container } = inLocale(
      <ItemsBlock blockType="items" frame="panel" items={[{ id: 'i', icon: 'zap', title: 'Schnell', text: 'Text' }]} style={style} />,
    )
    const wrapper = container.querySelector(`[data-style="${style}"]`)!.className
    expect(wrapper).not.toContain('rounded')
    expect(wrapper).not.toContain('bg-surface')
    const item = container.querySelector('li')!
    expect(item.className).not.toMatch(/card-surface|border|bg-/)
    expect(item.className).toContain('flex-col')
    expect(item.firstElementChild?.tagName.toLowerCase()).toBe('svg')
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
