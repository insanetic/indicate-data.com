'use client'

import { useTranslation } from '@payloadcms/ui'

/** Picks the German or English string for the admin UI language. */
export const useL = () => {
  const { i18n } = useTranslation()
  return (de: string, en: string) => (i18n.language === 'de' ? de : en)
}
