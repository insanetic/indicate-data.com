import type { Locale } from '@/i18n/config'
import type { Consent } from '@/payload-types'

import { consentConfig, type CategoryKey } from './config'

export type ServiceText = { name: string; provider?: string; purpose?: string; cookies?: string; privacyUrl?: string }
export type CategoryText = { key: CategoryKey; required: boolean; label: string; description: string; services: ServiceText[] }

type CategoryDefaults = Record<CategoryKey, { label: string; description: string }>

type Strings = {
  bannerTitle: string
  bannerText: string
  settingsTitle: string
  settingsText: string
  acceptAll: string
  rejectAll: string
  openSettings: string
  saveSelection: string
  cookieSettings: string
  lastChanged: string
  showServices: string
  alwaysActive: string
  privacy: string
  imprint: string
  close: string
  provider: string
  cookies: string
  privacyLink: string
  categories: CategoryDefaults
}

export type ConsentTexts = Omit<Strings, 'categories'> & { categories: CategoryText[] }

export type ResolvedConsent = {
  texts: ConsentTexts
  revision: number
  privacyHref: string | null
  imprintHref: string | null
}

const de: Strings = {
  bannerTitle: 'Cookies auf dieser Website',
  bannerText:
    'Wir verwenden Cookies nur mit Ihrer Zustimmung, um zu verstehen, wie die Website genutzt wird. Ohne Ihre Zustimmung wird nichts erfasst.',
  settingsTitle: 'Cookie-Einstellungen',
  settingsText: 'Wählen Sie, welche Kategorien Sie erlauben. Ihre Auswahl können Sie jederzeit hier ändern.',
  acceptAll: 'Alle akzeptieren',
  rejectAll: 'Nur notwendige',
  openSettings: 'Einstellungen',
  saveSelection: 'Auswahl speichern',
  cookieSettings: 'Cookie-Einstellungen',
  lastChanged: 'Zuletzt geändert am',
  showServices: 'Dienste anzeigen',
  alwaysActive: 'Immer aktiv',
  privacy: 'Datenschutz',
  imprint: 'Impressum',
  close: 'Schließen',
  provider: 'Anbieter',
  cookies: 'Cookies',
  privacyLink: 'Datenschutzerklärung des Anbieters',
  categories: {
    necessary: { label: 'Notwendig', description: 'Für den Betrieb der Website erforderlich, etwa um Ihre Cookie-Auswahl zu speichern.' },
    analytics: { label: 'Statistik', description: 'Hilft uns zu verstehen, welche Seiten besucht werden. Die Daten werden anonymisiert ausgewertet.' },
    marketing: { label: 'Marketing', description: 'Ermöglicht es, den Erfolg unserer Kampagnen zu messen und Ihnen relevante Inhalte zu zeigen.' },
  },
}

const en: Strings = {
  bannerTitle: 'Cookies on this website',
  bannerText:
    'We only use cookies with your consent, to understand how the website is used. Nothing is recorded without your consent.',
  settingsTitle: 'Cookie settings',
  settingsText: 'Choose which categories you allow. You can change your selection here at any time.',
  acceptAll: 'Accept all',
  rejectAll: 'Only necessary',
  openSettings: 'Settings',
  saveSelection: 'Save selection',
  cookieSettings: 'Cookie settings',
  lastChanged: 'Last changed on',
  showServices: 'Show services',
  alwaysActive: 'Always active',
  privacy: 'Privacy',
  imprint: 'Imprint',
  close: 'Close',
  provider: 'Provider',
  cookies: 'Cookies',
  privacyLink: 'Provider privacy policy',
  categories: {
    necessary: { label: 'Necessary', description: 'Required to run the website, for example to remember your cookie choice.' },
    analytics: { label: 'Statistics', description: 'Helps us understand which pages are visited. Data is evaluated anonymously.' },
    marketing: { label: 'Marketing', description: 'Lets us measure our campaigns and show you relevant content.' },
  },
}

export const defaults: Record<Locale, Strings> = { de, en }

const pageHref = (locale: string, value: Consent['privacyPage']): string | null => {
  if (!value || typeof value !== 'object' || !value.slug) return null
  return value.slug === 'home' ? `/${locale}` : `/${locale}/${value.slug}`
}

const text = (cms: string | null | undefined, fallback: string) => (cms && cms.trim() ? cms : fallback)

/** Merges the CMS global into the code defaults, field by field, for one locale. */
export function resolveConsent(global: Consent | null | undefined, locale: Locale): ResolvedConsent {
  const base = defaults[locale] || defaults.en
  const rows = global?.categories || []
  const categories: CategoryText[] = consentConfig.categories.map((category) => {
    const row = rows.find((r) => r.key === category.key)
    return {
      key: category.key,
      required: category.required,
      label: text(row?.label, base.categories[category.key].label),
      description: text(row?.description, base.categories[category.key].description),
      services: (row?.services || []).map((s) => ({
        name: s.name,
        provider: s.provider || undefined,
        purpose: s.purpose || undefined,
        cookies: s.cookies || undefined,
        privacyUrl: s.privacyUrl || undefined,
      })),
    }
  })
  return {
    revision: global?.revision || 1,
    privacyHref: pageHref(locale, global?.privacyPage),
    imprintHref: pageHref(locale, global?.imprintPage),
    texts: {
      ...base,
      bannerTitle: text(global?.banner?.title, base.bannerTitle),
      bannerText: text(global?.banner?.text, base.bannerText),
      settingsTitle: text(global?.settings?.title, base.settingsTitle),
      settingsText: text(global?.settings?.text, base.settingsText),
      categories,
    },
  }
}
