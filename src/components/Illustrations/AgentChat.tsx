import { Check, LayoutDashboard } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Bars, Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/**
 * Looping scene (wide): a question is typed into the in-app chat, the agent thinks, answers
 * with a KPI and a small chart, names its source and offers follow-ups. The context panel on
 * the right shows the sources picked for the chat, the space and role the answer is scoped
 * to, and the model the admin chose. Timing lives in loops.css (`.loop-chat`).
 */
export const AgentChatIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const c = l.scenes.chat
  const delay = (s: string) => ({ '--delay': s }) as React.CSSProperties

  return (
    <Frame className={cn('loop loop-chat w-full', className)} label="Chat mit dem Indicate Agent: Frage, Antwort mit Kennzahl und Quelle, Kontext daneben">
      <div className="grid overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Chat */}
        <div className="flex flex-col gap-4 border-b border-line p-4 md:border-b-0 md:border-r md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {c.title}
            </span>
            <span className="flex gap-1.5">
              {c.sources.map((src) => (
                <Chip key={src} tone="neutral">{src}</Chip>
              ))}
            </span>
          </div>

          <p className="loop-chat-q max-w-[88%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3.5 py-2.5 type-small text-ink">
            {c.question}
          </p>

          <div className="relative min-h-[9.5rem]">
            <div className="loop-chat-think absolute left-0 top-0 flex items-center gap-2.5 type-small text-ink-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
                <BrandBars size={12} thinking />
              </span>
              {l.scenes.builderThinking}
            </div>

            <div className="loop-chat-in flex gap-2.5" style={delay('0s')}>
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
                <BrandBars size={12} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-[0.875rem] rounded-tl-sm border border-line bg-surface p-3.5">
                <p className="type-small text-ink-2 pretty">{c.answer}</p>
                <div className="grid grid-cols-[auto_1fr] items-end gap-4 rounded-card-inner border border-line bg-surface-2 p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="type-caption text-ink-3">{c.kpi}</span>
                    <span className="font-display text-2xl font-medium leading-none tnum text-ink">61 %</span>
                    <span className="type-caption font-medium tnum text-brand-coral">−14</span>
                  </div>
                  <div className="h-12">
                    <Bars color="var(--brand-coral)" compare={[75, 78, 74, 80, 82, 79, 76]} values={[52, 48, 55, 50, 84, 88, 50]} />
                  </div>
                </div>
                <span className="loop-chat-in flex items-center gap-1.5 type-caption text-ink-3" style={delay('0.3s')}>
                  <Check aria-hidden="true" className="text-[oklch(0.78_0.15_160)]" size={12} strokeWidth={2.5} /> {c.source}
                </span>
              </div>
            </div>
          </div>

          <div className="loop-chat-in flex flex-wrap gap-1.5" style={delay('0.6s')}>
            {c.followUps.map((f) => (
              <span className="rounded-pill border border-line px-2.5 py-1 type-caption text-ink-2" key={f}>{f}</span>
            ))}
          </div>
        </div>

        {/* Context */}
        <div className="flex flex-col gap-4 p-4 md:p-5">
          <span className="type-caption font-medium text-ink-3">{c.context}</span>
          <div className="flex flex-col gap-2 rounded-card-inner border border-line bg-surface p-3.5">
            <span className="type-caption text-ink-2">{c.scope}</span>
            <span className="type-caption text-ink-3">{c.model}</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {c.sources.map((src) => (
              <li className="flex items-center justify-between gap-3 rounded-card-inner border border-line bg-surface px-3 py-2 type-caption" key={src}>
                <span className="font-medium text-ink">{src}</span>
                <span className="flex items-center gap-1 text-ink-3">
                  <i className="size-1.5 rounded-full bg-[oklch(0.78_0.15_160)]" />
                  {l.syncing}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center gap-2.5 rounded-card-inner border border-line bg-surface px-3 py-2.5 type-caption text-ink-2">
            <LayoutDashboard aria-hidden="true" className="shrink-0 text-accent" size={15} strokeWidth={1.75} />
            {c.aboutDashboard} · {l.scenes.weeklyReport}
          </div>
        </div>
      </div>
    </Frame>
  )
}
