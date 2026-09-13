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

export const formatDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(localeTags[locale], { dateStyle: 'long' }).format(new Date(iso))

/** "Stand · Gültig ab · Version" plus a tag when this is the binding language. */
export const DocumentMeta: React.FC<Props> = ({ locale, meta, binding, labels }) => {
  const items: { label: string; value: React.ReactNode }[] = []
  if (meta?.lastUpdated) items.push({ label: labels.lastUpdated, value: <time dateTime={meta.lastUpdated.slice(0, 10)}>{formatDate(meta.lastUpdated, locale)}</time> })
  if (meta?.effectiveFrom) items.push({ label: labels.effectiveFrom, value: <time dateTime={meta.effectiveFrom.slice(0, 10)}>{formatDate(meta.effectiveFrom, locale)}</time> })
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
