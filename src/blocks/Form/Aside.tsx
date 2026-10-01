import React from 'react'

import type { HeadingBlock } from '@/payload-types'

import { ActionRow } from '@/components/ActionRow'
import { SectionHeading } from '@/components/SectionHeading'

/** A heading block shown beside the form that follows it: eyebrow, heading, lead and up to two actions. */
export const FormAside: React.FC<Pick<HeadingBlock, 'header' | 'links'> & { as: 'h1' | 'h2' }> = ({ header, links, as }) => (
  <div className="flex flex-col gap-8">
    <SectionHeading align="left" as={as} header={header} leadClassName="max-w-[40ch]" size="display" />
    <ActionRow links={links} />
  </div>
)
