import { Check, Users } from 'lucide-react'
import React from 'react'

import { BrandBars } from '@/components/BrandBars'
import { cn } from '@/utilities/ui'

import { Avatar, Chip, Frame } from './primitives'
import { labelsFor } from './labels'
import type { IllustrationProps } from './index'

type Client = {
  spend: string
  bookings: string
  revenue: string
  roi: string
  /** Bar heights (0–100) for spend, bookings, revenue. */
  bars: [number, number, number]
  gap: boolean
}

/** Demo figures for three agency clients; identical in every language. */
const clients: Client[] = [
  { spend: '3.200 €', bookings: '118', revenue: '41.300 €', roi: '12,9×', bars: [28, 62, 92], gap: false },
  { spend: '5.900 €', bookings: '96', revenue: '38.700 €', roi: '6,6×', bars: [46, 52, 84], gap: true },
  { spend: '1.400 €', bookings: '74', revenue: '19.800 €', roi: '14,1×', bars: [16, 48, 70], gap: false },
]

/**
 * Looping scene (wide) for agencies: client tabs take turns (one login, every client). For
 * each one the campaign figures rise, a shared strategy thread with the client pops in, and
 * the automation card shows the monthly reports going out by themselves.
 * Timing lives in loops.css (`.loop-slot-3`, `.loop-row-3`, `.loop-rise-3`, `.loop-pop-3`).
 */
export const CampaignsIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const l = labelsFor(locale)
  const s = l.scenes
  const series = [
    { label: s.adSpend, color: 'bg-surface-3' },
    { label: l.bookings, color: 'bg-brand-blue' },
    { label: s.revenue, color: 'bg-accent' },
  ]

  return (
    <Frame className={cn('loop w-full', className)} label="Agentur-Arbeitsplatz: Kampagnen-ROI je Kunde, gemeinsame Strategie und automatische Reports">
      <div className="overflow-hidden rounded-[1rem] border border-line-strong bg-surface-2 shadow-float">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-line px-3 py-2 [scrollbar-width:none]">
          <BrandBars className="mx-1 shrink-0" size={12} />
          {s.clients.map((name, i) => (
            <span
              className="loop-row-3 shrink-0 rounded-btn px-2.5 py-1 type-caption font-medium"
              data-first={i === 0 || undefined}
              key={name}
              style={{ '--delay': `${(i * 10) / 3}s` } as React.CSSProperties}
            >
              {name}
            </span>
          ))}
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 type-caption text-ink-3 md:flex">
            <Users aria-hidden="true" size={13} strokeWidth={1.75} /> 12 Spaces
          </span>
        </div>

        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
          {/* Campaign figures per client */}
          <div className="relative min-h-[16rem] border-b border-line p-4 md:border-b-0 md:border-r md:p-5">
            {clients.map((c, i) => (
              <div
                className="loop-slot-3 absolute inset-4 flex flex-col gap-4 md:inset-5"
                data-first={i === 0 || undefined}
                key={i}
                style={{ '--delay': `${(i * 10) / 3}s` } as React.CSSProperties}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="type-caption text-ink-3">{s.campaignRoi} · Q3</span>
                    <span className="font-display text-3xl font-medium leading-none tnum text-accent">{c.roi}</span>
                  </div>
                  {c.gap ? (
                    <Chip tone="coral">{s.gap}</Chip>
                  ) : (
                    <Chip tone="green">
                      <Check aria-hidden="true" size={11} strokeWidth={2.5} /> {s.reportSent}
                    </Chip>
                  )}
                </div>
                <div className="grid flex-1 grid-cols-3 gap-3">
                  {series.map((ser, si) => (
                    <div className="flex flex-col gap-1.5" key={ser.label}>
                      <div className="flex h-20 items-end rounded-card-inner border border-line bg-surface p-2">
                        <span
                          className={cn('loop-rise-3 w-full rounded-[3px]', ser.color)}
                          style={{ height: `${c.bars[si]}%`, '--delay': `${(i * 10) / 3}s` } as React.CSSProperties}
                        />
                      </div>
                      <span className="type-caption text-ink-3">{ser.label}</span>
                      <span className="font-display text-base font-medium leading-none tnum text-ink">
                        {[c.spend, c.bookings, c.revenue][si]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Shared strategy thread + automation */}
          <div className="flex flex-col gap-3 p-4 md:p-5">
            <div className="flex flex-col gap-3 rounded-card-inner border border-line bg-surface p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="type-small font-medium text-ink">{s.strategy}</span>
                <span className="flex items-center gap-1.5 type-caption text-ink-3">
                  <span className="flex -space-x-1.5">
                    <Avatar className="size-5 text-[0.5625rem]" initials="L" tone="blue" />
                    <Avatar className="size-5 text-[0.5625rem]" initials="K" tone="yellow" />
                  </span>
                  {s.sharedWith}
                </span>
              </div>
              <div className="relative min-h-[5.5rem]">
                {clients.map((_, i) => (
                  <div
                    className="loop-slot-3 absolute inset-0 flex flex-col gap-2"
                    data-first={i === 0 || undefined}
                    key={i}
                    style={{ '--delay': `${(i * 10) / 3}s` } as React.CSSProperties}
                  >
                    <div className="flex gap-2">
                      <Avatar className="size-6 shrink-0 text-[0.625rem]" initials="L" tone="blue" />
                      <div className="flex flex-col rounded-[0.75rem] rounded-tl-sm bg-surface-2 px-3 py-2">
                        <span className="type-caption text-ink-3">{s.commentBy}</span>
                        <span className="type-caption text-ink">{s.comment}</span>
                      </div>
                    </div>
                    <div className="loop-pop-3 flex justify-end gap-2" style={{ '--delay': `${(i * 10) / 3}s` } as React.CSSProperties}>
                      <div className="flex flex-col items-end rounded-[0.75rem] rounded-tr-sm bg-brand-yellow-soft px-3 py-2">
                        <span className="type-caption text-ink-3">{s.replyBy}</span>
                        <span className="type-caption text-ink">{s.reply} ✓</span>
                      </div>
                      <Avatar className="size-6 shrink-0 text-[0.625rem]" initials="K" tone="yellow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-card-inner border border-line bg-surface px-3.5 py-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-yellow-soft text-accent">
                <Check aria-hidden="true" size={15} strokeWidth={2} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="type-small font-medium text-ink">{s.automation}</span>
                <span className="truncate type-caption text-ink-3">{s.automationText}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}
