'use client'

import { ChevronDown, Globe } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useId } from 'react'

import { localeLabels, localeTags, locales, type Locale } from '@/i18n/config'
import { switchLocale } from '@/i18n/href'
import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  /** Accessible group label, e.g. "Sprache". */
  label: string
  variant?: 'pill' | 'text' | 'select'
}

/**
 * Language switch that keeps the visitor on the same page. `select` is the footer combobox
 * (a native select, so it works with keyboard and screen readers without extra code).
 */
export const LanguageSwitch: React.FC<Props> = ({ className, label, variant = 'pill' }) => {
  const current = useLocale()
  const pathname = usePathname() || '/'
  const router = useRouter()
  const id = useId()

  if (variant === 'select') {
    return (
      <div className={cn('relative inline-flex items-center', className)}>
        <label className="sr-only" htmlFor={id}>
          {label}
        </label>
        <Globe aria-hidden="true" className="pointer-events-none absolute left-3 size-4 text-ink-3" strokeWidth={1.75} />
        <select
          className="h-10 appearance-none rounded-btn border border-line bg-surface-2 pl-9 pr-9 text-base text-ink transition-colors duration-150 hover:border-line-strong focus-visible:border-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 md:text-[0.9375rem]"
          id={id}
          onChange={(e) => router.push(switchLocale(pathname, e.target.value as Locale))}
          value={current}
        >
          {locales.map((locale) => (
            <option key={locale} lang={localeTags[locale]} value={locale}>
              {localeLabels[locale]}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4 text-ink-3" strokeWidth={1.75} />
      </div>
    )
  }

  if (variant === 'text') {
    return (
      <nav aria-label={label} className={cn('flex items-center gap-3 type-small', className)}>
        {locales.map((locale) => (
          <Link
            aria-current={locale === current ? 'true' : undefined}
            className={cn(
              'transition-colors duration-150 hover:text-ink',
              locale === current ? 'text-ink font-medium' : 'text-ink-3',
            )}
            href={switchLocale(pathname, locale)}
            hrefLang={localeTags[locale]}
            key={locale}
            lang={localeTags[locale]}
          >
            {localeLabels[locale]}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-btn border border-line bg-surface-2 p-0.5 type-caption font-medium',
        className,
      )}
    >
      {locales.map((locale) => (
        <Link
          aria-current={locale === current ? 'true' : undefined}
          className={cn(
            'rounded-[0.25rem] px-2.5 py-1 uppercase tracking-[0.04em] transition-colors duration-150',
            locale === current ? 'bg-surface-3 text-ink' : 'text-ink-3 hover:text-ink',
          )}
          href={switchLocale(pathname, locale)}
          hrefLang={localeTags[locale]}
          key={locale}
          lang={localeTags[locale]}
          title={localeLabels[locale]}
        >
          {locale}
        </Link>
      ))}
    </nav>
  )
}

export const useSwitchLocaleHref = (locale: Locale) => {
  const pathname = usePathname() || '/'
  return switchLocale(pathname, locale)
}
