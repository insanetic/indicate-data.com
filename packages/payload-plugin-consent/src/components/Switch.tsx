'use client'

import React from 'react'

import { useConsent } from './ConsentProvider'

type Props = {
  checked: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  'aria-labelledby'?: string
}

/** Minimal accessible switch (role="switch"); locked when disabled. `data-state` drives styling. */
export const Switch: React.FC<Props> = ({ checked, onChange, disabled, ...aria }) => {
  const { cx } = useConsent()
  const state = checked ? 'checked' : 'unchecked'
  return (
    <button
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      className={cx('switch')}
      data-consent="switch"
      data-state={state}
      onClick={() => {
        if (!disabled) onChange?.(!checked)
      }}
      role="switch"
      type="button"
      {...aria}
    >
      <span aria-hidden className={cx('switchThumb')} data-consent="switchThumb" data-state={state} />
    </button>
  )
}
