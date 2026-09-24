import type { Footer, Page } from '@/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { localizeHref } from '@/i18n/href'
import { defaultLocale, localeLabels, locales, type Locale } from '@/i18n/config'
import { seoOf } from './generateMeta'
import { getServerSideURL } from './getURL'

type FooterLink = NonNullable<NonNullable<Footer['columns']>[number]['links']>[number]['link']

const copy = {
  de: {
    alsoIn: 'Diese Datei gibt es auch auf',
    note: 'Die Website ist zweisprachig (Deutsch ist Standard); Rechtstexte sind auf Deutsch verbindlich.',
    more: 'Weitere Seiten',
    product: 'Produkt-Links',
    app: 'Web-App (Anmeldung)',
    docs: 'Entwickler-Dokumentation',
    help: 'Hilfe-Center',
    demo: 'Demo buchen',
    contact: 'Kontakt',
  },
  en: {
    alsoIn: 'This file is also available in',
    note: 'The site is bilingual (German is the default); legal texts are binding in German.',
    more: 'More pages',
    product: 'Product links',
    app: 'Web app (sign in)',
    docs: 'Developer documentation',
    help: 'Help centre',
    demo: 'Book a demo',
    contact: 'Contact',
  },
} satisfies Record<Locale, Record<string, string>>

const oneLine = (text?: string | null) => text?.replace(/\s+/g, ' ').trim() || ''

/**
 * Builds /llms.txt (https://llmstxt.org): a Markdown briefing an AI agent reads instead of crawling
 * the whole site. Generated from what editors already maintain: the site settings for the summary,
 * the footer columns for the sections, and each page's SEO title and description for the entries.
 * Legal pages go under "Optional", which the format reserves for content an agent may skip.
 */
const buildLlmsTxt = async (locale: Locale): Promise<string> => {
  const payload = await getPayload({ config: configPromise })
  const site = getServerSideURL()

  const [settings, footer, pages] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0, locale }),
    payload.findGlobal({ slug: 'footer', depth: 0, locale }),
    payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      locale,
      where: { _status: { equals: 'published' } },
      select: { slug: true, title: true, seo: true, meta: true },
    }),
  ])

  const name = settings.siteName || 'Indicate Data'
  const pagesById = new Map(pages.docs.map((page) => [page.id, page as Page]))
  const listed = new Set<number>()
  const listedUrls = new Set<string>()

  const pageTitle = (page: Page) =>
    oneLine(seoOf(page).title || page.title).replace(new RegExp(`\\s*[·|]\\s*${name}$`), '')

  const pageEntry = (page: Page, label?: string) => {
    const href = page.slug === 'home' ? '/' : `/${page.slug}`
    const description = oneLine(seoOf(page).description)
    const title = pageTitle(page) || label || page.slug
    const url = site + localizeHref(href, locale)
    listedUrls.add(url)
    return `- [${title}](${url})${description ? `: ${description}` : ''}`
  }

  const linkEntry = (link: FooterLink) => {
    const reference = link.reference
    if (link.type === 'reference' && reference?.relationTo === 'pages') {
      const id = typeof reference.value === 'object' ? reference.value.id : reference.value
      const page = pagesById.get(id)
      if (!page) return null
      listed.add(page.id)
      return pageEntry(page, link.label)
    }
    const href = link.url
    if (!href) return null
    const url = href.startsWith('/') ? site + localizeHref(href, locale) : href
    listedUrls.add(url)
    return `- [${oneLine(link.label) || url}](${url})`
  }

  const section = (title: string, entries: (string | null | undefined)[]) => {
    const lines = entries.filter(Boolean)
    return lines.length ? `## ${oneLine(title)}\n\n${lines.join('\n')}` : null
  }

  const home = pages.docs.find((page) => page.slug === 'home') as Page | undefined
  if (home) listed.add(home.id)

  const columns = (footer.columns || []).map((column) =>
    section(column.title, (column.links || []).map((entry) => linkEntry(entry.link))),
  )
  const legal = (footer.legalLinks || []).map((entry) => linkEntry(entry.link))
  const others = pages.docs
    .filter((page) => page.slug && !listed.has(page.id))
    .map((page) => pageEntry(page as Page))

  const t = copy[locale]
  const links = settings.links || {}
  // Only what the footer does not already list.
  const productLinks = [
    [t.app, links.appUrl],
    [t.docs, links.docsUrl],
    [t.help, links.helpUrl],
    [t.demo, links.demoUrl],
  ]
    .filter(([, url]) => url && !listedUrls.has(url))
    .map(([label, url]) => `- [${label}](${url})`)
  if (settings.contact?.email) productLinks.push(`- ${t.contact}: ${settings.contact.email}`)

  const otherLocales = locales
    .filter((code) => code !== locale)
    .map((code) => `[${localeLabels[code]}](${site}/${code}/llms.txt)`)
    .join(', ')

  const intro = [
    `# ${name}`,
    settings.tagline && `> ${oneLine(settings.tagline)}`,
    home && oneLine(seoOf(home).description),
    `${t.note} ${t.alsoIn}: ${otherLocales}.`,
  ]

  return (
    [
      ...intro,
      ...columns,
      section(t.more, others),
      section(t.product, productLinks),
      section('Optional', legal),
    ]
      .filter(Boolean)
      .join('\n\n') + '\n'
  )
}

export const getLlmsTxt = (locale: Locale = defaultLocale) =>
  unstable_cache(() => buildLlmsTxt(locale), ['llms-txt', locale], {
    tags: ['pages-sitemap', 'global_footer', 'global_site-settings'],
  })()

export const llmsTxtResponse = async (locale: Locale) =>
  new Response(await getLlmsTxt(locale), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
