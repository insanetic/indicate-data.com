import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import { getTestimonials } from '@subneo/payload-testimonials/server'
import type { TestimonialLink } from '@subneo/payload-testimonials'

import type { Media as MediaType, Page, TestimonialsBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { Avatar } from '@/components/Illustrations/primitives'
import { cn } from '@/utilities/ui'

import { legacySelection } from './legacy'

/** Company line: linked to the case study or customer site when the testimonial has a link. */
const Company: React.FC<{ text: string; link?: TestimonialLink | null }> = ({ text, link }) => {
  if (!text) return null
  if (link?.type === 'internal' && link.doc && typeof link.doc.value === 'object') {
    return <CMSLink className="underline decoration-line underline-offset-4 hover:text-ink" label={link.label || text} reference={link.doc as never} type="reference" />
  }
  if (link?.type === 'external' && link.url) {
    return <CMSLink className="underline decoration-line underline-offset-4 hover:text-ink" label={link.label || text} newTab type="custom" url={link.url} />
  }
  return <>{text}</>
}

/**
 * Editorial quotes: heading on the left, each quote set large with a yellow opening mark and
 * a hairline between them. No cards, no grid of equal boxes. The quotes come from the central
 * testimonials collection (hand-picked or chosen by tag and seed, see @subneo/payload-testimonials).
 */
export const TestimonialsBlock: React.FC<Props & { locale: Locale; layout?: Page['layout']; blockIndex?: number }> = async (props) => {
  const { header, locale, layout, blockIndex } = props
  const { isEnabled: draft } = await draftMode()

  const selected =
    legacySelection(props) ??
    (await getTestimonials({ payload: await getPayload({ config: configPromise }), block: props as never, layout, blockIndex, locale, draft }))

  const list = selected.map((s) => s.testimonial).filter((t) => t.quote && t.name)
  if (list.length === 0) return null

  return (
    <div className="container">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <SectionHeading className="reveal lg:col-span-4 lg:sticky lg:top-28 lg:self-start" header={header} />
        <ul className="reveal-stagger flex flex-col divide-y divide-line border-y border-line lg:col-span-8">
          {list.map((t, i) => {
            const name = t.name as string
            const initials = name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
            const avatar = t.avatar && typeof t.avatar === 'object' ? (t.avatar as MediaType) : null
            const logo = t.logo && typeof t.logo === 'object' ? (t.logo as MediaType) : null
            return (
              <li className="grid gap-6 py-10 md:grid-cols-[3rem_1fr] md:gap-8 md:py-12" key={String(t.id)} style={{ '--i': i } as React.CSSProperties}>
                <span aria-hidden="true" className="font-display text-[3.5rem] leading-[0.7] text-accent select-none">
                  „
                </span>
                <figure className="flex flex-col gap-7">
                  <blockquote className={cn('font-display text-ink pretty', i === 0 ? 'type-h3 md:text-[1.9rem] md:leading-[1.3]' : 'type-h3')}>
                    {t.quote}
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    {avatar ? (
                      <Media htmlElement={null} imgClassName="size-10 rounded-full object-cover" resource={avatar} />
                    ) : (
                      <Avatar className="size-10 type-small" initials={initials} tone={(['blue', 'yellow', 'coral'] as const)[i % 3]} />
                    )}
                    <div className="flex flex-col">
                      <span className="type-small font-medium text-ink">{name}</span>
                      <span className="type-caption text-ink-3">
                        {t.role}
                        {t.role && t.company ? ', ' : null}
                        {t.company && <Company link={t.link} text={t.company} />}
                      </span>
                    </div>
                    {logo && <Media htmlElement={null} imgClassName="ml-auto h-6 w-auto opacity-70" resource={logo} />}
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
