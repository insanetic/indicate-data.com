import React from 'react'

import { ConsentProvider } from '@/consent/components/ConsentProvider'
import type { Locale } from '@/i18n/config'
import type { Consent } from '@/payload-types'

import { HeaderThemeProvider } from './HeaderTheme'
import { LocaleProvider } from './Locale'
import { ThemeProvider } from './Theme'

export type ConsentProps = { settings: Consent | null; gtmId?: string; disabled?: boolean }

export const Providers: React.FC<{
  children: React.ReactNode
  locale: Locale
  consent: ConsentProps
}> = ({ children, locale, consent }) => {
  return (
    <LocaleProvider locale={locale}>
      <ConsentProvider disabled={consent.disabled} gtmId={consent.gtmId} settings={consent.settings}>
        <ThemeProvider>
          <HeaderThemeProvider>{children}</HeaderThemeProvider>
        </ThemeProvider>
      </ConsentProvider>
    </LocaleProvider>
  )
}
