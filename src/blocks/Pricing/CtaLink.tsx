'use client'

import React from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { LocaleLink } from '@/components/LocaleLink'

type Props = {
  href: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  className?: string
  children: React.ReactNode
}

/** Plan button: internal paths get the locale prefix, external URLs open in a new tab. */
export const CtaLink: React.FC<Props> = ({ href, variant = 'primary', size = 'default', className, children }) => {
  const internal = href.startsWith('/') || href.startsWith('#')
  return (
    <Button asChild className={className} size={size} variant={variant}>
      {internal ? (
        <LocaleLink href={href}>{children}</LocaleLink>
      ) : (
        <a href={href} rel="noreferrer" target="_blank">
          {children}
        </a>
      )}
    </Button>
  )
}
