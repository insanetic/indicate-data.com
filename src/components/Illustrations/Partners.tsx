import { Building2, Check, KeyRound, Lock, Megaphone, TrendingUp } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Avatar, Chip } from './primitives'
import { Scene } from './Scene'
import { Connector, LOOP, build, pos, slotDelay, type Pt } from './stage'
import { partnersCopyFor } from './copy/partners'
import type { IllustrationProps } from './index'

/*
 * A scene for a text-beside-visual section, not a hero: it lays itself out by the width of its
 * own column (container query `@lg`, 32rem) instead of the viewport. From there the stage is
 * 125 × 100 on a 5 : 4 box (left = x / 1.25 %, top = y %); below it the pieces stack.
 */
const W = 125
const H = 100

/** Partners along the top; `entry` is where their wire meets the space card. */
const PARTNER_Y = 11
const PARTNER_B = 17
const partners: { at: Pt; entry: number; tone: 'blue' | 'yellow' | 'coral'; icon: typeof Building2 }[] = [
  { at: { x: 21, y: PARTNER_Y }, entry: 41, tone: 'blue', icon: Building2 },
  { at: { x: 62.5, y: PARTNER_Y }, entry: 62.5, tone: 'yellow', icon: Megaphone },
  { at: { x: 104, y: PARTNER_Y }, entry: 84, tone: 'coral', icon: TrendingUp },
]

/** The hotel's space in the middle, what the partner sees below it. */
const SPACE: Pt = { x: 62.5, y: 48 }
const SPACE_T = 26
const SPACE_B = 70
const VIEW: Pt = { x: 62.5, y: 88.5 }
const VIEW_T = 80

/** Down from `a`, across at `mid`, down into `b`, with rounded corners. */
function drop(a: Pt, b: Pt, mid: number, r = 2.5): string {
  if (Math.abs(a.x - b.x) < 0.01) return `M ${a.x} ${a.y} V ${b.y}`
  const dx = Math.sign(b.x - a.x)
  return [
    `M ${a.x} ${a.y}`,
    `V ${mid - r}`,
    `Q ${a.x} ${mid} ${a.x + dx * r} ${mid}`,
    `H ${b.x - dx * r}`,
    `Q ${b.x} ${mid} ${b.x} ${mid + r}`,
    `V ${b.y}`,
  ].join(' ')
}

const partnerPath = (p: number) => drop({ x: partners[p].at.x, y: PARTNER_B }, { x: partners[p].entry, y: SPACE_T }, 21)
const viewPath = `M ${SPACE.x} ${SPACE_B} V ${VIEW_T}`

/** Stage placement, only once the column is wide enough: below it `left`/`top` would shift the stacked boxes. */
const AT = '@lg:absolute @lg:left-(--x) @lg:top-(--y) @lg:-translate-x-1/2 @lg:-translate-y-1/2'

/**
 * Data governance with partners: who sees what in a hotel's space. Head office, the agency and
 * the consultant sit on top, Hotel Alpenrose's space in the middle with each partner's role and
 * 2FA, and below it what that partner sees. Three exchanges of 4 s on a 12 s clock: a partner
 * lights, its wire draws into the space, its row lights, and the view below fills: head office
 * sees every released property through its multi-space token, the agency sees campaign KPIs
 * and booking sources but not the guest list, the consultant reads the revenue dashboard and
 * the group's templates but cannot edit. Reduced motion shows the first exchange, finished.
 * Timing: `.loop-team-*`, `.loop-hub-*`.
 */
export const PartnersIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = partnersCopyFor(locale)

  const spaceCard = (
    <div className="relative flex h-full flex-col justify-center gap-2 rounded-[1.25rem] border border-line-strong bg-surface-2 p-3.5 shadow-float">
      <span className="flex items-center gap-2.5">
        <span className="loop-tree-centre relative inline-flex shrink-0 rounded-[calc(0.625rem+2px)] p-[2px]">
          <span className="grid size-8 place-items-center rounded-[0.625rem] bg-surface-2">
            <BrandBars size={16} />
          </span>
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="type-caption leading-4 text-ink-3">{c.space.label}</span>
          <span className="truncate font-display text-base font-medium leading-5 text-ink">{c.space.name}</span>
        </span>
        <span className="ml-auto flex -space-x-1.5">
          {partners.map((p, i) => (
            <Avatar className="size-6 text-[0.5625rem] ring-2 ring-surface-2" initials={c.partners[i].initials} key={i} tone={p.tone} />
          ))}
        </span>
      </span>
      <span className="flex flex-col divide-y divide-line">
        {partners.map((p, slot) => {
          const who = c.partners[slot]
          const access = c.access[slot]
          return (
            <span className="relative flex items-center gap-2.5 py-1.5" key={slot}>
              <span aria-hidden="true" className="loop-hub-lit pointer-events-none absolute -inset-x-1.5 inset-y-0.5 rounded-[0.5rem] border border-brand-blue" data-slot={slot} style={slotDelay(slot)} />
              <Avatar className="size-6 text-[0.5625rem]" initials={who.initials} tone={p.tone} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-caption font-medium leading-4 text-ink">{who.org}</span>
                <span className="flex items-center gap-1 truncate type-caption leading-4 text-ink-3">
                  {slot === 0 && <KeyRound aria-hidden="true" className="shrink-0" size={10} strokeWidth={2} />}
                  {access.via}
                </span>
              </span>
              <Chip className={cn('shrink-0', slot === 2 && 'border border-line')} tone={slot === 2 ? 'neutral' : 'blue'}>
                {access.role}
              </Chip>
              <span className="flex shrink-0 items-center gap-1 type-caption leading-4 text-ink-3">
                <Check aria-hidden="true" className="text-success-deep" size={12} strokeWidth={2.5} />
                {c.space.twoFactor}
              </span>
            </span>
          )
        })}
      </span>
    </div>
  )

  const viewCard = (
    <div className="relative grid rounded-[0.875rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-card">
      {c.views.map((_, slot) => (
        <span
          aria-hidden="true"
          className="loop-hub-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue"
          data-slot={slot}
          key={slot}
          style={{ ...slotDelay(slot), '--glow': 'var(--brand-blue)' } as React.CSSProperties}
        />
      ))}
      <span className="grid place-items-center type-caption leading-4 text-ink-3 [grid-area:1/1]">{c.pending}</span>
      {c.views.map((view, slot) => (
        <span className="loop-team-reply flex min-w-0 flex-col gap-1.5 bg-surface-2 [grid-area:1/1]" data-slot={slot} key={view.title} style={slotDelay(slot)}>
          <span className="flex items-center justify-between gap-3 type-caption leading-4 text-ink-3">
            {view.title}
            <span className="flex items-center gap-1 truncate">
              <Lock aria-hidden="true" className="shrink-0" size={10} strokeWidth={2} />
              {c.note}
            </span>
          </span>
          <span className="flex flex-wrap gap-1.5">
            {view.items.map((item) => (
              <Chip className={cn('whitespace-nowrap', !item.open && 'border border-line')} key={item.label} tone={item.open ? 'green' : 'neutral'}>
                {item.open ? <Check aria-hidden="true" size={10} strokeWidth={2.75} /> : <Lock aria-hidden="true" size={10} strokeWidth={2.25} />}
                <span className={cn(!item.open && 'text-ink-3 line-through decoration-ink-3/60')}>{item.label}</span>
              </Chip>
            ))}
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <Scene className={cn('@container w-full', className)} label={c.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center @lg:block @lg:aspect-[5/4]">
        {/* Stage wiring: dotted idle routes, then per exchange the partner's wire in and the view's wire out. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full overflow-visible @lg:block" viewBox={`0 0 ${W} ${H}`}>
          {[...partners.map((_, p) => ({ d: partnerPath(p), order: 2 + p })), { d: viewPath, order: 1 }].map(({ d, order }) => (
            <g className="scene-fade" key={d} style={build(order, 0.2)}>
              <path className="hub-dots" d={d} fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.35" style={{ '--gap': 1.3 } as React.CSSProperties} />
            </g>
          ))}
          {partners.map((_, slot) => (
            <g key={slot}>
              <path className="loop-team-in" d={partnerPath(slot)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.35" style={slotDelay(slot)} />
              <path className="loop-team-comet-in" d={partnerPath(slot)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.7" style={{ ...slotDelay(slot), '--comet': 0.12, '--comet-from': 0.17 } as React.CSSProperties} />
              <path className="loop-hub-draw-out" d={viewPath} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.35" style={slotDelay(slot)} />
              <path className="loop-hub-comet-out" d={viewPath} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.7" style={{ ...slotDelay(slot), '--comet': 0.3, '--comet-from': 0.35 } as React.CSSProperties} />
            </g>
          ))}
        </svg>

        {/* Partners: chips when stacked, cards along the top of the stage. */}
        <div className="flex flex-wrap justify-center gap-2 @lg:contents">
          {partners.map((p, slot) => {
            const Icon = p.icon
            const who = c.partners[slot]
            return (
              <div className={cn('relative @lg:w-[31%]', AT)} key={who.kind} style={pos(p.at, W, H)}>
                <div className="scene-build-in" style={{ ...build(3 + slot), '--from-y': '-6px' } as React.CSSProperties}>
                  <div className="hub-float" style={{ '--float-delay': `${-slot * 2.1 - 0.6}s` } as React.CSSProperties}>
                    <div className="relative flex items-center gap-2 rounded-pill border border-line-strong bg-surface-2 py-1 pl-1 pr-3 shadow-card @lg:rounded-[0.875rem] @lg:px-2.5 @lg:py-2">
                      <span aria-hidden="true" className="loop-team-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" data-slot={slot} style={slotDelay(slot)} />
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-blue-soft text-brand-blue-deep @lg:rounded-[0.5rem]">
                        <Icon aria-hidden="true" size={14} strokeWidth={1.75} />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate type-caption font-medium leading-4 text-ink">{who.kind}</span>
                        <span className="hidden truncate type-caption leading-4 text-ink-3 @lg:block">{who.org}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Connector className="h-9 w-3 shrink-0 @lg:hidden" color="var(--brand-yellow)" />

        {/* The hotel's space */}
        <div className="relative z-10 w-full max-w-sm @lg:absolute @lg:h-[44%] @lg:w-[72%] @lg:max-w-none @lg:-translate-x-1/2 @lg:-translate-y-1/2 @lg:left-(--x) @lg:top-(--y)" style={pos(SPACE, W, H)}>
          <div className="scene-build h-full" style={build(0)}>
            {spaceCard}
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 @lg:hidden" color="var(--brand-yellow)" out />

        {/* What the partner sees */}
        <div className={cn('relative w-full max-w-sm @lg:w-[72%] @lg:max-w-none', AT)} style={pos(VIEW, W, H)}>
          <div className="scene-build-in" style={{ ...build(1), '--from-y': '6px' } as React.CSSProperties}>
            {viewCard}
          </div>
        </div>
      </div>
    </Scene>
  )
}
