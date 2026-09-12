'use client'

import Link from 'next/link'
import React from 'react'

import { localizeHref } from '@/i18n/href'
import { useLocale } from '@/providers/Locale'

type Props = Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }

/** `next/link` that prefixes internal hrefs with the current locale. */
export const LocaleLink = React.forwardRef<HTMLAnchorElement, Props>(function LocaleLink(
  { href, ...rest },
  ref,
) {
  const locale = useLocale()
  return <Link ref={ref} href={localizeHref(href, locale)} {...rest} />
})
