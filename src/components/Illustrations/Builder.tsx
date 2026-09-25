import { ArrowUp, Check, LayoutDashboard, LoaderCircle } from 'lucide-react'
import React from 'react'

import { ResiMark, ResiName, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import { curve } from './stage'
import type { IllustrationProps } from './index'

const LOOP = 10
const WIDGET_STEP = 0.3

const delay = (s: number) => ({ '--delay': `${s.toFixed(2)}s` }) as React.CSSProperties
const widgetDelay = (i: number, extra = 0) => delay(i * WIDGET_STEP + extra)

const weekly = [34, 46, 41, 58, 52, 66, 61, 78]
const plan = [60, 65, 70, 72]
const actual = [64, 58, 78, 81]
const mix = [
  { value: 54, color: 'var(--brand-blue)' },
  { value: 31, color: 'var(--brand-coral)' },
  { value: 15, color: 'var(--ink-3)' },
]
/** Donut arcs on a circle of circumference 100, each starting where the previous one ends. */
const arcs = mix.map((m, i) => ({ ...m, start: mix.slice(0, i).reduce((sum, p) => sum + p.value, 0) }))

/**
 * Looping scene (wide), 10 s: a dashboard from one sentence. The request is typed into Resi's
 * chat and sent; while a light runs around the chat she works through three steps (catalogue,
 * sources, budget), each turning from a spinner into a check. Then a pulse travels along the
 * wire for every widget and the widgets land one by one on the dashboard's empty slots, each
 * lit as it arrives: KPIs count up, the channel mix spins in, the bookings line draws, plan vs.
 * actual bars grow. A confirmation follows, everything clears and it starts again. Timing:
 * `.loop-build-*` in loops.css; reduced motion shows the finished dashboard.
 */
export const BuilderIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes
  const b = s.builder

  const widget = (i: number, label: string, children: React.ReactNode, layout?: 'wide' | 'desktop') => (
    <div className={cn('relative min-h-[6.5rem]', layout === 'wide' && 'col-span-2 md:col-span-1', layout === 'desktop' && 'hidden md:block')} key={label}>
      <span aria-hidden="true" className="absolute inset-0 rounded-card-inner border border-dashed border-line" />
      <div className="loop-build-widget relative flex h-full flex-col gap-2 rounded-card-inner border border-line bg-surface p-3" style={widgetDelay(i)}>
        <span aria-hidden="true" className="loop-build-lit pointer-events-none absolute -inset-[3px] rounded-[inherit] border-2 border-resi-mint" style={widgetDelay(i)} />
        <span className="type-caption text-ink-3">{label}</span>
        {children}
      </div>
    </div>
  )

  const kpi = (i: number, label: string, value: number, unit: string, delta: string, layout?: 'desktop') =>
    widget(
      i,
      label,
      <>
        <span className="font-display text-2xl font-medium leading-none tnum text-ink">
          <span className="loop-build-count" style={{ ...widgetDelay(i), '--hub-to': value } as React.CSSProperties} />
          {unit}
        </span>
        <span className="mt-auto type-caption font-medium tnum text-success-deep">{delta}</span>
      </>,
      layout,
    )

  return (
    <Frame className={cn('loop loop-build w-full', className)} label={b.title} style={{ '--loop': `${LOOP}s` } as React.CSSProperties}>
      <div className="grid md:grid-cols-[minmax(0,2fr)_3.5rem_minmax(0,3fr)]">
        {/* Resi's chat */}
        <div className="relative flex flex-col rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
          <span aria-hidden="true" className="loop-build-ring pointer-events-none absolute -inset-px rounded-[inherit]" />

          <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
            <ResiMark size={28} />
            <span className="flex flex-col">
              <ResiName className="type-small leading-4" />
              <span className="type-caption leading-4 text-ink-3">{s.resi.role}</span>
            </span>
          </div>

          <div className="relative flex min-h-[15rem] flex-1 flex-col gap-3 px-4 pb-12 pt-4">
            <p className="loop-build-q max-w-[88%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3 py-2 type-small text-ink">{b.prompt}</p>
            <div className="loop-build-work flex gap-2.5">
              <ResiMark className="mt-0.5" size={24} />
              <div className="flex min-w-0 flex-col gap-2">
                <span className="type-small text-ink-2">{b.intro}</span>
                <ul className="flex flex-col gap-1.5">
                  {b.steps.map((step, k) => (
                    <li className="loop-build-step flex items-center gap-2 type-caption text-ink-2" key={step} style={delay(k * 0.6)}>
                      <span className="relative grid size-4 shrink-0 place-items-center">
                        <span className="loop-build-spinner absolute inset-0 grid place-items-center text-ink-3" style={delay(k * 0.6)}>
                          <LoaderCircle aria-hidden="true" className="build-spin" size={14} strokeWidth={2} />
                        </span>
                        <span className="loop-build-check absolute inset-0 grid place-items-center rounded-full bg-success-soft text-resi-mint" style={delay(k * 0.6)}>
                          <Check aria-hidden="true" size={10} strokeWidth={3} />
                        </span>
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Chip className="loop-build-done absolute bottom-3 left-4" tone="green">
              <Check aria-hidden="true" size={11} strokeWidth={3} /> {b.done}
            </Chip>
          </div>

          <div className="p-3 pt-0">
            <div className="flex items-center gap-2 rounded-[0.875rem] border border-line bg-surface px-3.5 py-2">
              <span className="relative min-w-0 flex-1 overflow-hidden whitespace-nowrap type-small">
                <span className="loop-build-ph block text-ink-3">{withResi(s.hub.ask)}</span>
                <span className="loop-build-type absolute inset-0 text-ink">{b.prompt}</span>
              </span>
              <span className="loop-build-send inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink-3">
                <ArrowUp aria-hidden="true" size={16} strokeWidth={2.25} />
              </span>
            </div>
          </div>
        </div>

        {/* Wire: one pulse per widget */}
        <Wire />

        {/* Dashboard */}
        <div className="flex flex-col overflow-hidden rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <span className="flex items-center gap-2 type-small font-medium text-ink">
              <LayoutDashboard aria-hidden="true" className="text-resi-teal" size={15} strokeWidth={1.75} />
              {b.dashboard}
            </span>
            <Chip tone="neutral">{b.period}</Chip>
          </div>
          <div className="grid flex-1 auto-rows-fr grid-cols-2 gap-3 p-4 md:grid-cols-3">
            {kpi(0, l.occupancy, 84, ' %', `+6 ${s.vsPlan}`)}
            {kpi(1, l.adr, 142, ' €', '+3,1 %')}
            {/* Phones: two KPIs side by side, the third would sit alone. */}
            {kpi(2, l.revpar, 119, ' €', '+9,4 %', 'desktop')}
            {widget(
              3,
              s.channelMix,
              <div className="flex items-center gap-3">
                <svg aria-hidden="true" className="loop-build-spinin size-12 shrink-0 -rotate-90" style={widgetDelay(3)} viewBox="0 0 36 36">
                  {arcs.map((a) => (
                    <circle
                      cx="18"
                      cy="18"
                      fill="none"
                      key={a.color}
                      r="15.9155"
                      stroke={a.color}
                      strokeDasharray={`${a.value - 2} ${102 - a.value}`}
                      strokeDashoffset={-a.start}
                      strokeWidth="5"
                    />
                  ))}
                </svg>
                <ul className="flex flex-col gap-0.5 type-caption text-ink-2">
                  <li className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-brand-blue" /> {l.direct} <span className="tnum text-ink-3">54 %</span></li>
                  <li className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-brand-coral" /> {l.ota} <span className="tnum text-ink-3">31 %</span></li>
                  <li className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-ink-3" /> {b.other}</li>
                </ul>
              </div>,
              'wide',
            )}
            {widget(
              4,
              s.bookingsByWeek,
              <svg aria-hidden="true" className="mt-auto h-12 w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path className="loop-build-area" d={`${curve(weekly, 100, 40, 3)} L 100 40 L 0 40 Z`} fill="var(--brand-blue)" fillOpacity="0.14" style={widgetDelay(4)} />
                <path className="loop-build-draw" d={curve(weekly, 100, 40, 3)} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="2" style={widgetDelay(4)} />
              </svg>,
            )}
            {widget(
              5,
              s.planVsActual,
              <div className="mt-auto flex h-12 items-end gap-2">
                {actual.map((v, k) => (
                  <span className="relative flex h-full flex-1 items-end" key={k}>
                    <span className={cn('loop-build-grow w-full rounded-t-[2px]', v < plan[k] ? 'bg-brand-coral' : 'bg-brand-blue')} style={{ height: `${v}%`, ...widgetDelay(5, k * 0.05) }} />
                    <span aria-hidden="true" className="absolute -inset-x-1 border-t-2 border-ink-2" style={{ bottom: `${plan[k]}%` }} />
                  </span>
                ))}
              </div>,
            )}
          </div>
        </div>
      </div>
    </Frame>
  )
}

/** Short link between chat and dashboard: horizontal from `md`, vertical on phones. */
const Wire: React.FC = () => {
  const pulses = (d: string, comet: number) =>
    Array.from({ length: 6 }, (_, i) => (
      <path
        className="loop-build-pulse"
        d={d}
        fill="none"
        key={i}
        pathLength={1}
        stroke="var(--resi-mint)"
        strokeLinecap="round"
        strokeWidth="3"
        style={{ ...widgetDelay(i), '--comet': comet } as React.CSSProperties}
      />
    ))
  return (
    <>
      <svg aria-hidden="true" className="mx-auto h-9 w-3 md:hidden" viewBox="0 0 12 36">
        <path className="hub-dots" d="M 6 2 V 34" fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="2" style={{ '--gap': 6 } as React.CSSProperties} />
        {pulses('M 6 2 V 34', 0.3)}
      </svg>
      <svg aria-hidden="true" className="hidden h-3 w-full self-center md:block" viewBox="0 0 56 12">
        <path className="hub-dots" d="M 2 6 H 54" fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="2" style={{ '--gap': 6 } as React.CSSProperties} />
        {pulses('M 2 6 H 54', 0.25)}
      </svg>
    </>
  )
}
