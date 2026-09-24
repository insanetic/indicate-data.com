import React from 'react'

import type { IntegrationTreeBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { IntegrationTree, type TreeSystem } from '@/components/IntegrationTree'
import { findIntegrationByName, getIntegrations } from '@/integrations/getIntegrations'

export const IntegrationTreeBlock: React.FC<Props & { locale?: Locale }> = async ({ groups, locale }) => {
  const catalogue = await getIntegrations()
  const systems: TreeSystem[] = (groups || [])
    .filter((g) => g.title)
    .flatMap((g) => g.items || [])
    .map((item) => ({ name: item.name, logo: item.logo, logoSrc: findIntegrationByName(catalogue, item.name)?.logo }))
  if (systems.length === 0) return null
  return (
    <div className="container">
      <div className="reveal">
        <IntegrationTree className="mx-auto max-w-[64rem]" locale={locale} systems={systems} />
      </div>
    </div>
  )
}
