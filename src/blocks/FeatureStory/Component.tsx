import React from 'react'

import type { FeatureStoryBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { SectionHeading } from '@/components/SectionHeading'
import { Visual } from '@/components/Illustrations'
import { cn } from '@/utilities/ui'

/**
 * A feature told with a product scene. `stacked` (default): heading row, the scene at full
 * width, points in one row underneath, so the scene gets the space. `visual-left` and
 * `visual-right` put the text beside the scene instead.
 */
export const FeatureStoryBlock: React.FC<Props & { locale?: Locale }> = ({
  header,
  layout,
  visual,
  points,
  links,
  locale,
}) => {
  const list = (points || []).filter((p) => p.title)
  const buttons = (links || []).filter((l) => l.link?.label)
  const scene = <Visual className="w-full" fallback="builder" locale={locale} visual={visual} />

  const actions = buttons.length > 0 && (
    <div className="flex flex-wrap items-center gap-3">
      {buttons.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          appearance={link.appearance === 'outline' ? 'secondary' : link.appearance || 'primary'}
        />
      ))}
    </div>
  )

  if (layout === 'visual-left' || layout === 'visual-right') {
    const visualLeft = layout === 'visual-left'
    return (
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className={cn('reveal flex flex-col gap-8 lg:col-span-5', visualLeft && 'lg:order-2')}>
            <SectionHeading align="left" header={header} />
            {list.length > 0 && (
              <ul className="flex flex-col gap-5">
                {list.map((p, i) => (
                  <Point key={p.id || i} {...p} />
                ))}
              </ul>
            )}
            {actions}
          </div>
          <div className={cn('reveal lg:col-span-7', visualLeft && 'lg:order-1')} style={{ '--i': 1 } as React.CSSProperties}>
            {scene}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex flex-col gap-10 md:gap-12">
      <div className="reveal grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
        <SectionHeading align="left" className="lg:col-span-8" header={{ ...header, lead: null }} />
        {header?.lead && (
          <p className="type-lead max-w-[48ch] text-ink-2 lg:col-span-4 lg:pb-1">{header.lead}</p>
        )}
      </div>
      <div className="reveal" style={{ '--i': 1 } as React.CSSProperties}>
        {scene}
      </div>
      {(list.length > 0 || buttons.length > 0) && (
        <div className="reveal flex flex-col gap-8" style={{ '--i': 2 } as React.CSSProperties}>
          {list.length > 0 && (
            <ul
              className={cn(
                'grid gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-2',
                list.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
              )}
            >
              {list.map((p, i) => (
                <Point key={p.id || i} {...p} />
              ))}
            </ul>
          )}
          {actions}
        </div>
      )}
    </div>
  )
}

type PointProps = NonNullable<Props['points']>[number]

const Point: React.FC<PointProps> = ({ icon, title, text }) => (
  <li className="flex gap-3.5">
    <Icon className="mt-1 shrink-0 text-accent" name={icon} size={20} />
    <div className="flex flex-col gap-1">
      <p className="font-medium text-ink">{title}</p>
      {text && <p className="type-small text-ink-2 pretty max-w-[40ch]">{text}</p>}
    </div>
  </li>
)
