// Minimal renderer for the `document` block. Replaced with the full layout (sidebar, TOC,
// meta band, binding-language notice, history) in Task 8.
import React from 'react'

import type { DocumentBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import RichText from '@/components/RichText'
import { SectionHeading } from '@/components/SectionHeading'

export const DocumentBlock: React.FC<Props & { locale: Locale }> = ({ header, body }) => (
  <div className="container py-16">
    <SectionHeading as="h1" size="display" header={header} />
    <RichText data={body} enableGutter={false} />
  </div>
)
