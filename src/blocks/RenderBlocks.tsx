import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { DocumentBlock } from '@/blocks/Document/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ActionsBlock } from '@/blocks/Actions/Component'
import { AgentShowcaseBlock } from '@/blocks/AgentShowcase/Component'
import { CardGridBlock } from '@/blocks/CardGrid/Component'
import { CtaSectionBlock } from '@/blocks/CtaSection/Component'
import { SpotlightBlock } from '@/blocks/Spotlight/Component'
import { FaqBlock } from '@/blocks/Faq/Component'
import { FeatureStoryBlock } from '@/blocks/FeatureStory/Component'
import { FeatureTabsBlock } from '@/blocks/FeatureTabs/Component'
import { HeadingBlock } from '@/blocks/Heading/Component'
import { HeroBlock } from '@/blocks/Hero/Component'
import { IntegrationsBlock } from '@/blocks/Integrations/Component'
import { IntegrationDirectoryBlock } from '@/blocks/IntegrationDirectory/Component'
import { LogoWallBlock } from '@/blocks/LogoWall/Component'
import { MediaSectionBlock } from '@/blocks/MediaSection/Component'
import { PillarsBlock } from '@/blocks/Pillars/Component'
import { PricingTeaserBlock } from '@/blocks/PricingTeaser/Component'
import { PricingBlock } from '@/blocks/Pricing/Component'
import { StatsBlock } from '@/blocks/Stats/Component'
import { StepsBlock } from '@/blocks/Steps/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { Section } from '@/components/Section'
import { visibleBlocks } from '@/plugins/blockTools/visibleBlocks'
import { resolveSpacing, type RhythmBlock } from '@/sections/rhythm'

type Block = Page['layout'][number]
type BlockType = Block['blockType']

/**
 * Block slug → component. New blocks register here; a test checks that every block
 * configured on the Pages collection has a renderer.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const blockComponents: Record<BlockType, React.FC<any>> = {
  hero: HeroBlock,
  heading: HeadingBlock,
  media: MediaSectionBlock,
  actions: ActionsBlock,
  logoWall: LogoWallBlock,
  featureTabs: FeatureTabsBlock,
  featureStory: FeatureStoryBlock,
  agentShowcase: AgentShowcaseBlock,
  steps: StepsBlock,
  integrations: IntegrationsBlock,
  integrationDirectory: IntegrationDirectoryBlock,
  pillars: PillarsBlock,
  cardGrid: CardGridBlock,
  stats: StatsBlock,
  testimonials: TestimonialsBlock,
  pricingTeaser: PricingTeaserBlock,
  pricing: PricingBlock,
  faq: FaqBlock,
  ctaSection: CtaSectionBlock,
  spotlight: SpotlightBlock,
  document: DocumentBlock,
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
}

/** Starter-template blocks that render their own spacing and have no section settings. */
const legacyBlocks: BlockType[] = ['archive', 'content', 'cta', 'formBlock', 'mediaBlock']

type Settings = {
  background?: 'default' | 'tinted' | 'dark' | 'accent' | null
  anchor?: string | null
}

export const RenderBlocks: React.FC<{
  blocks: Block[]
  locale: Locale
  slug?: string
}> = ({ blocks: allBlocks, locale, slug }) => {
  // Hidden blocks never render; everything below (isFirst, the testimonials layout) sees only visible ones.
  const blocks = visibleBlocks(allBlocks)
  if (blocks.length === 0) return null
  const rhythm = resolveSpacing(blocks as unknown as RhythmBlock[])

  return (
    <Fragment>
      {blocks.map((block, index) => {
        const { blockType } = block
        const Block = blockComponents[blockType]
        if (!Block) return null

        if (legacyBlocks.includes(blockType)) {
          return (
            <div className="my-16" key={block.id || index}>
              <Block {...block} disableInnerContainer locale={locale} />
            </div>
          )
        }

        const settings = ('settings' in block ? block.settings : undefined) as Settings | undefined

        return (
          <Section
            background={settings?.background}
            bottom={rhythm[index].bottom}
            groupEnd={rhythm[index].groupEnd}
            groupStart={rhythm[index].groupStart}
            id={settings?.anchor}
            key={block.id || index}
            top={rhythm[index].top}
          >
            <Block
              {...block}
              {...(blockType === 'testimonials' ? { layout: blocks, blockIndex: index } : {})}
              isFirst={index === 0}
              locale={locale}
              slug={slug}
            />
          </Section>
        )
      })}
    </Fragment>
  )
}
