'use client'

import React, { useEffect, useState } from 'react'

import type { Header, SiteSetting } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { LocaleLink } from '@/components/LocaleLink'
import { Logo } from '@/components/Logo/Logo'
import { cn } from '@/utilities/ui'

import { DesktopNav } from './Nav/DesktopNav'
import { MobileMenu } from './Nav/MobileMenu'

export type HeaderLabels = {
  closeMenu: string
  language: string
  mainNavigation: string
  menu: string
  openMenu: string
}

interface HeaderClientProps {
  data: Header
  labels: HeaderLabels
  settings: SiteSetting
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, labels, settings }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const announcement = data.announcement?.enabled ? data.announcement : null
  const primary = data.primaryCta?.enabled ? data.primaryCta.link : null
  const secondary = data.secondaryCta?.enabled ? data.secondaryCta.link : null

  return (
    <header className="sticky top-0 z-40" data-scrolled={scrolled ? 'true' : 'false'}>
      {announcement?.text && (
        <div className="bg-accent text-accent-ink" data-theme="accent">
          <div className="container flex min-h-9 items-center justify-center gap-3 py-1.5 text-center type-small font-medium">
            <span>{announcement.text}</span>
            {announcement.link?.label && (
              <CMSLink {...announcement.link} appearance="inline" className="link-arrow !text-accent-ink" />
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          'border-b transition-[background-color,border-color,box-shadow] duration-200 ease-out',
          scrolled
            ? 'border-line bg-surface/80 backdrop-blur-md supports-[backdrop-filter]:bg-surface/70'
            : 'border-transparent bg-surface',
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-6 lg:h-[4.25rem]">
          <LocaleLink
            aria-label={settings.siteName || 'Indicate Data'}
            className="flex shrink-0 items-center rounded-md focus-visible:outline-2"
            href="/"
          >
            <Logo className="h-6 md:h-7" title={settings.siteName || 'Indicate Data'} />
          </LocaleLink>

          <DesktopNav items={data.items || []} label={labels.mainNavigation} />

          <div className="flex items-center gap-2 md:gap-3">
            {secondary?.label && (
              <CMSLink
                {...secondary}
                appearance="ghost"
                className="hidden lg:inline-flex"
                size="sm"
              />
            )}
            {primary?.label && (
              <CMSLink
                {...primary}
                appearance="primary"
                className="hidden sm:inline-flex"
                size="sm"
                track={{ location: 'header' }}
              />
            )}
            <MobileMenu
              items={data.items || []}
              labels={labels}
              primary={primary}
              secondary={secondary}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
