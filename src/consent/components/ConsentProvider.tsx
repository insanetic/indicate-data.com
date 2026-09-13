// src/consent/components/ConsentProvider.tsx
'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { Locale } from '@/i18n/config'
import { useLocale } from '@/providers/Locale'

import type { ConsentTexts, ResolvedConsent } from '../defaults'
import { allChoices, needsDecision, readRecord, writeRecord, type Choices, type ConsentRecord } from '../store'
import { setTrackingEnabled } from '../track'

export type ConsentStatus = 'loading' | 'pending' | 'decided'

export type ConsentContextValue = {
  /** False when the global is off, no container id is set, or in draft mode: nothing renders. */
  enabled: boolean
  gtmId: string | null
  locale: Locale
  status: ConsentStatus
  record: ConsentRecord | null
  choices: Choices
  texts: ConsentTexts
  revision: number
  privacyHref: string | null
  imprintHref: string | null
  dialogOpen: boolean
  acceptAll: () => void
  rejectAll: () => void
  save: (choices: Choices) => void
  openSettings: () => void
  closeSettings: () => void
  hasConsent: (category: keyof Choices) => boolean
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

type Props = {
  settings: ResolvedConsent
  gtmId?: string | null
  /** True in draft mode / live preview: no banner, no tracking. */
  disabled?: boolean
  children: React.ReactNode
}

export const ConsentProvider: React.FC<Props> = ({ settings, gtmId, disabled, children }) => {
  const locale = useLocale()
  const enabled = Boolean(gtmId && settings.enabled && !disabled)

  const [status, setStatus] = useState<ConsentStatus>('loading')
  const [record, setRecord] = useState<ConsentRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setTrackingEnabled(enabled)
    if (!enabled) return
    const existing = readRecord()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration-safe cookie read; SSR has no cookie access.
    setRecord(existing)
    setStatus(needsDecision(existing, settings.revision) ? 'pending' : 'decided')
  }, [enabled, settings.revision])

  const decide = useCallback(
    (choices: Choices) => {
      const next: ConsentRecord = { v: settings.revision, t: new Date().toISOString(), c: choices }
      writeRecord(next)
      setRecord(next)
      setStatus('decided')
      setDialogOpen(false)
    },
    [settings.revision],
  )

  const value = useMemo<ConsentContextValue>(
    () => ({
      enabled,
      gtmId: gtmId || null,
      locale,
      status,
      record,
      choices: record?.c || allChoices(false),
      texts: settings.texts,
      revision: settings.revision,
      privacyHref: settings.privacyHref,
      imprintHref: settings.imprintHref,
      dialogOpen,
      acceptAll: () => decide(allChoices(true)),
      rejectAll: () => decide(allChoices(false)),
      save: decide,
      openSettings: () => setDialogOpen(true),
      closeSettings: () => setDialogOpen(false),
      hasConsent: (category) => status === 'decided' && Boolean(record?.c[category]),
    }),
    [enabled, gtmId, locale, status, record, settings, dialogOpen, decide],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export const useConsent = (): ConsentContextValue => {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside ConsentProvider')
  return ctx
}
