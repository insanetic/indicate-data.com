import type { File, Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { locales, type Locale } from '@/i18n/config'
import { splitLegacyLayout } from '@/sections/legacy'
import { stepsToSplit } from '@/sections/steps'
import { keyOf } from '@/utilities/convertInlineTestimonials'

import { aboutPage } from './about'
import { consentGlobal } from './consent'
import { contactForm as contactFormData } from './contact-form'
import { contactPage, footer, header, homePage, pick, siteSettings, type Refs } from './content'
import { legalPage, legalSidebar, legalSlugs, type LegalSlug } from './legal'
import { productSlugs, solutionSlugs, subpages, type SubpageSlug } from './pages'
import { pricingPage, pricingSettings, pricingSlug } from './pricing'
import { testimonialData, testimonialTagData, testimonialTagSlugs, type TestimonialTagSlug } from './testimonials'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const productLinks = {
  appUrl: 'https://app.indicate-data.com',
  demoUrl: 'https://calendar.app.google/HSU9JepL7HmgeLCVA',
  helpUrl: 'https://support.indicate-data.com/docs',
  docsUrl: 'https://docs.indicate-data.io',
}

const assets: { key: string; file: string; alt: string; mime: string }[] = [
  { key: 'mews', file: 'mews.webp', alt: 'Mews', mime: 'image/webp' },
  { key: 'oracle', file: 'oracle.svg', alt: 'Oracle Hospitality', mime: 'image/svg+xml' },
  { key: 'elite-pms', file: 'elite-pms.png', alt: 'elite PMS', mime: 'image/png' },
  { key: 're-guest', file: 're-guest.png', alt: 'Re:Guest', mime: 'image/png' },
  { key: 'vioma', file: 'vioma.svg', alt: 'vioma', mime: 'image/svg+xml' },
  { key: 'google-analytics', file: 'google-analytics.svg', alt: 'Google Analytics', mime: 'image/svg+xml' },
  { key: 'meta', file: 'meta.svg', alt: 'Meta', mime: 'image/svg+xml' },
  { key: 'instagram', file: 'instagram.svg', alt: 'Instagram', mime: 'image/svg+xml' },
  { key: 'inxmail', file: 'inxmail.png', alt: 'Inxmail', mime: 'image/png' },
]

const context = { disableRevalidate: true }

/**
 * Installs the Indicate Data site: media, site settings, header, footer, home, contact, about,
 * the product and solution pages, and the legal pages with their "Rechtliches" sidebar, in
 * German and English. Idempotent: existing documents are updated by slug/filename/title,
 * nothing is deleted. Blog posts and categories are left untouched.
 */
export const seed = async ({ payload, req }: { payload: Payload; req: PayloadRequest }): Promise<void> => {
  payload.logger.info('Seeding Indicate Data site…')

  payload.logger.info('— Media')
  const media: Record<string, number> = {}
  for (const asset of assets) {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: asset.file } },
      limit: 1,
      depth: 0,
    })
    if (existing.docs[0]) {
      media[asset.key] = existing.docs[0].id
      continue
    }
    const buffer = fs.readFileSync(path.resolve(dirname, 'assets', asset.file))
    const file: File = { name: asset.file, data: buffer, mimetype: asset.mime, size: buffer.length }
    const doc = await payload.create({ collection: 'media', data: { alt: asset.alt }, file, req, context })
    media[asset.key] = doc.id
  }

  payload.logger.info('— Contact form')
  const existingForm = await payload.find({
    collection: 'forms',
    where: { title: { equals: contactFormData.title } },
    limit: 1,
    depth: 0,
  })
  const form =
    existingForm.docs[0] ||
    (await payload.create({ collection: 'forms', data: contactFormData, req, context }))

  payload.logger.info('— Contact page')
  const contactId = await upsertPage(payload, req, 'contact', (locale) => contactPage(pick(locale), form.id))

  payload.logger.info('— Sidebar: Rechtliches')
  const sidebarId = await upsertSidebar(payload, req, 'Rechtliches', () => ({ title: 'Rechtliches', groups: [{ title: '—', links: [] }] }))

  const legalIds = {} as Record<LegalSlug, number>
  for (const slug of legalSlugs) {
    payload.logger.info(`— Page /${slug}`)
    legalIds[slug] = await upsertPage(payload, req, slug, (locale) => legalPage(pick(locale), slug, sidebarId, locale))
  }
  await upsertSidebar(payload, req, 'Rechtliches', (locale) => legalSidebar(pick(locale), legalIds))

  payload.logger.info('— Testimonials')
  const testimonialTags = {} as Record<TestimonialTagSlug, number>
  for (const slug of testimonialTagSlugs) {
    const found = await payload.find({ collection: 'testimonial-tags', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    const [primary, ...rest] = locales
    const doc = found.docs[0]
      ? await payload.update({ collection: 'testimonial-tags', id: found.docs[0].id, data: { ...testimonialTagData(pick(primary))[slug], slug }, locale: primary, req, context })
      : await payload.create({ collection: 'testimonial-tags', data: { ...testimonialTagData(pick(primary))[slug], slug }, locale: primary, req, context })
    for (const locale of rest) await payload.update({ collection: 'testimonial-tags', id: doc.id, data: testimonialTagData(pick(locale))[slug], locale, req, context })
    testimonialTags[slug] = doc.id
  }
  const existingTestimonials = await payload.find({ collection: 'testimonials', pagination: false, depth: 0, draft: true })
  const [primaryLocale, ...otherLocales] = locales
  const base = testimonialData(pick(primaryLocale))
  for (let i = 0; i < base.length; i++) {
    const entry = base[i]
    const data = { ...entry, tags: entry.tags.map((s) => testimonialTags[s]), _status: 'published' as const }
    const match = existingTestimonials.docs.find((d) => keyOf(d.name, d.company) === keyOf(entry.name, entry.company))
    const doc = match
      ? await payload.update({ collection: 'testimonials', id: match.id, data, locale: primaryLocale, req, context })
      : await payload.create({ collection: 'testimonials', data, locale: primaryLocale, req, context })
    for (const locale of otherLocales) {
      const localised = testimonialData(pick(locale))[i]
      await payload.update({ collection: 'testimonials', id: doc.id, data: { quote: localised.quote, role: localised.role, _status: 'published' }, locale, req, context })
    }
  }

  // Subpages link to each other by URL, so they only need media and the contact page.
  const pageIds = {} as Record<SubpageSlug, number>
  const draft: Refs = { contactPageId: contactId, aboutPageId: 0, pricingPageId: 0, pages: pageIds, legal: legalIds, media, links: productLinks, testimonialTags }
  for (const slug of [...productSlugs, ...solutionSlugs]) {
    payload.logger.info(`— Page /${slug}`)
    pageIds[slug] = await upsertPage(payload, req, slug, (locale) => subpages(pick(locale), draft)[slug])
  }

  payload.logger.info('— Page /about')
  const aboutPageId = await upsertPage(payload, req, 'about', (locale) => aboutPage(pick(locale), draft))

  payload.logger.info(`— Page /${pricingSlug}`)
  const pricingPageId = await upsertPage(payload, req, pricingSlug, (locale) => pricingPage(pick(locale), draft))
  const refs: Refs = { ...draft, pages: pageIds, aboutPageId, pricingPageId }

  payload.logger.info('— Home page')
  await upsertPage(payload, req, 'home', (locale) => homePage(pick(locale), refs))

  payload.logger.info('— Site settings, header, footer')
  await upsertGlobal(payload, req, 'site-settings', (locale) => siteSettings(pick(locale), refs))
  await upsertGlobal(payload, req, 'header', (locale) => header(pick(locale), refs))
  await upsertGlobal(payload, req, 'footer', (locale) => footer(pick(locale), refs))

  payload.logger.info('— Consent')
  await upsertGlobal(payload, req, 'consent', (locale) => consentGlobal(pick(locale), refs))

  payload.logger.info('— Pricing settings (Subneo)')
  await upsertGlobal(payload, req, 'subneo-pricing', (locale) => pricingSettings(pick(locale)))

  payload.logger.info('Seeded database successfully!')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = Record<string, any>

async function upsertPage(
  payload: Payload,
  req: PayloadRequest,
  slug: string,
  build: (locale: Locale) => AnyData,
): Promise<number> {
  // Seed content may still use the legacy section shapes; write what the migrations would produce.
  const buildConverted = (locale: Locale): AnyData => {
    const data = build(locale)
    return Array.isArray(data.layout) ? { ...data, layout: stepsToSplit(splitLegacyLayout(data.layout), slug) } : data
  }
  const [primary, ...rest] = locales
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale: primary,
  })

  let doc: AnyData
  if (existing.docs[0]) {
    doc = await payload.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data: buildConverted(primary),
      locale: primary,
      depth: 0,
      req,
      context,
    })
  } else {
    doc = await payload.create({
      collection: 'pages',
      data: buildConverted(primary) as RequiredDataFromCollectionSlug<'pages'>,
      locale: primary,
      depth: 0,
      req,
      context,
    })
  }

  for (const locale of rest) {
    await payload.update({
      collection: 'pages',
      id: doc.id,
      data: withIds(buildConverted(locale), doc),
      locale,
      depth: 0,
      req,
      context,
    })
  }
  return doc.id
}

async function upsertSidebar(
  payload: Payload,
  req: PayloadRequest,
  title: string,
  build: (locale: Locale) => AnyData,
): Promise<number> {
  const [primary, ...rest] = locales
  const existing = await payload.find({ collection: 'sidebars', where: { title: { equals: title } }, limit: 1, depth: 0 })
  const doc = existing.docs[0]
    ? await payload.update({ collection: 'sidebars', id: existing.docs[0].id, data: build(primary), locale: primary, depth: 0, req, context })
    : await payload.create({ collection: 'sidebars', data: build(primary) as RequiredDataFromCollectionSlug<'sidebars'>, locale: primary, depth: 0, req, context })
  for (const locale of rest) {
    await payload.update({ collection: 'sidebars', id: doc.id, data: withIds(build(locale), doc), locale, depth: 0, req, context })
  }
  return doc.id
}

async function upsertGlobal(
  payload: Payload,
  req: PayloadRequest,
  slug: 'site-settings' | 'header' | 'footer' | 'consent' | 'subneo-pricing',
  build: (locale: Locale) => AnyData,
) {
  const [primary, ...rest] = locales
  const doc = await payload.updateGlobal({ slug, data: build(primary), locale: primary, depth: 0, req, context })
  for (const locale of rest) {
    await payload.updateGlobal({ slug, data: withIds(build(locale), doc), locale, depth: 0, req, context })
  }
}

/**
 * Copies row ids from a saved document onto freshly built data (same shape, same order), so
 * updating a second locale writes translations onto the existing array/block rows instead of
 * creating new ones.
 */
function withIds(data: AnyData, saved: AnyData): AnyData {
  if (Array.isArray(data)) {
    return data.map((item, i) => {
      const savedItem = Array.isArray(saved) ? saved[i] : undefined
      if (item && typeof item === 'object' && savedItem && typeof savedItem === 'object') {
        return { ...withIds(item, savedItem), ...(savedItem.id ? { id: savedItem.id } : {}) }
      }
      return item
    })
  }
  if (data && typeof data === 'object') {
    const out: AnyData = {}
    for (const [key, value] of Object.entries(data)) {
      out[key] = saved && typeof saved === 'object' && key in saved ? withIds(value, saved[key]) : value
    }
    return out
  }
  return data
}
