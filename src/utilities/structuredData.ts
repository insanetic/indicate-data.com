import type { Media, SiteSetting } from '@/payload-types'

import { localeTags, type Locale } from '@/i18n/config'
import { getServerSideURL } from './getURL'

const absolute = (url: string) => (url.startsWith('http') ? url : getServerSideURL() + url)

const logoUrl = (logo: SiteSetting['logo']) =>
  logo && typeof logo === 'object' && (logo as Media).url ? absolute((logo as Media).url!) : absolute('/apple-touch-icon.png')

/** Splits the footer address textarea (company, street, postcode + city) into a PostalAddress. */
const postalAddress = (address?: string | null) => {
  const lines = address?.split('\n').map((line) => line.trim()).filter(Boolean) || []
  if (lines.length < 2) return undefined
  const cityLine = lines[lines.length - 1]
  const match = cityLine.match(/^(\d{4,5})\s+(.+)$/)
  return {
    '@type': 'PostalAddress',
    streetAddress: lines[lines.length - 2],
    ...(match ? { postalCode: match[1], addressLocality: match[2] } : { addressLocality: cityLine }),
    addressCountry: 'DE',
  }
}

/**
 * Site-wide schema.org graph: who runs the site (Organization), the site itself (WebSite) and the
 * product (SoftwareApplication). Built only from the site settings, so every page gets the same
 * facts that search engines and AI answer engines quote for "what is Indicate".
 */
export const siteStructuredData = (settings: SiteSetting, locale: Locale) => {
  const site = getServerSideURL()
  const name = settings.siteName || 'Indicate Data'
  const organizationId = `${site}/#organization`
  const address = postalAddress(settings.contact?.address)
  const legalName = settings.contact?.address?.split('\n')[0]?.trim()
  const sameAs = (settings.social || []).map((entry) => entry.url).filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name,
        ...(legalName && legalName !== name ? { legalName } : {}),
        url: site,
        logo: logoUrl(settings.logo),
        ...(settings.tagline ? { description: settings.tagline } : {}),
        ...(settings.contact?.email ? { email: settings.contact.email } : {}),
        ...(settings.contact?.phone ? { telephone: settings.contact.phone } : {}),
        ...(address ? { address } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${site}/#website`,
        name,
        url: `${site}/${locale}`,
        inLanguage: localeTags[locale],
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${site}/#software`,
        name,
        applicationCategory: 'BusinessApplication',
        applicationSubCategory: 'Analytics',
        operatingSystem: 'Web',
        url: `${site}/${locale}`,
        ...(settings.tagline ? { description: settings.tagline } : {}),
        publisher: { '@id': organizationId },
      },
    ],
  }
}
