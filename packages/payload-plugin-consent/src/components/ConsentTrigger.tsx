'use client'

import React from 'react'

import { useConsent } from './ConsentProvider'

type Props = {
  className?: string
  /** Attach the opener to the child element instead of rendering a button. */
  asChild?: boolean
  children?: React.ReactNode
}

/** Reopens the settings dialog. Headless: a plain button by default, any element with `asChild`. */
export const ConsentTrigger: React.FC<Props> = ({ className, asChild, children }) => {
  const { enabled, texts, openSettings, cx } = useConsent()
  if (!enabled) return null
  if (asChild && React.isValidElement<{ onClick?: React.MouseEventHandler<HTMLElement> }>(children)) {
    const child = children
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(e)
        e.preventDefault()
        openSettings()
      },
    })
  }
  return (
    <button className={cx('trigger', className)} data-consent="trigger" onClick={openSettings} type="button">
      {children ?? texts.cookieSettings}
    </button>
  )
}
