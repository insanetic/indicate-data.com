import React from 'react'

import type { CtaSectionBlock as Props } from '@/payload-types'

import { BrandBars } from '@/components/BrandBars'
import { CMSLink } from '@/components/Link'
import { SectionHeading } from '@/components/SectionHeading'

export const CtaSectionBlock: React.FC<Props> = ({ header, links, note }) => {
  const buttons = (links || []).filter((l) => l.link?.label)

  return (
    <div className="container relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 opacity-40 lg:block xl:-right-10"
      >
        <BrandBars size={300} />
      </div>
      <div className="relative flex flex-col items-center gap-8 text-center">
        <SectionHeading align="center" className="reveal" header={header} size="display" />
        {buttons.length > 0 && (
          <div className="reveal flex flex-wrap justify-center gap-3">
            {buttons.map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                appearance={link.appearance === 'outline' ? 'secondary' : link.appearance || 'primary'}
                size="lg"
              />
            ))}
          </div>
        )}
        {note && <p className="type-small text-ink-3">{note}</p>}
      </div>
    </div>
  )
}
