import type { Access, CollectionConfig, CollectionSlug, Field } from 'payload'

import { slugField } from 'payload'

import { createPreviewEndpoint, createUsageEndpoint } from './endpoints'
import { createRevalidateHook, setTitle } from './hooks'
import { l } from './labels'
import type { ResolvedOptions } from './types'

const authenticated: Access = ({ req }) => Boolean(req.user)
const publishedOrAuthenticated: Access = ({ req }) => (req.user ? true : { _status: { equals: 'published' } })

const linkField = (o: ResolvedOptions): Field => {
  const types = [
    { label: l('Kein Link', 'No link'), value: 'none' },
    ...(o.linkCollections.length ? [{ label: l('Interne Seite', 'Internal page'), value: 'internal' }] : []),
    { label: l('Externe URL', 'External URL'), value: 'external' },
  ]
  return {
    name: 'link',
    type: 'group',
    label: l('Link (z. B. Fallstudie)', 'Link (e.g. case study)'),
    fields: [
      { name: 'type', type: 'radio', label: l('Linkart', 'Link type'), defaultValue: 'none', options: types, admin: { layout: 'horizontal' } },
      ...(o.linkCollections.length
        ? [
            {
              name: 'doc',
              type: 'relationship',
              relationTo: o.linkCollections,
              label: l('Seite', 'Page'),
              admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'internal' },
            } as Field,
          ]
        : []),
      {
        name: 'url',
        type: 'text',
        label: 'URL',
        admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'external' },
      },
      {
        name: 'label',
        type: 'text',
        localized: o.localized,
        label: l('Linktext (optional)', 'Link text (optional)'),
        admin: { condition: (_: unknown, s: { type?: string }) => Boolean(s?.type) && s.type !== 'none' },
      },
    ],
  }
}

export const createTestimonialsCollection = (o: ResolvedOptions): CollectionConfig => {
  const revalidate = createRevalidateHook(o.cacheTag)
  return {
    slug: o.slugs.testimonials,
    labels: { singular: l('Kundenstimme', 'Testimonial'), plural: l('Kundenstimmen', 'Testimonials') },
    admin: {
      group: o.adminGroup,
      useAsTitle: 'title',
      defaultColumns: ['title', 'tags', 'approvedUntil', '_status', 'updatedAt'],
      listSearchableFields: ['name', 'company', 'quote'],
    },
    access: {
      read: publishedOrAuthenticated,
      create: authenticated,
      update: authenticated,
      delete: authenticated,
      ...o.access,
    },
    versions: { drafts: true },
    endpoints: [createUsageEndpoint(o), createPreviewEndpoint(o)],
    hooks: { beforeChange: [setTitle], afterChange: [revalidate], afterDelete: [revalidate] },
    fields: [
      { name: 'title', type: 'text', admin: { hidden: true } },
      { name: 'quote', type: 'textarea', required: true, localized: o.localized, label: l('Zitat', 'Quote') },
      {
        type: 'row',
        fields: [
          { name: 'name', type: 'text', required: true, label: l('Name', 'Name'), admin: { width: '34%' } },
          { name: 'role', type: 'text', localized: o.localized, label: l('Rolle', 'Role'), admin: { width: '33%' } },
          { name: 'company', type: 'text', label: l('Unternehmen', 'Company'), admin: { width: '33%' } },
        ],
      },
      {
        type: 'row',
        fields: [
          { name: 'avatar', type: 'upload', relationTo: o.mediaSlug as CollectionSlug, label: l('Foto (optional)', 'Photo (optional)'), admin: { width: '50%' } },
          { name: 'logo', type: 'upload', relationTo: o.mediaSlug as CollectionSlug, label: l('Firmenlogo (optional)', 'Company logo (optional)'), admin: { width: '50%' } },
        ],
      },
      {
        name: 'tags',
        type: 'relationship',
        // Slugs are configurable strings; the site's generated CollectionSlug union can't know them.
        relationTo: o.slugs.tags as CollectionSlug,
        hasMany: true,
        label: l('Zielgruppen-Tags', 'Cohort tags'),
        admin: { description: l('Nur für die Auswahl in Abschnitten; Besucher sehen die Tags nicht.', 'Only used to select testimonials in sections; visitors never see tags.') },
      },
      linkField(o),
      {
        name: 'approvedUntil',
        type: 'date',
        label: l('Freigabe bis', 'Approved until'),
        admin: {
          position: 'sidebar',
          date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
          description: l('Nach diesem Tag wird das Zitat nicht mehr angezeigt.', 'After this day the quote is no longer shown.'),
          components: { Cell: o.componentPaths.approvedUntilCell },
        },
      },
      {
        name: 'internalNote',
        type: 'textarea',
        label: l('Interne Notiz', 'Internal note'),
        // Collection read is public for published docs; the note must never reach the REST/GraphQL API anonymously.
        access: { read: ({ req }) => Boolean(req.user) },
        admin: { position: 'sidebar', description: l('Z. B. wer freigegeben hat. Wird nie angezeigt.', 'E.g. who approved it. Never shown.') },
      },
      ...(o.usage
        ? [
            {
              name: 'usage',
              type: 'ui',
              label: l('Verwendet auf', 'Shown on'),
              admin: {
                position: 'sidebar',
                components: { Field: { path: o.componentPaths.usagePanel, clientProps: { apiSlug: o.slugs.testimonials, usageCollection: o.usage.collection } } },
              },
            } as Field,
          ]
        : []),
    ],
  }
}

export const createTagsCollection = (o: ResolvedOptions): CollectionConfig => {
  const revalidate = createRevalidateHook(o.cacheTag)
  return {
    slug: o.slugs.tags,
    labels: { singular: l('Zielgruppen-Tag', 'Cohort tag'), plural: l('Zielgruppen-Tags', 'Cohort tags') },
    admin: { group: o.adminGroup, useAsTitle: 'title', defaultColumns: ['title', 'slug'] },
    access: { read: () => true, create: authenticated, update: authenticated, delete: authenticated },
    hooks: { afterChange: [revalidate], afterDelete: [revalidate] },
    fields: [{ name: 'title', type: 'text', required: true, localized: o.localized, label: l('Name', 'Name') }, slugField()],
  }
}
