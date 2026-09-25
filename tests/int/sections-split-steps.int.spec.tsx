import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SplitBlock } from '@/blocks/Split/Component'
import { LocaleProvider } from '@/providers/Locale'

type Entry = { target: Element; isIntersecting: boolean }
let observers: { cb: (e: Entry[]) => void; els: Element[] }[] = []
let reduced = false

beforeEach(() => {
  observers = []
  reduced = false
  globalThis.IntersectionObserver = class {
    els: Element[] = []
    constructor(public cb: (e: Entry[]) => void) { observers.push(this as never) }
    observe(el: Element) { this.els.push(el) }
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
  } as unknown as typeof IntersectionObserver
  window.matchMedia = ((q: string) => ({ matches: q.includes('reduce') ? reduced : false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as never
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(cleanup)

const inLocale = (ui: React.ReactElement) => render(<LocaleProvider locale="de">{ui}</LocaleProvider>)
const img = { type: 'illustration', illustration: 'builder' } as const
const step = (n: number, own?: string) => ({
  id: `s${n}`, title: `Schritt ${n}`, text: `Text ${n}`,
  ...(own ? { ownVisual: true, visual: { type: 'illustration', illustration: own } } : {}),
})
const split = (points: ReturnType<typeof step>[]) => (
  <SplitBlock blockType="split" header={{ heading: 'So geht es' }} pointStyle="steps" points={points as never} visual={img as never} />
)
const layers = (c: HTMLElement) => [...c.querySelectorAll('[data-scene-layer]')]
const intersect = (el: Element) => act(() => observers.forEach((o) => o.cb([{ target: el, isIntersecting: true }])))

describe('Split in steps mode', () => {
  it('numbers the steps 01, 02, 03 and does not render point icons', () => {
    inLocale(split([step(1), step(2), step(3)]))
    expect(screen.getByText('01')).toBeTruthy()
    expect(screen.getByText('03')).toBeTruthy()
    expect(screen.getByText('Schritt 2').closest('li')?.querySelector('svg.lucide')).toBeNull()
  })

  it('without per-step scenes: one layer, not pinned, no tall rows', () => {
    const { container } = inLocale(split([step(1), step(2)]))
    expect(layers(container)).toHaveLength(1)
    expect(container.querySelector('[data-pinned]')).toBeNull()
    expect(container.innerHTML).not.toContain('min-h-[50vh]')
  })

  it('with a per-step scene: pinned, tall rows, one layer per distinct scene', () => {
    const { container } = inLocale(split([step(1), step(2, 'dimensions'), step(3, 'dimensions')]))
    expect(container.querySelector('[data-pinned]')).toBeTruthy()
    expect(container.innerHTML).toContain('lg:min-h-[50vh]')
    expect(layers(container)).toHaveLength(2)
  })

  it('defaults to step 1 and its scene', () => {
    const { container } = inLocale(split([step(1), step(2, 'dimensions')]))
    expect(screen.getByText('Schritt 1').closest('li')?.getAttribute('data-active')).toBe('true')
    expect(layers(container)[0].getAttribute('data-visible')).toBe('true')
    expect(layers(container)[1].getAttribute('data-visible')).toBe('false')
  })

  it('switches step and scene when a step crosses the centre line', () => {
    const { container } = inLocale(split([step(1), step(2, 'dimensions')]))
    intersect(screen.getByText('Schritt 2').closest('li')!)
    expect(screen.getByText('Schritt 2').closest('li')?.getAttribute('data-active')).toBe('true')
    expect(screen.getByText('Schritt 1').closest('li')?.getAttribute('data-active')).toBe('false')
    expect(layers(container)[1].getAttribute('data-visible')).toBe('true')
    expect(layers(container)[0].hasAttribute('inert')).toBe(true)
  })

  it('per-step line segment: the active step gets the accent colour, others stay grey', () => {
    inLocale(split([step(1), step(2, 'dimensions'), step(3)]))
    intersect(screen.getByText('Schritt 2').closest('li')!)
    const segment = (title: string) => screen.getByText(title).closest('li')?.querySelector('[data-segment]')
    expect(segment('Schritt 2')?.className).toContain('lg:bg-accent')
    expect(segment('Schritt 1')?.className).not.toContain('lg:bg-accent')
    expect(segment('Schritt 1')?.className).toContain('bg-line')
    expect(segment('Schritt 3')).toBeNull()
  })

  it('reduced motion: layers have no transition', () => {
    reduced = true
    const { container } = inLocale(split([step(1), step(2, 'dimensions')]))
    expect(layers(container)[0].className).not.toContain('transition-opacity')
  })

  it('mobile: the top scene is skipped when step 1 has its own scene, own scenes sit above their step', () => {
    const { container } = inLocale(split([step(1, 'sources'), step(2)]))
    expect(container.querySelector('[data-mobile-top-scene]')).toBeNull()
    expect(screen.getByText('Schritt 1').closest('li')?.querySelector('[data-step-scene]')).toBeTruthy()
    expect(screen.getByText('Schritt 2').closest('li')?.querySelector('[data-step-scene]')).toBeNull()
  })

  it('mobile: the section scene comes first when step 1 has none', () => {
    const { container } = inLocale(split([step(1), step(2)]))
    const order = [...container.querySelectorAll('[data-mobile-top-scene], [data-part="text"]')].map((el) => el.getAttribute('data-part') || 'scene')
    expect(order).toEqual(['scene', 'text'])
  })

  it('image scene on a step renders like the section scene', () => {
    const { container } = inLocale(
      <SplitBlock blockType="split" header={{ heading: 'X' }} pointStyle="steps" visual={img as never}
        points={[step(1), { id: 's2', title: 'Bild', ownVisual: true, visual: { type: 'image', image: { id: 1, url: '/m.png', alt: 'Bild', width: 10, height: 10 } } }] as never} />,
    )
    expect(layers(container)).toHaveLength(2)
    expect(layers(container)[1].querySelector('img')).toBeTruthy()
  })

  it('clicking a number scrolls its step to the centre', () => {
    inLocale(split([step(1), step(2)]))
    fireEvent.click(screen.getByRole('button', { name: /02/ }))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' })
  })

  it('resiHub as the section scene: the mobile copy and the desktop layer share no duplicate ids', () => {
    const { container } = inLocale(
      <SplitBlock blockType="split" header={{ heading: 'X' }} pointStyle="steps" visual={{ type: 'illustration', illustration: 'resiHub' } as never} points={[step(1), step(2)] as never} />,
    )
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('below lg every step number looks the same; the active ring is an lg-only difference', () => {
    inLocale(split([step(1), step(2, 'dimensions')]))
    intersect(screen.getByText('Schritt 2').closest('li')!)
    const strip = (cls: string) => cls.split(' ').filter((c) => !c.startsWith('lg:')).sort().join(' ')
    const active = screen.getByRole('button', { name: '02: Schritt 2' })
    const inactive = screen.getByRole('button', { name: '01: Schritt 1' })
    expect(strip(active.className)).toBe(strip(inactive.className))
  })
})
