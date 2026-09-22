'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import type { ConsentTexts, ResolvedConsent, TriggerSettings } from '../defaults'
import type { Choices, ResolvedSetup } from '../setup'
import { allChoices, needsDecision, newRecordId, purgeCookies, readRecord, writeRecord, type ConsentRecord } from '../store'
import { DefaultButton, type ConsentButtonProps } from './DefaultButton'

export type ConsentSlot =
  | 'banner' | 'bannerTitle' | 'bannerText' | 'bannerLinks' | 'bannerLink' | 'bannerActions' | 'bannerSettingsLink'
  | 'dialog' | 'dialogContent' | 'dialogTitle' | 'dialogText' | 'dialogLinks' | 'dialogLink' | 'closeButton' | 'lastChanged'
  | 'categoryList' | 'categoryRow' | 'categoryHeader' | 'categoryLabel' | 'categoryBadge' | 'categoryDescription'
  | 'services' | 'servicesSummary' | 'serviceList' | 'service' | 'serviceName' | 'serviceProvider' | 'servicePurpose' | 'serviceMeta' | 'serviceLink'
  | 'switch' | 'switchThumb' | 'dialogActions' | 'button'
  | 'trigger' | 'floatingTrigger'
  | 'gate' | 'gateText' | 'gateActions'

export type ConsentClassNames = Partial<Record<ConsentSlot, string>>
export type ConsentComponents = { Button?: React.ComponentType<ConsentButtonProps> }
export type ConsentStatus = 'loading' | 'pending' | 'decided'

/** URL hash that opens the settings dialog on any page; editors can link it from rich text. */
export const SETTINGS_HASH = '#cookie-settings'

export type ConsentContextValue = {
  setup: ResolvedSetup
  /** False when the global is off or `disabled` is set: nothing renders, nothing loads. */
  enabled: boolean
  locale: string
  status: ConsentStatus
  record: ConsentRecord | null
  choices: Choices
  texts: ConsentTexts
  revision: number
  trigger: TriggerSettings
  privacyHref: string | null
  imprintHref: string | null
  /** Runtime settings per integration, resolved on the server (ids from the environment). */
  integrations: ResolvedConsent['integrations']
  dialogOpen: boolean
  acceptAll: () => void
  rejectAll: () => void
  save: (choices: Choices) => void
  openSettings: () => void
  closeSettings: () => void
  hasConsent: (category: string) => boolean
  Button: React.ComponentType<ConsentButtonProps>
  /** Class names for a slot, plus optional extra classes. */
  cx: (slot: ConsentSlot, extra?: string) => string | undefined
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export type ConsentProviderProps = {
  setup: ResolvedSetup
  settings: ResolvedConsent
  locale: string
  /** True in draft mode / live preview or when the site has nothing to gate: no banner, no tracking. */
  disabled?: boolean
  /** `POST` target for the consent log, e.g. `/api/consent/log`. Omit to log nothing. */
  logEndpoint?: string | null
  components?: ConsentComponents
  classNames?: ConsentClassNames
  children: React.ReactNode
}

function sendLog(endpoint: string, record: ConsentRecord, textsHash: string, locale: string): void {
  if (typeof fetch !== 'function' || !record.id) return
  const body = JSON.stringify({ id: record.id, v: record.v, t: record.t, c: record.c, h: textsHash, l: locale })
  fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {})
}

const hasSettingsHash = () => typeof window !== 'undefined' && window.location.hash === SETTINGS_HASH

const clearSettingsHash = () => {
  if (hasSettingsHash()) window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

export const ConsentProvider: React.FC<ConsentProviderProps> = ({
  setup,
  settings,
  locale,
  disabled,
  logEndpoint,
  components,
  classNames,
  children,
}) => {
  const enabled = Boolean(settings.enabled && !disabled)
  const [status, setStatus] = useState<ConsentStatus>('loading')
  const [record, setRecord] = useState<ConsentRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const existing = readRecord(setup)
    const pending = needsDecision(setup, existing, settings.revision)
    // An invalidated record (revision bump, expiry) must not leave old tracking cookies behind.
    if (pending && existing) for (const key of setup.optionalKeys) purgeCookies(setup.purgePatternsFor(key))
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration-safe cookie read; SSR has no cookie access.
    setRecord(existing)
    setStatus(pending ? 'pending' : 'decided')
  }, [enabled, setup, settings.revision])

  useEffect(() => {
    if (!enabled) return
    const sync = () => {
      // Subscribes to the URL hash, an external system.
      if (hasSettingsHash()) setDialogOpen(true)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [enabled])

  const closeSettings = useCallback(() => {
    setDialogOpen(false)
    clearSettingsHash()
  }, [])

  const decide = useCallback(
    (choices: Choices) => {
      const next: ConsentRecord = { id: record?.id || newRecordId(), v: settings.revision, t: new Date().toISOString(), c: choices }
      writeRecord(setup, next)
      setRecord(next)
      setStatus('decided')
      closeSettings()
      if (logEndpoint) sendLog(logEndpoint, next, settings.textsHash, locale)
    },
    [record?.id, settings.revision, settings.textsHash, setup, logEndpoint, locale, closeSettings],
  )

  const value = useMemo<ConsentContextValue>(
    () => ({
      setup,
      enabled,
      locale,
      status,
      record,
      // Only a valid decision may seed the choices. While pending, an invalidated record is still
      // held (for its id), and handing its categories out would let `save({ ...choices })` in the
      // gate silently re-grant what the visitor has not been asked about again.
      choices: status === 'decided' && record ? record.c : allChoices(setup, false),
      texts: settings.texts,
      revision: settings.revision,
      trigger: settings.trigger,
      privacyHref: settings.privacyHref,
      imprintHref: settings.imprintHref,
      integrations: settings.integrations,
      dialogOpen,
      acceptAll: () => decide(allChoices(setup, true)),
      rejectAll: () => decide(allChoices(setup, false)),
      save: decide,
      openSettings: () => setDialogOpen(true),
      closeSettings,
      hasConsent: (category) => category === setup.requiredKey || (status === 'decided' && Boolean(record?.c[category])),
      Button: components?.Button || DefaultButton,
      cx: (slot, extra) => [classNames?.[slot], extra].filter(Boolean).join(' ') || undefined,
    }),
    [setup, enabled, locale, status, record, settings, dialogOpen, decide, closeSettings, components, classNames],
  )

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}

export const useConsent = (): ConsentContextValue => {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside ConsentProvider')
  return ctx
}
