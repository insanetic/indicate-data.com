'use client'
import React from 'react'

export type ConsentButtonProps = {
  variant: 'primary' | 'secondary'
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
}

/** Fallback when the site passes no `components.Button`. Styled by styles.css via `data-variant`. */
export const DefaultButton: React.FC<ConsentButtonProps> = ({ variant, type = 'button', ...props }) => (
  <button data-consent="button" data-variant={variant} type={type} {...props} />
)
