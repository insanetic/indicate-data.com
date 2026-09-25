import { Check } from 'lucide-react'
import React from 'react'

import { cn } from '@/utilities/ui'

import { Avatar, Backdrop, Card, Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/** One space per hotel with roles and two-factor status. */
export const TeamIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const rows = [
    { name: 'Anna Berger', initials: 'AB', role: l.owner, tone: 'blue' as const },
    { name: 'Lukas Hofer', initials: 'LH', role: l.admin, tone: 'yellow' as const },
    { name: 'Maria Stein', initials: 'MS', role: l.reader, tone: 'coral' as const },
  ]
  return (
    <Frame className={cn('aspect-[5/4] w-full', className)} label="Team und Rechte pro Space">
      <Backdrop tone="coral" />
      <Card className="absolute left-[14%] right-[4%] top-[8%] p-4 opacity-70" raised={false}>
        <span className="type-caption text-ink-3">{l.space} · Seehotel Bergblick</span>
      </Card>
      <Card className="absolute left-[6%] right-[12%] top-[18%] p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="type-caption text-ink-3">{l.space}</span>
            <span className="font-display text-lg font-medium">Hotel Alpenrose</span>
          </div>
          <div className="flex -space-x-2">
            {rows.map((r) => (
              <Avatar className="ring-2 ring-surface" initials={r.initials} key={r.name} tone={r.tone} />
            ))}
          </div>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {rows.map((r) => (
            <li className="flex items-center gap-3 py-2.5" key={r.name}>
              <Avatar initials={r.initials} tone={r.tone} />
              <span className="type-small font-medium text-ink">{r.name}</span>
              <Chip className="ml-auto" tone={r.tone === 'coral' ? 'neutral' : 'blue'}>
                {r.role}
              </Chip>
              <span className="flex items-center gap-1 type-caption text-ink-3">
                <Check aria-hidden="true" className="size-3.5 text-success-deep" strokeWidth={2.5} /> {l.twoFactor}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </Frame>
  )
}
