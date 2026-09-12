import React from 'react'

import type { IntegrationsBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { IntegrationTree } from '@/components/IntegrationTree'
import { Visual } from '@/components/Illustrations'

/** Heading, the looping integration tree (or an uploaded image), then every connected system. */
export const IntegrationsBlock: React.FC<Props & { locale?: Locale }> = ({ header, visual, groups, links, locale }) => {
  const list = (groups || []).filter((g) => g.title && (g.items || []).length > 0)
  const link = (links || []).find((l) => l.link?.label)?.link
  const customImage = visual?.type === 'image' && visual.image
  const systems = list.flatMap((g) => g.items || [])

  return (
    <div className="container flex flex-col gap-12 md:gap-16">
      <SectionHeading align="center" className="mx-auto reveal" header={header} />
      <div className="reveal">
        {customImage ? (
          <Visual className="mx-auto max-w-4xl" fallback="integrations" locale={locale} visual={visual} />
        ) : (
          <IntegrationTree className="mx-auto max-w-[64rem]" locale={locale} systems={systems} />
        )}
      </div>
      {systems.length > 0 && (
        <div className="reveal flex flex-col items-center gap-5">
          <ul className="flex flex-wrap justify-center gap-2">
            {systems.map((item, ii) => (
              <li
                className="flex h-9 items-center gap-2 rounded-btn border border-line bg-surface-2 px-3 type-caption font-medium text-ink-2"
                key={item.id || ii}
              >
                {item.logo && typeof item.logo === 'object' ? (
                  <Media htmlElement={null} imgClassName="size-4 object-contain" resource={item.logo} />
                ) : null}
                {item.name}
              </li>
            ))}
          </ul>
          {link && <CMSLink {...link} appearance="inline" className="link-arrow type-small" />}
        </div>
      )}
    </div>
  )
}
