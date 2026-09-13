import React from 'react'

import type { HeroBlock as HeroBlockProps } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual } from '@/components/Illustrations'
import { HeroIntro } from './Intro'
import { withResi } from '@/components/Resi'

/**
 * Centred, typography-first hero with a wide product scene underneath: the layered stage on
 * the home page, the feature's own looping scene on a feature page, or an uploaded image.
 */
export const HeroBlock: React.FC<HeroBlockProps & { locale?: Locale }> = ({ header, links, trust, visual, locale }) => {
  const buttons = (links || []).filter((l) => l.link?.label)
  const logos = (trust?.logos || []).filter((l) => l.name)

  return (
    <HeroIntro>
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-x-0 -top-32 h-[44rem]" />
      <div className="container relative flex flex-col items-center text-center">
        <div className="intro-item" style={{ '--i': 0 } as React.CSSProperties}>
          <SectionHeading align="center" as="h1" header={header} leadClassName="mx-auto max-w-[46ch]" size="display-xl" />
        </div>

        {buttons.length > 0 && (
          <div className="intro-item mt-9 flex flex-wrap justify-center gap-3" style={{ '--i': 2 } as React.CSSProperties}>
            {buttons.map(({ link }, i) => (
              <CMSLink
                key={i}
                {...link}
                appearance={link.appearance === 'outline' ? 'secondary' : link.appearance || 'primary'}
                size="lg"
                track={{ location: 'hero' }}
              />
            ))}
          </div>
        )}

        {(trust?.text || logos.length > 0) && (
          <div className="intro-item mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2" style={{ '--i': 3 } as React.CSSProperties}>
            {trust?.text && <span className="type-small text-ink-3">{withResi(trust.text)}</span>}
            {logos.map((logo, i) => (
              <span className="flex items-center" key={logo.id || i}>
                {logo.image && typeof logo.image === 'object' ? (
                  <Media htmlElement={null} imgClassName="h-5 w-auto opacity-60 grayscale" resource={logo.image} />
                ) : (
                  <span className="font-display type-small font-medium text-ink-2">{logo.name}</span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="intro-visual mt-14 w-full max-w-[68rem] md:mt-20">
          <Visual className="w-full" fallback="stage" locale={locale} visual={visual} />
        </div>
      </div>
    </HeroIntro>
  )
}
