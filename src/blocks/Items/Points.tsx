import React from 'react'

import { Feature } from '@/components/Feature'
import { cn } from '@/utilities/ui'

import type { StyleProps } from './Component'

/** Points and cards share one shape since 2026-09: see `Feature`. A double-width card still spans two columns. */
export const PointList: React.FC<StyleProps> = ({ items, grid }) => (
  <ul className={cn('reveal-stagger grid gap-x-10 gap-y-12', grid)}>
    {items.map((item, i) => (
      <Feature
        className={cn(item.size === 'lg' && 'md:col-span-2')}
        icon={item.icon}
        key={item.id || i}
        link={(item.links || []).find((l) => l.link?.label)?.link}
        points={item.points}
        style={{ '--i': i } as React.CSSProperties}
        text={item.text}
        title={item.title}
      />
    ))}
  </ul>
)
