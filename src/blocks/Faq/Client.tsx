'use client'

import { ChevronDown } from 'lucide-react'
import React, { useId, useState } from 'react'

import { cn } from '@/utilities/ui'

export type FaqItemData = { id: string; question: string; answer: React.ReactNode }

/** Accordion: one open at a time, height animated via grid rows (transform-free, interruptible). */
export const FaqClient: React.FC<{ items: FaqItemData[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()

  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <li key={item.id}>
            <h3>
              <button
                aria-controls={`${baseId}-${i}`}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-5 text-left type-h4 text-ink transition-colors duration-150 hover:text-brand-blue-deep"
                onClick={() => setOpen(isOpen ? null : i)}
                type="button"
              >
                <span>{item.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    'size-5 shrink-0 text-ink-3 transition-transform duration-250 ease-out-quart',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </h3>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-250 ease-out-quart motion-reduce:transition-none',
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
              id={`${baseId}-${i}`}
              inert={!isOpen || undefined}
            >
              <div className="overflow-hidden">
                <div className="pb-6 type-body text-ink-2 max-w-[62ch]">{item.answer}</div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
