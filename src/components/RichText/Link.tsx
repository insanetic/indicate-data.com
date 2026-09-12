'use client'

import React from 'react'

import { LocaleLink } from '@/components/LocaleLink'

export const RichTextLink: React.FC<{
  href: string
  newTab?: boolean
  children: React.ReactNode
}> = ({ href, newTab, children }) => {
  const isExternal = /^(https?:|mailto:|tel:)/i.test(href)
  const rel = newTab ? 'noopener noreferrer' : undefined
  const target = newTab ? '_blank' : undefined

  if (isExternal) {
    return (
      <a href={href} rel={rel} target={target}>
        {children}
      </a>
    )
  }
  return (
    <LocaleLink href={href} rel={rel} target={target}>
      {children}
    </LocaleLink>
  )
}
