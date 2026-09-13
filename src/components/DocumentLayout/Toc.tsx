'use client'

import { ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import type { DocHeading } from '@/utilities/lexical/headings'
import { cn } from '@/utilities/ui'

type Props = { headings: DocHeading[]; label: string }

/** "On this page" list. The marker follows the heading nearest the top of the viewport. */
export const Toc: React.FC<Props> = ({ headings, label }) => {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null)

  useEffect(() => {
    const elements = headings.map((h) => document.getElementById(h.id)).filter((el): el is HTMLElement => Boolean(el))
    if (elements.length === 0) return

    // Recomputed on demand rather than tracked from stale IntersectionObserver rects:
    // the last heading whose top has scrolled past the sticky offset is active.
    const pick = () => {
      let current = elements[0]?.id ?? null
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= 120) current = el.id
        else break
      }
      setActive(current)
    }

    pick()

    // The observer is only a trigger here — entries aren't used, `pick` recomputes from scratch.
    const observer = new IntersectionObserver(() => pick(), { rootMargin: '-96px 0px -70% 0px', threshold: 0 })
    elements.forEach((el) => observer.observe(el))

    window.addEventListener('hashchange', pick)

    return () => {
      observer.disconnect()
      window.removeEventListener('hashchange', pick)
    }
  }, [headings])

  if (headings.length === 0) return null

  const list = (
    <ol className="relative flex flex-col border-l border-line">
      {headings.map((h) => {
        const isActive = h.id === active
        return (
          <li key={h.id}>
            <a
              aria-current={isActive ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l py-1 type-caption leading-5 transition-colors duration-200 motion-reduce:transition-none',
                h.level === 3 ? 'pl-7' : 'pl-4',
                isActive ? 'border-accent text-ink' : 'border-transparent text-ink-3 hover:text-ink',
              )}
              href={`#${h.id}`}
            >
              {h.text}
            </a>
          </li>
        )
      })}
    </ol>
  )

  return (
    <>
      <nav aria-label={label} className="hidden xl:block">
        <p className="mb-3 type-caption font-medium uppercase tracking-wider text-ink-3">{label}</p>
        {list}
      </nav>
      <details className="group rounded-md border border-line bg-surface-2 xl:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 type-small font-medium text-ink [&::-webkit-details-marker]:hidden">
          {label}
          <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="border-t border-line px-4 py-4">{list}</div>
      </details>
    </>
  )
}
