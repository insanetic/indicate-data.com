'use client'

import React, { createContext, useContext } from 'react'

import { defaultLocale, type Locale } from '@/i18n/config'

const LocaleContext = createContext<Locale>(defaultLocale)

export const LocaleProvider: React.FC<{ locale: Locale; children: React.ReactNode }> = ({
  locale,
  children,
}) => <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>

/** The current site locale, for client components. Server components receive it as a prop. */
export const useLocale = (): Locale => useContext(LocaleContext)
