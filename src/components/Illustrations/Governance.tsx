import { KeyRound, Lock, ScrollText, ShieldCheck } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { accessCopy } from './copy/access'
import { Avatar, Chip } from './primitives'
import { Scene } from './Scene'
import { Connector, LOOP, Lit, SLOTS, build, pos, slotDelay, type Pt } from './stage'
import type { IllustrationProps } from './index'

/*
 * Wire ends sit a little inside the (opaque) cards, so the stage holds at every width.
 *
 * Desktop stage: a 200 × 100 coordinate system on a 2 : 1 box, so SVG units and CSS
 * percentages line up (left = x / 2 %, top = y %) and no stroke is ever stretched.
 */
const ORG: Pt = { x: 69, y: 11 }
const ORG_BOTTOM = 14
const ORG_RIGHT = 95
/** Structure bus between the organisation and its spaces. */
const ORG_BUS = 26
const SPACE_Y = 45
const SPACE_TOP = 40
const SPACE_BOTTOM = 50
/** Where the grant chip sits on the wire into each space. */
const GRANT_Y = 60
/** Access bus between the people and the spaces they reach. */
const ACCESS_BUS = 68
const PEOPLE_Y = 86
const PEOPLE_TOP = 83
const LOG: Pt = { x: 171, y: 34 }

/** Three properties, each its own space on its own PMS. Names and systems are the same in every language. */
const spaces: { name: string; pms: string; logo: string; x: number }[] = [
  { name: 'Hotel Alpenrose', pms: 'Mews', logo: '/integrations/mews.webp', x: 24 },
  { name: 'Seeblick Resort', pms: 'apaleo', logo: '/integrations/apaleo.png', x: 69 },
  { name: 'Bergwald Lodge', pms: 'ASA', logo: '/integrations/asa_hotelsoftware.svg', x: 114 },
]

/** One identity per exchange and the spaces it reaches: the manager, head office, the agency token. */
const people: { x: number; reach: number[]; initials?: string; tone?: 'blue' | 'yellow' | 'coral' }[] = [
  { x: 24, reach: [0], initials: 'LH', tone: 'coral' },
  { x: 69, reach: [0, 1, 2], initials: 'MW', tone: 'blue' },
  { x: 114, reach: [1, 2] },
]
const grantTones = ['blue', 'neutral', 'yellow'] as const

/** Straight up, or up to `bus`, along it, and up again, with rounded corners. */
function riser(a: Pt, b: Pt, bus: number, r = 3): string {
  if (Math.abs(a.x - b.x) < 0.01) return `M ${a.x} ${a.y} V ${b.y}`
  const dy = Math.sign(b.y - a.y)
  const dx = Math.sign(b.x - a.x)
  return [
    `M ${a.x} ${a.y}`,
    `V ${bus - dy * r}`,
    `Q ${a.x} ${bus} ${a.x + dx * r} ${bus}`,
    `H ${b.x - dx * r}`,
    `Q ${b.x} ${bus} ${b.x} ${bus + dy * r}`,
    `V ${b.y}`,
  ].join(' ')
}

const structurePaths = spaces.map((s) => riser({ x: ORG.x, y: ORG_BOTTOM }, { x: s.x, y: SPACE_TOP }, ORG_BUS))
const accessPath = (person: number, space: number) =>
  riser({ x: people[person].x, y: PEOPLE_TOP }, { x: spaces[space].x, y: SPACE_BOTTOM }, ACCESS_BUS)
/** The idle access wiring: every person up to the bus, the bus, and the bus up to every space. */
const idleAccess = [
  ...people.map((p) => `M ${p.x} ${PEOPLE_TOP} V ${ACCESS_BUS}`),
  `M ${spaces[0].x} ${ACCESS_BUS} H ${spaces[2].x}`,
  ...spaces.map((s) => `M ${s.x} ${ACCESS_BUS} V ${SPACE_BOTTOM}`),
]
/** Every access is written to the organisation's audit log. */
const auditPath = `M ${ORG_RIGHT} ${ORG.y} H ${LOG.x - 3} Q ${LOG.x} ${ORG.y} ${LOG.x} ${ORG.y + 3} V ${LOG.y + 2}`

/** Exchange timeline (s): the 2FA check 0.7, the person lights 1.0, lines reach the spaces 1.5, grants switch 1.45, the log line lands 2.7. */
const GRANT_AT = 1.45
const SIGN_IN_AT = 0.7
const AUDIT_AT = 0.8
const LOG_AT = 2.7

/** Three values for the `loop-tri-*` classes, one per exchange. */
const tri = (pick: (slot: number) => string | number, delay = 0): React.CSSProperties =>
  ({
    ...Object.fromEntries(Array.from({ length: SLOTS }, (_, slot) => [`--s${slot}`, pick(slot)])),
    '--delay': `${delay}s`,
  }) as React.CSSProperties

/** Stage placement, only from `xl`: on phones `left`/`top` would shift the `relative` boxes. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y) xl:-translate-x-1/2 xl:-translate-y-1/2'

/**
 * Looping scene (wide), 12 s: who sees what, shown as reach. The organisation sits on top with
 * its 2FA policy, its three spaces below it (each on its own PMS, guest data stays inside), and
 * the people and tokens at the bottom. Each exchange (4 s) one identity lights and its lines
 * draw up into exactly the spaces it may open, where its role appears: the manager as Admin in
 * her own hotel, head office as Reader in all three, the agency token with dashboards only in
 * two. The access is written to the audit log on the right: a pulse runs from the organisation
 * and the new entry slides in on top. Below `xl` the pieces stack. Reduced motion shows the
 * manager's access, finished. Timing: `.loop-hub-*`, `.loop-tri-*` and `.loop-access-*`.
 */
export const GovernanceIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = accessCopy[locale === 'en' ? 'en' : 'de']

  return (
    <Scene className={cn('w-full', className)} label={c.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="relative flex flex-col items-center xl:block xl:aspect-[2/1]">
        {/* Desktop wiring: solid structure, dotted access, lines that draw per exchange. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full xl:block" viewBox="0 0 200 100">
          {structurePaths.map((d, i) => (
            <path className="scene-wire" d={d} fill="none" key={d} pathLength={1} stroke="var(--line-strong)" strokeLinejoin="round" strokeWidth="0.4" style={{ '--build': `${0.3 + i * 0.05}s` } as React.CSSProperties} />
          ))}
          <path className="scene-wire" d={auditPath} fill="none" pathLength={1} stroke="var(--line-strong)" strokeLinejoin="round" strokeWidth="0.4" style={{ '--build': '0.55s' } as React.CSSProperties} />
          <g className="scene-fade" style={{ '--build': '0.6s' } as React.CSSProperties}>
            {idleAccess.map((d) => (
              <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
            ))}
          </g>
          {people.map((person, slot) => (
            <g key={slot}>
              {person.reach.map((space, k) => (
                <React.Fragment key={space}>
                  <path className="loop-hub-draw" d={accessPath(slot, space)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.45" style={slotDelay(slot, k * 0.08)} />
                  <path className="loop-hub-comet" d={accessPath(slot, space)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.9" style={slotDelay(slot, k * 0.08)} />
                </React.Fragment>
              ))}
              <path
                className="loop-hub-comet-out"
                d={auditPath}
                fill="none"
                pathLength={1}
                stroke="var(--brand-yellow)"
                strokeLinecap="round"
                strokeWidth="0.9"
                style={{ ...slotDelay(slot, AUDIT_AT), '--comet': 0.1, '--comet-from': 0.15 } as React.CSSProperties}
              />
            </g>
          ))}
        </svg>

        {/* The organisation */}
        <div className={cn('relative z-10 w-full max-w-md xl:w-[30%] xl:max-w-none', AT)} style={pos(ORG)}>
          <div className="scene-build" style={build(0)}>
            <div className="flex items-center gap-3 rounded-[0.875rem] border border-line-strong bg-surface-2 px-3.5 py-2.5 shadow-float">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                <BrandBars size={15} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate type-small font-medium leading-5 text-ink">{c.org}</span>
                <span className="truncate type-caption leading-4 text-ink-3">{c.orgNote}</span>
              </span>
              <Chip className="shrink-0 whitespace-nowrap" tone="yellow">
                <ShieldCheck aria-hidden="true" size={11} strokeWidth={2} /> {c.policy}
              </Chip>
            </div>
          </div>
        </div>

        <Connector className="h-7 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* Spaces */}
        <div className="grid w-full max-w-md gap-2 xl:contents">
          {spaces.map((space, i) => (
            <div className={cn('relative z-10 xl:w-[20%]', AT)} key={space.name} style={pos({ x: space.x, y: SPACE_Y })}>
              <div className="scene-build-in" style={{ ...build(1 + i), '--from-y': '-6px' } as React.CSSProperties}>
                <div className="relative flex flex-col gap-2 rounded-[0.875rem] border border-line-strong bg-surface-2 p-3 shadow-card">
                  {people.map((person, slot) =>
                    person.reach.includes(i) ? <Lit key={slot} slot={slot} stagger={0.4 + person.reach.indexOf(i) * 0.08} /> : null,
                  )}
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white" title={space.pms}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
                      <img alt="" className="size-5 object-contain" height={20} src={space.logo} width={20} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate type-small font-medium leading-5 text-ink">{space.name}</span>
                      <span className="truncate type-caption leading-4 text-ink-3">
                        {c.space} · {space.pms}
                      </span>
                    </span>
                    {/* Phones: the grant sits beside the name; on the stage it sits on the wire. */}
                    <span className="ml-auto grid justify-items-end xl:hidden">{grants(i)}</span>
                  </div>
                  <span className="hidden items-center gap-1.5 type-caption text-ink-3 xl:flex">
                    <Lock aria-hidden="true" className="shrink-0" size={11} strokeWidth={2} />
                    <span className="truncate">{c.guestData}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grants on the wires into each space (stage only). */}
        {spaces.map((space, i) => (
          <div className={cn('z-10 hidden justify-items-center xl:grid', AT)} key={space.name} style={pos({ x: space.x, y: GRANT_Y })}>
            {grants(i)}
          </div>
        ))}

        <Connector className="h-7 w-3 shrink-0 rotate-180 xl:hidden" color="var(--brand-yellow)" />

        {/* People and tokens */}
        <div className="grid w-full max-w-md gap-2 xl:contents">
          {people.map((person, slot) => {
            const who = c.people[slot]
            return (
              <div className={cn('relative z-10 xl:w-[20%]', AT)} key={who.name} style={pos({ x: person.x, y: PEOPLE_Y })}>
                <div className="scene-build-in" style={{ ...build(4 + slot), '--from-y': '6px' } as React.CSSProperties}>
                  <div className="relative flex items-center gap-2.5 rounded-[0.875rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-card">
                    <Lit slot={slot} />
                    {person.initials ? (
                      <Avatar className="size-8 shrink-0" initials={person.initials} tone={person.tone} />
                    ) : (
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-2">
                        <KeyRound aria-hidden="true" size={14} strokeWidth={1.75} />
                      </span>
                    )}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate type-small font-medium leading-5 text-ink">{who.name}</span>
                      <span className="truncate type-caption leading-4 text-ink-3">{who.role}</span>
                    </span>
                    {/* People sign in with the organisation's 2FA policy while they act; tokens do not. */}
                    {person.initials && (
                    <span
                      className="loop-tri-show inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-deep"
                      data-slot={slot}
                      style={tri((s) => (s === slot ? 1 : 0), SIGN_IN_AT)}
                      title={c.policy}
                    >
                      <ShieldCheck aria-hidden="true" size={13} strokeWidth={2} />
                    </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <Connector className="h-7 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* Audit log */}
        <div className="relative z-10 w-full max-w-md xl:absolute xl:left-(--x) xl:top-(--y) xl:w-[25%] xl:max-w-none xl:-translate-x-1/2" style={pos(LOG)}>
          <div className="scene-build-in" style={{ ...build(7), '--from-x': '8px', '--from-y': '0px' } as React.CSSProperties}>
            <div className="overflow-hidden rounded-[0.875rem] border border-line-strong bg-surface-2 shadow-float">
              <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
                <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
                  <ScrollText aria-hidden="true" className="text-brand-blue" size={13} strokeWidth={1.75} /> {c.audit}
                </span>
                <span className="type-caption tnum text-ink-3">{c.retention}</span>
              </div>
              <div className="relative h-[8.25rem] overflow-hidden">
                {c.log.map((entry, slot) => (
                  <div
                    className="loop-access-row absolute inset-x-0 top-0 h-11 px-2"
                    data-slot={slot}
                    key={entry.who}
                    style={
                      {
                        ...slotDelay(slot, LOG_AT - LOOP),
                        '--rest': [0, 2, 1][slot],
                      } as React.CSSProperties
                    }
                  >
                    <LogRow entry={entry} fresh={slotDelay(slot, LOG_AT - LOOP)} />
                  </div>
                ))}
                {/* Ages belong to the places, newest on top; the entries slide beneath them. */}
                {c.ages.map((age, rank) => (
                  <span className="absolute right-3.5 flex h-11 items-center type-caption tnum text-ink-3" key={age} style={{ top: `${rank * 2.75}rem` }}>
                    {age}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  )

  /** The role (or scope) an identity has in space `space`, crossfading with each exchange. */
  function grants(space: number) {
    return people.map((person, slot) =>
      person.reach.includes(space) ? (
        <span
          className="loop-tri-show [grid-area:1/1]"
          data-slot={slot}
          key={slot}
          style={tri((s) => (s === slot ? 1 : 0), GRANT_AT)}
        >
          <Chip className={cn('whitespace-nowrap', grantTones[slot] === 'neutral' && 'bg-surface-3')} tone={grantTones[slot]}>
            {c.grants[slot]}
          </Chip>
        </span>
      ) : null,
    )
  }
}

const LogRow: React.FC<{ entry: { who: string; what: string }; fresh: React.CSSProperties }> = ({ entry, fresh }) => (
  <div className="relative flex h-full items-center rounded-lg pl-1.5 pr-24">
    <span aria-hidden="true" className="loop-access-new absolute inset-x-0 inset-y-1 rounded-lg bg-brand-blue-soft" style={fresh} />
    <span className="relative flex min-w-0 flex-1 flex-col">
      <span className="truncate type-caption font-medium leading-4 text-ink">{entry.who}</span>
      <span className="truncate type-caption leading-4 text-ink-3">{entry.what}</span>
    </span>
  </div>
)
