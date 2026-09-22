'use client'

import React from 'react'

import { useConsent } from './ConsentProvider'

/**
 * Lucide's `fingerprint-pattern` (ISC, https://lucide.dev), inlined so the package keeps no icon
 * dependency. Drawn with Lucide's own stroke settings, so it sits next to the host's Lucide icons
 * without looking off. Replace the paths only by copying a whole icon from Lucide again.
 */
const FingerprintIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="22"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="22"
  >
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M2 16h.01" />
    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
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
