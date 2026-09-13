import React from 'react'

import type { IntegrationDirectoryBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { resolveLinkHref } from '@/components/Link'
import { SectionHeading } from '@/components/SectionHeading'
import { getIntegrations } from '@/integrations/getIntegrations'

import { DirectoryClient } from './Client'

/** Heading from the CMS, the connector catalogue from `src/integrations`, search and filters on the client. */
export const IntegrationDirectoryBlock: React.FC<Props & { locale?: Locale }> = async ({ header, request, locale }) => {
  const lang: Locale = locale === 'en' ? 'en' : 'de'
  const integrations = await getIntegrations()
  const requestHref = request?.link ? resolveLinkHref(request.link) : null

  return (
    <div className="container flex flex-col gap-10 md:gap-12">
      <SectionHeading className="reveal" header={header} />
      <DirectoryClient
        items={integrations.map((i) => ({ ...i, description: i.description[lang] }))}
        locale={lang}
        request={{
          title: request?.title || null,
          text: request?.text || null,
          label: request?.link?.label || null,
          href: requestHref,
        }}
      />
    </div>
  )
}
