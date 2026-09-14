'use client'

import React, { useId } from 'react'

import { useConsent } from './ConsentProvider'

/**
 * First layer. Non-modal: the page stays usable. Accept and reject are identical buttons;
 * settings is a text button. Render it right after the skip link so keyboard users reach it first.
 */
export const ConsentBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { enabled, status, dialogOpen, texts, privacyHref, imprintHref, acceptAll, rejectAll, openSettings, Button, cx } = useConsent()
  const id = useId()

  if (!enabled || status !== 'pending' || dialogOpen) return null

  return (
    <section aria-describedby={`${id}-text`} aria-labelledby={`${id}-title`} className={cx('banner', className)} data-consent="banner">
      <p className={cx('bannerTitle')} data-consent="bannerTitle" id={`${id}-title`}>
        {texts.bannerTitle}
      </p>
      <p className={cx('bannerText')} data-consent="bannerText" id={`${id}-text`}>
        {texts.bannerText}
      </p>
      {(privacyHref || imprintHref) && (
        <p className={cx('bannerLinks')} data-consent="bannerLinks">
          {privacyHref && (
            <a className={cx('bannerLink')} data-consent="bannerLink" href={privacyHref}>
              {texts.privacy}
            </a>
          )}
          {imprintHref && (
            <a className={cx('bannerLink')} data-consent="bannerLink" href={imprintHref}>
              {texts.imprint}
            </a>
          )}
        </p>
      )}
      <div className={cx('bannerActions')} data-consent="bannerActions">
        <Button onClick={acceptAll} variant="secondary">
          {texts.acceptAll}
        </Button>
        <Button onClick={rejectAll} variant="secondary">
          {texts.rejectAll}
        </Button>
      </div>
      <button className={cx('bannerSettingsLink')} data-consent="bannerSettingsLink" onClick={openSettings} type="button">
        {texts.openSettings}
      </button>
    </section>
  )
}
