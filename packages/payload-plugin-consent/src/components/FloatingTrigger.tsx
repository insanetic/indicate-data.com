'use client'

import React from 'react'

import { useConsent } from './ConsentProvider'

const FingerprintIcon = () => (
  <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" viewBox="0 0 24 24" width="22">
    <path d="M4 12a8 8 0 0 1 8-8 8 8 0 0 1 8 8v1" />
    <path d="M7 21v-3a5 5 0 0 1 10 0v3" />
    <path d="M7 14v-2a5 5 0 0 1 5-5 5 5 0 0 1 5 5" />
    <path d="M12 13v8" />
    <path d="M9.5 21v-4M14.5 21v-4" />
  </svg>
)

/**
 * Floating "Cookie settings" button at the corner chosen in the CMS. Visible only after a decision
 * and while the dialog is closed, so it never competes with the banner.
 */
export const FloatingTrigger: React.FC<{ className?: string }> = ({ className }) => {
  const { enabled, trigger, status, dialogOpen, texts, openSettings, cx } = useConsent()
  if (!enabled || trigger.mode !== 'floating' || status !== 'decided' || dialogOpen) return null
  const inset = 'max(1.25rem, env(safe-area-inset-INSET))'
  const side =
    trigger.position === 'bottom-right'
      ? { right: inset.replace('INSET', 'right') }
      : { left: inset.replace('INSET', 'left') }
  return (
    <button
      aria-label={texts.cookieSettings}
      className={cx('floatingTrigger', className)}
      data-consent="floatingTrigger"
      data-position={trigger.position}
      onClick={openSettings}
      style={{ position: 'fixed', bottom: inset.replace('INSET', 'bottom'), zIndex: 50, ...side }}
      title={texts.cookieSettings}
      type="button"
    >
      <FingerprintIcon />
    </button>
  )
}
