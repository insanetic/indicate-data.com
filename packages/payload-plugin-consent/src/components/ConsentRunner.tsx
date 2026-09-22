'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { signalsFor } from '../consent-mode'
import { runtimeIntegrations, type Choices, type IntegrationContext } from '../setup'
import { purgeCookies } from '../store'
import { installClickTracking, track } from '../track'
import { useConsent } from './ConsentProvider'

/**
 * Headless. Forwards every decision to the active integrations (`update`), loads each granted
 * integration once per page load, purges and reloads on withdrawal, pushes page views and installs
 * the data-track click listener. Reloading is the only reliable way to unload third-party scripts.
 */
export const ConsentRunner: React.FC = () => {
  const { setup, integrations, enabled, status, record, locale } = useConsent()
  const pathname = usePathname()
  const previous = useRef<Choices | null>(null)
  const loaded = useRef<Set<string>>(new Set())
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || status !== 'decided' || !record) return
    const active = runtimeIntegrations(setup, { integrations })
    const contextFor = (key: string): IntegrationContext => ({
      choices: record.c,
      locale,
      signals: signalsFor(setup, record.c),
      options: integrations[key]?.options || {},
    })
    for (const integration of active) integration.update?.(contextFor(integration.key))

    const withdrawn = setup.optionalKeys.filter((key) => previous.current?.[key] && !record.c[key])
    previous.current = record.c
    if (withdrawn.length > 0) {
      for (const key of withdrawn) purgeCookies(setup.purgePatternsFor(key))
      window.location.reload()
      return
    }

    for (const integration of active) {
      if (!record.c[integration.category] || loaded.current.has(integration.key)) continue
      integration.load(contextFor(integration.key))
      loaded.current.add(integration.key)
    }
  }, [enabled, setup, integrations, status, record, locale])

  // React runs child effects before parent effects, so on mount this effect would fire before the
  // provider has read the cookie and flipped the status, queueing the entry page view ahead of the
  // consent update above — gtm.js replays the queue in order and would process it under the denied
  // defaults. Waiting past 'loading' defers the first page view to the commit that also runs the
  // update effect, which is declared first and therefore pushes first.
  useEffect(() => {
    if (!enabled || status === 'loading' || !pathname || lastPath.current === pathname) return
    lastPath.current = pathname
    track({ name: 'page_view', params: { page_path: pathname, page_title: document.title, page_locale: locale } })
  }, [enabled, status, pathname, locale])

  useEffect(() => {
    if (!enabled) return
    return installClickTracking()
  }, [enabled])

  return null
}
