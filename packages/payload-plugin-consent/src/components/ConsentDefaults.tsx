import Script from 'next/script'
import React from 'react'

import type { ResolvedSetup } from '../setup'

/** Head script: the bootstrap of every active integration (deduplicated), before anything else runs. */
export const ConsentDefaults: React.FC<{ setup: ResolvedSetup; enabled: boolean }> = ({ setup, enabled }) => {
  if (!enabled) return null
  const snippet = Array.from(new Set(setup.activeIntegrations.map((i) => i.bootstrap).filter(Boolean))).join('')
  if (!snippet) return null
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router: beforeInteractive belongs in the root layout.
    <Script id="consent-defaults" strategy="beforeInteractive">
      {snippet}
    </Script>
  )
}
