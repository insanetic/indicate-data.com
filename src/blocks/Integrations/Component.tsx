import React from 'react'

import type { IntegrationsBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { FlowDiagram } from '@/components/FlowDiagram'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual } from '@/components/Illustrations'

export const IntegrationsBlock: React.FC<Props & { locale?: Locale }> = ({ header, visual, groups, links, locale }) => {
  const list = (groups || []).filter((g) => g.title && (g.items || []).length > 0)
  const link = (links || []).find((l) => l.link?.label)?.link
  const customImage = visual?.type === 'image' && visual.image

  return (
    <div className="container flex flex-col gap-12 md:gap-16">
      <SectionHeading align="center" className="mx-auto reveal" header={header} />
      <div className="reveal">
        {customImage ? (
          <Visual className="mx-auto max-w-4xl" fallback="integrations" locale={locale} visual={visual} />
        ) : (
          <FlowDiagram groups={list.map((g) => ({ title: g.title, items: g.items || [] }))} locale={locale} />
        )}
      </div>
      {list.length > 0 && (
        <div className="reveal flex flex-col gap-4">
          <ul className="flex flex-wrap justify-center gap-2">
            {list.flatMap((g) => g.items || []).map((item, ii) => (
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
          {link && (
            <div className="flex justify-center">
              <CMSLink {...link} appearance="inline" className="link-arrow type-small" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
