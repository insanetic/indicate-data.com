import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { LocaleProvider } from './Locale'
import { ThemeProvider } from './Theme'
import type { Locale } from '@/i18n/config'

export const Providers: React.FC<{
  children: React.ReactNode
  locale: Locale
}> = ({ children, locale }) => {
  return (
    <LocaleProvider locale={locale}>
      <ThemeProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </ThemeProvider>
    </LocaleProvider>
  )
}
