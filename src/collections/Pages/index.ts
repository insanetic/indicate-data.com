import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { AgentShowcase } from '../../blocks/AgentShowcase/config'
import { CardGrid } from '../../blocks/CardGrid/config'
import { CtaSection } from '../../blocks/CtaSection/config'
import { Faq } from '../../blocks/Faq/config'
import { FeatureStory } from '../../blocks/FeatureStory/config'
import { FeatureTabs } from '../../blocks/FeatureTabs/config'
import { Hero } from '../../blocks/Hero/config'
import { Integrations } from '../../blocks/Integrations/config'
import { LogoWall } from '../../blocks/LogoWall/config'
import { Pillars } from '../../blocks/Pillars/config'
import { PricingTeaser } from '../../blocks/PricingTeaser/config'
import { Stats } from '../../blocks/Stats/config'
import { Steps } from '../../blocks/Steps/config'
import { Testimonials } from '../../blocks/Testimonials/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req, locale }) =>
        generatePreviewPath({
          slug: data?.slug,
          locale: locale?.code,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req, locale }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        locale,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: { de: 'Hero (alt)', en: 'Hero (legacy)' },
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                Hero,
                LogoWall,
                FeatureTabs,
                FeatureStory,
                AgentShowcase,
                Steps,
                Integrations,
                Pillars,
                CardGrid,
                Stats,
                Testimonials,
                PricingTeaser,
                Faq,
                CtaSection,
                Content,
                MediaBlock,
                FormBlock,
                Archive,
                CallToAction,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: { de: 'Inhalt', en: 'Content' },
        },
        {
          name: 'seo',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'seo.title',
              descriptionPath: 'seo.description',
              imagePath: 'seo.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
              overrides: { localized: true },
            }),
            MetaImageField({
              relationTo: 'media',
              overrides: { localized: true },
            }),
            MetaDescriptionField({
              overrides: { localized: true },
            }),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'seo.title',
              descriptionPath: 'seo.description',
            }),
          ],
        },
      ],
    },
    // Legacy, non-localised SEO group from the starter template. Kept (hidden) so the dev
    // schema push never has to drop populated columns; remove together with a migration.
    {
      name: 'meta',
      type: 'group',
      admin: { hidden: true },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
