import React from 'react'

import { Icon } from '@/components/Icon'
import { withResi } from '@/components/Resi'
import { cn } from '@/utilities/ui'

export type PointRow = { icon?: string | null; title: string; text?: string | null; id?: string | null }

/** Icon, title and text. A row in the Items block, a column beside the scene in Split. */
export const PointList: React.FC<{ items: PointRow[]; grid?: string; panel?: boolean; layout?: 'row' | 'column' }> = ({
  items,
  grid,
  panel,
  layout = 'row',
}) => (
  <ul
    className={cn(
      layout === 'column' ? 'flex flex-col gap-5' : 'grid gap-x-8 gap-y-6',
      layout === 'row' && grid,
      panel && 'gap-0 divide-y divide-line lg:divide-x lg:divide-y-0',
    )}
  >
    {items.map((p, i) => (
      <li className={cn('flex gap-3.5', panel && 'p-6 md:p-8')} key={p.id || i}>
        <Icon className="mt-1 shrink-0 text-accent" name={p.icon} size={20} />
        <div className="flex flex-col gap-1">
          <p className="font-medium text-ink">{withResi(p.title)}</p>
          {p.text && <p className="type-small text-ink-2 pretty max-w-[40ch]">{withResi(p.text)}</p>}
        </div>
      </li>
    ))}
  </ul>
)
