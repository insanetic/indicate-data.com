import { BadgeCheck } from 'lucide-react'
import React from 'react'

import { localeLabels, localeTags, type Locale } from '@/i18n/config'
import type { BindingLanguage } from './TranslationNotice'

type Meta = { lastUpdated?: string | null; effectiveFrom?: string | null; version?: string | null }
type Props = {
  locale: Locale
  meta?: Meta | null
  binding: BindingLanguage
  labels: { lastUpdated: string; effectiveFrom: string; version: string; bindingVersion: string }
}

// The company and its editors work in Germany, and both seeded dates (UTC midnight)
// and admin-picked dates (local midnight) should read as the same calendar day
// regardless of the server's own time zone, so both helpers pin to Europe/Berlin.
export const formatDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(localeTags[locale], { dateStyle: 'long', timeZone: 'Europe/Berlin' }).format(new Date(iso))

/** `YYYY-MM-DD` in Europe/Berlin, for `<time dateTime>` — kept in sync with `formatDate`'s calendar day. */
export const isoDate = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))

/** "Stand · Gültig ab · Version" plus a tag when this is the binding language. */
export const DocumentMeta: React.FC<Props> = ({ locale, meta, binding, labels }) => {
  const items: { label: string; value: React.ReactNode }[] = []
  if (meta?.lastUpdated) items.push({ label: labels.lastUpdated, value: <time dateTime={isoDate(meta.lastUpdated)}>{formatDate(meta.lastUpdated, locale)}</time> })
  if (meta?.effectiveFrom) items.push({ label: labels.effectiveFrom, value: <time dateTime={isoDate(meta.effectiveFrom)}>{formatDate(meta.effectiveFrom, locale)}</time> })
  if (meta?.version) items.push({ label: labels.version, value: meta.version })
  const isBinding = binding === locale

  if (items.length === 0 && !isBinding) return null

  return (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 type-small tabular-nums text-ink-2">
      {items.map((item) => (
        <div className="flex gap-2" key={item.label}>
          <dt className="text-ink-3">{item.label}</dt>
          <dd className="text-ink">{item.value}</dd>
        </div>
      ))}
      {isBinding && (
        <div className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 type-caption text-ink-2">
          <BadgeCheck aria-hidden="true" className="size-3.5 text-accent" strokeWidth={2} />
          <dt className="sr-only">{labels.bindingVersion}</dt>
          <dd>
            {labels.bindingVersion} · {localeLabels[locale]}
          </dd>
        </div>
      )}
    </dl>
  )
}
