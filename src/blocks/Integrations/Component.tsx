import React from 'react'

import type { IntegrationsBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual } from '@/components/Illustrations'

export const IntegrationsBlock: React.FC<Props & { locale?: Locale }> = ({ header, visual, groups, links, locale }) => {
  const list = (groups || []).filter((g) => g.title && (g.items || []).length > 0)
  const link = (links || []).find((l) => l.link?.label)?.link

  return (
    <div className="container">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Visual className="w-full" fallback="integrations" locale={locale} visual={visual} />
        </div>
        <div className="flex flex-col gap-8 lg:col-span-7">
          <SectionHeading className="reveal" header={header} />
          {list.length > 0 && (
            <div className="reveal-stagger flex flex-col gap-6">
              {list.map((group, gi) => (
                <div className="flex flex-col gap-3" key={group.id || gi} style={{ '--i': gi } as React.CSSProperties}>
                  <p className="type-small font-medium text-ink-3">{group.title}</p>
                  <ul className="flex flex-wrap gap-2">
                    {group.items!.map((item, ii) => (
                      <li
                        className="flex h-10 items-center gap-2 rounded-pill border border-line bg-surface px-3 type-small font-medium text-ink"
                        key={item.id || ii}
                      >
                        {item.logo && typeof item.logo === 'object' ? (
                          <Media htmlElement={null} imgClassName="size-5 rounded-sm object-contain" resource={item.logo} />
                        ) : (
                          <span className="inline-flex size-5 items-center justify-center rounded-md bg-brand-blue-soft text-[0.625rem] font-semibold text-brand-blue-deep">
                            {item.name.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {link && (
            <div>
              <CMSLink {...link} appearance={link.appearance === 'outline' ? 'secondary' : 'link'} size="sm" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
