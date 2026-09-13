import { Check, KeyRound, ShieldCheck } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Avatar, Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

/** Which role may do what, per area (dashboards, data & KPIs, team, billing). */
const matrix: boolean[][] = [
  [true, true, true, true],
  [true, true, true, false],
  [true, true, false, false],
  [true, false, false, false],
  [true, false, false, false],
]

const members = [
  { initials: 'AB', tone: 'blue' as const },
  { initials: 'LH', tone: 'yellow' as const },
  { initials: 'JK', tone: 'coral' as const },
]

/**
 * Looping scene (wide): an organisation with three spaces and their members on the left, the
 * role matrix in the middle, and the audit log on the right, where entries arrive one after
 * another. Timing lives in loops.css (`.loop-log`, 8 s).
 */
export const GovernanceIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const g = l.scenes.governance

  return (
    <Frame className={cn('loop w-full', className)} label="Organisation mit Spaces, Rollen-Matrix und Audit-Log">
      <div className="grid overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float md:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,4fr)]" style={{ '--loop': '8s' } as React.CSSProperties}>
        {/* Spaces */}
        <div className="flex flex-col gap-3 border-b border-line p-4 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 type-caption font-medium text-ink-2">
              <BrandBars size={12} /> {g.org}
            </span>
            <Chip tone="yellow"><ShieldCheck aria-hidden="true" size={11} strokeWidth={2} /> {g.policy}</Chip>
          </div>
          <ul className="flex flex-col gap-1.5">
            {g.spaces.map((name, i) => (
              <li className="flex items-center justify-between gap-3 rounded-card-inner border border-line bg-surface px-3 py-2.5" key={name}>
                <span className="flex flex-col">
                  <span className="type-small font-medium text-ink">{name}</span>
                  <span className="type-caption text-ink-3">{3 + i} {g.members} · {g.roles[i === 0 ? 0 : 1]}</span>
                </span>
                <span className="flex -space-x-1.5">
                  {members.slice(0, 3 - (i === 2 ? 1 : 0)).map((m) => (
                    <Avatar className="size-6 text-[0.625rem] ring-2 ring-surface" initials={m.initials} key={m.initials} tone={m.tone} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <span className="mt-auto flex items-center gap-2 px-1 type-caption text-ink-3">
            <KeyRound aria-hidden="true" size={13} strokeWidth={1.75} /> {g.tokens}
          </span>
        </div>

        {/* Role matrix */}
        <div className="flex flex-col gap-3 border-b border-line p-4 md:border-b-0 md:border-r">
          <span className="type-caption font-medium text-ink-2">{g.roles.length} {g.rolesLabel}</span>
          <table className="w-full border-separate border-spacing-y-1 type-caption">
            <thead>
              <tr className="text-ink-3">
                <th className="w-[30%] text-left font-normal" scope="col" />
                {g.areas.map((a) => (
                  <th className="truncate px-1 text-center font-normal" key={a} scope="col">{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {g.roles.map((role, ri) => (
                <tr className="rounded-card-inner bg-surface" key={role}>
                  <th className="rounded-l-md px-2.5 py-1.5 text-left font-medium text-ink" scope="row">{role}</th>
                  {matrix[ri].map((ok, ai) => (
                    <td className={cn('py-1.5 text-center', ai === matrix[ri].length - 1 && 'rounded-r-md')} key={ai}>
                      {ok ? (
                        <Check aria-hidden="true" className="inline text-[oklch(0.78_0.15_160)]" size={13} strokeWidth={2.5} />
                      ) : (
                        <i className="inline-block size-1 rounded-full bg-surface-3 align-middle" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit log */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="type-caption font-medium text-ink-2">{g.audit}</span>
            <span className="type-caption tnum text-ink-3">{g.retention}</span>
          </div>
          <ul className="flex flex-col gap-1.5 type-caption">
            {g.log.map(([time, who, what], i) => (
              <li
                className="loop-log flex items-start gap-2.5 rounded-card-inner border border-line bg-surface px-3 py-2"
                key={time}
                style={{ '--delay': `${i * 1.1}s` } as React.CSSProperties}
              >
                <span className="tnum text-ink-3">{time}</span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium text-ink">{who}</span>
                  <span className="truncate text-ink-3">{what}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  )
}
