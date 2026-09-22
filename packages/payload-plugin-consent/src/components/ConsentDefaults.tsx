import Script from 'next/script'
import React from 'react'

import type { ResolvedConsent } from '../defaults'
import { runtimeIntegrations, type ResolvedSetup } from '../setup'

type RuntimeSettings = Pick<ResolvedConsent, 'integrations'>

/**
 * The bootstrap of every active integration, concatenated, identical strings only once. Empty when
 * no active integration brings one — the caller then renders no script tag at all. With `settings`
 * only integrations enabled at runtime count.
 */
export const bootstrapSnippet = (setup: ResolvedSetup, settings?: RuntimeSettings): string => {
  const integrations = settings ? runtimeIntegrations(setup, settings) : setup.activeIntegrations
  return Array.from(new Set(integrations.map((i) => i.bootstrap).filter(Boolean))).join('')
}

/** Head script: the bootstrap of every active integration (deduplicated), before anything else runs. */
export const ConsentDefaults: React.FC<{ setup: ResolvedSetup; settings: RuntimeSettings; enabled: boolean }> = ({
  setup,
  settings,
  enabled,
}) => {
  if (!enabled) return null
  const snippet = bootstrapSnippet(setup, settings)
  if (!snippet) return null
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router: beforeInteractive belongs in the root layout.
    <Script id="consent-defaults" strategy="beforeInteractive">
      {snippet}
    </Script>
  )
}
