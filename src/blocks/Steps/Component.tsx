import React from 'react'

import type { StepsBlock as Props } from '@/payload-types'

import { Icon } from '@/components/Icon'
import { SectionHeading } from '@/components/SectionHeading'
import { withResi } from '@/components/Resi'

export const StepsBlock: React.FC<Props> = ({ header, steps }) => {
  const list = (steps || []).filter((s) => s.title)
  if (list.length === 0) return null

  return (
    <div className="container">
      <SectionHeading align="center" className="mx-auto mb-12 md:mb-16 reveal" header={header} />
      <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
        <span
          aria-hidden="true"
          className="steps-line absolute left-6 right-6 top-6 hidden h-px bg-line-strong md:block"
        />
        {list.map((step, i) => (
          <li
            className="reveal relative flex flex-col gap-5"
            key={step.id || i}
            style={{ '--i': i } as React.CSSProperties}
          >
            <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-full border border-line-strong bg-surface-2 font-display text-lg font-medium text-accent tnum">
              {i + 1}
            </span>
            <div className="flex flex-col gap-2 md:pr-8">
              <h3 className="flex items-center gap-2 type-h4 text-ink">
                {step.icon && <Icon className="text-ink-3" name={step.icon} size={20} />}
                {withResi(step.title)}
              </h3>
              <p className="type-body text-ink-2 pretty max-w-[38ch]">{withResi(step.text)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
