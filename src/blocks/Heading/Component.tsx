import React from 'react'

import type { HeadingBlock as Props } from '@/payload-types'

import { ActionRow } from '@/components/ActionRow'
import { SectionHeading } from '@/components/SectionHeading'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

/**
 * `left`: heading in columns 1–8, lead and actions in 9–12 (the stacked FeatureStory header).
 * `right`: the mirror, lead and actions in 1–4, heading in 5–12. Both stack heading-first on
 * phones. `center`: one centred stack. `display` is the large closing size.
 */
export const HeadingBlock: React.FC<Props & { isFirst?: boolean }> = ({ header, size, links, isFirst }) => {
  if (!header?.heading && !header?.lead) return null
  const as = isFirst ? 'h1' : 'h2'
  const headingSize = size === 'display' ? 'display' : 'h2'
  const track = size === 'display' ? 'cta-section' : undefined
  const align = header.align || 'left'

  if (align === 'center') {
    return (
      <div className="container flex flex-col items-center gap-8 text-center" data-align="center">
        <SectionHeading align="center" as={as} className="reveal" header={header} size={headingSize} />
        <ActionRow align="center" className="reveal" links={links} size={size === 'display' ? 'lg' : undefined} track={track} />
      </div>
    )
  }

  const right = align === 'right'
  const hasSide = Boolean(header.lead) || (links || []).some((l) => l.link?.label)
  return (
    <div className="container" data-align={align}>
      <div className="reveal grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <SectionHeading
          align={right ? 'right' : 'left'}
          as={as}
          className={cn('lg:col-span-8 lg:row-start-1', right && 'lg:col-start-5')}
          data-part="title"
          header={{ ...header, lead: null }}
          size={headingSize}
        />
        {hasSide && (
          <div className={cn('flex flex-col gap-6 lg:col-span-4 lg:row-start-1 lg:pb-1', right && 'lg:col-start-1')} data-part="side">
            {header.lead && <p className="type-lead max-w-[48ch] text-ink-2">{withResi(header.lead)}</p>}
            <ActionRow links={links} size={size === 'display' ? 'lg' : undefined} track={track} />
          </div>
        )}
      </div>
    </div>
  )
}
