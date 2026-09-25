import { Check, LayoutDashboard, Mail } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { ResiMark, ResiName } from '@/components/Resi'
import type { Locale } from '@/i18n/config'
import { cn } from '@/utilities/ui'

import { studioCopyFor } from './copy/studio'
import { Scene } from './Scene'
import { Connector, Lit, build, curve, elbow, pos, slotDelay, type Pt } from './stage'
import type { IllustrationProps } from './index'

/*
 * Desktop stage: 200 × 100 units on a 2 : 1 box that is its own inline-size container, so one
 * unit is 0.5cqw both ways. The definition card sizes its header and code lines in cqw, which
 * lets the wires from the schema land exactly on the operand lines they feed.
 */
const CARD: Pt = { x: 63, y: 8 }
const CARD_W = 74
const HEAD = 9
const PAD = 2.6
const LH = 3.4
const lineY = (i: number) => CARD.y + HEAD + PAD + (i + 0.5) * LH

/** The definition, as saved in KPI Studio; line 10 is the edit of this version. */
const code: { text: React.ReactNode; edit?: boolean }[] = [
  { text: '{' },
  { text: <>{'  '}<K>&quot;$project&quot;</K>: [{'{'}</> },
  { text: <>{'    '}<K>&quot;$fn&quot;</K>: <S>&quot;div&quot;</S>,</> },
  { text: <>{'    '}<K>&quot;$operands&quot;</K>: [</> },
  { text: <>{'      '}<S>&quot;sum(net_revenue)&quot;</S>,</> },
  { text: <>{'      '}<S>&quot;rooms_available&quot;</S></> },
  { text: '    ],' },
  { text: <>{'    '}<K>&quot;$as&quot;</K>: <S>&quot;value&quot;</S></> },
  { text: '  }],' },
  { text: <>{'  '}<K>&quot;$from&quot;</K>: <S>&quot;hotel_data_source.reservation&quot;</S>,</> },
  { text: <>{'  '}<K>&quot;$where&quot;</K>: {'{ '}<K>&quot;$ne&quot;</K>: [<S>&quot;status&quot;</S>, <S>&quot;cancelled&quot;</S>] {'}'}</>, edit: true },
  { text: '}' },
]
const EDIT_LINE = 10

/** Schema fields on the left and the code line each one feeds; `slots` are the exchanges that read it. */
const fields: { y: number; line: number; bend: number; slots: number[] }[] = [
  { y: 29, line: 4, bend: 57, slots: [1] },
  { y: 46, line: 5, bend: 53, slots: [1] },
  { y: 63, line: EDIT_LINE, bend: 55, slots: [0, 1] },
]
const SOURCE: Pt = { x: 9, y: 14 }
/** Fields hang off the table as a small tree: trunk at `TRUNK`, chips indented to `FIELD_X`. */
const TRUNK = 12
const FIELD_X = 15
const FIELD_W = 34

/** Consumers on the right; every line leaves the card at one point and fans out. */
const consumers: Pt[] = [
  { x: 151, y: 16 },
  { x: 151, y: 38 },
  { x: 151, y: 60 },
  { x: 151, y: 82 },
]
const EXIT: Pt = { x: CARD.x + CARD_W, y: 48 }
const FAN = 144

const fieldPath = (i: number) => elbow({ x: FIELD_X + FIELD_W, y: fields[i].y }, { x: CARD.x, y: lineY(fields[i].line) }, fields[i].bend)
const consumerPath = (i: number) => elbow(EXIT, { x: consumers[i].x, y: consumers[i].y }, FAN)

/** Top-left placement on the stage, only from `xl`. */
const AT = 'xl:absolute xl:left-(--x) xl:top-(--y)'
/** Centred vertically on its point (tiles and consumer cards). */
const AT_MID = cn(AT, 'xl:-translate-y-1/2')

/** RevPAR over the last twelve months: v1.1 counted cancelled stays, v1.2 does not. */
const before = [40, 46, 43, 52, 58, 66, 62, 72, 78, 70, 82, 90]
const after = [30, 35, 33, 40, 45, 52, 48, 57, 62, 55, 66, 72]

function K({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-2">{children}</span>
}
function S({ children }: { children: React.ReactNode }) {
  return <span className="text-ink">{children}</span>
}

/** A euro amount whose number is a counter (`--kpi-n`), so it can roll from 124 to 119. */
const Euro: React.FC<{ locale?: Locale | null; className: string }> = ({ locale, className }) =>
  locale === 'en' ? (
    <span className="tnum">
      €<span className={className} />
    </span>
  ) : (
    <span className="tnum">
      <span className={className} /> €
    </span>
  )

/** v1.1 until the release reaches the consumer, then v1.2. */
const Version: React.FC = () => (
  <span className="grid shrink-0 rounded-md border border-line px-1.5 font-mono text-[0.625rem] leading-4 text-ink-3">
    <span className="loop-kpi-old [grid-area:1/1]">v1.1</span>
    <span className="loop-kpi-new [grid-area:1/1] text-ink">v1.2</span>
  </span>
)

/** Ring that lights once the release line arrives (blue; Resi's own card in her mint). */
const Arrive: React.FC<{ resi?: boolean }> = ({ resi = false }) => (
  <span
    aria-hidden="true"
    className={cn('loop-hub-glow pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2', resi ? 'border-resi-mint' : 'border-brand-blue')}
    data-slot={2}
    style={{ ...slotDelay(2), ...(resi ? {} : { '--glow': 'var(--brand-blue)' }) } as React.CSSProperties}
  />
)

/**
 * Hero scene of KPI Studio: one RevPAR definition, the same number everywhere. The schema of
 * the data source sits left, wired into the operand lines of the definition in the middle;
 * dashboard, Resi, Claude (through MCP) and the Monday digest sit right. Exchange 1: the
 * `status` field lights and the `$where` line that excludes cancellations is typed. Exchange
 * 2: the dry run reads all three fields, the checks tick and the preview rolls from 124 € to
 * 119 €, matching the finance report. Exchange 3: v1.2 is released, one line fans out to all
 * four consumers and each rolls to 119 € with the new version at the same moment. Below `xl`
 * the pieces stack. Reduced motion shows the release. Timing: `loop-kpi-*` in scenes/studio.css
 * plus the shared `.loop-hub-*` wiring.
 */
export const KpiStudioIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const c = studioCopyFor(locale)

  const consumer = (i: number, children: React.ReactNode, resi = false) => (
    <div className={cn('scene-build-in relative w-full xl:w-[22%]', AT_MID)} key={i} style={{ ...pos(consumers[i]), ...build(3 + i * 0.8), '--from-x': '-10px', '--from-y': '0px' } as React.CSSProperties}>
      <div className="hub-float" style={{ '--float-delay': `${-i * 1.9}s` } as React.CSSProperties}>
        <div className="relative rounded-[0.875rem] border border-line-strong bg-surface-2 px-3 py-2.5 shadow-float">
          <Arrive resi={resi} />
          {children}
        </div>
      </div>
    </div>
  )

  return (
    <Scene className={cn('scene-studio w-full', className)} label={c.label} lead={0.9}>
      <div className="relative flex flex-col items-center xl:block xl:aspect-[2/1] xl:[container-type:inline-size]">
        {/* Desktop wiring: dotted idle lines; per exchange the read lines draw in, the release fans out. */}
        <svg aria-hidden="true" className="absolute inset-0 hidden size-full xl:block" viewBox="0 0 200 100">
          <g className="scene-fade" style={build(2)}>
            <path d={`M ${TRUNK} ${SOURCE.y + 5} V ${fields[fields.length - 1].y} ${fields.map((f) => `M ${TRUNK} ${f.y} H ${FIELD_X}`).join(' ')}`} fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.35" />
            {[...fields.map((_, i) => fieldPath(i)), ...consumers.map((_, i) => consumerPath(i))].map((d) => (
              <path className="hub-dots" d={d} fill="none" key={d} stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="0.45" />
            ))}
          </g>
          {fields.map((f, i) =>
            f.slots.map((slot) => (
              <React.Fragment key={`${i}-${slot}`}>
                <path className="loop-hub-draw" d={fieldPath(i)} data-slot={slot} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(slot, i * 0.08)} />
                <path className="loop-hub-comet" d={fieldPath(i)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(slot, i * 0.08)} />
              </React.Fragment>
            )),
          )}
          {consumers.map((_, i) => (
            <React.Fragment key={i}>
              <path className="loop-hub-draw-out" d={consumerPath(i)} data-slot={2} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinejoin="round" strokeWidth="0.4" style={slotDelay(2)} />
              <path className="loop-hub-comet-out" d={consumerPath(i)} fill="none" pathLength={1} stroke="var(--brand-yellow)" strokeLinecap="round" strokeWidth="0.8" style={slotDelay(2)} />
            </React.Fragment>
          ))}
        </svg>

        {/* Schema: the table and the three fields the definition reads. */}
        <div className="flex w-full max-w-md flex-col gap-2 xl:contents">
          <div className={cn('scene-build-in relative xl:w-[18.5%]', AT_MID)} style={{ ...pos(SOURCE), ...build(3.4), '--from-x': '10px', '--from-y': '0px' } as React.CSSProperties}>
            <div className="relative flex items-center gap-2.5 rounded-[0.75rem] border border-line-strong bg-surface-2 px-2.5 py-2 shadow-card">
              <Lit slot={1} stagger={-0.1} />
              <span className="flex size-8 shrink-0 items-center justify-center rounded-[0.5rem] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element -- static catalogue mark, sized by CSS */}
                <img alt="" className="size-5 object-contain" height={20} src="/integrations/mews.webp" width={20} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-mono text-[0.75rem] leading-4 text-ink">{c.table}</span>
                <span className="truncate type-caption leading-4 text-ink-3">
                  {c.source} · {c.rows}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3 xl:contents">
            {fields.map((f, i) => (
              <div className={cn('scene-build-in relative xl:w-[17%]', AT_MID)} key={f.line} style={{ ...pos({ x: FIELD_X, y: f.y }), ...build(2 + i * 0.6), '--from-x': '10px', '--from-y': '0px' } as React.CSSProperties}>
                <div className="hub-float" style={{ '--float-delay': `${-i * 2.2}s` } as React.CSSProperties}>
                  <div className="relative flex items-center justify-between gap-2 rounded-[0.625rem] border border-line-strong bg-surface-2 px-2.5 py-1.5 shadow-card">
                    {f.slots.map((slot) => (
                      <Lit key={slot} slot={slot} stagger={i * 0.08} />
                    ))}
                    <span className="truncate font-mono text-[0.75rem] leading-5 text-ink">{c.fields[i].name}</span>
                    <span className="shrink-0 font-mono text-[0.625rem] leading-5 text-ink-3">{c.fields[i].type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <span className={cn('scene-fade hidden px-1 type-caption text-ink-3 xl:block', AT)} style={{ ...pos({ x: FIELD_X, y: 72 }), ...build(4.5) }}>
            {c.dims}
          </span>
        </div>

        <Connector className="h-8 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" />

        {/* Definition */}
        <div className={cn('scene-build relative z-10 w-full max-w-md xl:w-[37%] xl:max-w-none', AT)} style={{ ...pos(CARD), ...build(0) }}>
          <div className="relative rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
            <Lit slot={2} />

            <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5 xl:h-[4.5cqw] xl:py-0">
              <BrandBars size={12} />
              <span className="type-caption font-medium text-ink-2">{c.studio}</span>
              <span className="truncate rounded-md bg-surface px-1.5 font-mono text-[0.6875rem] leading-5 text-ink-2">revpar.v1.2.json</span>
              <span className="ml-auto grid shrink-0 justify-items-end">
                <span className="loop-kpi-draft inline-flex items-center gap-1 rounded-pill bg-surface-3 px-2 text-[0.6875rem] font-medium leading-5 text-ink-2 [grid-area:1/1]">
                  <i className="size-1.5 rounded-full bg-brand-yellow" /> {c.draft}
                </span>
                <span className="loop-kpi-live inline-flex items-center gap-1 rounded-pill bg-success-soft px-2 text-[0.6875rem] font-medium leading-5 text-success-deep [grid-area:1/1]">
                  <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {c.released}
                </span>
              </span>
            </div>

            <pre className="m-0 overflow-hidden px-3.5 py-3 font-mono text-[0.625rem] leading-[1.125rem] text-ink-3 sm:text-[0.6875rem] xl:py-[1.3cqw] xl:leading-[1.7cqw]">
              {code.map((line, i) => (
                <span className="relative -mx-1.5 block whitespace-pre rounded-[4px] px-1.5" key={i}>
                  {(i === 4 || i === 5) && <i aria-hidden="true" className="loop-kpi-hl absolute inset-0 rounded-[inherit] border-l-2 border-brand-blue bg-brand-blue-soft/70" data-slot={1} style={slotDelay(1)} />}
                  {line.edit && <i aria-hidden="true" className="loop-kpi-hl absolute inset-0 rounded-[inherit] border-l-2 border-brand-yellow bg-brand-yellow-soft/50" data-slot={0} style={slotDelay(0)} />}
                  <span className="relative mr-3 inline-block w-4 select-none text-right text-ink-3/50">{i + 1}</span>
                  <span className={cn('relative', line.edit && 'loop-kpi-type inline-block align-top')}>{line.text}</span>
                </span>
              ))}
            </pre>

            {/* Dry run: three checks and the preview against the previous version. */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-t border-line px-3.5 py-3">
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="type-caption text-ink-3">{c.dryRun}</span>
                <ul className="flex flex-col gap-1">
                  {c.checks.map((check, i) => (
                    <li className="loop-kpi-row flex items-center gap-2 type-caption text-ink" key={check} style={{ '--delay': `${i * 0.4}s` } as React.CSSProperties}>
                      <span className="relative flex size-3.5 shrink-0 items-center justify-center rounded-full border border-line-strong">
                        <span className="loop-kpi-check absolute inset-[-1px] flex items-center justify-center rounded-full bg-success-soft text-success-deep" style={{ '--delay': `${i * 0.4}s` } as React.CSSProperties}>
                          <Check aria-hidden="true" size={9} strokeWidth={3} />
                        </span>
                      </span>
                      <span className="truncate">{check}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-[8.5rem] flex-col gap-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="type-caption text-ink-3">{c.preview}</span>
                  <span className="font-display text-xl font-medium leading-none text-ink">
                    <Euro className="loop-kpi-roll" locale={locale} />
                  </span>
                </span>
                <svg aria-hidden="true" className="h-9 w-full" viewBox="0 0 136 36">
                  {[12, 24].map((y) => (
                    <line key={y} stroke="var(--line)" strokeWidth="0.5" x1="0" x2="136" y1={y} y2={y} />
                  ))}
                  <path d={curve(before, 136, 36)} fill="none" stroke="var(--ink-3)" strokeDasharray="2 2.5" strokeLinecap="round" strokeWidth="1.25" />
                  <path className="loop-kpi-trace" d={curve(after, 136, 36)} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="2" />
                </svg>
                <span className="flex items-center justify-between type-caption leading-4 text-ink-3">
                  <span className="flex items-center gap-1.5">
                    <i className="w-3 border-t-[1.5px] border-dashed border-ink-3" /> {c.previous}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <i className="h-0.5 w-3 rounded-full bg-brand-blue" /> v1.2
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <Connector className="h-8 w-3 shrink-0 xl:hidden" color="var(--brand-yellow)" out />

        {/* Consumers: the same number in four places. */}
        <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2 xl:contents">
          {consumer(
            0,
            <>
              <span className="flex items-center gap-1.5 type-caption text-ink-3">
                <LayoutDashboard aria-hidden="true" className="shrink-0" size={12} strokeWidth={1.75} />
                <span className="truncate">{c.consumers.dashboard.title}</span>
                <span className="ml-auto" />
                <Version />
              </span>
              <span className="mt-1.5 flex items-end justify-between gap-2">
                <span className="flex flex-col">
                  <span className="type-caption leading-4 text-ink-3">{c.consumers.dashboard.kpi}</span>
                  <span className="font-display text-lg font-medium leading-6 text-ink">
                    <Euro className="loop-kpi-roll-out" locale={locale} />
                  </span>
                </span>
              </span>
            </>,
          )}
          {consumer(
            1,
            <>
              <span className="flex items-center gap-1.5 type-caption">
                <ResiMark size={16} />
                <ResiName className="font-medium" />{' '}
                <span className="ml-auto" />
                <Version />
              </span>
              <p className="mt-1.5 type-caption leading-4 text-ink-2 pretty">
                {c.consumers.resi.before}{' '}
                <span className="font-medium text-ink">
                  <Euro className="loop-kpi-roll-out" locale={locale} />
                </span>{' '}
                {c.consumers.resi.after}
              </p>
            </>,
            true,
          )}
          {consumer(
            2,
            <>
              <span className="flex items-center gap-1.5 type-caption text-ink-3">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static vendor mark */}
                  <img alt="" className="size-2.5" height={10} src="/clients/claude.svg" width={10} />
                </span>
                <span className="truncate">{c.consumers.claude.title}</span>
                <span className="ml-auto" />
                <Version />
              </span>
              <span className="mt-1.5 flex items-center gap-1.5 whitespace-nowrap font-mono text-[0.6875rem] leading-5">
                <span className="text-ink-2">get_kpi(&quot;revpar&quot;)</span>
                <span className="text-ink-3">→</span>
                <span className="text-ink">
                  <span className="loop-kpi-roll-out tnum" />
                </span>
              </span>
            </>,
          )}
          {consumer(
            3,
            <>
              <span className="flex items-center gap-1.5 type-caption text-ink-3">
                <Mail aria-hidden="true" className="shrink-0" size={12} strokeWidth={1.75} />
                <span className="truncate">{c.consumers.digest.title}</span>
                <span className="ml-auto" />
                <Version />
              </span>
              <span className="mt-1.5 flex items-baseline justify-between gap-2">
                <span className="type-caption text-ink-2">{c.consumers.digest.kpi}</span>
                <span className="font-display text-base font-medium text-ink">
                  <Euro className="loop-kpi-roll-out" locale={locale} />
                </span>
              </span>
            </>,
          )}
        </div>
      </div>
    </Scene>
  )
}
