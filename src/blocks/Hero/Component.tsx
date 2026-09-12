import React from 'react'

import type { HeroBlock as HeroBlockProps } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual } from '@/components/Illustrations'
import { HeroIntro } from './Intro'

export const HeroBlock: React.FC<HeroBlockProps & { locale?: Locale }> = ({ header, links, trust, visual, locale }) => {
  const buttons = (links || []).filter((l) => l.link?.label)
  const logos = (trust?.logos || []).filter((l) => l.name)

  return (
    <HeroIntro>
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-7 lg:col-span-6">
            <div className="intro-item" style={{ '--i': 0 } as React.CSSProperties}>
              <SectionHeading align="left" as="h1" header={header} size="display" />
            </div>

            {buttons.length > 0 && (
              <div className="intro-item flex flex-wrap gap-3" style={{ '--i': 2 } as React.CSSProperties}>
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

            {(trust?.text || logos.length > 0) && (
              <div
                className="intro-item flex flex-col gap-3 border-t border-line pt-6"
                style={{ '--i': 3 } as React.CSSProperties}
              >
                {trust?.text && <p className="type-small text-ink-3">{trust.text}</p>}
                {logos.length > 0 && (
                  <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
                    {logos.map((logo, i) => (
                      <li className="flex items-center" key={logo.id || i}>
                        {logo.image && typeof logo.image === 'object' ? (
                          <Media
                            htmlElement={null}
                            imgClassName="h-6 w-auto opacity-70 grayscale"
                            resource={logo.image}
                          />
                        ) : (
                          <span className="font-display text-lg font-medium text-ink-3">{logo.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="intro-visual lg:col-span-6">
            <Visual className="w-full" fallback="dashboard" locale={locale} visual={visual} />
          </div>
        </div>
      </div>
    </HeroIntro>
  )
}
