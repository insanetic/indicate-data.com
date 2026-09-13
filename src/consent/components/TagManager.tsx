// src/consent/components/TagManager.tsx
'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

import { optionalKeys } from '../config'
import { anyGranted, applyConsent, loadGtm } from '../consent-mode'
import { purgeCookies, type Choices } from '../store'
import { installClickTracking, track } from '../track'
import { useConsent } from './ConsentProvider'

/**
 * Headless. Applies every decision to Consent Mode, loads GTM once something is granted, reloads
 * on withdrawal (after purging that category's cookies), pushes page views and installs the
 * data-track click listener.
 */
export const TagManager: React.FC = () => {
  const { enabled, gtmId, status, record, locale } = useConsent()
  const pathname = usePathname()
  const previous = useRef<Choices | null>(null)
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !gtmId || status !== 'decided' || !record) return
    const withdrawn = optionalKeys.filter((key) => previous.current?.[key] && !record.c[key])
    previous.current = record.c
    applyConsent(record.c)
    if (withdrawn.length > 0) {
      for (const key of withdrawn) purgeCookies(key)
      window.location.reload()
      return
    }
    if (anyGranted(record.c)) loadGtm(gtmId)
  }, [enabled, gtmId, status, record])

  // React runs child effects before parent effects, so on initial mount this effect would fire
  // before ConsentProvider's effect calls setTrackingEnabled(true) and the first page view would
  // be dropped. Waiting past the 'loading' status defers the first run until after that happens.
  useEffect(() => {
    if (!enabled || !pathname || status === 'loading') return
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    track({ name: 'page_view', params: { page_path: pathname, page_title: document.title, page_locale: locale } })
  }, [enabled, pathname, locale, status])

  useEffect(() => {
    if (!enabled) return
    return installClickTracking()
  }, [enabled])

  return null
}
