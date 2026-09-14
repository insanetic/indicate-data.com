import React from 'react'

import type { ResolvedConsent } from '@subneo/payload-consent'

import { ConsentRoot } from '@/consent/ConsentRoot'
import type { Locale } from '@/i18n/config'

import { HeaderThemeProvider } from './HeaderTheme'
import { LocaleProvider } from './Locale'
import { ThemeProvider } from './Theme'

export type ConsentProps = { settings: ResolvedConsent; disabled?: boolean }

export const Providers: React.FC<{
  children: React.ReactNode
  locale: Locale
  consent: ConsentProps
}> = ({ children, locale, consent }) => {
  return (
    <LocaleProvider locale={locale}>
      <ConsentRoot disabled={consent.disabled} locale={locale} settings={consent.settings}>
        <ThemeProvider>
          <HeaderThemeProvider>{children}</HeaderThemeProvider>
        </ThemeProvider>
      </ConsentRoot>
    </LocaleProvider>
  )
}
