import React from 'react'

import type { IntegrationsBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'
import { SectionHeading } from '@/components/SectionHeading'
import { IntegrationTree, type TreeSystem } from '@/components/IntegrationTree'
import { Visual } from '@/components/Illustrations'
import { findIntegrationByName, getIntegrations } from '@/integrations/getIntegrations'

/**
 * Heading, the looping integration tree (or an uploaded image) and up to two buttons. The
 * systems on the tiles come from the CMS groups; a tile without an uploaded logo takes the
 * mark from the connector catalogue. The full list lives in the directory block.
 */
export const IntegrationsBlock: React.FC<Props & { locale?: Locale }> = async ({ header, visual, groups, links, locale }) => {
  const list = (groups || []).filter((g) => g.title && (g.items || []).length > 0)
  const buttons = (links || []).filter((l) => l.link?.label)
  const customImage = visual?.type === 'image' && visual.image
  const catalogue = await getIntegrations()
  const systems: TreeSystem[] = list
    .flatMap((g) => g.items || [])
    .map((item) => ({
      name: item.name,
      logo: item.logo,
      logoSrc: findIntegrationByName(catalogue, item.name)?.logo,
    }))

  return (
    <div className="container flex flex-col gap-12 md:gap-16">
      <SectionHeading align="center" className="mx-auto reveal" header={header} />
      <div className="reveal">
        {customImage ? (
          <Visual className="mx-auto max-w-4xl" fallback="integrations" locale={locale} visual={visual} />
        ) : (
          <IntegrationTree className="mx-auto max-w-[64rem]" locale={locale} systems={systems} />
        )}
      </div>
      {buttons.length > 0 && (
        <div className="reveal flex flex-wrap items-center justify-center gap-3">
          {buttons.map(({ link }, i) => (
            <CMSLink
              key={i}
              {...link}
              appearance={link.appearance === 'outline' ? 'secondary' : link.appearance || 'primary'}
              size="lg"
            />
          ))}
        </div>
      )}
    </div>
  )
}
