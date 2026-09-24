import React from 'react'

import type { SplitBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { ActionRow } from '@/components/ActionRow'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual } from '@/components/Illustrations'
import { PointList } from '@/blocks/Items/Points'
import { cn } from '@/utilities/ui'

export const SplitBlock: React.FC<Props & { locale?: Locale; isFirst?: boolean }> = ({ header, mediaSide, visual, points, links, locale, isFirst }) => {
  const mediaLeft = mediaSide === 'left'
  const list = (points || []).filter((p) => p.title)
  return (
    <div className="container">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className={cn('reveal flex flex-col gap-8 lg:col-span-5', mediaLeft && 'lg:order-2')} data-part="text">
          <SectionHeading align="left" as={isFirst ? 'h1' : 'h2'} header={header} />
          {list.length > 0 && <PointList items={list} layout="column" />}
          <ActionRow links={links} />
        </div>
        <div className={cn('reveal lg:col-span-7', mediaLeft && 'lg:order-1')} data-part="media" style={{ '--i': 1 } as React.CSSProperties}>
          <Visual className="w-full" fallback="builder" locale={locale} visual={visual} />
        </div>
      </div>
    </div>
  )
}
