import { CalendarClock, Check, Code2, FileSignature, GraduationCap, Laptop, MapPin, PartyPopper, Plug } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Avatar } from './primitives'
import { Scene } from './Scene'
import { Connector, LOOP, build, elbow, perSlot, pos, slotDelay, type Pt } from './stage'
import { careersCopyFor } from './copy/careers'
import type { IllustrationProps } from './index'

/*
 * Desktop stage: 200 × 100 on a 2 : 1 box, so SVG units and CSS percentages line up
 * (left = x / 2 %, top = y %). The application card is fixed in size so the wires meet its edges.
 */
const APP: Pt = { x: 100, y: 50 }
const APP_L = 76
const APP_R = 124

/** Open roles on the left; `entry` is where their wire meets the application. */
const ROLES_X = 27
const ROLES_EDGE = 49
const roles: { at: Pt; entry: number; icon: typeof Plug }[] = [
  { at: { x: ROLES_X, y: 22 }, entry: 40, icon: Plug },
  { at: { x: ROLES_X, y: 50 }, entry: 50, icon: Code2 },
  { at: { x: ROLES_X, y: 78 }, entry: 60, icon: GraduationCap },
]
const ROLES_BEND = 62.5

/** Your start at Indicate, on the right. */
const START: Pt = { x: 168, y: 50 }
const START_L = 140

const rolePath = (r: number) => elbow({ x: ROLES_EDGE, y: roles[r].at.y }, { x: APP_L, y: roles[r].entry }, ROLES_BEND)
const startPath = `M ${APP_R} 50 H ${START_L}`

/** Stage placement, only from `xl`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y) xl:-translate-x-1/2 xl:-translate-y-1/2'

const benefitIcons = [CalendarClock, Laptop, PartyPopper, FileSignature]

/**
 * Hero scene for "Jobs": applying to Indicate and starting here. The three open roles sit on
 * the left, your application in the middle, your start at Indicate on the right. Three
 * exchanges of 4 s on a 12 s clock: a role lights, the application names it and ticks
 * through the real steps (application, first chat, meet the team, offer, your start), and the
 * start card welcomes you in that role with your onboarding buddy while one of the benefits
 * lights (flexible hours, equipment, team events). Below `xl` the pieces stack. Reduced motion
 * shows the first exchange, finished. Timing: `.loop-team-*`, `.loop-hub-*`, `.loop-crew-step`.
 */
export const CareersIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = careersCopyFor(locale)

  const appCard = (
    <div className="relative flex h-full flex-col gap-2.5 rounded-[1.25rem] border border-line-strong bg-surface-2 p-3.5 shadow-float">
      <span className="flex items-center gap-2.5">
        <Avatar className="size-8 text-[0.625rem]" initials={c.you} tone="yellow" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="type-small font-medium leading-5 text-ink">{c.application}</span>
          <span className="grid">
            {c.roles.map((role, slot) => (
              <span className="loop-team-status truncate type-caption leading-4 text-ink-3 [grid-area:1/1]" data-slot={slot} key={role.title} style={slotDelay(slot)}>
                {role.title}
              </span>
            ))}
          </span>
        </span>
      </span>
      <span className="flex flex-col gap-1 border-t border-line pt-2.5">
        {c.steps.map((label, k) => (
          <span className="relative flex items-center gap-2 rounded-[0.5rem] px-1.5 py-1 type-caption leading-4 text-ink-3" key={label}>
            <span className="size-3.5 shrink-0 rounded-full border border-line-strong" />
            {label}
            <span
              aria-hidden="true"
              className={cn(
                'loop-crew-step absolute inset-0 flex items-center gap-2 rounded-[inherit] px-1.5',
                k === c.steps.length - 1 ? 'bg-brand-blue-soft font-medium text-brand-blue-deep' : 'bg-success-soft text-success-deep',
              )}
              data-step={k}
              style={perSlot}
            >
              <span className={cn('grid size-3.5 shrink-0 place-items-center rounded-full text-white', k === c.steps.length - 1 ? 'bg-brand-blue' : 'bg-success')}>
                <Check size={9} strokeWidth={3} />
              </span>
              {label}
            </span>
          </span>
        ))}
      </span>
    </div>
  )

  const startCard = (
    <div className="relative flex flex-col gap-2.5 rounded-[0.875rem] border border-line-strong bg-surface-2 p-2.5 shadow-card">
      {c.roles.map((_, slot) => (
        <span
          aria-hidden="true"
          className="loop-hub-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue"
          data-slot={slot}
          key={slot}
          style={{ ...slotDelay(slot), '--glow': 'var(--brand-blue)' } as React.CSSProperties}
        />
      ))}
      <span className="flex items-center gap-2.5 px-0.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[0.5rem] border border-line bg-surface">
          <BrandBars size={16} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate type-caption font-medium leading-4 text-ink">{c.start.title}</span>
          <span className="flex items-center gap-1 truncate type-caption leading-4 text-ink-3">
            <MapPin aria-hidden="true" className="shrink-0" size={10} strokeWidth={2} /> {c.start.place}
          </span>
        </span>
      </span>
      {/* The welcome for the role that just went through, with the buddy waiting. */}
      <span className="grid h-[3.25rem] rounded-[0.625rem] border border-dashed border-line-strong">
        {c.start.welcome.map((welcome, slot) => (
          <span className="loop-team-reply flex min-w-0 flex-col justify-center rounded-[0.625rem] bg-brand-blue-soft px-2.5 [grid-area:1/1]" data-slot={slot} key={welcome} style={slotDelay(slot)}>
            <span className="truncate type-caption font-medium leading-4 text-brand-blue-deep">{welcome}</span>
            <span className="truncate type-caption leading-4 text-ink-2">{c.start.buddy}</span>
          </span>
        ))}
      </span>
      <span className="grid grid-cols-2 gap-1.5">
        {c.benefits.map((benefit, i) => {
          const Icon = benefitIcons[i]
          return (
            <span className="relative flex min-w-0 items-center rounded-[0.5rem] border border-line bg-surface px-2 py-2" key={benefit}>
              {i < 3 && (
                <span
                  aria-hidden="true"
                  className="loop-hub-glow pointer-events-none absolute -inset-px rounded-[inherit] border border-brand-yellow"
                  data-slot={i}
                  style={{ ...slotDelay(i, 0.15), '--glow': 'var(--brand-yellow)' } as React.CSSProperties}
                />
              )}
              <span className="flex items-start gap-1.5 type-caption font-medium leading-4 text-ink">
                <Icon aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" size={11} strokeWidth={2} />
                {benefit}
              </span>
            </span>
          )
        })}
      </span>
    </div>
  )

  return (
    <Scene className={cn('w-full', className)} label={c.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center xl:block xl:aspect-[2/1]">
        {/* Desktop wiring: dotted idle routes, then per exchange the role's wire in and the start's wire out. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full overflow-visible xl:block" viewBox="0 0 200 100">
          {[...roles.map((_, r) => ({ d: rolePath(r), order: 2 + r })), { d: startPath, order: 1 }].map(({ d, order }) => (
            <g className="scene-fade" key={d} style={build(order, 0.2)}>
              <path className="hub-dots" d={d} fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
            </g>
          ))}
          {roles.map((_, slot) => (
            <g key={slot}>
              <path className="loop-team-in" d={rolePath(slot)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot)} />
              <path className="loop-team-comet-in" d={rolePath(slot)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(slot)} />
              <path className="loop-hub-draw-out" d={startPath} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot)} />
              <path className="loop-hub-comet-out" d={startPath} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={{ ...slotDelay(slot), '--comet': 0.2, '--comet-from': 0.25 } as React.CSSProperties} />
            </g>
          ))}
        </svg>

        {/* Open roles: chips on phones, cards on the desktop stage. */}
        <div className="flex flex-wrap justify-center gap-2 xl:contents">
          {roles.map((role, r) => {
            const Icon = role.icon
            const copy = c.roles[r]
            return (
              <div className={cn('relative xl:w-[22%]', AT)} key={copy.title} style={pos(role.at)}>
                <div className="scene-build-in" style={{ ...build(3 + r), '--from-x': '6px', '--from-y': '0' } as React.CSSProperties}>
                  <div className="hub-float" style={{ '--float-delay': `${-r * 2.1 - 0.6}s` } as React.CSSProperties}>
                    <div className="relative flex items-center gap-2 rounded-pill border border-line-strong bg-surface-2 py-1 pl-1 pr-3 shadow-card xl:gap-2.5 xl:rounded-[0.875rem] xl:px-3 xl:py-2.5">
                      <span aria-hidden="true" className="loop-team-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" data-slot={r} style={slotDelay(r)} />
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-blue-soft text-brand-blue-deep xl:size-8 xl:rounded-[0.5rem]">
                        <Icon aria-hidden="true" size={15} strokeWidth={1.75} />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate type-caption font-medium leading-4 text-ink xl:type-small xl:leading-5">{copy.title}</span>
                        <span className="hidden truncate type-caption leading-4 text-ink-3 xl:block">{copy.focus}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* Your application */}
        <div className="relative z-10 w-full max-w-72 xl:absolute xl:w-[24%] xl:max-w-none xl:-translate-x-1/2 xl:-translate-y-1/2 xl:left-(--x) xl:top-(--y)" style={pos(APP)}>
          <div className="scene-build" style={build(0)}>
            {appCard}
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" out />

        {/* Your start at Indicate: below the application on phones, on the right of the stage. */}
        <div className={cn('relative w-full max-w-sm xl:w-[28%] xl:max-w-none', AT)} style={pos(START)}>
          <div className="scene-build-in" style={{ ...build(1), '--from-x': '-6px', '--from-y': '0' } as React.CSSProperties}>
            <div className="hub-float" style={{ '--float-delay': '-1.2s' } as React.CSSProperties}>
              {startCard}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  )
}
