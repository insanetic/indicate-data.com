// src/consent/components/ConsentTrigger.tsx
'use client'

import React from 'react'

import { cn } from '@/utilities/ui'

import { useConsent } from './ConsentProvider'

/** "Cookie-Einstellungen" button for the footer; reopens the settings dialog at any time. */
export const ConsentTrigger: React.FC<{ className?: string }> = ({ className }) => {
  const { enabled, texts, openSettings } = useConsent()
  if (!enabled) return null
  return (
    <button
      className={cn('focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]', className)}
      onClick={openSettings}
      type="button"
    >
      {texts.cookieSettings}
    </button>
  )
}
