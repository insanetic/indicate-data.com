import React from 'react'

import type { MediaSectionBlock as Props } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { Visual } from '@/components/Illustrations'
import { cn } from '@/utilities/ui'

export const MediaSectionBlock: React.FC<Props & { locale?: Locale }> = ({ visual, width, locale }) => (
  <div className="container">
    <div className={cn('reveal', width === 'narrow' && 'mx-auto max-w-4xl')}>
      <Visual className="w-full" fallback="dashboard" locale={locale} visual={visual} />
    </div>
  </div>
)
