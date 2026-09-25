import React from 'react'

import type { ItemsBlock as Props } from '@/payload-types'

import { cn } from '@/utilities/ui'

import { gridClasses, resolveColumns, type ItemStyle } from './columns'
import { PointList } from './Points'
import { Stats } from './Stats'
import { Steps } from './Steps'

export type ItemRow = NonNullable<Props['items']>[number]
export type StyleProps = { items: ItemRow[]; grid: string; panel: boolean }

/** One row of points, cards, steps or numbers; see `resolveColumns` for the automatic columns. */
export const ItemsBlock: React.FC<Props> = ({ style, columns, frame, divider, items }) => {
  const kind: ItemStyle = style || 'points'
  const list = (items || []).filter((i) => i.title)
  if (list.length === 0) return null
  // Only numbers sit on a shared panel; points and cards never get a surface of their own.
  const panel = frame === 'panel' && kind === 'stats'
  const props: StyleProps = { items: list, grid: gridClasses(kind, resolveColumns(kind, columns, list.length)), panel }
  return (
    <div className="container">
      <div
        className={cn(divider && 'border-t border-line pt-8', panel && 'overflow-hidden rounded-[1.25rem] border border-line bg-surface-2')}
        data-style={kind}
      >
        {kind === 'steps' ? <Steps {...props} /> : kind === 'stats' ? <Stats {...props} /> : <PointList {...props} />}
      </div>
    </div>
  )
}
