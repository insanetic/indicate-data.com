'use client'

import React from 'react'

import { fill } from '../defaults'
import { useConsent } from './ConsentProvider'

type Props = {
  /** Category key the embed needs, e.g. `marketing`. */
  category: string
  /** Provider name shown in the placeholder, e.g. `YouTube`. */
  service: string
  className?: string
  children: React.ReactNode
}

/**
 * Renders `children` only once the category is granted; otherwise a placeholder with a one-click
 * grant and a link to the settings. A disabled layer (draft mode) shows the children.
 */
export const ConsentGate: React.FC<Props> = ({ category, service, className, children }) => {
  const { enabled, hasConsent, choices, save, openSettings, texts, Button, cx } = useConsent()
  if (!enabled || hasConsent(category)) return <>{children}</>
  const label = texts.categories.find((c) => c.key === category)?.label || category
  return (
    <div aria-label={label} className={cx('gate', className)} data-consent="gate" role="group">
      <p className={cx('gateText')} data-consent="gateText">
        {fill(texts.gateText, { service, category: label })}
      </p>
      <div className={cx('gateActions')} data-consent="gateActions">
        <Button onClick={() => save({ ...choices, [category]: true })} variant="primary">
          {fill(texts.gateAllow, { category: label })}
        </Button>
        <Button onClick={openSettings} variant="secondary">
          {texts.cookieSettings}
        </Button>
      </div>
    </div>
  )
}
