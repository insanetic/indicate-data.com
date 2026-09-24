import React from 'react'

import { Icon } from '@/components/Icon'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

import type { StyleProps } from './Component'

/** Numbered steps joined by a line on wide screens. */
export const Steps: React.FC<StyleProps> = ({ items, grid }) => (
  <ol className={cn('relative grid gap-10 md:gap-8', grid)}>
    <span aria-hidden="true" className="steps-line absolute left-6 right-6 top-6 hidden h-px bg-line-strong lg:block" />
    {items.map((step, i) => (
      <li className="reveal relative flex flex-col gap-5" key={step.id || i} style={{ '--i': i } as React.CSSProperties}>
        <span className="relative z-10 inline-flex size-12 items-center justify-center rounded-full border border-line-strong bg-surface-2 font-display text-lg font-medium text-accent tnum">
          {i + 1}
        </span>
        <div className="flex flex-col gap-2 md:pr-8">
          <h3 className="flex items-center gap-2 type-h4 text-ink">
            {step.icon && <Icon className="text-ink-3" name={step.icon} size={20} />}
            {withResi(step.title)}
          </h3>
          {step.text && <p className="type-body text-ink-2 pretty max-w-[38ch]">{withResi(step.text)}</p>}
        </div>
      </li>
    ))}
  </ol>
)
