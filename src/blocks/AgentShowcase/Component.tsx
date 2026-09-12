import React from 'react'

import type { AgentShowcaseBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { SectionHeading } from '@/components/SectionHeading'
import { IconTile } from '@/components/Icon'
import { AgentShowcaseClient, type PromptData } from './Client'

export const AgentShowcaseBlock: React.FC<Props> = ({ header, prompts, points, links }) => {
  const list: PromptData[] = (prompts || [])
    .filter((p) => p.question && p.answer)
    .map((p, i) => ({
      id: p.id || String(i),
      question: p.question,
      answer: p.answer,
      chart: p.chart || 'line',
      kpiLabel: p.kpiLabel || null,
      kpiValue: p.kpiValue || null,
      kpiDelta: p.kpiDelta || null,
    }))
  if (list.length === 0) return null
  const buttons = (links || []).filter((l) => l.link?.label)

  return (
    <div className="container">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col gap-8 lg:col-span-5">
          <SectionHeading className="reveal" header={header} />
          {(points || []).length > 0 && (
            <ul className="reveal-stagger flex flex-col gap-5">
              {points!.map((p, i) => (
                <li className="flex gap-4" key={p.id || i} style={{ '--i': i } as React.CSSProperties}>
                  <IconTile className="bg-surface-2 text-brand-yellow" name={p.icon} tone="neutral" />
                  <div className="flex flex-col gap-0.5 pt-1">
                    <p className="font-medium text-ink">{p.title}</p>
                    {p.text && <p className="type-small text-ink-2 pretty">{p.text}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {buttons.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {buttons.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  appearance={link.appearance === 'outline' ? 'secondary' : link.appearance || 'primary'}
                />
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-7">
          <AgentShowcaseClient prompts={list} />
        </div>
      </div>
    </div>
  )
}
