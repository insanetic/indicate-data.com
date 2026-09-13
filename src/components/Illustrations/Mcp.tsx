import { Check, Lock, ShieldCheck } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

const catalogue = ['occupancy', 'adr', 'revpar', 'total_bookings', 'meta_ad_spend', 'cost_per_booking']

/**
 * Looping scene (wide): a question is typed into Claude, Claude calls the Indicate MCP server
 * (three tool calls tick off one after another) and answers from the returned KPIs. The
 * server panel on the right shows the endpoint, the KPI catalogue it exposes and the
 * guardrails: same permissions as in the app, guest data stays in the space.
 * Timing lives in loops.css (`.loop-chat`).
 */
export const McpIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const m = l.scenes.mcp
  const delay = (s: string) => ({ '--delay': s }) as React.CSSProperties

  return (
    <Frame className={cn('loop loop-chat w-full', className)} label="Claude fragt den Indicate MCP Server nach Kennzahlen und antwortet daraus">
      <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-6">
        {/* AI client window */}
        <div className="overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-3">
              <span className="flex gap-1.5">
                <i className="size-2.5 rounded-full bg-surface-3" />
                <i className="size-2.5 rounded-full bg-surface-3" />
                <i className="size-2.5 rounded-full bg-surface-3" />
              </span>
              <span className="type-caption font-medium text-ink-2">{m.title}</span>
            </span>
            <span className="hidden gap-1 sm:flex">
              {m.clients.map((name, i) => (
                <span
                  className={cn('rounded-pill px-2 py-0.5 text-[0.6875rem] font-medium leading-5', i === 0 ? 'bg-surface-3 text-ink' : 'text-ink-3')}
                  key={name}
                >
                  {name}
                </span>
              ))}
            </span>
          </div>

          <div className="flex flex-col gap-4 p-4 md:p-5">
            <p className="loop-chat-q max-w-[88%] self-end rounded-[0.875rem] rounded-tr-sm bg-surface-3 px-3.5 py-2.5 type-small text-ink">
              {m.prompt}
            </p>

            <ul className="flex flex-col gap-1 rounded-card-inner border border-line bg-surface p-3 font-mono text-[0.75rem] leading-5 text-ink-3">
              {m.tools.map(([tool, args], i) => (
                <li className="flex items-center gap-2 whitespace-nowrap" key={`${tool}${i}`}>
                  <span className="text-accent">→</span>
                  <span className="text-ink-2">indicate.{tool}</span>
                  <span className="truncate">{args}</span>
                  <Check
                    aria-hidden="true"
                    className="loop-chat-tick ml-auto shrink-0 text-[oklch(0.78_0.15_160)]"
                    size={12}
                    strokeWidth={2.5}
                    style={delay(`${i * 0.35}s`)}
                  />
                </li>
              ))}
            </ul>

            <div className="loop-chat-in flex gap-2.5" style={delay('0.9s')}>
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-display text-[0.7rem] font-semibold text-ink-2">
                AI
              </span>
              <div className="flex flex-col gap-2 rounded-[0.875rem] rounded-tl-sm border border-line bg-surface px-3.5 py-2.5">
                <p className="type-small text-ink-2 pretty">{m.answer}</p>
                <span className="flex items-center gap-2 type-caption text-ink-3">
                  <BrandBars size={11} /> {m.server} · 3 {m.calls}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Server panel */}
        <div className="flex flex-col gap-4 rounded-[1rem] border border-line bg-surface-2 p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {m.server}
            </span>
            <Chip tone="green"><i className="size-1.5 rounded-full bg-current" /> {l.healthy}</Chip>
          </div>
          <code className="truncate rounded-card-inner border border-line bg-surface px-3 py-2 font-mono text-[0.75rem] text-ink-3">
            https://{m.endpoint}
          </code>
          <div className="flex flex-col gap-2">
            <span className="type-caption text-ink-3">{m.catalogue}</span>
            <div className="flex flex-wrap gap-1.5">
              {catalogue.map((k, i) => (
                <span
                  className={cn(
                    'rounded-md border px-2 py-0.5 font-mono text-[0.6875rem] leading-5',
                    i === 3 || i === 4 ? 'border-accent/40 bg-brand-yellow-soft text-ink' : 'border-line bg-surface text-ink-2',
                  )}
                  key={k}
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
          <ul className="mt-auto flex flex-col gap-1.5 type-caption text-ink-2">
            <li className="flex items-center gap-2 rounded-card-inner border border-line bg-surface px-3 py-2">
              <ShieldCheck aria-hidden="true" className="shrink-0 text-accent" size={14} strokeWidth={1.75} /> {m.permission}
            </li>
            <li className="flex items-center gap-2 rounded-card-inner border border-line bg-surface px-3 py-2">
              <Lock aria-hidden="true" className="shrink-0 text-accent" size={14} strokeWidth={1.75} /> {m.privacy}
            </li>
            <li className="px-3 pt-1 text-ink-3">{m.token}</li>
          </ul>
        </div>
      </div>
    </Frame>
  )
}
