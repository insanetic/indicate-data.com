# Split Steps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Items `steps` row with a Split block in steps mode: a numbered vertical list beside a pinned scene that switches to the scene of the step most in view.

**Architecture:** Split gets `pointStyle` (`points`/`steps`) and per-point `ownVisual` + `visual`. A server component renders every scene once and hands them to a small client component (`StepsScroller`) that tracks the active step with an IntersectionObserver and crossfades layers. A pure converter (`stepsToSplit`) turns heading + items(steps) pairs into one Split; a generic page runner applies it to published/draft rows per locale, from a dev script, the seed and a production migration.

**Tech Stack:** Next.js (App Router, RSC), Payload 3 (Postgres adapter), Tailwind v4 utilities, Vitest + Testing Library (jsdom), Playwright.

**Spec:** `docs/superpowers/specs/2026-09-25-split-steps-design.md`

## Global Constraints

- Labels are bilingual `{ de, en }`, German first, as everywhere in `src/blocks/*/config.ts`.
- `points` keeps `maxRows: 4` in both modes.
- Mobile (below `lg`): media before text for every Split, in DOM order (not only visually).
- Crossfade 200 ms ease-out on opacity; with `prefers-reduced-motion: reduce` no transition.
- Pinning and `min-height: 50vh` per step only when at least one step has its own scene.
- The Items `style` enum keeps `steps`; only the picker hides it (`filterOptions`), like `cards`.
- Resi's name goes through `withResi()` in titles and texts (memory rule).
- Never run Payload-loading commands against a database you did not mean to: the shared dev DB is `payload` on `localhost:5433`; host scripts need `NODE_ENV=production` (memory: docker dev schema push).
- Other Claude sessions share this checkout: stage only files named in the task, never `git add -A`.
- The production migration ships only after phase 1 (`20260924_222517_section_blocks`) ran on production.

## Review Focus

1. A heading and a steps row where only one of them is hidden: the visible output must not change (Task 4 test "only the steps are hidden").
2. A steps row with no heading before it, or a heading followed by a non-steps block: only the steps row converts, the heading stays (Task 4 tests).
3. A page whose German and English layouts differ in text but not structure: both locale passes must produce the same block and row ids (Task 4 test "ids are stable").
4. Scrolling fast past the section or loading mid-page: exactly one step active, never none (Task 3 test "defaults to step 1" + "switches on intersection").
5. Uploaded image as a step scene (not an illustration): renders via `Visual` like the section scene (Task 3 test "image scene").

---

### Task 1: Split and Items config

**Files:**
- Modify: `src/blocks/Split/config.ts`
- Modify: `src/blocks/Items/config.ts` (style `filterOptions`)
- Regenerate: `src/payload-types.ts`
- Test: `tests/int/sections-split-config.int.spec.ts` (create)

**Interfaces:**
- Produces: `SplitBlock['pointStyle']: 'points' | 'steps' | null | undefined`; `SplitBlock['points'][number]['ownVisual']: boolean | null | undefined`; `SplitBlock['points'][number]['visual']` shaped like `SplitBlock['visual']`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/int/sections-split-config.int.spec.ts
import { describe, expect, it } from 'vitest'
import type { Field } from 'payload'

import { Split } from '@/blocks/Split/config'
import { Items } from '@/blocks/Items/config'

const named = (fields: Field[], name: string): any => {
  for (const f of fields as any[]) {
    if (f.name === name) return f
    if (f.fields) {
      const hit = named(f.fields, name)
      if (hit) return hit
    }
  }
}

describe('Split config', () => {
  it('has a point style switch defaulting to points', () => {
    const f = named(Split.fields, 'pointStyle')
    expect(f.type).toBe('select')
    expect(f.defaultValue).toBe('points')
    expect(f.options.map((o: any) => o.value)).toEqual(['points', 'steps'])
  })

  it('points get an own-scene checkbox and a visual shown only in steps mode', () => {
    const points = named(Split.fields, 'points')
    const own = named(points.fields, 'ownVisual')
    const visual = named(points.fields, 'visual')
    expect(own.type).toBe('checkbox')
    const steps = { blockData: { pointStyle: 'steps' } }
    const plain = { blockData: { pointStyle: 'points' } }
    expect(own.admin.condition({}, {}, steps)).toBe(true)
    expect(own.admin.condition({}, {}, plain)).toBe(false)
    expect(visual.admin.condition({}, { ownVisual: true }, steps)).toBe(true)
    expect(visual.admin.condition({}, { ownVisual: false }, steps)).toBe(false)
    expect(points.maxRows).toBe(4)
  })
})

describe('Items style picker', () => {
  const style = named(Items.fields, 'style')
  const values = (siblingStyle?: string) =>
    style.filterOptions({ options: style.options, siblingData: { style: siblingStyle }, data: {}, req: {} }).map((o: any) => o.value)

  it('offers neither cards nor steps for new rows', () => {
    expect(values(undefined)).toEqual(['points', 'stats'])
  })

  it('keeps the current value selectable on existing rows', () => {
    expect(values('steps')).toContain('steps')
    expect(values('cards')).toContain('cards')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/int/sections-split-config.int.spec.ts`
Expected: FAIL (`pointStyle` undefined; `steps` still offered).

- [ ] **Step 3: Implement**

In `src/blocks/Split/config.ts`, add after `mediaSide`:

```ts
    {
      name: 'pointStyle',
      type: 'select',
      defaultValue: 'points',
      label: { de: 'Darstellung der Punkte', en: 'Point style' },
      admin: { description: { de: 'Schritte: nummeriert, die Szene wechselt beim Scrollen zum Schritt.', en: 'Steps: numbered, the scene follows the step in view while scrolling.' } },
      options: [
        { label: { de: 'Punkte', en: 'Points' }, value: 'points' },
        { label: { de: 'Schritte (nummeriert)', en: 'Steps (numbered)' }, value: 'steps' },
      ],
    },
```

Add a helper at the top of the file and extend the `points` array fields (after `text`):

```ts
import type { Condition } from 'payload'

const inStepsMode: Condition = (_data, _siblingData, { blockData }) => (blockData as { pointStyle?: string } | undefined)?.pointStyle === 'steps'
```

```ts
        {
          name: 'ownVisual',
          type: 'checkbox',
          defaultValue: false,
          label: { de: 'Eigene Szene für diesen Schritt', en: 'Own scene for this step' },
          admin: { condition: inStepsMode },
        },
        visual({
          overrides: {
            admin: {
              condition: (data, siblingData, ctx) => Boolean(inStepsMode(data, siblingData, ctx) && siblingData?.ownVisual),
            },
          },
        }),
```

Change the `points` array label to `{ de: 'Punkte oder Schritte (max. 4)', en: 'Points or steps (max. 4)' }` and the block comment to mention steps mode.

In `src/blocks/Items/config.ts`, replace the style `filterOptions` so it hides both retired values:

```ts
          // Cards render exactly like points, steps moved to the Split block; both values stay for
          // existing rows but are no longer offered.
          filterOptions: ({ options, siblingData }) => {
            const current = (siblingData as { style?: string })?.style
            return options.filter((o) => {
              const value = typeof o === 'string' ? o : o.value
              return !(value === 'cards' || value === 'steps') || value === current
            })
          },
```

- [ ] **Step 4: Regenerate types and run the test**

Run: `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload pnpm generate:types` (reads config only, writes `src/payload-types.ts`).
Run: `pnpm exec vitest run tests/int/sections-split-config.int.spec.ts tests/int/sections-items.int.spec.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Split/config.ts src/blocks/Items/config.ts src/payload-types.ts tests/int/sections-split-config.int.spec.ts
git commit -m "Split: point style switch and a scene per step; hide steps from the Items picker"
```

---

### Task 2: Split puts the media first on small screens

**Files:**
- Modify: `src/blocks/Split/Component.tsx`
- Test: `tests/int/sections-items.int.spec.tsx` (the `SplitBlock` describe)

**Interfaces:**
- Produces: DOM order `[data-part="media"]` then `[data-part="text"]`; desktop sides via `lg:order-*`.

- [ ] **Step 1: Update the tests**

Replace the first `SplitBlock` test with:

```tsx
  it.each([
    ['right', 'lg:order-1', 'lg:order-2'],
    ['left', 'lg:order-2', 'lg:order-1'],
  ] as const)('scene %s: media comes first in the DOM, the sides come from lg:order', (side, textOrder, mediaOrder) => {
    const { container } = inLocale(
      <SplitBlock blockType="split" header={{ heading: 'Text neben Szene' }} mediaSide={side} points={[{ id: 'p', title: 'Punkt eins' }]} visual={{ type: 'image', image: null }} />,
    )
    const parts = [...container.querySelectorAll('[data-part]')].map((el) => el.getAttribute('data-part'))
    expect(parts).toEqual(['media', 'text'])
    expect(container.querySelector('[data-part="text"]')?.className).toContain(textOrder)
    expect(container.querySelector('[data-part="media"]')?.className).toContain(mediaOrder)
    expect(container.querySelector('ul')?.className).toContain('flex-col')
  })
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm exec vitest run tests/int/sections-items.int.spec.tsx -t SplitBlock`
Expected: FAIL (order is text, media).

- [ ] **Step 3: Implement**

In `src/blocks/Split/Component.tsx`, render the media `div` before the text `div` and set:

```tsx
        <div className={cn('reveal lg:col-span-7', mediaLeft ? 'lg:order-1' : 'lg:order-2')} data-part="media" style={{ '--i': 1 } as React.CSSProperties}>
          <Visual className="w-full" fallback="builder" locale={locale} visual={visual} />
        </div>
        <div className={cn('reveal flex flex-col gap-8 lg:col-span-5', mediaLeft ? 'lg:order-2' : 'lg:order-1')} data-part="text">
```

- [ ] **Step 4: Run tests**

Run: `pnpm exec vitest run tests/int/sections-items.int.spec.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/Split/Component.tsx tests/int/sections-items.int.spec.tsx
git commit -m "Split: scene before text on small screens"
```

---

### Task 3: Steps mode rendering

**Files:**
- Create: `src/blocks/Split/Steps.tsx` (server: builds scenes and rows)
- Create: `src/blocks/Split/StepsScroller.tsx` (client: active step, layers)
- Modify: `src/blocks/Split/Component.tsx` (branch on `pointStyle`)
- Modify: `src/app/(frontend)/globals.css` (pause rule; `loops.css` belongs to another session's dirty work, do not touch it)
- Test: `tests/int/sections-split-steps.int.spec.tsx` (create)

**Interfaces:**
- Consumes: `SplitBlock` from Task 1; `Visual` from `@/components/Illustrations`; `withResi` from `@/components/Resi`.
- Produces:
  - `SplitSteps: React.FC<SplitBlock & { locale?: Locale; isFirst?: boolean }>`
  - `StepsScroller: React.FC<{ steps: StepRow[]; scenes: React.ReactNode[]; pinned: boolean; mediaLeft: boolean; showTopScene: boolean; header: React.ReactNode; actions: React.ReactNode }>`
  - `type StepRow = { id: string; title: React.ReactNode; text: React.ReactNode; scene: number; ownScene: React.ReactNode | null }` (`scene` indexes `scenes`; 0 is the section scene)

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/int/sections-split-steps.int.spec.tsx
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
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm exec vitest run tests/int/sections-split-steps.int.spec.tsx`
Expected: FAIL (no numbers; steps mode not implemented).

- [ ] **Step 3: Implement the server part**

```tsx
// src/blocks/Split/Steps.tsx
import React from 'react'

import type { SplitBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { ActionRow } from '@/components/ActionRow'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual, type VisualData } from '@/components/Illustrations'
import { withResi } from '@/components/Resi'

import { StepsScroller, type StepRow } from './StepsScroller'

/** Same scene, same layer: an illustration by key, an image by id. */
const sceneKey = (v: VisualData | null | undefined): string =>
  v?.type === 'image' ? `image:${typeof v.image === 'object' ? v.image?.id : v.image}` : `illustration:${v?.illustration || 'builder'}`

/** Split in steps mode: every scene rendered once here, the scroll behaviour in `StepsScroller`. */
export const SplitSteps: React.FC<Props & { locale?: Locale; isFirst?: boolean }> = ({ header, mediaSide, visual, points, links, locale, isFirst }) => {
  const list = (points || []).filter((p) => p.title)
  const keys = [sceneKey(visual as VisualData)]
  const scenes: React.ReactNode[] = [<Visual className="w-full" fallback="builder" key="section" locale={locale} visual={visual as VisualData} />]
  const steps: StepRow[] = list.map((p, i) => {
    const own = p.ownVisual && p.visual ? (p.visual as VisualData) : null
    let scene = 0
    if (own) {
      const key = sceneKey(own)
      scene = keys.indexOf(key)
      if (scene === -1) {
        keys.push(key)
        scenes.push(<Visual className="w-full" fallback="builder" key={key} locale={locale} visual={own} />)
        scene = scenes.length - 1
      }
    }
    return {
      id: p.id || String(i),
      title: withResi(p.title),
      text: p.text ? withResi(p.text) : null,
      scene,
      ownScene: own ? <Visual className="w-full" fallback="builder" locale={locale} visual={own} /> : null,
    }
  })
  return (
    <StepsScroller
      actions={<ActionRow links={links} />}
      header={<SectionHeading align="left" as={isFirst ? 'h1' : 'h2'} header={header} />}
      mediaLeft={mediaSide === 'left'}
      pinned={steps.some((s) => s.ownScene)}
      scenes={scenes}
      showTopScene={!steps[0]?.ownScene}
      steps={steps}
    />
  )
}
```

Check that `VisualData` is exported from `src/components/Illustrations/index.tsx` (it is: `export type VisualData`).

- [ ] **Step 4: Implement the client part**

```tsx
// src/blocks/Split/StepsScroller.tsx
'use client'
import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

export type StepRow = { id: string; title: React.ReactNode; text: React.ReactNode; scene: number; ownScene: React.ReactNode | null }

type Props = {
  steps: StepRow[]
  scenes: React.ReactNode[]
  pinned: boolean
  mediaLeft: boolean
  showTopScene: boolean
  header: React.ReactNode
  actions: React.ReactNode
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Numbered steps beside a scene. From lg the step crossing the viewport's centre line is active and
 * the pinned scene shows its layer; below lg every step with its own scene shows it inline.
 */
export const StepsScroller: React.FC<Props> = ({ steps, scenes, pinned, mediaLeft, showTopScene, header, actions }) => {
  const [active, setActive] = useState(0)
  const [reduced] = useState(prefersReducedMotion)
  const items = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    // A zero-height band at the vertical centre: whichever step crosses it is active.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const i = items.current.indexOf(e.target as HTMLLIElement)
          if (i !== -1) setActive(i)
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    items.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [steps.length])

  const visibleScene = steps[active]?.scene ?? 0

  return (
    <div className="container">
      <div className={cn('grid gap-12 lg:grid-cols-12 lg:gap-16', pinned ? 'items-start' : 'items-center')}>
        <div className={cn('lg:col-span-7', mediaLeft ? 'lg:order-1' : 'lg:order-2', pinned && 'lg:self-stretch')} data-part="media">
          {showTopScene && (
            <div className="lg:hidden" data-mobile-top-scene>
              {scenes[0]}
            </div>
          )}
          <div className={cn('relative hidden lg:grid', pinned && 'lg:sticky lg:top-28')} data-pinned={pinned ? '' : undefined}>
            {scenes.map((scene, i) => (
              <div
                className={cn('[grid-area:1/1]', !reduced && 'transition-opacity duration-200 ease-out', i === visibleScene ? 'opacity-100' : 'opacity-0')}
                data-paused={i === visibleScene ? undefined : ''}
                data-scene-layer
                data-visible={i === visibleScene ? 'true' : 'false'}
                inert={i !== visibleScene}
                key={i}
              >
                {scene}
              </div>
            ))}
          </div>
        </div>
        <div className={cn('reveal flex flex-col gap-8 lg:col-span-5', mediaLeft ? 'lg:order-2' : 'lg:order-1')} data-part="text">
          {header}
          <ol className="relative flex flex-col">
            <span aria-hidden="true" className="absolute bottom-3 left-[1.125rem] top-3 w-px bg-line" />
            {steps.map((s, i) => (
              <li
                className={cn('relative flex flex-col gap-4 pb-8 last:pb-0', pinned && 'lg:min-h-[50vh]')}
                data-active={i === active ? 'true' : 'false'}
                key={s.id}
                ref={(el) => {
                  items.current[i] = el
                }}
              >
                {s.ownScene && (
                  <div className="lg:hidden" data-step-scene>
                    {s.ownScene}
                  </div>
                )}
                <div className="flex gap-5">
                  <button
                    aria-label={`${String(i + 1).padStart(2, '0')}`}
                    className={cn(
                      'relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-surface font-display text-sm font-medium tnum transition-colors duration-150',
                      i === active ? 'border-accent text-accent' : 'border-line-strong text-accent lg:text-ink-2',
                    )}
                    onClick={(e) => e.currentTarget.closest('li')?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })}
                    type="button"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </button>
                  <div className="flex flex-col gap-2 pt-1.5">
                    <h3 className="type-h4 text-ink">{s.title}</h3>
                    {s.text && <p className="type-small text-ink-2 pretty max-w-[44ch]">{s.text}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          {actions}
        </div>
      </div>
    </div>
  )
}
```

Note: the test "clicking a number" expects `behavior: 'smooth'` (reduced is false there).

- [ ] **Step 5: Branch in the Split component**

At the top of `SplitBlock` in `src/blocks/Split/Component.tsx`:

```tsx
import { SplitSteps } from './Steps'
// …
  if (props.pointStyle === 'steps') return <SplitSteps {...props} />
```

(Change the signature to `= (props) => { const { header, mediaSide, … } = props; … }`.)

- [ ] **Step 6: Pause hidden loop layers**

Append to `src/app/(frontend)/globals.css`:

```css
/* Scene layers that are not shown (Split steps) stop their loop animations. */
[data-paused] [class*='loop-'] {
  animation-play-state: paused;
}
```

- [ ] **Step 7: Run tests**

Run: `pnpm exec vitest run tests/int/sections-split-steps.int.spec.tsx tests/int/sections-items.int.spec.tsx`
Expected: PASS. If `inert` renders as `inert=""` vs boolean in this React version, keep the assertion `hasAttribute('inert')`.

- [ ] **Step 8: Commit**

```bash
git add src/blocks/Split/Steps.tsx src/blocks/Split/StepsScroller.tsx src/blocks/Split/Component.tsx "src/app/(frontend)/globals.css" tests/int/sections-split-steps.int.spec.tsx
git commit -m "Split: steps mode with a pinned scene that follows the step in view"
```

---

### Task 4: Pure converter heading + items(steps) → Split

**Files:**
- Create: `src/sections/steps.ts`
- Test: `tests/int/sections-steps.int.spec.ts` (create)

**Interfaces:**
- Consumes: `HeadingBlock`, `ItemsBlock`, `SplitBlock` from `@/payload-types`.
- Produces:
  - `stepScenes: Record<string, { section: IllustrationKey; steps?: (IllustrationKey | null)[] }>`
  - `stepsToSplit(layout: readonly unknown[], slug: string | null | undefined): unknown[]`
  - `needsStepsConversion(layout: readonly unknown[] | null | undefined): boolean`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/int/sections-steps.int.spec.ts
import { describe, expect, it } from 'vitest'

import { needsStepsConversion, stepsToSplit } from '@/sections/steps'

const heading = (o: Record<string, unknown> = {}) => ({
  id: 'h1', blockType: 'heading', hidden: false,
  header: { eyebrow: 'So funktioniert es', heading: 'Vom Satz zum Dashboard', lead: 'Kein leeres Blatt.', align: 'center' },
  size: 'h2', links: [{ id: 'l1', link: { type: 'custom', url: '/demo', label: 'Demo', appearance: 'default' } }],
  settings: { background: 'tinted', gapTop: 'large', gapBottom: 'auto', anchor: 'how' }, ...o,
})
const items = (o: Record<string, unknown> = {}) => ({
  id: 'i1', blockType: 'items', style: 'steps', hidden: false, blockName: 'So funktioniert es',
  items: [
    { id: 'a', icon: 'message', title: 'Beschreiben', text: 'Eins' },
    { id: 'b', icon: 'zap', title: 'Prüfen', text: 'Zwei' },
    { id: 'c', icon: 'sparkles', title: 'Zusammenfassen', text: 'Drei' },
  ],
  settings: { background: 'tinted', gapTop: 'auto', gapBottom: 'tight' }, ...o,
})
const other = { id: 'x', blockType: 'items', style: 'points', items: [] }

describe('stepsToSplit', () => {
  it('merges a heading and its steps into one Split in steps mode', () => {
    const [split] = stepsToSplit([heading(), items()], 'build-with-ai') as any[]
    expect(split).toMatchObject({
      id: 'h1-split', blockType: 'split', blockName: 'So funktioniert es', hidden: false,
      header: { eyebrow: 'So funktioniert es', heading: 'Vom Satz zum Dashboard', lead: 'Kein leeres Blatt.' },
      mediaSide: 'right', pointStyle: 'steps',
      visual: { type: 'illustration', illustration: 'dashboard' },
      links: [{ id: 'l1', link: { label: 'Demo' } }],
      settings: { background: 'tinted', gapTop: 'large', gapBottom: 'tight', anchor: 'how' },
    })
    expect(split.points.map((p: any) => [p.id, p.icon, p.title, p.ownVisual])).toEqual([
      ['a', 'message', 'Beschreiben', false], ['b', 'zap', 'Prüfen', false], ['c', 'sparkles', 'Zusammenfassen', true],
    ])
    expect(split.points[2].visual).toEqual({ type: 'illustration', illustration: 'alerts' })
    expect(split.header).not.toHaveProperty('align')
  })

  it('keeps the blocks around it in place', () => {
    const out = stepsToSplit([other, heading(), items(), other], 'x') as any[]
    expect(out.map((b) => b.blockType)).toEqual(['items', 'split', 'items'])
  })

  it('a steps row without a heading becomes a Split with an empty header', () => {
    const [split] = stepsToSplit([items()], 'x') as any[]
    expect(split).toMatchObject({ id: 'i1-split', header: { eyebrow: null, heading: null, lead: null }, links: [] })
  })

  it('a heading followed by something else stays a heading', () => {
    const out = stepsToSplit([heading(), other, items({ id: 'i2' })], 'x') as any[]
    expect(out.map((b) => b.blockType)).toEqual(['heading', 'items', 'split'])
  })

  it('unknown pages get the builder scene and no per-step scenes', () => {
    const [split] = stepsToSplit([heading(), items()], 'unknown') as any[]
    expect(split.visual.illustration).toBe('builder')
    expect(split.points.every((p: any) => p.ownVisual === false)).toBe(true)
  })

  it('only the steps are hidden: the heading stays visible, the Split is hidden with an empty header', () => {
    const out = stepsToSplit([heading(), items({ hidden: true })], 'x') as any[]
    expect(out.map((b) => [b.blockType, b.hidden])).toEqual([['heading', false], ['split', true]])
    expect(out[1].header.heading).toBeNull()
  })

  it('only the heading is hidden: the Split is visible without the header', () => {
    const [split, ...rest] = stepsToSplit([heading({ hidden: true }), items()], 'x') as any[]
    expect(rest).toHaveLength(0)
    expect(split.hidden).toBe(false)
    expect(split.header.heading).toBeNull()
    expect(split.links).toEqual([])
  })

  it('ids are stable: two locales with different text give the same ids', () => {
    const de = stepsToSplit([heading(), items()], 'kpi-studio') as any[]
    const en = stepsToSplit([heading({ header: { heading: 'From sentence' } }), items({ items: items().items.map((r: any) => ({ ...r, title: `${r.title} EN` })) })], 'kpi-studio') as any[]
    expect(de.map((b) => b.id)).toEqual(en.map((b) => b.id))
    expect(de[0].points.map((p: any) => p.id)).toEqual(en[0].points.map((p: any) => p.id))
  })

  it('is idempotent', () => {
    const once = stepsToSplit([heading(), items()], 'x')
    expect(stepsToSplit(once, 'x')).toEqual(once)
    expect(needsStepsConversion(once)).toBe(false)
    expect(needsStepsConversion([heading(), items()])).toBe(true)
    expect(needsStepsConversion(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm exec vitest run tests/int/sections-steps.int.spec.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// src/sections/steps.ts
/**
 * Turns the retired Items `steps` row (and the Heading above it) into a Split block in steps mode.
 * Pure; used by `scripts/convert-steps.ts`, the split_steps migration and the seed.
 */
import type { HeadingBlock, ItemsBlock, SplitBlock } from '@/payload-types'
import type { IllustrationKey } from '@/components/Illustrations/registry'

type Scenes = { section: IllustrationKey; steps?: (IllustrationKey | null)[] }

/** Scene per page slug; `steps[i]` null means step i shows the section scene. See the spec's table. */
export const stepScenes: Record<string, Scenes> = {
  agent: { section: 'resi', steps: ['sources', null, 'dashboard'] },
  mcp: { section: 'semanticLayer', steps: [null, null, 'agentChat'] },
  'build-with-ai': { section: 'dashboard', steps: [null, null, 'alerts'] },
  dashboards: { section: 'comparison', steps: ['templates', null, 'team'] },
  'flying-kpis': { section: 'dashboard', steps: [null, null, 'alerts'] },
  integrations: { section: 'integrations', steps: [null, 'sources', null] },
  'kpi-studio': { section: 'semanticLayer', steps: [null, 'kpiStudio', 'dimensions', 'collections'] },
  governance: { section: 'team', steps: [null, null, 'governance'] },
}

const isSteps = (b: unknown): b is ItemsBlock => (b as ItemsBlock)?.blockType === 'items' && (b as ItemsBlock).style === 'steps'
const isHeading = (b: unknown): b is HeadingBlock => (b as HeadingBlock)?.blockType === 'heading'

const toSplit = (heading: HeadingBlock | null, steps: ItemsBlock, slug: string | null | undefined): SplitBlock => {
  const scenes = stepScenes[slug || ''] || { section: 'builder' }
  const head = heading && !heading.hidden ? heading : null
  return {
    blockType: 'split',
    id: `${(heading || steps).id}-split`,
    blockName: steps.blockName || heading?.blockName || null,
    hidden: Boolean(steps.hidden),
    header: { eyebrow: head?.header?.eyebrow ?? null, heading: head?.header?.heading ?? null, lead: head?.header?.lead ?? null },
    mediaSide: 'right',
    pointStyle: 'steps',
    visual: { type: 'illustration', illustration: scenes.section },
    points: (steps.items || []).map((row, i) => {
      const own = scenes.steps?.[i] || null
      return {
        id: row.id,
        icon: row.icon,
        title: row.title,
        text: row.text,
        ownVisual: Boolean(own),
        ...(own ? { visual: { type: 'illustration' as const, illustration: own } } : {}),
      }
    }),
    links: head?.links || [],
    settings: {
      background: steps.settings?.background || 'default',
      gapTop: (heading || steps).settings?.gapTop || 'auto',
      gapBottom: steps.settings?.gapBottom || 'auto',
      ...((heading || steps).settings?.anchor ? { anchor: (heading || steps).settings!.anchor } : {}),
    },
  } as SplitBlock
}

export const stepsToSplit = (layout: readonly unknown[], slug: string | null | undefined): unknown[] => {
  const out: unknown[] = []
  for (let i = 0; i < layout.length; i++) {
    const block = layout[i]
    const next = layout[i + 1]
    if (isHeading(block) && isSteps(next)) {
      // A visible heading over hidden steps keeps showing on its own.
      if (next.hidden && !block.hidden) out.push(block, toSplit(null, next, slug))
      else out.push(toSplit(block, next, slug))
      i++
    } else if (isSteps(block)) {
      out.push(toSplit(null, block, slug))
    } else {
      out.push(block)
    }
  }
  return out
}

export const needsStepsConversion = (layout: readonly unknown[] | null | undefined): boolean => (layout || []).some(isSteps)
```

Note on the "only the steps are hidden" test: `toSplit(null, …)` gives id `i1-split`, header empty. On the "only the heading is hidden" test, `head` is null so header and links are empty while the id stays `h1-split`.

- [ ] **Step 4: Run tests**

Run: `pnpm exec vitest run tests/int/sections-steps.int.spec.ts`
Expected: PASS. Also `pnpm exec tsc --noEmit -p . 2>&1 | grep sections/steps` → no output.

- [ ] **Step 5: Commit**

```bash
git add src/sections/steps.ts tests/int/sections-steps.int.spec.ts
git commit -m "Sections: converter from the steps row to Split in steps mode"
```

---

### Task 5: Page runner, dev script and seed

**Files:**
- Modify: `src/sections/convertPages.ts` (extract a generic runner, keep `convertSectionBlocks`/`runSectionConversion` behaviour and signatures)
- Create: `scripts/convert-steps.ts`
- Modify: `src/endpoints/seed/index.ts` (`upsertPage`)
- Test: `tests/int/sections-convert-db.int.spec.ts` (add a steps case, still opt-in)

**Interfaces:**
- Consumes: `stepsToSplit`, `needsStepsConversion` (Task 4).
- Produces:
  - `convertPageLayouts({ payload, req, pageIds, needs, prepare }): Promise<{ publishedPages: number; draftPages: number }>` where `needs: (layout: Page['layout']) => boolean` and `prepare: (docs: Page[]) => (doc: Page) => unknown[]` (called once per state with that state's per-locale docs).
  - `convertStepSections({ payload, req, pageIds })` and `runStepsConversion(payload, { pageIds })`, same result shape.

- [ ] **Step 1: Write the failing DB test**

Append to `tests/int/sections-convert-db.int.spec.ts` a second `describeDb` block:

```ts
describeDb('convertStepSections against the database', () => {
  let payload: Payload
  let pageId: number
  const stepsSlug = `kpi-studio-steps-${run}`

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const created = await payload.create({
      collection: 'pages', locale: 'de', context,
      data: {
        title: `Steps ${run}`, slug: stepsSlug, _status: 'published',
        layout: [
          { blockType: 'heading', header: { heading: 'Schritte DE', align: 'center' }, links: [] },
          { blockType: 'items', style: 'steps', items: [{ title: 'Eins DE' }, { title: 'Zwei DE' }] },
        ],
      } as never,
    })
    pageId = created.id
    const de = created as unknown as Loose
    await payload.update({
      collection: 'pages', id: pageId, locale: 'en', context,
      data: { _status: 'published', layout: [{ ...de.layout[0], header: { ...de.layout[0].header, heading: 'Steps EN' } }, { ...de.layout[1], items: de.layout[1].items.map((r: Loose, i: number) => ({ ...r, title: `Step ${i + 1} EN` })) }] } as never,
    })
  })

  afterAll(async () => {
    if (payload && pageId) await payload.delete({ collection: 'pages', id: pageId, context })
  })

  it('writes one Split per locale with the same ids, and a second run changes nothing', async () => {
    const { runStepsConversion } = await import('@/sections/convertPages')
    expect(await runStepsConversion(payload, { pageIds: [pageId] })).toEqual({ publishedPages: 1, draftPages: 0 })
    const de = (await payload.findByID({ collection: 'pages', id: pageId, locale: 'de', depth: 0, context })) as unknown as Loose
    const en = (await payload.findByID({ collection: 'pages', id: pageId, locale: 'en', depth: 0, context })) as unknown as Loose
    expect(de.layout.map((b: Loose) => b.blockType)).toEqual(['split'])
    expect(de.layout[0].pointStyle).toBe('steps')
    expect(de.layout[0].header.heading).toBe('Schritte DE')
    expect(en.layout[0].header.heading).toBe('Steps EN')
    expect(en.layout[0].points.map((p: Loose) => p.title)).toEqual(['Step 1 EN', 'Step 2 EN'])
    expect(de.layout[0].points.map((p: Loose) => p.id)).toEqual(en.layout[0].points.map((p: Loose) => p.id))
    expect(await runStepsConversion(payload, { pageIds: [pageId] })).toEqual({ publishedPages: 0, draftPages: 0 })
  })
})
```

(The slug does not match `stepScenes`, so the scene is `builder`; the test does not depend on the map.)

- [ ] **Step 2: Refactor the runner**

In `src/sections/convertPages.ts`, move the body of `convertSectionBlocks` into:

```ts
type Prepare = (docs: Page[]) => (doc: Page) => unknown[]

/**
 * Rewrites every page whose published version or pending draft `needs` it. `prepare` sees all
 * locales of one state first (so structure decisions can span locales) and returns the per-doc
 * layout rewrite. Published and draft are saved separately and in full per locale, as described
 * on `convertSectionBlocks`.
 */
export const convertPageLayouts = async ({ payload, req, pageIds, needs, prepare }: { payload: Payload; req: PayloadRequest; pageIds?: (number | string)[]; needs: (layout: Page['layout']) => boolean; prepare: Prepare }) => {
  // … existing body, with:
  //   .filter((d) => needs(d.layout))                         instead of needsSectionConversion(d.layout)
  //   const publishedConvert = prepare(publishedDocs); const draftConvert = prepare(draftDocs)
  //   const convert = (doc: Page, rewrite: (doc: Page) => unknown[]) => ({ ...pageData(doc), layout: rewrite(doc) as Page['layout'] })
  //   convert(publishedDocs[i], publishedConvert) / convert(draftDocs[i], draftConvert)
}

export const convertSectionBlocks = ({ payload, req, pageIds }: { payload: Payload; req: PayloadRequest; pageIds?: (number | string)[] }) =>
  convertPageLayouts({
    payload, req, pageIds,
    needs: needsSectionConversion,
    prepare: (docs) => {
      const withHeader = headerTextIds(docs.map((d) => d.layout || []))
      return (doc) => splitLegacyLayout(doc.layout || [], { withHeader })
    },
  })

export const convertStepSections = ({ payload, req, pageIds }: { payload: Payload; req: PayloadRequest; pageIds?: (number | string)[] }) =>
  convertPageLayouts({ payload, req, pageIds, needs: needsStepsConversion, prepare: () => (doc) => stepsToSplit(doc.layout || [], doc.slug) })
```

Generalise `runSectionConversion` into a private `inTransaction(payload, fn)` and export:

```ts
export const runSectionConversion = (payload: Payload, o: { pageIds?: (number | string)[] } = {}) => inTransaction(payload, (req) => convertSectionBlocks({ payload, req, ...o }))
export const runStepsConversion = (payload: Payload, o: { pageIds?: (number | string)[] } = {}) => inTransaction(payload, (req) => convertStepSections({ payload, req, ...o }))
```

The `context` constant (`allowLegacySections: true`) stays shared: a page may hold hidden legacy blocks.

- [ ] **Step 3: Dev script**

```ts
// scripts/convert-steps.ts
/**
 * Converts every "heading + Items steps" pair into a Split block in steps mode:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/convert-steps.ts
 * Safe to run again. One transaction. Production runs the same step in the split_steps migration.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { runStepsConversion } from '../src/sections/convertPages'

const payload = await getPayload({ config })
try {
  const result = await runStepsConversion(payload)
  payload.logger.info(`[steps] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error, msg: '[steps] conversion failed, rolled back' })
  process.exit(1)
}
```

- [ ] **Step 4: Seed**

In `src/endpoints/seed/index.ts` `upsertPage`, change the layout line to:

```ts
    return Array.isArray(data.layout) ? { ...data, layout: stepsToSplit(splitLegacyLayout(data.layout), slug) } : data
```

and import `stepsToSplit` from `@/sections/steps`. Update the comment above: "…write what the migrations would produce." (The seed keeps its `steps(...)` helper; passing through both converters guarantees a fresh seed equals a converted database. This replaces the spec's "seed builds Split blocks directly" with the same outcome.)

- [ ] **Step 5: Run tests**

Run: `pnpm exec vitest run tests/int/sections-legacy.int.spec.ts tests/int/sections-steps.int.spec.ts`
Expected: PASS (legacy behaviour unchanged).
The DB test runs in Task 6 against the scratch database.

- [ ] **Step 6: Commit**

```bash
git add src/sections/convertPages.ts scripts/convert-steps.ts src/endpoints/seed/index.ts tests/int/sections-convert-db.int.spec.ts
git commit -m "Sections: generic page runner, steps conversion script and seed"
```

---

### Task 6: Migration and verification on a scratch database

**Files:**
- Create: `src/migrations/<timestamp>_split_steps.ts` and `.json` (generated)
- Modify: `src/migrations/index.ts` (generated)

**Interfaces:**
- Consumes: `convertStepSections` (Task 5).

- [ ] **Step 1: Make a scratch copy of the dev DB**

```bash
docker compose exec -T postgres sh -c 'dropdb -U payload --if-exists steps_dev && createdb -U payload steps_dev && pg_dump -U payload -Fc payload | pg_restore -U payload -d steps_dev --no-owner'
```

(Service name per `docker-compose.yml`; check with `docker compose ps` first. No app stop needed.)

- [ ] **Step 2: Generate the migration against the scratch DB**

```bash
NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/steps_dev pnpm payload migrate:create split_steps
```

- [ ] **Step 3: Prune unrelated statements**

Open the generated `.ts`. Keep only statements on `pages_blocks_split`, `pages_blocks_split_points` (and their `_v_` version tables and locale tables) plus new enum types for `point_style` and the points' `visual_*` columns. Another session's uncommitted testimonials work may show up as extra statements: remove them from `up` and `down` and tell the user. Then append to `up`:

```ts
  const result = await convertStepSections({ payload, req })
  payload.logger.info(`[steps] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
```

with `import { convertStepSections } from '../sections/convertPages'`, and a comment above `down` as in the section_blocks migration ("Schema only…").

- [ ] **Step 4: Run it on the scratch DB and check the result**

```bash
NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/steps_dev pnpm payload migrate
SECTIONS_DB_TEST=1 DATABASE_URL=postgres://payload:payload@localhost:5433/steps_dev pnpm exec vitest run tests/int/sections-convert-db.int.spec.ts
docker compose exec -T postgres psql -U payload -d steps_dev -c "select count(*) from pages_blocks_items where style = 'steps'; select count(*) from pages_blocks_split where point_style = 'steps';"
```

Expected: migration logs `[steps] converted 8 published pages …` (dev may differ if pages were edited), DB tests PASS, 0 items steps rows and ≥ 8 split steps rows.

- [ ] **Step 5: Commit**

```bash
git add src/migrations/*_split_steps.* src/migrations/index.ts
git commit -m "Migration: Split steps mode, converts the steps rows on deploy"
```

---

### Task 7: Dev database, e2e and visual check

**Files:**
- Test: `tests/e2e/sections.e2e.spec.ts` (add a steps test)

- [ ] **Step 1: Back up and convert the shared dev DB**

The running dev server pushes the new schema on its next request (memory: dev push). Then:

```bash
docker compose exec -T postgres pg_dump -U payload -Fc payload > backups/payload-$(date +%Y%m%d-%H%M)-before-steps.dump
NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload ./node_modules/.bin/payload run scripts/convert-steps.ts
```

Mark the migration as run in dev only if the team's dev flow records migrations (it does not with push; leave `payload_migrations` alone). Clear `.next/dev` fetch cache as after host seeds (memory: site content workflow).

- [ ] **Step 2: Add the e2e test**

In `tests/e2e/sections.e2e.spec.ts`, add a page with a steps Split and:

```ts
test('steps: the pinned scene follows the step in view, and the scene comes first on phones', async ({ page, context: browser }) => {
  const slug = `steps-e2e-${run}`
  await payload.create({
    collection: 'pages', locale: 'de', context,
    data: {
      title: `Steps e2e ${run}`, slug, _status: 'published',
      layout: [{
        blockType: 'split', header: { heading: `Schritte ${run}` }, pointStyle: 'steps',
        visual: { type: 'illustration', illustration: 'semanticLayer' },
        points: [
          { title: 'Eins', text: 'A' },
          { title: 'Zwei', text: 'B', ownVisual: true, visual: { type: 'illustration', illustration: 'kpiStudio' } },
          { title: 'Drei', text: 'C', ownVisual: true, visual: { type: 'illustration', illustration: 'dimensions' } },
        ],
      }],
    } as never,
  })
  try {
    await presetConsent(browser)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${base}/de/${slug}`)
    const layers = page.locator('[data-scene-layer]')
    await expect(layers).toHaveCount(3)
    await page.getByText('Drei', { exact: true }).scrollIntoViewIfNeeded()
    await page.getByText('Drei', { exact: true }).evaluate((el) => el.closest('li')!.scrollIntoView({ block: 'center' }))
    await expect(layers.nth(2)).toHaveAttribute('data-visible', 'true')
    await expect(page.locator('li[data-active="true"]')).toContainText('Drei')

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${base}/de/${slug}`)
    const scene = await page.locator('[data-mobile-top-scene]').boundingBox()
    const heading = await page.getByRole('heading', { name: `Schritte ${run}` }).boundingBox()
    expect(scene!.y).toBeLessThan(heading!.y)
  } finally {
    await payload.delete({ collection: 'pages', where: { slug: { equals: slug } }, context })
  }
})
```

- [ ] **Step 3: Run it**

Run: `pnpm test:e2e tests/e2e/sections.e2e.spec.ts`
Expected: PASS.

- [ ] **Step 4: Look at the real pages**

Screenshot `/en/kpi-studio`, `/en/build-with-ai` and `/de/agent` at 1440 and 390 px: step highlight, pinned scene and crossfade on KPI Studio; a plain list beside one scene where no step has its own scene; scene first on phones. Fix spacing issues found here in `StepsScroller.tsx`.

- [ ] **Step 5: Full suite and commit**

Run: `pnpm test:int` and `pnpm lint`
Expected: PASS (skipped DB tests are fine).

```bash
git add tests/e2e/sections.e2e.spec.ts src/blocks/Split/StepsScroller.tsx
git commit -m "Split steps: e2e for the scene switch and the phone order"
```

- [ ] **Step 6: Update memory**

Add to `composable-section-blocks.md` (memory): steps moved to Split steps mode; `split_steps` migration ships after phase 1 on production; `scripts/convert-steps.ts` for dev.
