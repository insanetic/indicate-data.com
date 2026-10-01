import { Check, FlaskConical, Heart, MessagesSquare, PartyPopper, Rocket, Scale } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Chip } from './primitives'
import { Scene } from './Scene'
import { Connector, LOOP, build, elbow, perSlot, pos, slotDelay, type Pt } from './stage'
import { aboutCopyFor } from './copy/about'
import type { IllustrationProps } from './index'

/*
 * Desktop stage: 200 × 100 on a 2 : 1 box, so SVG units and CSS percentages line up
 * (left = x / 2 %, top = y %). The cards are fixed in size so the wires meet their edges.
 */
const TEAM: Pt = { x: 100, y: 50 }
const TEAM_L = 77
const TEAM_R = 123

/** Our values on the left, one card each; `entry` is where their wire meets the team card. */
const VALUES_X = 28
const VALUES_EDGE = 53
const values: { at: Pt; entry: number }[] = [
  { at: { x: VALUES_X, y: 20 }, entry: 42 },
  { at: { x: VALUES_X, y: 50 }, entry: 50 },
  { at: { x: VALUES_X, y: 80 }, entry: 58 },
]
const VALUES_BEND = 65

/** The everyday moment on the right. */
const MOMENT: Pt = { x: 168, y: 50 }
const MOMENT_L = 140

const valuePath = (slot: number) => elbow({ x: VALUES_EDGE, y: values[slot].at.y }, { x: TEAM_L, y: values[slot].entry }, VALUES_BEND)
const momentPath = `M ${TEAM_R} 50 H ${MOMENT_L}`

/** Stage placement, only from `xl`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y) xl:-translate-x-1/2 xl:-translate-y-1/2'

const valueIcons = [FlaskConical, Scale, Heart]

/** Confetti for the release: brand colours, each piece flies out on its own vector. */
const confetti: { dx: number; dy: number; tone: string; r: number }[] = [
  { dx: -38, dy: -22, tone: 'bg-brand-yellow', r: 20 },
  { dx: -18, dy: -30, tone: 'bg-brand-blue', r: -35 },
  { dx: 4, dy: -34, tone: 'bg-brand-coral', r: 50 },
  { dx: 18, dy: -28, tone: 'bg-brand-yellow', r: -15 },
  { dx: 30, dy: -18, tone: 'bg-brand-blue', r: 70 },
  { dx: -30, dy: 8, tone: 'bg-brand-coral', r: -60 },
  { dx: 26, dy: 12, tone: 'bg-brand-yellow', r: 30 },
]

/**
 * Hero scene for "About us": who Indicate is, for customers and applicants alike. Our values
 * on the left, Indicate from Offenburg with its mission in the middle, and on the right what
 * each value looks like on a normal day. Three exchanges of 4 s on a 12 s clock: "agile and
 * data-driven" lights and a quick A/B test decides; "working as equals" lights and the best
 * argument wins in the team chat; "enjoying the work" lights and a release is celebrated with
 * a Mario Kart invite. Below `xl` the pieces stack. Reduced motion shows the first exchange,
 * finished. Timing: `.loop-team-*`, `.loop-hub-*`, `.loop-crew-confetti`.
 */
export const AboutIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = aboutCopyFor(locale)

  const teamCard = (
    <div className="relative flex h-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-line-strong bg-surface-2 px-4 pb-3.5 pt-9 text-center shadow-float">
      {/* The mark sits on the card's top edge, framed by a light in its own three colours. */}
      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <span className="loop-tree-centre relative inline-flex rounded-[calc(1rem+2px)] p-[2px] shadow-float">
          <span className="loop-resi-core grid size-12 place-items-center rounded-[1rem] bg-surface-2" style={perSlot}>
            <BrandBars size={24} />
          </span>
        </span>
      </span>
      <span className="flex flex-col items-center">
        <span className="font-display text-lg font-medium leading-6 text-ink">{c.team.name}</span>
        <span className="type-caption leading-4 text-ink-3">{c.team.place}</span>
      </span>
      <span className="type-small leading-5 text-ink-2">
        {c.quote[0]}
        {c.team.mission}
        {c.quote[1]}
      </span>
      <span className="grid w-full border-t border-line pt-2">
        {c.today.map((line, slot) => (
          <span className="loop-team-status truncate type-caption leading-4 text-ink-3 [grid-area:1/1]" data-slot={slot} key={line} style={slotDelay(slot)}>
            {line}
          </span>
        ))}
      </span>
    </div>
  )

  /** The three everyday moments; they take turns in one card. */
  const moments = [
    // Agile and data-driven: a quick A/B test, then the decision.
    <span className="flex h-full flex-col gap-2" key="test">
      <span className="flex items-center gap-1.5 type-caption leading-4 text-ink-2">
        <FlaskConical aria-hidden="true" className="shrink-0 text-ink-3" size={12} strokeWidth={1.75} />
        <span className="truncate">{c.experiment.title}</span>
      </span>
      <span className="flex min-h-0 flex-1 items-end gap-3 px-1">
        {c.experiment.variants.map((variant, i) => (
          <span className="flex h-full flex-1 flex-col justify-end gap-1" key={variant}>
            <span aria-hidden="true" className="flex min-h-0 flex-1 items-end">
              <span
                className={cn('loop-hub-grow w-full rounded-t-[3px]', i === 1 ? 'bg-brand-blue' : 'bg-surface-3')}
                style={{ height: i === 1 ? '92%' : '58%', ...slotDelay(0, 0.1 + i * 0.08) }}
              />
            </span>
            <span className="text-center type-caption leading-3 text-ink-3">{variant}</span>
          </span>
        ))}
      </span>
      <Chip className="loop-hub-cite self-start whitespace-nowrap" style={slotDelay(0, 0.25)} tone="green">
        <Check aria-hidden="true" size={10} strokeWidth={2.75} /> {c.experiment.decided}
      </Chip>
    </span>,
    // Working as equals: the best argument wins.
    <span className="flex h-full flex-col justify-between gap-1.5" key="chat">
      {c.chat.messages.map((m, i) => (
        <span
          className={cn(
            'flex max-w-[88%] flex-col rounded-[0.75rem] px-2.5 py-1.5',
            i === 0 ? 'self-start rounded-tl-sm bg-surface-3' : 'self-end rounded-tr-sm bg-brand-blue-soft',
          )}
          key={m.from}
        >
          <span className={cn('type-caption font-medium leading-4', i === 0 ? 'text-ink-3' : 'text-brand-blue-deep')}>{m.from}</span>
          <span className="type-caption leading-4 text-ink">{m.text}</span>
        </span>
      ))}
      <Chip className="loop-hub-cite self-start whitespace-nowrap" style={slotDelay(1, 0.25)} tone="green">
        <Check aria-hidden="true" size={10} strokeWidth={2.75} /> {c.chat.resolved}
      </Chip>
    </span>,
    // Enjoying the work: the release is live, confetti, and an invite.
    <span className="relative flex h-full flex-col justify-center gap-3" key="release">
      <span className="relative flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-[0.5rem] bg-brand-yellow-soft text-ink">
          <Rocket aria-hidden="true" size={15} strokeWidth={1.75} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate type-caption font-medium leading-4 text-ink">{c.release.title}</span>
          <span className="truncate type-caption leading-4 text-ink-3">{c.release.note}</span>
        </span>
        <PartyPopper aria-hidden="true" className="shrink-0 text-brand-coral" size={16} strokeWidth={1.75} />
        <span aria-hidden="true" className="pointer-events-none absolute right-12 top-1/2">
          {confetti.map((p, i) => (
            <span
              className={cn('loop-crew-confetti absolute size-1.5 rounded-[1px]', p.tone)}
              key={i}
              style={{ ...slotDelay(2, 0.05 + i * 0.03), '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--r': `${p.r}deg` } as React.CSSProperties}
            />
          ))}
        </span>
      </span>
      <span className="loop-hub-cite flex items-center gap-1.5 self-end rounded-[0.75rem] rounded-tr-sm bg-surface-3 px-2.5 py-1.5 type-caption leading-4 text-ink" style={slotDelay(2, 0.3)}>
        {c.release.invite}
      </span>
    </span>,
  ]

  const momentCard = (
    <div className="relative flex h-full flex-col gap-2.5 rounded-[0.875rem] border border-line-strong bg-surface-2 p-3 shadow-card">
      {moments.map((_, slot) => (
        <span
          aria-hidden="true"
          className="loop-hub-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue"
          data-slot={slot}
          key={slot}
          style={{ ...slotDelay(slot), '--glow': 'var(--brand-blue)' } as React.CSSProperties}
        />
      ))}
      <span className="flex items-center gap-1.5 px-0.5 type-caption leading-4 text-ink-2">
        <MessagesSquare aria-hidden="true" className="shrink-0 text-ink-3" size={13} strokeWidth={1.75} />
        {c.everyday}
      </span>
      <span className="grid min-h-[7rem] flex-1">
        {moments.map((moment, slot) => (
          <span className="loop-hub-a min-w-0 px-0.5 [grid-area:1/1]" data-slot={slot} key={slot} style={slotDelay(slot)}>
            {moment}
          </span>
        ))}
      </span>
    </div>
  )

  return (
    <Scene className={cn('w-full', className)} label={c.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center xl:block xl:aspect-[2/1]">
        {/* Desktop wiring: dotted idle routes, then per exchange the value's wire in and the moment's wire out. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full overflow-visible xl:block" viewBox="0 0 200 100">
          {[...values.map((_, slot) => ({ d: valuePath(slot), order: 2 + slot })), { d: momentPath, order: 1 }].map(({ d, order }) => (
            <g className="scene-fade" key={d} style={build(order, 0.2)}>
              <path className="hub-dots" d={d} fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
            </g>
          ))}
          {values.map((_, slot) => (
            <g key={slot}>
              <path className="loop-team-in" d={valuePath(slot)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot)} />
              <path className="loop-team-comet-in" d={valuePath(slot)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(slot)} />
              <path className="loop-hub-draw-out" d={momentPath} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot, -0.3)} />
              <path className="loop-hub-comet-out" d={momentPath} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={{ ...slotDelay(slot, -0.3), '--comet': 0.2, '--comet-from': 0.25 } as React.CSSProperties} />
            </g>
          ))}
        </svg>

        {/* Values: chips on phones, one card each on the desktop stage. */}
        <div className="flex flex-wrap justify-center gap-2 xl:contents">
          {values.map((value, slot) => {
            const Icon = valueIcons[slot]
            const copy = c.values.items[slot]
            return (
              <div className={cn('relative xl:w-[25%]', AT)} key={copy.title} style={pos(value.at)}>
                <div className="scene-build-in" style={{ ...build(3 + slot), '--from-x': '6px', '--from-y': '0' } as React.CSSProperties}>
                  <div className="hub-float" style={{ '--float-delay': `${-slot * 2.1 - 0.6}s` } as React.CSSProperties}>
                    <div className="relative flex items-center gap-2 rounded-pill border border-line-strong bg-surface-2 py-1 pl-1 pr-3 shadow-card xl:gap-2.5 xl:rounded-[0.875rem] xl:px-3 xl:py-2.5">
                      <span aria-hidden="true" className="loop-team-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" data-slot={slot} style={slotDelay(slot)} />
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-blue-soft text-brand-blue-deep xl:size-8 xl:rounded-[0.5rem]">
                        <Icon aria-hidden="true" size={15} strokeWidth={1.75} />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate type-caption font-medium leading-4 text-ink xl:whitespace-normal xl:type-small xl:leading-5">{copy.title}</span>
                        <span className="hidden truncate type-caption leading-4 text-ink-3 xl:block">{copy.line}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* Indicate */}
        <div className="relative z-10 mt-6 w-full max-w-72 xl:absolute xl:mt-0 xl:h-[38%] xl:w-[23%] xl:max-w-none xl:-translate-x-1/2 xl:-translate-y-1/2 xl:left-(--x) xl:top-(--y)" style={pos(TEAM)}>
          <div className="scene-build h-full" style={build(0)}>
            {teamCard}
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" out />

        {/* What the value looks like on a normal day. */}
        <div className={cn('relative w-full max-w-sm xl:w-[28%] xl:max-w-none', AT)} style={pos(MOMENT)}>
          <div className="scene-build-in" style={{ ...build(1), '--from-x': '-6px', '--from-y': '0' } as React.CSSProperties}>
            <div className="hub-float" style={{ '--float-delay': '-2.4s' } as React.CSSProperties}>
              {momentCard}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  )
}
