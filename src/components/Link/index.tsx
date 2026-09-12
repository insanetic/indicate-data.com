import { Button, type ButtonProps } from '@/components/ui/button'
import { LocaleLink } from '@/components/LocaleLink'
import { cn } from '@/utilities/ui'
import React from 'react'

import type { Page, Post } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

/** Resolves a CMS link field to an href (without locale prefix). */
export const resolveLinkHref = (link: Pick<CMSLinkType, 'type' | 'reference' | 'url'>) => {
  const { type, reference, url } = link
  if (type === 'reference' && typeof reference?.value === 'object' && reference.value.slug) {
    const slug = reference.value.slug
    if (reference.relationTo === 'pages') return slug === 'home' ? '/' : `/${slug}`
    return `/${reference.relationTo}/${slug}`
  }
  return url || null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    size: sizeFromProps,
  } = props

  const href = resolveLinkHref(props)

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  const anchor = (
    <LocaleLink className={cn(className)} href={href} {...newTabProps}>
      {label && label}
      {children && children}
    </LocaleLink>
  )

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') return anchor

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      {anchor}
    </Button>
  )
}
