// src/consent/components/ConsentDefaults.tsx
import Script from 'next/script'
import React from 'react'

import { bootstrapSnippet } from '../consent-mode'

/** Head script: dataLayer, gtag and Consent Mode defaults (all denied) before anything else runs. */
export const ConsentDefaults: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  if (!enabled) return null
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router has no pages/_document; beforeInteractive belongs in the root layout, per Next.js docs.
    <Script id="consent-defaults" strategy="beforeInteractive">
      {bootstrapSnippet}
    </Script>
  )
}
