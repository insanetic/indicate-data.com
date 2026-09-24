import React from 'react'

import type { ActionsBlock as Props } from '@/payload-types'

import { ActionRow } from '@/components/ActionRow'

export const ActionsBlock: React.FC<Props> = ({ links, align }) => (
  <div className="container">
    <ActionRow align={align || 'left'} className="reveal" links={links} />
  </div>
)
