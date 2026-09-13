import React from 'react'

import type { CtaSectionBlock as Props } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { SectionHeading } from '@/components/SectionHeading'

export const CtaSectionBlock: React.FC<Props> = ({ header, links }) => {
  const buttons = (links || []).filter((l) => l.link?.label)

  return (
    <div className="container relative">
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
                track={{ location: 'cta-section' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
