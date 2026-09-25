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
import { legacySelection } from './legacy'
import { type Slide, TestimonialSlider } from './Slider'

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

const labels = {
  de: {
    carousel: 'Kundenstimmen',
    slide: 'Kundenstimme {n} von {total}',
    prev: 'Vorherige Kundenstimme',
    next: 'Nächste Kundenstimme',
    open: '„',
    close: '“',
  },
  en: {
    carousel: 'Testimonials',
    slide: 'Testimonial {n} of {total}',
    prev: 'Previous testimonial',
    next: 'Next testimonial',
    open: '“',
    close: '”',
  },
}

/**
 * Heading on the left, one quote at a time on the right (see Slider). The quotes come from the
 * central testimonials collection (hand-picked or chosen by tag and seed, see
 * @subneo/payload-testimonials); the author line is rendered here because the company may link
 * to a CMS document.
 */
export const TestimonialsBlock: React.FC<Props & { locale: Locale; layout?: Page['layout']; blockIndex?: number }> = async (props) => {
  const { header, locale, layout, blockIndex } = props
  const { isEnabled: draft } = await draftMode()

  const selected =
    legacySelection(props) ??
    (await getTestimonials({ payload: await getPayload({ config: configPromise }), block: props as never, layout, blockIndex, locale, draft }))

  const list = selected.map((s) => s.testimonial).filter((t) => t.quote && t.name)
  if (list.length === 0) return null

  const slides: Slide[] = list.map((t, i) => {
    const name = t.name as string
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
    const avatar = t.avatar && typeof t.avatar === 'object' ? (t.avatar as MediaType) : null
    const logo = t.logo && typeof t.logo === 'object' ? (t.logo as MediaType) : null
    return {
      id: String(t.id),
      quote: t.quote as string,
      author: (
        <div className="flex items-center gap-3">
          {avatar ? (
            <Media htmlElement={null} imgClassName="size-10 shrink-0 rounded-full object-cover" resource={avatar} />
          ) : (
            // No yellow: it disappears on the yellow section tone.
            <Avatar className="size-10 shrink-0 type-small" initials={initials} tone={(['blue', 'coral'] as const)[i % 2]} />
          )}
          <div className="flex min-w-0 flex-col">
            <span className="type-small font-medium text-ink">{name}</span>
            <span className="type-caption text-ink-3">
              {t.role}
              {t.role && t.company ? ', ' : null}
              {t.company && <Company link={t.link} text={t.company} />}
            </span>
          </div>
          {logo && <Media htmlElement={null} imgClassName="ml-auto hidden h-6 w-auto opacity-70 lg:block" resource={logo} />}
        </div>
      ),
    }
  })

  const t = labels[locale] ?? labels.de
  return (
    <div className="container">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <SectionHeading className="reveal lg:col-span-4 lg:sticky lg:top-28 lg:self-start" header={header} />
        <div className="reveal lg:col-span-8">
          <TestimonialSlider labels={t} slides={slides} />
        </div>
      </div>
    </div>
  )
}
