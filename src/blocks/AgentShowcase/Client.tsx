'use client'

import { ArrowUp, Check, LoaderCircle } from 'lucide-react'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { ClientMark } from '@/components/ClientMark'
import { curve } from '@/components/Illustrations/stage'
import { ResiMark, ResiName, withResi } from '@/components/Resi'
import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/ui'

export type PromptData = {
  id: string
  question: string
  answer: string
  chart: 'line' | 'bars' | 'donut' | 'none'
  kpiLabel: string | null
  kpiValue: string | null
  kpiDelta: string | null
}

type Phase = 'idle' | 'typing' | 'working' | 'streaming' | 'done'

const series = [
  [42, 55, 48, 63, 58, 72, 69, 84],
  [70, 64, 58, 61, 52, 47, 55, 60],
  [30, 38, 46, 44, 58, 66, 74, 81],
  [52, 60, 57, 66, 71, 68, 77, 88],
  [66, 62, 70, 74, 69, 80, 86, 90],
]
const mix = [
  { value: 54, color: 'var(--brand-blue)' },
  { value: 28, color: 'var(--brand-coral)' },
  { value: 18, color: 'var(--ink-3)' },
]
const arcs = mix.map((m, i) => ({
  ...m,
  start: mix.slice(0, i).reduce((sum, p) => sum + p.value, 0),
}))

/** How long a finished answer stays before autoplay moves on (ms). */
const HOLD = 4200

const copy = {
  de: {
    you: 'Du',
    role: 'Deine KI-Agentin',
    chips: 'Beispielfragen',
    channels: 'Resi, in deinem Chat',
    connected: 'Indicate MCP · verbunden',
    placeholder: 'Frag Resi …',
    steps: [
      'Kennzahl im Katalog gefunden',
      'Rechte geprüft · dein Space',
      'Daten aus PMS und Kanälen',
    ],
    direct: 'Direkt',
    ota: 'OTA',
    other: 'Andere',
    source: 'Quelle: geprüfte Kennzahlen aus PMS und Kanälen',
  },
  en: {
    you: 'You',
    role: 'Your AI agent',
    chips: 'Example questions',
    channels: 'Resi, in your chat',
    connected: 'Indicate MCP · connected',
    placeholder: 'Ask Resi …',
    steps: [
      'KPI found in the catalogue',
      'Permissions checked · your space',
      'Data from PMS and channels',
    ],
    direct: 'Direct',
    ota: 'OTA',
    other: 'Other',
    source: 'Source: verified KPIs from PMS and channels',
  },
}
/** In an external assistant the same work shows as calls to the Indicate MCP server. */
const toolCalls = ['indicate · list_kpis', 'indicate · check_access', 'indicate · get_kpi']

/**
 * Resi's chat stage. A question types into the input and is sent; a light runs around the
 * chat while Resi works through three steps (in the app in plain words, in Claude, ChatGPT
 * or Langdock as Indicate MCP tool calls); the answer streams in, the KPI counts up and the
 * chart builds. While in view it plays the example questions in turn (a thin bar shows when
 * the next one comes) until the visitor picks a question or a surface. Reduced motion shows
 * each answer finished and does not autoplay.
 */
export const AgentShowcaseClient: React.FC<{ prompts: PromptData[]; channels?: string[] }> = ({
  prompts,
  channels = [],
}) => {
  const locale = useLocale()
  const t = copy[locale]
  const [active, setActive] = useState(0)
  const [channel, setChannel] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [typed, setTyped] = useState(0)
  const [steps, setSteps] = useState(0)
  const [words, setWords] = useState(0)
  const [pressed, setPressed] = useState(false)
  const [run, setRun] = useState(0)
  const [auto, setAuto] = useState(true)
  const [inView, setInView] = useState(false)
  const timers = useRef<number[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const surface = channels[channel]
  const external = channel > 0 && Boolean(surface)
  const stepLabels = external ? toolCalls : t.steps

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const play = useCallback(
    (index: number) => {
      clear()
      const prompt = prompts[index]
      if (!prompt) return
      setActive(index)
      setRun((r) => r + 1)
      const answerWords = prompt.answer.split(' ').length
      if (reduced) {
        setTyped(0)
        setSteps(3)
        setWords(answerWords)
        setPhase('done')
        return
      }
      setTyped(0)
      setSteps(0)
      setWords(0)
      setPhase('typing')
      const chars = prompt.question.length
      const perChar = Math.min(24, 800 / chars)
      for (let i = 1; i <= chars; i++) later(() => setTyped(i), i * perChar)
      const sent = chars * perChar + 200
      later(() => setPressed(true), sent)
      later(() => {
        setPressed(false)
        setPhase('working')
      }, sent + 160)
      for (let s = 1; s <= 3; s++) later(() => setSteps(s), sent + 160 + s * 330)
      const stream = sent + 160 + 3 * 330 + 200
      later(() => setPhase('streaming'), stream)
      for (let w = 1; w <= answerWords; w++) later(() => setWords(w), stream + w * 38)
      later(() => setPhase('done'), stream + answerWords * 38 + 80)
    },
    [prompts, reduced],
  )

  // In view: the first question plays once, autoplay continues from there; out of view pauses it.
  const playRef = useRef(play)
  useEffect(() => {
    playRef.current = play
  }, [play])
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    let started = false
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && !started) {
          started = true
          playRef.current(0)
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clear()
    }
  }, [])
  useEffect(() => {
    if (!auto || reduced || !inView || phase !== 'done' || prompts.length < 2) return
    const id = window.setTimeout(() => play((active + 1) % prompts.length), HOLD)
    return () => window.clearTimeout(id)
  }, [auto, reduced, inView, phase, active, prompts.length, play])

  const pick = (index: number) => {
    setAuto(false)
    play(index)
  }
  const pickChannel = (index: number) => {
    setAuto(false)
    setChannel(index)
    play(active)
  }

  const prompt = prompts[active]
  const data = series[active % series.length]
  const answerText = prompt.answer.split(' ').slice(0, words).join(' ')
  const sent = phase === 'working' || phase === 'streaming' || phase === 'done'
  const answering = phase === 'streaming' || phase === 'done'
  const done = phase === 'done'
  const negative = /^[-−]/.test(prompt.kpiDelta?.trim() || '')

  return (
    <div className="relative" ref={rootRef}>
      <div className="flex flex-col gap-4">
        {/* Surfaces */}
        {channels.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="type-caption font-medium text-ink-2">{withResi(t.channels)}</span>
            <Segmented active={channel} items={channels} label={t.channels} onPick={pickChannel} />
          </div>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(15rem,19rem)_minmax(0,1fr)] lg:gap-0">
          {/* Questions */}
          <div
            aria-label={t.chips}
            className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 lg:pr-8"
            role="group"
          >
            {prompts.map((p, i) => {
              const on = i === active
              return (
                <button
                  aria-pressed={on}
                  className={cn(
                    'pressable relative flex w-[16rem] shrink-0 snap-start items-start gap-3 rounded-[0.875rem] border px-3.5 py-3 text-left type-small transition-colors duration-150 lg:w-auto',
                    on
                      ? 'border-line-strong bg-surface-2 text-ink'
                      : 'border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink',
                  )}
                  key={p.id}
                  onClick={() => pick(i)}
                  type="button"
                >
                  {on && (
                    <span
                      aria-hidden="true"
                      className="chat-lit pointer-events-none absolute -inset-[3px] rounded-[inherit] border-2 border-brand-blue"
                      key={`lit-${run}`}
                    />
                  )}
                  <span
                    className={cn(
                      'mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[0.6875rem] font-semibold tnum',
                      on ? 'bg-brand-blue text-white' : 'bg-surface-3 text-ink-3',
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="pretty">{p.question}</span>
                  {on && auto && done && !reduced && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3.5 bottom-1.5 h-0.5 overflow-hidden rounded-full bg-line"
                    >
                      <span
                        className="chat-progress block h-full rounded-full bg-brand-blue"
                        key={`p-${run}`}
                        style={{ '--hold': `${HOLD}ms` } as React.CSSProperties}
                      />
                    </span>
                  )}
                  {/* Wire to the chat, with a pulse when the question is sent */}
                  {on && (
                    <svg
                      aria-hidden="true"
                      className="absolute left-full top-1/2 hidden h-3 w-8 -translate-y-1/2 lg:block"
                      viewBox="0 0 32 12"
                    >
                      <path
                        className="hub-dots"
                        d="M 2 6 H 30"
                        fill="none"
                        stroke="var(--line-strong)"
                        strokeLinecap="round"
                        strokeWidth="2"
                        style={{ '--gap': 5 } as React.CSSProperties}
                      />
                      {sent && (
                        <path
                          className="chat-pulse"
                          d="M 2 6 H 30"
                          fill="none"
                          key={`w-${run}`}
                          pathLength={1}
                          stroke="var(--brand-blue)"
                          strokeLinecap="round"
                          strokeWidth="3"
                        />
                      )}
                    </svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* Chat */}
          <div className="relative flex h-[38rem] flex-col rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float md:h-[36rem]">
            <span
              aria-hidden="true"
              className="resi-halo pointer-events-none absolute -inset-px rounded-[inherit]"
              data-on={phase === 'working' || phase === 'streaming' ? '' : undefined}
            />

            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
              <span className="flex items-center gap-2.5" key={channel}>
                {external ? (
                  <span className="chat-rise inline-flex items-center gap-2 type-small font-medium text-ink">
                    <ClientMark name={surface} size={18} />
                  </span>
                ) : (
                  <span className="chat-rise flex items-center gap-2.5">
                    <ResiMark size={28} />
                    <span className="flex flex-col">
                      <ResiName className="type-small leading-4" />
                      <span className="type-caption leading-4 text-ink-3">{t.role}</span>
                    </span>
                  </span>
                )}
              </span>
              {external && (
                <span
                  className="chat-rise flex items-center gap-1.5 rounded-pill border border-line px-2.5 py-1 type-caption text-ink-2"
                  key={`c-${channel}`}
                >
                  <i className="size-1.5 rounded-full bg-[oklch(0.78_0.15_160)]" /> {t.connected}
                </span>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
              {/* Fixed height, newest at the bottom like a real chat: the page never shifts. */}
              <div
                aria-live="polite"
                className="flex min-h-0 flex-1 flex-col justify-end gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_2.5rem)]"
              >
                {sent && (
                  <p
                    className="chat-rise max-w-[85%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-4 py-2.5 type-small text-ink md:type-body"
                    key={`q-${run}`}
                  >
                    {prompt.question}
                  </p>
                )}

                {sent && (
                  <div className="chat-rise flex gap-3" key={`a-${run}`}>
                    <ResiMark className="mt-0.5" size={28} thinking={phase === 'working'} />
                    <div className="flex min-w-0 max-w-[36rem] flex-1 flex-col gap-3">
                      {/* While Resi works: the steps tick one by one. Once she answers they fold
                          into one line, so the question stays in view above the answer. */}
                      {answering ? (
                        <p
                          className={cn(
                            'chat-rise flex items-center gap-2 type-caption text-ink-3',
                            external && 'font-mono',
                          )}
                        >
                          <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[oklch(0.3_0.07_160)] text-resi-mint">
                            <Check aria-hidden="true" size={10} strokeWidth={3} />
                          </span>
                          <span className="truncate">{stepLabels.join(' · ')}</span>
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-1.5">
                          {stepLabels.map((label, k) => (
                            <li
                              className={cn(
                                'flex items-center gap-2 type-caption transition-opacity duration-200',
                                external && 'font-mono',
                                k < steps + 1 ? 'opacity-100' : 'opacity-0',
                              )}
                              key={label}
                            >
                              <span className="relative grid size-4 shrink-0 place-items-center">
                                {k < steps ? (
                                  <span className="chat-pop grid size-4 place-items-center rounded-full bg-[oklch(0.3_0.07_160)] text-resi-mint">
                                    <Check aria-hidden="true" size={10} strokeWidth={3} />
                                  </span>
                                ) : (
                                  <LoaderCircle
                                    aria-hidden="true"
                                    className="build-spin text-ink-3"
                                    size={14}
                                    strokeWidth={2}
                                  />
                                )}
                              </span>
                              <span className={k < steps ? 'text-ink-2' : 'text-ink-3'}>
                                {label}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {answering && (
                        <div className="chat-rise flex flex-col gap-4 rounded-[0.875rem] rounded-tl-sm border border-line bg-surface p-4 md:p-5">
                          <p
                            className={cn(
                              'type-small text-ink pretty md:type-body',
                              phase === 'streaming' && 'caret',
                            )}
                          >
                            {answerText}
                          </p>
                          {done && (prompt.chart !== 'none' || prompt.kpiValue) && (
                            <div
                              className="chat-rise flex flex-col gap-3 rounded-card-inner border border-line bg-surface-2 p-4"
                              key={`c-${run}`}
                            >
                              <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:items-end">
                                {prompt.kpiValue && (
                                  <div className="flex flex-col gap-1.5">
                                    {prompt.kpiLabel && (
                                      <span className="type-caption text-ink-3">
                                        {prompt.kpiLabel}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                      <span className="font-display text-2xl font-medium leading-none tnum text-ink">
                                        <CountUp
                                          reduced={reduced}
                                          run={run}
                                          text={prompt.kpiValue}
                                        />
                                      </span>
                                      {prompt.kpiDelta && (
                                        <span
                                          className={cn(
                                            'rounded-pill px-2 py-0.5 type-caption font-medium tnum',
                                            negative
                                              ? 'bg-brand-coral-soft text-brand-coral'
                                              : 'bg-[oklch(0.3_0.07_160)] text-[oklch(0.8_0.15_160)]',
                                          )}
                                        >
                                          {prompt.kpiDelta}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                {prompt.chart === 'bars' && (
                                  <BarsChart data={data} negative={negative} />
                                )}
                                {prompt.chart === 'line' && <LineChart data={data} />}
                                {prompt.chart === 'donut' && <DonutChart t={t} />}
                              </div>
                              <p className="chat-fade-late flex items-center gap-1.5 type-caption text-ink-3">
                                <Check
                                  aria-hidden="true"
                                  className="text-resi-mint"
                                  size={12}
                                  strokeWidth={2.5}
                                />{' '}
                                {t.source}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Input: the question types in here, then it is sent */}
              <div className="flex items-center gap-2 rounded-[0.875rem] border border-line bg-surface px-4 py-2.5">
                <span className="min-w-0 flex-1 truncate type-small">
                  {phase === 'typing' && typed > 0 ? (
                    <span className="caret text-ink">{prompt.question.slice(0, typed)}</span>
                  ) : (
                    <span className="text-ink-3">{withResi(t.placeholder)}</span>
                  )}
                </span>
                <span
                  className={cn(
                    'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-[background-color,color,scale] duration-150 ease-out',
                    phase === 'typing' && typed > 0
                      ? 'bg-ink text-surface'
                      : 'bg-surface-3 text-ink-3',
                    pressed && 'scale-[0.86] bg-ink text-surface',
                  )}
                >
                  <ArrowUp aria-hidden="true" size={16} strokeWidth={2.25} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Surface switch with an indicator that slides to the chosen item. */
const Segmented: React.FC<{
  items: string[]
  active: number
  label: string
  onPick: (i: number) => void
}> = ({ items, active, label, onPick }) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [box, setBox] = useState<{ x: number; w: number } | null>(null)
  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[active]
      if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active, items])
  return (
    <div
      aria-label={label}
      className="relative flex max-w-full gap-1 overflow-x-auto rounded-btn border border-line bg-surface p-1"
      role="group"
    >
      {box && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-0 rounded-[0.3rem] bg-surface-3 transition-[translate,width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ translate: `${box.x}px 0`, width: box.w }}
        />
      )}
      {items.map((name, i) => (
        <button
          aria-pressed={i === active}
          className={cn(
            'relative h-8 shrink-0 rounded-[0.3rem] px-3 type-caption font-medium transition-colors duration-150',
            i === active ? 'text-ink' : 'text-ink-3 hover:text-ink',
          )}
          key={name}
          onClick={() => onPick(i)}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="button"
        >
          <ClientMark name={name} size={12} />
        </button>
      ))}
    </div>
  )
}

/** Counts the number inside a KPI string ("61 %", "€189", "1.284") up from zero. */
const CountUp: React.FC<{ text: string; run: number; reduced: boolean }> = ({
  text,
  run,
  reduced,
}) => {
  const match = text.match(/^(\D*?)(\d[\d.,]*)(.*)$/)
  const animate = Boolean(match) && !reduced
  // Starts at zero; the chart card remounts per run, so every answer counts up afresh.
  const [shown, setShown] = useState(() => (match ? `${match[1]}0${match[3]}` : text))
  useEffect(() => {
    if (!match || !animate) return
    const [, pre, num, post] = match
    const decimalSep =
      num.includes(',') && !/,\d{3}\b/.test(num)
        ? ','
        : num.includes('.') && !/\.\d{3}\b/.test(num)
          ? '.'
          : null
    const decimals = decimalSep ? num.split(decimalSep)[1].length : 0
    const target = Number(num.replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'))
    const format = (v: number) => {
      const fixed = v.toFixed(decimals)
      return decimalSep === ',' ? fixed.replace('.', ',') : fixed
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 800)
      const eased = 1 - Math.pow(1 - p, 3)
      setShown(p < 1 ? `${pre}${format(target * eased)}${post}` : text)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart per run
  }, [text, run, animate])
  return <>{animate ? shown : text}</>
}

const BarsChart: React.FC<{ data: number[]; negative: boolean }> = ({ data, negative }) => (
  <div className="flex h-16 items-end gap-1.5">
    {data.map((v, i) => {
      const plan = Math.max(20, v - 14 + (i % 3) * 9)
      return (
        <span className="relative flex h-full flex-1 items-end" key={i}>
          <span
            className={cn(
              'chat-grow w-full rounded-t-[3px]',
              negative && v < plan ? 'bg-brand-coral' : 'bg-brand-blue',
            )}
            style={{ height: `${v}%`, '--i': i } as React.CSSProperties}
          />
          <span
            aria-hidden="true"
            className="absolute -inset-x-1 border-t-2 border-ink-3"
            style={{ bottom: `${plan}%` }}
          />
        </span>
      )
    })}
  </div>
)

const LineChart: React.FC<{ data: number[] }> = ({ data }) => (
  <svg aria-hidden="true" className="h-16 w-full" preserveAspectRatio="none" viewBox="0 0 100 40">
    {[10, 20, 30].map((y) => (
      <line key={y} stroke="var(--line)" strokeWidth="0.4" x1="0" x2="100" y1={y} y2={y} />
    ))}
    <path
      className="chat-fade-late"
      d={`${curve(data, 100, 40, 3)} L 100 40 L 0 40 Z`}
      fill="var(--brand-blue)"
      fillOpacity="0.14"
    />
    <path
      className="chat-trace"
      d={curve(data, 100, 40, 3)}
      fill="none"
      pathLength={1}
      stroke="var(--brand-blue)"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
)

const DonutChart: React.FC<{ t: (typeof copy)['de'] }> = ({ t }) => (
  <div className="flex items-center gap-5">
    <svg aria-hidden="true" className="chat-spinin size-16 shrink-0 -rotate-90" viewBox="0 0 36 36">
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
    <ul className="flex flex-col gap-1 type-caption text-ink-2">
      <li className="flex items-center gap-2">
        <i className="size-2 rounded-full bg-brand-blue" /> {t.direct}{' '}
        <span className="tnum text-ink-3">54 %</span>
      </li>
      <li className="flex items-center gap-2">
        <i className="size-2 rounded-full bg-brand-coral" /> {t.ota}{' '}
        <span className="tnum text-ink-3">28 %</span>
      </li>
      <li className="flex items-center gap-2">
        <i className="size-2 rounded-full bg-ink-3" /> {t.other}{' '}
        <span className="tnum text-ink-3">18 %</span>
      </li>
    </ul>
  </div>
)

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}
