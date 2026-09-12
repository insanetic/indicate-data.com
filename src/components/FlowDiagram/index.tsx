import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { Media } from '@/components/Media'
import type { Locale } from '@/i18n/config'
import type { Media as MediaType } from '@/payload-types'
import { cn } from '@/utilities/ui'

export type FlowGroup = {
  title: string
  items: { name: string; logo?: MediaType | number | null }[]
}

const outputs = {
  de: [
    { title: 'Dashboards', text: 'Fertige Kennzahlen für jedes Haus' },
    { title: 'KI-Agent', text: 'Antworten in normalen Worten' },
    { title: 'ChatGPT & Claude', text: 'Über den MCP-Server' },
    { title: 'API & Export', text: 'Für eigene Werkzeuge' },
  ],
  en: [
    { title: 'Dashboards', text: 'Ready-made KPIs per property' },
    { title: 'AI agent', text: 'Answers in plain words' },
    { title: 'ChatGPT & Claude', text: 'Through the MCP server' },
    { title: 'API & export', text: 'For your own tools' },
  ],
}

const centre = {
  de: { title: 'Indicate', text: 'Ein Datenmodell, geprüfte Kennzahlen, Rechte pro Haus' },
  en: { title: 'Indicate', text: 'One data model, verified KPIs, permissions per property' },
}

/**
 * Sources on the left flow into Indicate and out to the places people use the numbers.
 * Connectors are one SVG behind the grid; dashes travel along them.
 */
export const FlowDiagram: React.FC<{ groups: FlowGroup[]; locale?: Locale | null; className?: string }> = ({
  groups,
  locale,
  className,
}) => {
  const l = locale === 'en' ? 'en' : 'de'
  const sources = groups.slice(0, 4)
  const outs = outputs[l]
  const rows = Math.max(sources.length, outs.length)
  const y = (i: number, n: number) => ((i + 0.5) / n) * 100

  return (
    <div className={cn('relative', className)}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden size-full md:block"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {sources.map((_, i) => (
          <path
            className="flow-line"
            d={`M 27 ${y(i, sources.length)} C 36 ${y(i, sources.length)}, 36 50, 43 50`}
            fill="none"
            key={`s${i}`}
            stroke="var(--accent)"
            strokeOpacity="0.8"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {outs.map((_, i) => (
          <path
            className="flow-line"
            d={`M 57 50 C 64 50, 64 ${y(i, outs.length)}, 73 ${y(i, outs.length)}`}
            fill="none"
            key={`o${i}`}
            stroke="var(--brand-blue)"
            strokeOpacity="0.8"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="relative grid gap-6 md:grid-cols-[27%_auto_27%] md:gap-0" style={{ minHeight: `${rows * 6.5}rem` }}>
        <ul className="flex flex-col justify-around gap-3 md:gap-4">
          {sources.map((g, i) => (
            <li className="card-surface flex items-center justify-between gap-3 px-4 py-3" key={i}>
              <div className="flex flex-col">
                <span className="type-small font-medium text-ink">{g.title}</span>
                <span className="type-caption text-ink-3">{g.items.length} {l === 'de' ? 'Systeme' : 'systems'}</span>
              </div>
              <div className="flex -space-x-1.5">
                {g.items.slice(0, 4).map((it, ii) =>
                  it.logo && typeof it.logo === 'object' ? (
                    <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-full border border-line bg-surface" key={ii}>
                      <Media htmlElement={null} imgClassName="size-4 object-contain" resource={it.logo} />
                    </span>
                  ) : (
                    <span className="inline-flex size-7 items-center justify-center rounded-full border border-line bg-surface-3 type-caption font-semibold text-ink-2" key={ii}>
                      {it.name[0]}
                    </span>
                  ),
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-center px-4 md:px-10">
          <div className="relative w-full max-w-[16rem]">
            <div aria-hidden="true" className="glow-pulse absolute -inset-6 rounded-full bg-[radial-gradient(closest-side,oklch(0.85_0.17_88/0.25),transparent)]" />
            <div className="card-float relative flex flex-col items-center gap-3 p-6 text-center">
              <BrandBars size={30} />
              <span className="font-display text-xl font-medium text-ink">{centre[l].title}</span>
              <span className="type-caption text-ink-2 pretty">{centre[l].text}</span>
            </div>
          </div>
        </div>

        <ul className="flex flex-col justify-around gap-3 md:gap-4">
          {outs.map((o, i) => (
            <li className="card-surface flex flex-col px-4 py-3" key={i}>
              <span className="type-small font-medium text-ink">{o.title}</span>
              <span className="type-caption text-ink-3">{o.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
