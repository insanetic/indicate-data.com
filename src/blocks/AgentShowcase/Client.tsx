'use client'

import React, { useEffect, useRef, useState } from 'react'

import { BrandBars } from '@/components/BrandBars'
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

const THINK_MS = 650

const series = [
  [42, 55, 48, 63, 58, 72, 69, 84],
  [70, 64, 58, 61, 52, 47, 55, 60],
  [30, 38, 46, 44, 58, 66, 74, 81],
  [52, 60, 57, 66, 71, 68, 77, 88],
  [66, 62, 70, 74, 69, 80, 86, 90],
]

/**
 * Pick a question, the three bars "think", then the answer card enters with its chart.
 * Everything is user triggered; nothing auto-advances.
 */
export const AgentShowcaseClient: React.FC<{ prompts: PromptData[] }> = ({ prompts }) => {
  const [active, setActive] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'answer'>('answer')
  const timer = useRef<number | null>(null)
  const locale = useLocale()
  const reduced = useReducedMotion()

  const ask = (i: number) => {
    if (i === active && phase === 'answer') return
    if (timer.current) window.clearTimeout(timer.current)
    setActive(i)
    if (reduced) {
      setPhase('answer')
      return
    }
    setPhase('thinking')
    timer.current = window.setTimeout(() => setPhase('answer'), THINK_MS)
  }

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const prompt = prompts[active]
  const data = series[active % series.length]
  const labels = {
    de: {
      you: 'Sie',
      agent: 'Indicate Agent',
      thinking: 'Zahlen werden geprüft …',
      chips: 'Beispielfragen',
      direct: 'Direkt',
      ota: 'OTA',
      other: 'Andere',
    },
    en: {
      you: 'You',
      agent: 'Indicate agent',
      thinking: 'Checking the numbers …',
      chips: 'Example questions',
      direct: 'Direct',
      ota: 'OTA',
      other: 'Other',
    },
  }[locale]

  return (
    <div className="flex flex-col gap-5">
      <div aria-label={labels.chips} className="flex flex-wrap gap-2" role="group">
        {prompts.map((p, i) => (
          <button
            aria-pressed={i === active}
            className={cn(
              'pressable rounded-pill border px-4 py-2 text-left type-small font-medium transition-colors duration-150',
              i === active
                ? 'border-transparent bg-[oklch(1_0_0)] text-night'
                : 'border-line bg-surface-2 text-ink-2 hover:border-line-strong hover:text-ink',
            )}
            key={p.id}
            onClick={() => ask(i)}
            type="button"
          >
            {p.question}
          </button>
        ))}
      </div>

      <div className="card-surface flex min-h-[26rem] flex-col gap-5 bg-surface-2 p-5 md:p-7" aria-live="polite">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-[1.25rem] rounded-tr-md bg-[oklch(1_0_0)] px-4 py-3 text-night" key={`q-${prompt.id}`}>
            <p className="type-caption font-medium text-ink-3">{labels.you}</p>
            <p className="type-body">{prompt.question}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-3">
            <BrandBars size={14} thinking={phase === 'thinking'} />
          </span>
          {phase === 'thinking' ? (
            <p className="pt-2 type-small text-ink-3">{labels.thinking}</p>
          ) : (
            <div className="card-enter flex w-full max-w-[34rem] flex-col gap-4 rounded-[1.25rem] rounded-tl-md border border-line bg-surface p-4 md:p-5" key={`a-${prompt.id}`}>
              <p className="type-caption font-medium text-ink-3">{labels.agent}</p>
              <p className="type-body text-ink pretty">{prompt.answer}</p>
              {(prompt.chart !== 'none' || prompt.kpiValue) && (
                <div className="flex flex-col gap-3 rounded-card-inner border border-line bg-surface-2 p-4">
                  {prompt.kpiValue && (
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex flex-col">
                        {prompt.kpiLabel && <span className="type-caption text-ink-3">{prompt.kpiLabel}</span>}
                        <span className="font-display text-2xl font-medium tnum text-ink">{prompt.kpiValue}</span>
                      </div>
                      {prompt.kpiDelta && (
                        <span
                          className={cn(
                            'rounded-pill px-2 py-0.5 type-caption font-medium tnum',
                            prompt.kpiDelta.trim().startsWith('-')
                              ? 'bg-brand-coral-soft text-brand-coral'
                              : 'bg-[oklch(0.3_0.06_160)] text-[oklch(0.8_0.14_160)]',
                          )}
                        >
                          {prompt.kpiDelta}
                        </span>
                      )}
                    </div>
                  )}
                  {prompt.chart === 'line' && <Sparkline className="h-20" draw={!reduced} height={70} points={data} />}
                  {prompt.chart === 'bars' && (
                    <div className="h-24">
                      <Bars compare={data.map((v) => Math.max(20, v - 14))} values={data} />
                    </div>
                  )}
                  {prompt.chart === 'donut' && (
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
                        <li className="flex items-center gap-2"><i className="size-2 rounded-full bg-brand-blue" /> {labels.direct} 54 %</li>
                        <li className="flex items-center gap-2"><i className="size-2 rounded-full bg-brand-yellow" /> {labels.ota} 28 %</li>
                        <li className="flex items-center gap-2"><i className="size-2 rounded-full bg-brand-coral" /> {labels.other} 18 %</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
