import { Check, LayoutDashboard, Mail } from 'lucide-react'
import React from 'react'

import { ResiMark, ResiName } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Avatar, Chip } from './primitives'
import { Scene } from './Scene'
import { Connector, LOOP, Lit, build, elbow, perSlot, pos, slotDelay, type Pt } from './stage'
import { teamCopyFor } from './copy/team'
import type { IllustrationProps } from './index'

/*
 * Desktop stage: 200 × 100 on a 2 : 1 box, so SVG units and CSS percentages line up
 * (left = x / 2 %, top = y %). Resi's card is fixed in size so the wires meet its edges.
 */
const RESI: Pt = { x: 100, y: 50 }
const RESI_L = 74
const RESI_R = 126
const RESI_T = 36
const RESI_B = 64

/** Systems on the left, marks from the connector catalogue; `entry` is where the wire meets Resi. */
const sources: { name: string; logo: string; at: Pt; entry: number; bend: number }[] = [
  { name: 'Mews', logo: '/integrations/mews.webp', at: { x: 14, y: 14 }, entry: 41, bend: 60 },
  { name: 'Google Ads', logo: '/integrations/google_ads.webp', at: { x: 30, y: 28 }, entry: 46, bend: 54 },
  { name: 'Re:Guest', logo: '/integrations/re_guest.png', at: { x: 14, y: 42 }, entry: 51, bend: 48 },
  { name: 'Meta Ads', logo: '/integrations/meta_ads.svg', at: { x: 30, y: 56 }, entry: 56, bend: 54 },
]
const TILE = 4.6
const catalogue = { at: { x: 26, y: 80 }, edge: 46, entry: 61, bend: 60 }

/** The team on the right; `entry` is where their wire meets Resi's card. */
const PEOPLE_X = 174
const PEOPLE_EDGE = 153
const people: { at: Pt; entry: number; tone: 'blue' | 'yellow' | 'coral' }[] = [
  { at: { x: PEOPLE_X, y: 12 }, entry: 42, tone: 'blue' },
  { at: { x: PEOPLE_X, y: 44 }, entry: 50, tone: 'yellow' },
  { at: { x: PEOPLE_X, y: 76 }, entry: 58, tone: 'coral' },
]
const PEOPLE_BEND = 140

/** Where her work lands: the dashboard above her, the Monday email below. */
const DASHBOARD: Pt = { x: 100, y: 11 }
const DASHBOARD_B = 20
const DIGEST: Pt = { x: 100, y: 88 }
const DIGEST_T = 82

/**
 * Who starts each exchange (a person, or the Monday schedule), which systems Resi reads and
 * where the answer goes. The third exchange is Resi's own: the weekly report to everyone.
 */
const turns: { asker: number | 'digest'; reads: number[]; to: number[]; pin: boolean }[] = [
  { asker: 0, reads: [0, 1], to: [0], pin: false },
  { asker: 1, reads: [0, 2], to: [1], pin: true },
  { asker: 'digest', reads: [0, 1, 3], to: [0, 1, 2], pin: false },
]

const sourcePath = (i: number) =>
  elbow({ x: sources[i].at.x + TILE, y: sources[i].at.y }, { x: RESI_L, y: sources[i].entry }, sources[i].bend)
const cataloguePath = elbow({ x: catalogue.edge, y: catalogue.at.y }, { x: RESI_L, y: catalogue.entry }, catalogue.bend)
/** Person → Resi (a question) and Resi → person (her answer) share one route. */
const askPath = (p: number) => elbow({ x: PEOPLE_EDGE, y: people[p].at.y }, { x: RESI_R, y: people[p].entry }, PEOPLE_BEND)
const answerPath = (p: number) => elbow({ x: RESI_R, y: people[p].entry }, { x: PEOPLE_EDGE, y: people[p].at.y }, PEOPLE_BEND)
const dashboardPath = `M ${RESI.x} ${RESI_T} V ${DASHBOARD_B}`
const digestPath = `M ${DIGEST.x} ${DIGEST_T} V ${RESI_B}`

/** Stage placement, only from `xl`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y) xl:-translate-x-1/2 xl:-translate-y-1/2'

/** Occupancy Mon–Sun: the weekend (Sat, Sun) is the story in the first answer. */
const weekend = [58, 62, 60, 66, 84, 94, 90]
/** Junior suites in October, Mon–Sun: soft on weekdays, full at the weekend. */
const suites = [44, 46, 50, 52, 88, 96, 58]

const Bars: React.FC<{ values: number[]; strong: (i: number) => boolean; tone: 'blue' | 'coral'; slot: number; extra?: number; className?: string }> = ({
  values,
  strong,
  tone,
  slot,
  extra = 0.45,
  className,
}) => (
  <span aria-hidden="true" className={cn('flex items-end gap-[3px]', className)}>
    {values.map((v, i) => (
      <span
        className={cn(
          'loop-hub-grow flex-1 rounded-t-[2px]',
          strong(i) ? (tone === 'blue' ? 'bg-brand-blue' : 'bg-brand-coral') : 'bg-surface-3',
        )}
        key={i}
        style={{ height: `${v}%`, ...slotDelay(slot, extra + i * 0.03) }}
      />
    ))}
  </span>
)

/**
 * Hero scene for "Meet Resi": Resi herself in the middle of the property's systems and its
 * team. Mews, Google Ads, Re:Guest and Meta sit on the left with the KPI catalogue; Lena,
 * Jonas and Anna on the right; the dashboard above her and the Monday email below. Three
 * exchanges of 4 s on a 12 s clock: Lena asks how the weekend went and gets occupancy with
 * its week; Jonas asks about the junior suites, gets the answer and the chart is pinned to
 * the dashboard; then Resi acts on her own and the weekly report goes out by email to all
 * three. Questions arrive on blue wires with yellow pulses, her answers leave in her mint.
 * Below `xl` the pieces stack: logo row, Resi, and one answer card that swaps. Reduced motion
 * shows the first exchange, finished. Timing: `.loop-hub-*` and `.loop-team-*`.
 */
export const AgentChatIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = teamCopyFor(locale)

  const litBy = (source: number) => turns.flatMap((t, slot) => (t.reads.includes(source) ? [{ slot, k: t.reads.indexOf(source) }] : []))

  /** Lena's and Jonas's answers: KPI, tiny week chart, sources. */
  const answer = (slot: 0 | 1) => {
    const a = c.answers[slot]
    return (
      <>
        <span className="flex items-center gap-1.5 type-caption leading-4 text-ink-3">
          <ResiMark size={14} />
          <span className="min-w-0 flex-1 truncate">{a.kpi}</span>
          <span className="flex shrink-0 items-center gap-1" title={a.source}>
            <Check aria-hidden="true" className="text-resi-mint" size={11} strokeWidth={2.5} />
            {turns[slot].reads.map((i) => (
              <span className="inline-flex size-4 items-center justify-center rounded-[4px] bg-white" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark */}
                <img alt="" className="size-3 object-contain" height={12} src={sources[i].logo} width={12} />
              </span>
            ))}
          </span>
        </span>
        <span className="mt-2 flex items-end gap-2.5">
          <span className="font-display text-xl font-medium leading-none tnum text-ink">
            <span className="loop-hub-tick inline-block min-w-[2ch] text-right" style={{ ...slotDelay(slot, 0.45), '--hub-to': a.value } as React.CSSProperties} />
            {a.unit}
          </span>
          <Chip className="whitespace-nowrap" tone={a.up ? 'green' : 'coral'}>
            {a.delta}
          </Chip>
          {slot === 0 ? (
            <Bars className="h-7 min-w-0 flex-1" slot={0} strong={(i) => i >= 5} tone="blue" values={weekend} />
          ) : (
            <Bars className="h-7 min-w-0 flex-1" slot={1} strong={(i) => i < 4} tone="coral" values={suites} />
          )}
        </span>
      </>
    )
  }

  const statusLine = (slot: number) => (
    <span className="loop-team-status flex flex-col items-center gap-0.5 [grid-area:1/1]" data-slot={slot} key={slot} style={slotDelay(slot)}>
      <span className="type-caption leading-4 text-ink-3">{c.status[slot].for}</span>
      <span className="type-caption font-medium leading-4 text-ink-2">{c.status[slot].doing}</span>
    </span>
  )

  const resiCard = (
    <div className="relative flex h-full flex-col items-center justify-center gap-2.5 rounded-[1.25rem] border border-line-strong bg-surface-2 px-5 py-4 text-center shadow-float">
      <span aria-hidden="true" className="loop-hub-ring pointer-events-none absolute -inset-px rounded-[inherit]" style={perSlot} />
      <span className="relative grid size-16 place-items-center">
        <span aria-hidden="true" className="resi-aura absolute -inset-2 rounded-full" />
        <span className="loop-resi-core relative grid place-items-center" style={perSlot}>
          <ResiMark className="shadow-float" size={56} />
          {turns.map((_, slot) => (
            <span className="loop-hub-think absolute inset-0" key={slot} style={slotDelay(slot)}>
              <ResiMark size={56} thinking />
            </span>
          ))}
        </span>
      </span>
      <span className="flex flex-col items-center">
        {/* The spaces keep "Resi" a separate word in the text content. */}
        {' '}<ResiName className="font-display text-xl font-medium leading-6" />{' '}
        <span className="type-caption leading-4 text-ink-3">{c.role}</span>
      </span>
      <span className="grid w-full border-t border-line pt-2.5">{turns.map((_, slot) => statusLine(slot))}</span>
    </div>
  )

  /** What lands under a person: their question first, then Resi's answer or the report. */
  const inbox = (p: number) => (
    <span className="absolute inset-x-0 top-full mt-1.5 grid">
      {turns.map((turn, slot) => {
        const asks = turn.asker === p
        const gets = turn.to.includes(p)
        return (
          <React.Fragment key={slot}>
            {asks && slot < 2 && (
              <span
                className="loop-team-ask self-start justify-self-end rounded-[0.75rem] rounded-tr-sm bg-surface-3 px-2.5 py-1.5 type-caption text-ink [grid-area:1/1]"
                data-slot={slot}
                style={slotDelay(slot)}
              >
                {c.questions[slot]}
              </span>
            )}
            {gets && slot < 2 && (
              <span
                className="loop-team-reply relative block rounded-[0.75rem] border border-line-strong bg-surface-2 p-2.5 shadow-card [grid-area:1/1]"
                data-slot={slot}
                style={slotDelay(slot)}
              >
                {answer(slot as 0 | 1)}
              </span>
            )}
            {gets && slot === 2 && (
              <span
                className="loop-team-reply flex items-center gap-1.5 self-start justify-self-start rounded-pill border border-line-strong bg-surface-2 px-2.5 py-1 type-caption text-ink-2 shadow-card [grid-area:1/1]"
                data-slot={slot}
                style={slotDelay(slot, p * 0.08)}
              >
                <Mail aria-hidden="true" className="shrink-0 text-resi-mint" size={12} strokeWidth={2} />
                {c.digest.chip}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </span>
  )

  return (
    <Scene className={cn('w-full', className)} label={c.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center xl:block xl:aspect-[2/1]">
        {/* Desktop wiring: dotted idle routes, then per exchange the lines that draw and their pulses. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full overflow-visible xl:block" viewBox="0 0 200 100">
          {[
            ...sources.map((_, i) => ({ d: sourcePath(i), order: 2 + i })),
            { d: cataloguePath, order: 6 },
            ...people.map((_, p) => ({ d: askPath(p), order: 2 + p })),
            { d: dashboardPath, order: 1 },
            { d: digestPath, order: 1 },
          ].map(({ d, order }) => (
            <g className="scene-fade" key={d} style={build(order, 0.2)}>
              <path className="hub-dots" d={d} fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
            </g>
          ))}
          {turns.map((turn, slot) => {
            const inbound = turn.asker === 'digest' ? digestPath : askPath(turn.asker)
            return (
              <g key={slot}>
                <path className="loop-team-in" d={inbound} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot)} />
                <path className="loop-team-comet-in" d={inbound} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(slot)} />
                {[...turn.reads.map((i) => sourcePath(i)), cataloguePath].map((d, k) => (
                  <React.Fragment key={d}>
                    <path className="loop-hub-draw" d={d} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot, k * 0.08)} />
                    <path className="loop-hub-comet" d={d} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(slot, k * 0.08)} />
                  </React.Fragment>
                ))}
                {[...turn.to.map((p) => answerPath(p)), ...(turn.pin ? [dashboardPath] : [])].map((d, k) => (
                  <React.Fragment key={d}>
                    <path className="loop-hub-draw-out" d={d} data-slot={slot} fill="none" pathLength={1} stroke="var(--resi-mint)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot, k * 0.08)} />
                    <path className="loop-hub-comet-out" d={d} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(slot, k * 0.08)} />
                  </React.Fragment>
                ))}
              </g>
            )
          })}
        </svg>

        {/* Systems: a logo row on phones, tiles on the desktop stage. */}
        <div className="flex flex-wrap justify-center gap-2.5 xl:contents">
          {sources.map((src, i) => (
            <div className={cn('relative', AT)} key={src.name} style={pos(src.at)}>
              <div className="scene-build-in" style={{ ...build(3 + i), '--from-x': '6px', '--from-y': '0' } as React.CSSProperties}>
                <div className="hub-float" style={{ '--float-delay': `${-i * 1.7}s` } as React.CSSProperties}>
                  <span className="relative flex size-11 items-center justify-center rounded-[0.75rem] border border-line-strong bg-white shadow-card xl:size-12" title={src.name}>
                    {litBy(i).map(({ slot, k }) => (
                      <Lit key={slot} slot={slot} stagger={k * 0.08} />
                    ))}
                    {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
                    <img alt="" className="size-6 object-contain xl:size-7" height={28} src={src.logo} width={28} />
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className={cn('hidden w-[20%] xl:block', AT)} style={pos(catalogue.at)}>
            <div className="scene-build-in" style={{ ...build(7), '--from-x': '6px', '--from-y': '0' } as React.CSSProperties}>
              <div className="hub-float" style={{ '--float-delay': '-3.1s' } as React.CSSProperties}>
                <div className="relative rounded-[0.75rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-card">
                  {turns.map((t, slot) => (
                    <Lit key={slot} slot={slot} stagger={t.reads.length * 0.08} />
                  ))}
                  <span className="flex items-center justify-between gap-2 type-caption text-ink-3">
                    {c.catalogue}
                    <span className="tnum">v1.2</span>
                  </span>
                  <span className="mt-1 grid font-mono text-[0.6875rem] leading-4 text-ink-2">
                    {c.defs.map((def, slot) => (
                      <span className="loop-hub-def truncate [grid-area:1/1]" data-slot={slot} key={def} style={slotDelay(slot)}>
                        {def}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* Resi */}
        <div
          className="relative z-10 w-full max-w-72 xl:absolute xl:left-1/2 xl:top-1/2 xl:h-[28%] xl:w-[26%] xl:max-w-none xl:-translate-x-1/2 xl:-translate-y-1/2"
          style={pos(RESI)}
        >
          <div className="scene-build h-full" style={build(0)}>
            {resiCard}
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 xl:hidden" out />

        {/* Dashboard above her: Jonas's chart is pinned into the empty slot. */}
        <div className={cn('hidden w-[30%] xl:block xl:h-[18%]', AT)} style={pos(DASHBOARD)}>
          <div className="scene-build-in h-full" style={{ ...build(1), '--from-y': '-6px' } as React.CSSProperties}>
            <div className="relative flex h-full flex-col gap-2 rounded-[0.875rem] border border-line-strong bg-surface-2 p-2.5 shadow-card">
              <Lit slot={1} tone="out" />
              <span className="flex items-center gap-1.5 type-caption leading-4 text-ink-2">
                <LayoutDashboard aria-hidden="true" className="shrink-0 text-ink-3" size={13} strokeWidth={1.75} />
                {c.dashboard.title}
              </span>
              <span className="grid min-h-0 flex-1 grid-cols-3 gap-1.5">
                {c.dashboard.widgets.map(([label, value]) => (
                  <span className="flex flex-col justify-between rounded-[0.5rem] border border-line bg-surface px-2 py-1.5" key={label}>
                    <span className="type-caption leading-3 text-ink-3">{label}</span>
                    <span className="font-display text-sm font-medium leading-4 tnum text-ink">{value}</span>
                  </span>
                ))}
                <span className="relative grid rounded-[0.5rem] border border-dashed border-line-strong">
                  <span className="grid place-items-center type-caption leading-3 text-ink-3 [grid-area:1/1]">{c.dashboard.slot}</span>
                  <span className="loop-late flex flex-col gap-1 rounded-[0.5rem] bg-surface px-2 py-1.5 [grid-area:1/1]" style={slotDelay(1, -0.2 - LOOP)}>
                    <span className="type-caption leading-3 text-ink-3">{c.dashboard.pinned}</span>
                    <span aria-hidden="true" className="flex min-h-0 flex-1 items-end gap-[2px]">
                      {suites.map((v, i) => (
                        <span className={cn('flex-1 rounded-t-[1px]', i < 4 ? 'bg-brand-coral' : 'bg-surface-3')} key={i} style={{ height: `${v}%` }} />
                      ))}
                    </span>
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* The Monday email below her: the schedule that starts the third exchange. */}
        <div className={cn('hidden w-[27%] xl:block', AT)} style={pos(DIGEST)}>
          <div className="scene-build-in" style={{ ...build(1), '--from-y': '6px' } as React.CSSProperties}>
            <div className="relative flex items-center gap-2.5 rounded-[0.875rem] border border-line-strong bg-surface-2 px-3 pb-2.5 pt-3.5 shadow-card">
              <span aria-hidden="true" className="loop-team-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" data-slot={2} style={slotDelay(2)} />
              <span className="grid size-8 shrink-0 place-items-center rounded-[0.5rem] bg-surface-3 text-ink-2">
                <Mail aria-hidden="true" size={15} strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-caption font-medium leading-4 text-ink">{c.digest.title}</span>
                <span className="truncate type-caption leading-4 text-ink-3">{c.digest.when}</span>
              </span>
              <span className="grid justify-items-end">
                <span className="flex -space-x-1.5 [grid-area:1/1]">
                  {c.people.map((person, p) => (
                    <Avatar className="size-5 text-[0.5625rem] ring-2 ring-surface-2" initials={person.initials} key={person.name} tone={people[p].tone} />
                  ))}
                </span>
              </span>
              <Chip className="loop-late absolute -top-3 right-3 whitespace-nowrap" style={slotDelay(2, 0.55 - LOOP)} tone="green">
                <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {c.digest.sent}
              </Chip>
            </div>
          </div>
        </div>

        {/* The team: cards on the desktop stage, each with what lands under it. */}
        {people.map((person, p) => {
          const asked = turns.findIndex((t) => t.asker === p)
          const received = turns.flatMap((t, slot) => (t.to.includes(p) ? [slot] : []))
          const who = c.people[p]
          return (
            <div className={cn('hidden w-[21%] xl:block', AT)} key={who.name} style={pos(person.at)}>
              <div className="scene-build-in" style={{ ...build(3 + p), '--from-x': '-6px', '--from-y': '0' } as React.CSSProperties}>
                <div className="hub-float relative" style={{ '--float-delay': `${-p * 2.3 - 0.8}s` } as React.CSSProperties}>
                  <div className="relative flex items-center gap-2.5 rounded-[0.875rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-card">
                    {asked >= 0 && (
                      <span aria-hidden="true" className="loop-team-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-brand-blue" data-slot={asked} style={slotDelay(asked)} />
                    )}
                    {received.map((slot) => (
                      <Lit key={slot} slot={slot} stagger={p * 0.08} tone="out" />
                    ))}
                    <Avatar className="size-8 text-[0.6875rem]" initials={who.initials} tone={person.tone} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate type-small font-medium leading-5 text-ink">{who.name}</span>
                      <span className="truncate type-caption leading-4 text-ink-3">{who.role}</span>
                    </span>
                  </div>
                  {inbox(p)}
                </div>
              </div>
            </div>
          )
        })}

        {/* Phones: one card that swaps with each exchange, addressed to whoever it is for. */}
        <div className="grid w-full max-w-sm xl:hidden">
          {turns.map((turn, slot) => (
            <div className="loop-hub-swap [grid-area:1/1]" data-slot={slot} key={slot} style={slotDelay(slot)}>
              <div className="relative rounded-[0.875rem] border border-line-strong bg-surface-2 p-3.5 shadow-float">
                <Lit slot={slot} tone="out" />
                <span className="flex items-center gap-2">
                  {slot < 2 ? (
                    <>
                      <Avatar className="size-6 text-[0.625rem]" initials={c.people[turn.to[0]].initials} tone={people[turn.to[0]].tone} />
                      <span className="type-caption text-ink-3">
                        {c.to} {c.people[turn.to[0]].name} · {c.people[turn.to[0]].role}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="flex -space-x-1.5">
                        {c.people.map((person, p) => (
                          <Avatar className="size-6 text-[0.625rem] ring-2 ring-surface-2" initials={person.initials} key={person.name} tone={people[p].tone} />
                        ))}
                      </span>
                      <span className="type-caption text-ink-3">{c.team}</span>
                    </>
                  )}
                </span>
                {slot < 2 ? (
                  <>
                    <p className="mt-2 type-small text-ink-2">{c.quote[0]}{c.questions[slot]}{c.quote[1]}</p>
                    <div className="mt-2.5 rounded-[0.75rem] border border-line bg-surface p-2.5">{answer(slot as 0 | 1)}</div>
                  </>
                ) : (
                  <div className="mt-2.5 flex items-center gap-2.5 rounded-[0.75rem] border border-line bg-surface p-2.5">
                    <Mail aria-hidden="true" className="shrink-0 text-resi-mint" size={16} strokeWidth={1.75} />
                    <span className="flex min-w-0 flex-col">
                      <span className="type-caption font-medium text-ink">{c.digest.chip}</span>
                      <span className="type-caption text-ink-3">{c.digest.when}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Scene>
  )
}
