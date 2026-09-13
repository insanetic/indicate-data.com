'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { BrandBars } from '@/components/BrandBars'
import { ClientMark } from '@/components/ClientMark'
import { Bars, Donut, Sparkline } from '@/components/Illustrations/primitives'
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

type Phase = 'idle' | 'typing' | 'thinking' | 'streaming' | 'done'

const series = [
  [42, 55, 48, 63, 58, 72, 69, 84],
  [70, 64, 58, 61, 52, 47, 55, 60],
  [30, 38, 46, 44, 58, 66, 74, 81],
  [52, 60, 57, 66, 71, 68, 77, 88],
  [66, 62, 70, 74, 69, 80, 86, 90],
]

const copy = {
  de: {
    you: 'Sie',
    agent: 'Indicate Agent',
    thinking: 'Kennzahlen werden geprüft …',
    chips: 'Beispielfragen',
    channels: 'Derselbe Agent, Ihr Chat',
    via: 'via MCP',
    placeholder: 'Fragen Sie nach Auslastung, Kanälen, Stornos …',
    direct: 'Direkt',
    ota: 'OTA',
    other: 'Andere',
    source: 'Quelle: geprüfte Kennzahlen aus PMS und Kanälen',
  },
  en: {
    you: 'You',
    agent: 'Indicate agent',
    thinking: 'Checking the figures …',
    chips: 'Example questions',
    channels: 'Same agent, your chat',
    via: 'via MCP',
    placeholder: 'Ask about occupancy, channels, cancellations …',
    direct: 'Direct',
    ota: 'OTA',
    other: 'Other',
    source: 'Source: verified KPIs from PMS and channels',
  },
}

/**
 * The agent stage. A question types in, the three bars think, the answer streams word by
 * word, then the chart draws. Plays once when scrolled into view, then only on click.
 * `channels` (App, Claude, ChatGPT, …) render as a switch in the header: the conversation
 * stays the same, only the surface label changes, which is the point.
 */
export const AgentShowcaseClient: React.FC<{ prompts: PromptData[]; channels?: string[] }> = ({
  prompts,
  channels = [],
}) => {
  const locale = useLocale()
  const t = copy[locale]
  const [active, setActive] = useState(0)
  const [channel, setChannel] = useState(0)
  const surface = channels[channel]
  const external = channel > 0 && surface
  const [phase, setPhase] = useState<Phase>('idle')
  const [typed, setTyped] = useState(0)
  const [words, setWords] = useState(0)
  const timers = useRef<number[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)
  const reduced = useReducedMotion()

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const play = useCallback(
    (index: number) => {
      clear()
      setActive(index)
      const prompt = prompts[index]
      if (!prompt) return
      if (reduced) {
        setTyped(prompt.question.length)
        setWords(prompt.answer.split(' ').length)
        setPhase('done')
        return
      }
      setTyped(0)
      setWords(0)
      setPhase('typing')
      const chars = prompt.question.length
      const perChar = Math.min(28, 700 / chars)
      for (let i = 1; i <= chars; i++) later(() => setTyped(i), i * perChar)
      const typedDone = chars * perChar + 250
      later(() => setPhase('thinking'), typedDone)
      const answerWords = prompt.answer.split(' ').length
      later(() => setPhase('streaming'), typedDone + 700)
      for (let w = 1; w <= answerWords; w++) later(() => setWords(w), typedDone + 700 + w * 45)
      later(() => setPhase('done'), typedDone + 700 + answerWords * 45 + 100)
    },
    [prompts, reduced],
  )

  // Autoplay the first question once the stage is in view.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          play(0)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clear()
    }
  }, [play])

  const prompt = prompts[active]
  const data = series[active % series.length]
  const answerText = prompt.answer.split(' ').slice(0, words).join(' ')
  const showAnswer = phase === 'streaming' || phase === 'done'
  const showChart = phase === 'done'

  return (
    <div className="relative" ref={rootRef}>
      <div className="relative overflow-hidden rounded-[1.25rem] border border-line-strong bg-surface-2 shadow-float">
        {channels.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5 md:px-5">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {t.channels}
            </span>
            <div aria-label={t.channels} className="flex gap-1 rounded-btn border border-line bg-surface p-1" role="group">
              {channels.map((name, i) => (
                <button
                  aria-pressed={i === channel}
                  className={cn(
                    'h-7 rounded-[0.25rem] px-2.5 type-caption font-medium transition-colors duration-150',
                    i === channel ? 'bg-surface-3 text-ink' : 'text-ink-3 hover:text-ink',
                  )}
                  key={name}
                  onClick={() => setChannel(i)}
                  type="button"
                >
                  <ClientMark name={name} size={12} />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-[minmax(16rem,20rem)_1fr]">
        <aside className="flex flex-col gap-2 border-b border-line p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="px-2 pb-1 type-eyebrow">{t.chips}</p>
          <div aria-label={t.chips} className="flex flex-col gap-1" role="group">
            {prompts.map((p, i) => (
              <button
                aria-pressed={i === active}
                className={cn(
                  'pressable flex items-start gap-3 rounded-card-inner border px-3 py-2.5 text-left type-small transition-colors duration-150',
                  i === active
                    ? 'border-line-strong bg-surface-3 text-ink'
                    : 'border-transparent text-ink-2 hover:bg-surface-3/60 hover:text-ink',
                )}
                key={p.id}
                onClick={() => {
                  started.current = true
                  play(i)
                }}
                type="button"
              >
                <span
                  className={cn(
                    'mt-1.5 size-1.5 shrink-0 rounded-full transition-colors duration-150',
                    i === active ? 'bg-accent' : 'bg-line-strong',
                  )}
                />
                {p.question}
              </button>
            ))}
          </div>
        </aside>

        <div aria-live="polite" className="flex min-h-[28rem] flex-col gap-5 p-5 md:p-8">
          <div className="flex justify-end">
            <div className={cn('max-w-[85%] rounded-[1rem] rounded-tr-sm bg-surface-3 px-4 py-3 transition-opacity duration-300', phase === 'idle' ? 'opacity-0' : 'opacity-100')}>
              <p className="type-caption font-medium text-ink-3">{t.you}</p>
              <p className={cn('type-body text-ink', phase === 'typing' && 'caret')}>
                {prompt.question.slice(0, typed)}
              </p>
            </div>
          </div>

          <div className={cn('flex gap-3 transition-opacity duration-300', phase === 'idle' || phase === 'typing' ? 'opacity-0' : 'opacity-100')}>
            <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
              <BrandBars size={14} thinking={phase === 'thinking'} />
            </span>
            {phase === 'thinking' ? (
              <p className="pt-2 type-small text-ink-3">{t.thinking}</p>
            ) : (
              <div className="flex w-full max-w-[36rem] flex-col gap-4 rounded-[1rem] rounded-tl-sm border border-line bg-surface p-4 md:p-5">
                <p className="type-caption font-medium text-ink-3">
                  {t.agent}
                  {external && <span className="text-ink-3"> · {surface} {t.via}</span>}
                </p>
                <p className={cn('type-body text-ink pretty min-h-[3.2em]', phase === 'streaming' && 'caret')}>
                  {showAnswer ? answerText : ''}
                </p>
                {(prompt.chart !== 'none' || prompt.kpiValue) && (
                  <div className={cn('card-enter flex flex-col gap-3 rounded-card-inner border border-line bg-surface-2 p-4', !showChart && 'invisible')} key={`${prompt.id}-${showChart}`}>
                    {prompt.kpiValue && (
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="flex flex-col">
                          {prompt.kpiLabel && <span className="type-caption text-ink-3">{prompt.kpiLabel}</span>}
                          <span className="font-display text-2xl font-medium tnum text-ink">{prompt.kpiValue}</span>
                        </div>
                        {prompt.kpiDelta && (
                          <span
                            className={cn(
                              'rounded-btn px-2 py-0.5 type-caption font-medium tnum',
                              prompt.kpiDelta.trim().startsWith('-') || prompt.kpiDelta.trim().startsWith('−')
                                ? 'bg-brand-coral-soft text-brand-coral'
                                : 'bg-[oklch(0.3_0.07_160)] text-[oklch(0.8_0.15_160)]',
                            )}
                          >
                            {prompt.kpiDelta}
                          </span>
                        )}
                      </div>
                    )}
                    {showChart && prompt.chart === 'line' && <Sparkline className="h-20" draw={!reduced} height={70} points={data} />}
                    {showChart && prompt.chart === 'bars' && (
                      <div className="h-24">
                        <Bars compare={data.map((v) => Math.max(20, v - 14))} values={data} />
                      </div>
                    )}
                    {showChart && prompt.chart === 'donut' && (
                      <div className="flex items-center gap-5">
                        <div className="size-24 shrink-0">
                          <Donut
                            label="54%"
                            segments={[
                              { value: 54, color: 'var(--brand-blue)' },
                              { value: 28, color: 'var(--brand-yellow)' },
                              { value: 18, color: 'var(--brand-coral)' },
                            ]}
                          />
                        </div>
                        <ul className="flex flex-col gap-1 type-caption text-ink-2">
                          <li className="flex items-center gap-2"><i className="size-2 rounded-full bg-brand-blue" /> {t.direct} 54 %</li>
                          <li className="flex items-center gap-2"><i className="size-2 rounded-full bg-brand-yellow" /> {t.ota} 28 %</li>
                          <li className="flex items-center gap-2"><i className="size-2 rounded-full bg-brand-coral" /> {t.other} 18 %</li>
                        </ul>
                      </div>
                    )}
                    <p className="type-caption text-ink-3">{t.source}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-btn border border-line bg-surface px-4 py-3 type-small text-ink-3">
            <span className="flex-1">{t.placeholder}</span>
            <span className="rounded-[0.25rem] bg-surface-3 px-1.5 py-0.5 type-caption text-ink-2">↵</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

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
