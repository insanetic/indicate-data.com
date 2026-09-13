import type { DocumentBlock, Page, Sidebar } from '@/payload-types'

import type { T } from './content'
import { richText } from './lexical'
import { cookiePolicy } from './legal/cookie-policy'
import { gdpr } from './legal/gdpr'
import { imprint } from './legal/imprint'
import { privacyPolicy } from './legal/privacy-policy'
import { serviceDescription } from './legal/service-description'
import { termsOfService } from './legal/terms-of-service'

export const legalSlugs = ['terms-of-service', 'privacy-policy', 'gdpr', 'service-description', 'cookie-policy', 'imprint'] as const
export type LegalSlug = (typeof legalSlugs)[number]

type PageData = Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>
type Doc = { de: string; en: string }

const docs: Record<LegalSlug, { doc: Doc; lastUpdated?: string; effectiveFrom?: string }> = {
  'terms-of-service': { doc: termsOfService },
  'privacy-policy': { doc: privacyPolicy, lastUpdated: '2026-08-17', effectiveFrom: '2026-08-31' },
  gdpr: { doc: gdpr, lastUpdated: '2024-03-30', effectiveFrom: '2024-04-02' },
  'service-description': { doc: serviceDescription, lastUpdated: '2024-03-30', effectiveFrom: '2024-04-02' },
  'cookie-policy': { doc: cookiePolicy, lastUpdated: '2024-03-30', effectiveFrom: '2024-04-02' },
  imprint: { doc: imprint },
}

/** Page titles, as they appear in the sidebar, footer and browser tab. */
export const legalNames = (t: T): Record<LegalSlug, string> => ({
  'terms-of-service': t('Nutzungsbedingungen', 'Terms of service'),
  'privacy-policy': t('Datenschutzrichtlinie', 'Privacy policy'),
  gdpr: 'DSGVO',
  'service-description': t('Leistungsbeschreibung', 'Service description'),
  'cookie-policy': t('Cookie-Richtlinie', 'Cookie policy'),
  imprint: t('Impressum', 'Imprint'),
})

const leads = (t: T): Record<LegalSlug, string> => ({
  'terms-of-service': t('Die Bedingungen für die Nutzung von Indicate.', 'The terms for using Indicate.'),
  'privacy-policy': t('Welche Daten wir erheben, wofür wir sie nutzen und welche Rechte Sie haben.', 'What data we collect, what we use it for and which rights you have.'),
  gdpr: t('Wie Indicate die Datenschutz-Grundverordnung umsetzt.', 'How Indicate implements the General Data Protection Regulation.'),
  'service-description': t('Welche Schnittstellen Indicate anbindet und welche Daten dabei übertragen werden.', 'Which interfaces Indicate connects and which data is transferred.'),
  'cookie-policy': t('Welche Cookies wir einsetzen und wie Sie sie steuern.', 'Which cookies we use and how you control them.'),
  imprint: t('Angaben gemäß § 5 TMG.', 'Legal notice according to German law.'),
})

const seoDescriptions = leads

export const legalPage = (t: T, slug: LegalSlug, sidebarId: number, locale: 'de' | 'en'): Partial<PageData> => {
  const entry = docs[slug]
  return {
    title: legalNames(t)[slug],
    slug,
    _status: 'published',
    hero: { type: 'none' },
    seo: { title: `${legalNames(t)[slug]} · Indicate Data`, description: seoDescriptions(t)[slug] },
    layout: [
      {
        blockType: 'document',
        blockName: legalNames(t)[slug],
        header: { eyebrow: t('Rechtliches', 'Legal'), heading: legalNames(t)[slug], lead: leads(t)[slug], align: 'left' },
        sidebar: sidebarId,
        meta: { lastUpdated: entry.lastUpdated || null, effectiveFrom: entry.effectiveFrom || null, version: null },
        bindingLanguage: 'de',
        showToc: true,
        body: richText(entry.doc[locale]) as unknown as DocumentBlock['body'],
        history: [],
        settings: { background: 'default', spacing: 'none', anchor: null },
      },
    ],
  }
}

/** Sidebar "Rechtliches": the live site's grouping plus a contact card. */
export const legalSidebar = (t: T, pages: Record<LegalSlug, number>): Partial<Sidebar> => {
  const names = legalNames(t)
  const ref = (slug: LegalSlug) => ({
    link: { type: 'reference' as const, reference: { relationTo: 'pages' as const, value: pages[slug] }, label: names[slug] },
  })
  return {
    title: 'Rechtliches',
    groups: [
      { title: t('Bedingungen', 'Terms'), links: [ref('terms-of-service')] },
      { title: t('Datenschutz', 'Privacy'), links: [ref('privacy-policy'), ref('gdpr'), ref('service-description')] },
      { title: 'Compliance', links: [ref('cookie-policy')] },
      { title: t('Kontakt', 'Contact'), links: [ref('imprint')] },
    ],
    contact: {
      enabled: true,
      title: t('Fragen zum Datenschutz?', 'Questions about privacy?'),
      text: t('Schreiben Sie unserem Compliance-Team.', 'Write to our compliance team.'),
      email: 'compliance@indicate-data.io',
    },
  }
}
