import React from 'react'

import type { FeatureTabsBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual } from '@/components/Illustrations'
import { Feature } from '@/components/Feature'
import { Icon } from '@/components/Icon'
import { FeatureTabsClient, type TabData } from './Client'

export const FeatureTabsBlock: React.FC<Props & { locale?: Locale }> = ({ header, tabs, locale }) => {
  const list = (tabs || []).filter((t) => t.label && t.heading)
  if (list.length === 0) return null

  const data: TabData[] = list.map((tab, i) => ({
    id: tab.id || String(i),
    label: tab.label,
    icon: tab.icon ? <Icon name={tab.icon} size={18} /> : null,
    content: (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="type-h3 text-ink">{tab.heading}</h3>
          {tab.description && <p className="type-body text-ink-2 pretty max-w-[52ch]">{tab.description}</p>}
        </div>
        {(tab.points || []).length > 0 && (
          <ul className="flex flex-col gap-6">
            {tab.points!.map((p, pi) => (
              <Feature icon={p.icon} key={p.id || pi} text={p.text} title={p.title} />
            ))}
          </ul>
        )}
        {(tab.links || []).filter((l) => l.link?.label).map(({ link }, li) => (
          <div key={li}>
            <CMSLink {...link} appearance={link.appearance === 'outline' ? 'secondary' : 'link'} size="sm" />
          </div>
        ))}
      </div>
    ),
    visual: <Visual className="w-full" fallback="dashboard" locale={locale} visual={tab.visual} />,
  }))

  return (
    <div className="container">
      <SectionHeading align="center" className="mx-auto mb-10 md:mb-14 reveal" header={header} />
      <FeatureTabsClient tabs={data} />
    </div>
  )
}
