import { Check, Lock, Mail, Users } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'

import { Avatar, Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import { Connector, LOOP, SLOTS, pos, slotDelay, type Pt } from './stage'
import type { IllustrationProps } from './index'

/*
 * Stage from `lg`: a 200 × 90 coordinate system on a 20 : 9 box, so SVG units and CSS
 * percentages line up and no stroke is stretched.
 */
const W = 200
const H = 90
const CONSOLE: Pt = { x: 26, y: 45 }
const CONSOLE_RIGHT = 52
const JOIN: Pt = { x: 100, y: 45 }
const CHANNELS: Pt[] = [
  { x: 90, y: 12 },
  { x: 110, y: 12 },
]
const PMS: Pt = { x: 100, y: 79 }
/** Half a 3 rem tile in stage units. */
const TILE_R = 4.4
const REPORT: Pt = { x: 163, y: 45 }
const REPORT_LEFT = 126

type Brand = { name: string; logo: string }
type Client = {
  /** The client's CI colour: tints the stage while the agency works in their space. */
  tint: string
  mark: string
  stripe: string
  channels: [Brand & { share: number }, Brand & { share: number }]
  pms: Brand
  spend: string
  bookings: number
  revenue: string
  roas: string
}

const googleAds = { name: 'Google Ads', logo: '/integrations/google_ads.webp' }
const meta = { name: 'Meta', logo: '/integrations/meta_ads.svg' }

/** Demo figures for three clients; identical in every language. */
const clients: Client[] = [
  {
    tint: 'var(--brand-coral)',
    mark: 'bg-brand-coral-soft text-brand-coral',
    stripe: 'bg-brand-coral',
    channels: [
      { ...googleAds, share: 0.64 },
      { ...meta, share: 0.36 },
    ],
    pms: { name: 'Mews', logo: '/integrations/mews.webp' },
    spend: '3.200 €',
    bookings: 118,
    revenue: '41.300 €',
    roas: '12,9×',
  },
  {
    tint: 'var(--brand-blue)',
    mark: 'bg-brand-blue-soft text-brand-blue-deep',
    stripe: 'bg-brand-blue',
    channels: [
      { ...googleAds, share: 0.71 },
      { name: 'Microsoft Ads', logo: '/integrations/microsoft_advertising.svg', share: 0.29 },
    ],
    pms: { name: 'apaleo', logo: '/integrations/apaleo.png' },
    spend: '5.900 €',
    bookings: 96,
    revenue: '38.700 €',
    roas: '6,6×',
  },
  {
    tint: 'var(--brand-yellow)',
    mark: 'bg-brand-yellow-soft text-brand-yellow',
    stripe: 'bg-brand-yellow',
    channels: [
      { ...meta, share: 0.58 },
      { name: 'Newsletter', logo: '/integrations/inxmail.png', share: 0.42 },
    ],
    pms: { name: 'ASA', logo: '/integrations/asa_hotelsoftware.svg' },
    spend: '1.400 €',
    bookings: 74,
    revenue: '19.800 €',
    roas: '14,1×',
  },
]

/** Three values for the `loop-tri-*` classes, one per exchange (= client). */
const tri = (pick: (slot: number) => string | number, delay = 0): React.CSSProperties =>
  ({
    ...Object.fromEntries(Array.from({ length: SLOTS }, (_, slot) => [`--s${slot}`, pick(slot)])),
    '--delay': `${delay}s`,
  }) as React.CSSProperties
const only = (slot: number) => (s: number) => (s === slot ? 1 : 0)

/** Within each exchange: switch client, data draws in, the join counts, the report goes out. */
const SWITCH_AT = 0.2
const COUNT_AT = 1.3
const REPORT_AT = 2.0

const consolePath = `M ${CONSOLE_RIGHT} ${JOIN.y} H ${JOIN.x}`
const channelPath = (i: number) => `M ${CHANNELS[i].x} ${CHANNELS[i].y + TILE_R} V ${JOIN.y}`
const pmsPath = `M ${PMS.x} ${PMS.y - TILE_R} V ${JOIN.y}`
const inPaths = [channelPath(0), channelPath(1), pmsPath]
const outPath = `M ${JOIN.x} ${JOIN.y} H ${REPORT_LEFT}`

const AT = 'lg:absolute lg:left-(--x) lg:top-(--y) lg:-translate-x-1/2 lg:-translate-y-1/2'
const at = (p: Pt) => pos(p, W, H)

/** Ring in the client's colour while exchange `slot` reads this piece. */
const TintLit: React.FC<{ slot: number; stagger?: number }> = ({ slot, stagger = 0 }) => (
  <span
    aria-hidden="true"
    className="loop-hub-lit pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 border-(--tint)"
    data-slot={slot}
    style={{ ...slotDelay(slot, stagger), '--glow': 'var(--tint)' } as React.CSSProperties}
  />
)

const Logo: React.FC<{ brand: Brand; className?: string; style?: React.CSSProperties }> = ({ brand, className, style }) => (
  // eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS
  <img alt="" className={cn('object-contain', className)} height={28} src={brand.logo} style={style} title={brand.name} width={28} />
)

/**
 * Looping scene (wide), 12 s: an agency's one login, three clients in turn. Lena's console on
 * the left selects a client and the whole stage takes on that client's colour (rose, blue,
 * yellow). The client's campaign channels draw down and its PMS draws up into the join, which
 * counts the bookings the campaigns brought; one line carries the result to the client's
 * monthly report on the right, in the client's branding, which lands with the client's reply.
 * Below `lg` the pieces stack. Reduced motion shows the first client, finished.
 * Timing: `.loop-hub-*`, `.loop-tri-*` and `.loop-late` in loops.css.
 */
export const CampaignsIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const a = l.scenes.agency

  return (
    <Frame className={cn('loop loop-agency w-full', className)} label={a.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div
        className="loop-tri-tint relative flex flex-col items-center lg:block lg:aspect-[20/9]"
        style={tri((slot) => clients[slot].tint, SWITCH_AT)}
      >
        {/* Stage wiring */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full lg:block" viewBox={`0 0 ${W} ${H}`}>
          {[consolePath, ...inPaths, outPath].map((d) => (
            <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
          ))}
          {clients.map((_, slot) => (
            <g key={slot}>
              <path className="loop-hub-draw" d={consolePath} data-slot={slot} fill="none" pathLength={1} stroke="var(--tint)" strokeWidth="0.45" style={slotDelay(slot, -0.6)} />
              {inPaths.map((d, k) => (
                <React.Fragment key={d}>
                  <path className="loop-hub-draw" d={d} data-slot={slot} fill="none" pathLength={1} stroke="var(--tint)" strokeWidth="0.45" style={slotDelay(slot, k * 0.1)} />
                  <path className="loop-hub-comet" d={d} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="0.9" style={{ ...slotDelay(slot, k * 0.1), '--comet': 0.25 } as React.CSSProperties} />
                </React.Fragment>
              ))}
              <path className="loop-hub-draw-out" d={outPath} data-slot={slot} fill="none" pathLength={1} stroke="var(--tint)" strokeWidth="0.45" style={slotDelay(slot, 0.2)} />
              <path className="loop-hub-comet-out" d={outPath} fill="none" pathLength={1} stroke="var(--ink)" strokeLinecap="round" strokeWidth="0.9" style={{ ...slotDelay(slot, 0.2), '--comet': 0.2 } as React.CSSProperties} />
            </g>
          ))}
        </svg>

        {/* The agency's console: one login, every client in its own space */}
        <div className={cn('relative z-10 w-full max-w-md lg:w-[26%] lg:max-w-none', AT)} style={at(CONSOLE)}>
          <div className="rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
              <Avatar className="size-7 text-[0.6875rem]" initials={a.who[0]} tone="blue" />
              <span className="flex flex-col">
                <span className="type-small font-medium leading-4 text-ink">{a.who}</span>
                <span className="type-caption leading-4 text-ink-3">{a.role}</span>
              </span>
            </div>
            <div className="p-2">
              <div className="relative">
                {/* Selection: slides to the client of this exchange, its rail in the client's colour. */}
                <span className="loop-tri-y absolute inset-x-0 top-0 h-11" style={tri((slot) => slot, SWITCH_AT)}>
                  <span className="relative block size-full rounded-[0.625rem] bg-surface-3">
                    <span className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-(--tint)" />
                  </span>
                </span>
                {a.clients.map((name, i) => (
                  <div className="relative flex h-11 items-center gap-2.5 px-3" key={name}>
                    <span className={cn('inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[0.6875rem] font-semibold', clients[i].mark)}>
                      {name.replace('Hotel ', '')[0]}
                    </span>
                    <span className="min-w-0 flex-1 truncate type-small font-medium text-ink">{name}</span>
                    <Lock aria-hidden="true" className="shrink-0 text-ink-3" size={12} strokeWidth={1.75} />
                  </div>
                ))}
                <div className="flex h-9 items-center gap-2.5 px-3 type-caption text-ink-3">
                  <Users aria-hidden="true" className="ml-1" size={13} strokeWidth={1.75} />
                  {a.more}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--tint)" />

        {/* The client's campaign channels and PMS */}
        <div className="flex gap-4 lg:contents">
          {[...CHANNELS, PMS].map((p, k) => (
            <div className={cn('relative z-10', AT)} key={k} style={at(p)}>
              <div className="hub-float" style={{ '--float-delay': `${-k * 1.9}s` } as React.CSSProperties}>
                <span className="relative grid size-12 place-items-center rounded-[0.75rem] border border-line-strong bg-white shadow-card">
                  {clients.map((_, slot) => (
                    <TintLit key={slot} slot={slot} stagger={k * 0.1} />
                  ))}
                  {clients.map((c, slot) => (
                    <Logo
                      brand={k < 2 ? c.channels[k] : c.pms}
                      className="loop-tri-show size-7 [grid-area:1/1]"
                      key={slot}
                      style={tri(only(slot), SWITCH_AT)}
                    />
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--tint)" />

        {/* The join: bookings that campaigns brought, and their return */}
        <div className={cn('relative z-10 w-44 lg:w-[18%]', AT)} style={at(JOIN)}>
          <div className="relative flex flex-col gap-2 rounded-[1rem] border border-line-strong bg-surface-2 px-3.5 py-3 shadow-float">
            {clients.map((_, slot) => (
              <TintLit key={slot} slot={slot} stagger={0.35} />
            ))}
            <span className="type-caption leading-4 text-ink-3">{a.join}</span>
            <span className="grid">
              {clients.map((c, slot) => (
                <span className="loop-tri-show flex flex-col [grid-area:1/1]" key={slot} style={tri(only(slot), COUNT_AT)}>
                  <span className="loop-hub-tick font-display text-2xl font-medium leading-none tnum text-ink" style={{ ...slotDelay(slot, -LOOP), '--hub-to': c.bookings } as React.CSSProperties} />
                  <span className="mt-1 type-caption leading-4 text-ink-3">{a.bookings}</span>
                </span>
              ))}
            </span>
            <span className="flex items-center justify-between gap-2 border-t border-line pt-2 type-caption text-ink-3">
              ROAS
              <span className="grid justify-items-end">
                {clients.map((c, slot) => (
                  <span className="loop-tri-show font-medium tnum text-(--tint) [grid-area:1/1]" key={slot} style={tri(only(slot), COUNT_AT + 0.3)}>
                    {c.roas}
                  </span>
                ))}
              </span>
            </span>
          </div>
        </div>

        <Connector className="h-9 w-3 shrink-0 lg:hidden" color="var(--tint)" out />

        {/* The client's monthly report, in the client's colours, with their reply */}
        <div className={cn('relative z-10 w-full max-w-md lg:w-[37%] lg:max-w-none', AT)} style={at(REPORT)}>
          <div className="relative grid">
            {clients.map((_, slot) => (
              <span
                aria-hidden="true"
                className="loop-hub-glow pointer-events-none absolute -inset-[2px] z-10 rounded-[1.375rem] border-2 border-(--tint)"
                data-slot={slot}
                key={slot}
                style={{ ...slotDelay(slot, 0.3), '--glow': 'var(--tint)' } as React.CSSProperties}
              />
            ))}
            {clients.map((c, slot) => (
              <div
                className="loop-tri-show overflow-hidden rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float [grid-area:1/1]"
                key={slot}
                style={tri(only(slot), REPORT_AT)}
              >
                <span aria-hidden="true" className={cn('block h-1', c.stripe)} />
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold', c.mark)}>
                      {a.clients[slot].replace('Hotel ', '')[0]}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate type-small font-medium leading-4 text-ink">{a.clients[slot]}</span>
                      <span className="truncate type-caption leading-4 text-ink-3">{a.report}</span>
                    </span>
                  </span>
                  <Chip tone="neutral">
                    <Mail aria-hidden="true" size={11} strokeWidth={2} /> {a.byEmail}
                  </Chip>
                </div>
                <div className="flex flex-col gap-3.5 p-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: a.spend, value: c.spend },
                      { label: l.bookings, value: String(c.bookings) },
                      { label: a.revenue, value: c.revenue },
                    ].map((k) => (
                      <span className="flex flex-col gap-0.5" key={k.label}>
                        <span className="truncate type-caption text-ink-3">{k.label}</span>
                        <span className="font-display text-lg font-medium leading-tight tnum text-ink">{k.value}</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 rounded-card-inner border border-line bg-surface px-3 py-2.5">
                    {c.channels.map((ch) => (
                      <span className="grid grid-cols-[1rem_6rem_minmax(0,1fr)_2.25rem] items-center gap-2 type-caption text-ink-2" key={ch.name}>
                        <span className="inline-flex size-4 items-center justify-center rounded-[4px] bg-white">
                          <Logo brand={ch} className="size-3" />
                        </span>
                        <span className="truncate">{ch.name}</span>
                        <span className="h-1.5 rounded-full bg-surface-3">
                          <span className={cn('block h-full rounded-full', c.stripe)} style={{ width: `${ch.share * 100}%` }} />
                        </span>
                        <span className="text-right tnum text-ink-3">{Math.round(ch.share * 100)} %</span>
                      </span>
                    ))}
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <span className="loop-late flex max-w-[78%] items-end gap-2" style={slotDelay(slot, 0.5 - LOOP)}>
                      <span className={cn('inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-semibold', c.mark)}>
                        {a.clients[slot].replace('Hotel ', '')[0]}
                      </span>
                      <span className="rounded-[0.75rem] rounded-bl-sm bg-surface-3 px-3 py-2 type-caption text-ink">{a.replies[slot]}</span>
                    </span>
                    <span className="loop-late shrink-0" style={slotDelay(slot, -LOOP)}>
                      <Chip tone="neutral">
                        <Check aria-hidden="true" size={11} strokeWidth={3} /> {a.sent}
                      </Chip>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  )
}
