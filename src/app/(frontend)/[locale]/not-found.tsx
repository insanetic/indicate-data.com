'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { LocaleLink } from '@/components/LocaleLink'
import { getDictionary } from '@/i18n/dictionaries'
import { useLocale } from '@/providers/Locale'

export default function NotFound() {
  const locale = useLocale()
  const dict = getDictionary(locale)

  return (
    <div className="container py-28">
      <h1 className="type-h2 font-display mb-4">{dict.notFoundTitle}</h1>
      <p className="type-lead text-ink-2 mb-8 max-w-prose">{dict.notFoundText}</p>
      <Button asChild variant="primary">
        <LocaleLink href="/">{dict.backHome}</LocaleLink>
      </Button>
    </div>
  )
}
