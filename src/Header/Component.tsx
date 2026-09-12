import React from 'react'

import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/config'

export async function Header({ locale }: { locale: Locale }) {
  const [headerData, settings] = await Promise.all([
    getCachedGlobal('header', 1, locale)(),
    getCachedGlobal('site-settings', 1, locale)(),
  ])
  const dict = getDictionary(locale)

  return (
    <HeaderClient
      data={headerData}
      labels={{
        closeMenu: dict.closeMenu,
        language: dict.language,
        mainNavigation: dict.mainNavigation,
        menu: dict.menu,
        openMenu: dict.openMenu,
      }}
      settings={settings}
    />
  )
}
