import type { ResolvedSetup } from './setup'

export type Strings = {
  bannerTitle: string
  /** May contain `{categories}`: the optional category labels joined for the locale. */
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
  /** `{service}` and `{category}` placeholders. */
  gateText: string
  /** `{category}` placeholder. */
  gateAllow: string
}

const de: Strings = {
  bannerTitle: 'Cookies auf dieser Website',
  bannerText:
    'Wir verwenden Cookies nur mit Ihrer Zustimmung für {categories}. Sie können Ihre Auswahl jederzeit unter „Cookie-Einstellungen“ ändern oder widerrufen.',
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
  gateText: 'Dieser Inhalt wird von {service} bereitgestellt und erst nach Ihrer Zustimmung zur Kategorie „{category}“ geladen.',
  gateAllow: 'Laden und {category} erlauben',
}

const en: Strings = {
  bannerTitle: 'Cookies on this website',
  bannerText:
    'We use cookies only with your consent, for {categories}. You can change or withdraw your choice at any time under “Cookie settings”.',
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
  gateText: 'This content is provided by {service} and loads only after you allow the “{category}” category.',
  gateAllow: 'Load and allow {category}',
}

export const defaults: Record<string, Strings> = { de, en }

export const baseLanguage = (locale: string): string => locale.toLowerCase().split(/[-_]/)[0]

export const stringsFor = (locale: string): Strings => defaults[baseLanguage(locale)] || defaults.en

export const fill = (template: string, vars: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? vars[key] : match))

/** "Statistik und Marketing" / "statistics and marketing" via Intl.ListFormat, comma join as fallback. */
export function listLabels(locale: string, labels: readonly string[]): string {
  try {
    return new Intl.ListFormat(locale, { type: 'conjunction' }).format(labels)
  } catch {
    return labels.join(', ')
  }
}

export type ServiceText = {
  id?: string
  name: string
  provider?: string
  purpose?: string
  cookies?: string
  privacyUrl?: string
  integration?: string
}

export type CategoryText = { key: string; required: boolean; label: string; description: string; services: ServiceText[] }

export type ConsentTexts = Strings & { categories: CategoryText[] }

export type TriggerSettings = { mode: 'floating' | 'link'; position: 'bottom-left' | 'bottom-right' }

export type ResolvedConsent = {
  enabled: boolean
  revision: number
  privacyHref: string | null
  imprintHref: string | null
  trigger: TriggerSettings
  /** FNV-1a over every visible text, stored with each log row. */
  textsHash: string
  texts: ConsentTexts
}

type Nullable<T> = T | null | undefined

/** Loose shape of the `consent` global; the generated Payload type is assignable to it. */
export type ConsentGlobalDoc = {
  enabled?: Nullable<boolean>
  revision?: Nullable<number>
  privacyPage?: unknown
  imprintPage?: unknown
  trigger?: Nullable<{ mode?: Nullable<string>; position?: Nullable<string> }>
  banner?: Nullable<{ title?: Nullable<string>; text?: Nullable<string> }>
  settings?: Nullable<{ title?: Nullable<string>; text?: Nullable<string> }>
  categories?: Nullable<
    Array<{
      key?: Nullable<string>
      label?: Nullable<string>
      description?: Nullable<string>
      services?: Nullable<
        Array<{
          id?: Nullable<string>
          name?: Nullable<string>
          provider?: Nullable<string>
          purpose?: Nullable<string>
          cookies?: Nullable<string>
          privacyUrl?: Nullable<string>
          integration?: Nullable<string>
        }>
      >
    }>
  >
}

const pageHref = (locale: string, value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('slug' in value) || typeof value.slug !== 'string' || !value.slug) return null
  return value.slug === 'home' ? `/${locale}` : `/${locale}/${value.slug}`
}

const text = (cms: Nullable<string>, fallback: string) => (cms && cms.trim() ? cms : fallback)

/** FNV-1a 32-bit, hex. Plain JS so it runs in the layout, in the browser and in jsdom alike. */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

export function textsHash(texts: ConsentTexts): string {
  const { categories, ...strings } = texts
  const visible = {
    strings,
    categories: categories.map((c) => ({
      key: c.key,
      label: c.label,
      description: c.description,
      services: c.services.map((s) => [s.name, s.provider, s.purpose, s.cookies, s.privacyUrl, s.integration]),
    })),
  }
  return fnv1a(JSON.stringify(visible))
}

/** Merges the CMS global into the code defaults, field by field, for one locale. */
export function resolveConsent(global: ConsentGlobalDoc | null | undefined, locale: string, setup: ResolvedSetup): ResolvedConsent {
  const base = stringsFor(locale)
  const lang = baseLanguage(locale)
  const rows = global?.categories || []
  const categories: CategoryText[] = setup.categories.map((category) => {
    const row = rows.find((r) => r.key === category.key)
    const own = category.texts[lang] || category.texts.en || Object.values(category.texts)[0] || { label: category.key, description: '' }
    return {
      key: category.key,
      required: Boolean(category.required),
      label: text(row?.label, own.label),
      description: text(row?.description, own.description),
      services: (row?.services || [])
        .filter((s) => s.name)
        .map((s) => ({
          id: s.id || undefined,
          name: s.name as string,
          provider: s.provider || undefined,
          purpose: s.purpose || undefined,
          cookies: s.cookies || undefined,
          privacyUrl: s.privacyUrl || undefined,
          integration: s.integration && s.integration !== 'none' ? s.integration : undefined,
        })),
    }
  })
  const optionalLabels = categories.filter((c) => !c.required).map((c) => c.label)
  const mode = global?.trigger?.mode === 'floating' ? 'floating' : 'link'
  const position = global?.trigger?.position === 'bottom-right' ? 'bottom-right' : 'bottom-left'
  const texts: ConsentTexts = {
    ...base,
    bannerTitle: text(global?.banner?.title, base.bannerTitle),
    bannerText: fill(text(global?.banner?.text, base.bannerText), { categories: listLabels(locale, optionalLabels) }),
    settingsTitle: text(global?.settings?.title, base.settingsTitle),
    settingsText: text(global?.settings?.text, base.settingsText),
    categories,
  }
  return {
    enabled: global?.enabled !== false,
    revision: global?.revision || 1,
    privacyHref: pageHref(locale, global?.privacyPage),
    imprintHref: pageHref(locale, global?.imprintPage),
    trigger: { mode, position },
    textsHash: textsHash(texts),
    texts,
  }
}
