import React from 'react'

import type { AgentShowcaseBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { SectionHeading } from '@/components/SectionHeading'
import { AgentShowcaseClient, type PromptData } from './Client'

export const AgentShowcaseBlock: React.FC<Props> = ({ header, prompts, points, channels, links }) => {
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
  const trust = (points || []).filter((p) => p.title)
  const chips = (channels || []).map((c) => c.name).filter(Boolean)

  return (
    <div className="container flex flex-col gap-12 md:gap-16">
      <SectionHeading align="center" className="mx-auto reveal" header={header} />
      <div className="reveal">
        <AgentShowcaseClient channels={chips} prompts={list} />
      </div>
      {(trust.length > 0 || buttons.length > 0) && (
        <div className="reveal flex flex-col items-center gap-8">
          {trust.length > 0 && (
            <ul className="grid w-full gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
              {trust.map((p, i) => (
                <li className="flex gap-4 bg-surface p-5" key={p.id || i}>
                  <Icon className="mt-0.5 shrink-0 text-accent" name={p.icon} size={20} />
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-ink">{p.title}</p>
                    {p.text && <p className="type-small text-ink-2 pretty">{p.text}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {buttons.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {buttons.map(({ link }, i) => (
                <CMSLink key={i} {...link} appearance={link.appearance === 'outline' ? 'secondary' : link.appearance || 'primary'} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
