// src/consent/components/ConsentBanner.tsx
'use client'

import React, { useId } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'

import { useConsent } from './ConsentProvider'

/**
 * First layer. Non-modal: the page stays usable. Accept and reject are identical buttons;
 * settings is a text link. Rendered right after the skip link so keyboard users reach it first.
 */
export const ConsentBanner: React.FC = () => {
  const { enabled, status, dialogOpen, texts, privacyHref, imprintHref, acceptAll, rejectAll, openSettings } = useConsent()
  const titleId = useId()

  if (!enabled || status !== 'pending' || dialogOpen) return null

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'consent-enter fixed inset-x-0 bottom-0 z-[60] bg-surface text-ink border-t border-line shadow-float',
        'p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
        'md:inset-x-auto md:bottom-6 md:left-6 md:w-[26rem] md:rounded-card md:border md:p-6',
      )}
      role="region"
    >
      <h2 className="type-h4" id={titleId}>
        {texts.bannerTitle}
      </h2>
      <p className="mt-2 type-small text-ink-2 pretty">{texts.bannerText}</p>
      {(privacyHref || imprintHref) && (
        <p className="mt-3 flex flex-wrap gap-x-4 type-caption text-ink-3">
          {privacyHref && (
            <a className="underline underline-offset-4 hover:text-ink" href={privacyHref}>
              {texts.privacy}
            </a>
          )}
          {imprintHref && (
            <a className="underline underline-offset-4 hover:text-ink" href={imprintHref}>
              {texts.imprint}
            </a>
          )}
        </p>
      )}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button onClick={acceptAll} variant="secondary">
          {texts.acceptAll}
        </Button>
        <Button onClick={rejectAll} variant="secondary">
          {texts.rejectAll}
        </Button>
      </div>
      <button
        className="mt-3 type-small text-ink-2 underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        onClick={openSettings}
        type="button"
      >
        {texts.openSettings}
      </button>
    </section>
  )
}
