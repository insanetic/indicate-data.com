import React from 'react'

import type { SpotlightBlock as Props } from '@/payload-types'

import { Eyebrow } from '@/components/Eyebrow'
import { CMSLink } from '@/components/Link'
import { ResiMark, withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

/**
 * A box for one announcement, framed by the travelling gradient border. `banner` (home page):
 * Resi's mark with its breathing aura, a display heading and up to two links. `compact`
 * (subpages): one row with a small mark, one line of text and the links at the end.
 */
export const SpotlightBlock: React.FC<Props> = ({ layout, eyebrow, heading, text, links }) => {
  const buttons = (links || []).filter((l) => l.link?.label)
  const actions = buttons.length > 0 && (
    <div className={cn('flex flex-wrap items-center gap-3', layout === 'compact' ? 'md:justify-end' : 'mt-2')}>
      {buttons.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          appearance={link.appearance === 'outline' ? 'secondary' : link.appearance || 'primary'}
          size={layout === 'compact' ? 'sm' : 'default'}
        />
      ))}
    </div>
  )

  if (layout === 'compact') {
    return (
      <div className="container">
        <div className="resi-ring reveal flex flex-col gap-4 rounded-card bg-surface-2 px-5 py-4 md:flex-row md:items-center md:gap-6 md:px-6">
          <ResiMark size={40} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {eyebrow && <span className="type-caption font-medium text-ink-3">{withResi(eyebrow)}</span>}
            <p className="type-h4 text-ink">{withResi(heading)}</p>
            {text && <p className="type-small text-ink-2 pretty max-w-[60ch]">{withResi(text)}</p>}
          </div>
          {actions}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div
        className="resi-ring reveal relative overflow-hidden rounded-[1.25rem] bg-surface-2"
        style={{ '--resi-ring-width': '1.5px' } as React.CSSProperties}
      >
        <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative grid items-center gap-8 p-7 md:grid-cols-[auto_1fr] md:gap-12 md:p-12 lg:grid-cols-[auto_1fr_auto]">
          <div className="relative grid size-28 place-items-center md:size-36">
            <span aria-hidden="true" className="resi-aura absolute inset-3 rounded-full" />
            <ResiMark className="relative shadow-float" size={84} />
          </div>
          <div className="flex flex-col gap-4">
            {eyebrow && <Eyebrow>{withResi(eyebrow)}</Eyebrow>}
            <h2 className="type-display max-w-[16ch] text-ink">{withResi(heading)}</h2>
            {text && <p className="type-lead max-w-[52ch] text-ink-2">{withResi(text)}</p>}
            <div className="lg:hidden">{actions}</div>
          </div>
          <div className="hidden lg:block">{actions}</div>
        </div>
      </div>
    </div>
  )
}
