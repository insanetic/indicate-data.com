'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { localeLabels, localeTags, locales, type Locale } from '@/i18n/config'
import { switchLocale } from '@/i18n/href'
import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/ui'

type Props = {
  className?: string
  /** Accessible group label, e.g. "Sprache". */
  label: string
  variant?: 'pill' | 'text'
}

/** DE / EN toggle that keeps the visitor on the same page. */
export const LanguageSwitch: React.FC<Props> = ({ className, label, variant = 'pill' }) => {
  const current = useLocale()
  const pathname = usePathname() || '/'

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
        'inline-flex items-center rounded-pill border border-line bg-surface p-0.5 type-caption font-medium',
        className,
      )}
    >
      {locales.map((locale) => (
        <Link
          aria-current={locale === current ? 'true' : undefined}
          className={cn(
            'rounded-pill px-2.5 py-1 uppercase tracking-[0.04em] transition-colors duration-150',
            locale === current ? 'bg-ink text-surface' : 'text-ink-3 hover:text-ink',
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
