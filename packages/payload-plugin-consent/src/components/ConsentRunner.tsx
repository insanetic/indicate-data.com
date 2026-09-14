'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { signalsFor } from '../consent-mode'
import type { Choices, IntegrationContext } from '../setup'
import { purgeCookies } from '../store'
import { installClickTracking, track } from '../track'
import { useConsent } from './ConsentProvider'

/**
 * Headless. Forwards every decision to the active integrations (`update`), loads each granted
 * integration once per page load, purges and reloads on withdrawal, pushes page views and installs
 * the data-track click listener. Reloading is the only reliable way to unload third-party scripts.
 */
export const ConsentRunner: React.FC = () => {
  const { setup, enabled, status, record, locale } = useConsent()
  const pathname = usePathname()
  const previous = useRef<Choices | null>(null)
  const loaded = useRef<Set<string>>(new Set())
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || status !== 'decided' || !record) return
    const ctx: IntegrationContext = { choices: record.c, locale, signals: signalsFor(setup, record.c) }
    for (const integration of setup.activeIntegrations) integration.update?.(ctx)

    const withdrawn = setup.optionalKeys.filter((key) => previous.current?.[key] && !record.c[key])
    previous.current = record.c
    if (withdrawn.length > 0) {
      for (const key of withdrawn) purgeCookies(setup.purgePatternsFor(key))
      window.location.reload()
      return
    }

    for (const integration of setup.activeIntegrations) {
      if (!record.c[integration.category] || loaded.current.has(integration.key)) continue
      integration.load(ctx)
      loaded.current.add(integration.key)
    }
  }, [enabled, setup, status, record, locale])

  useEffect(() => {
    if (!enabled || !pathname || lastPath.current === pathname) return
    lastPath.current = pathname
    track({ name: 'page_view', params: { page_path: pathname, page_title: document.title, page_locale: locale } })
  }, [enabled, pathname, locale])

  useEffect(() => {
    if (!enabled) return
    return installClickTracking()
  }, [enabled])

  return null
}
