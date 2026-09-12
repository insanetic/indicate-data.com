'use client'

import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

import { CMSLink, resolveLinkHref } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { LocaleLink } from '@/components/LocaleLink'
import { localizeHref, splitLocale } from '@/i18n/href'
import { useLocale } from '@/providers/Locale'
import { cn } from '@/utilities/ui'

export type NavItem = NonNullable<Header['items']>[number]

const OPEN_DELAY = 60
const CLOSE_DELAY = 140

/**
 * Desktop navigation. Menu panels are always in the DOM (visually hidden when closed), open on
 * hover intent, click or keyboard, close on Escape, outside click or blur.
 */
export const DesktopNav: React.FC<{ items: NavItem[]; label: string }> = ({ items, label }) => {
  // The open menu is tied to the path it was opened on, so a navigation closes it without an effect.
  const [openState, setOpenState] = useState<{ index: number | null; path: string }>({
    index: null,
    path: '',
  })
  const timer = useRef<number | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const pathname = usePathname() || '/'
  const locale = useLocale()
  const currentPath = splitLocale(pathname).path
  const open = openState.path === pathname ? openState.index : null
  const setOpen = useCallback((index: number | null) => setOpenState({ index, path: pathname }), [pathname])

  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = null
  }
  const openLater = (i: number) => {
    clear()
    timer.current = window.setTimeout(() => setOpen(i), OPEN_DELAY)
  }
  const closeLater = () => {
    clear()
    timer.current = window.setTimeout(() => setOpen(null), CLOSE_DELAY)
  }
  const close = useCallback(() => {
    clear()
    setOpen(null)
  }, [setOpen])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        const btn = rootRef.current?.querySelector<HTMLButtonElement>(`[data-index="${open}"]`)
        btn?.focus()
      }
    }
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open, close])

  if (items.length === 0) return null

  return (
    <nav aria-label={label} className="hidden lg:block" ref={rootRef}>
      <ul className="flex items-center gap-1">
        {items.map((item, i) => {
          const isMenu = item.type === 'menu' && (item.columns?.length || 0) > 0
          if (!isMenu) {
            const href = item.link ? resolveLinkHref(item.link) : null
            const active = href && href !== '/' && currentPath.startsWith(href)
            return (
              <li key={item.id || i}>
                <CMSLink
                  {...item.link}
                  appearance="inline"
                  className={cn(navLinkClass, active && 'text-ink')}
                  label={item.label}
                />
              </li>
            )
          }
          return (
            <MenuItem
              close={close}
              closeLater={closeLater}
              index={i}
              isOpen={open === i}
              item={item}
              key={item.id || i}
              localeHref={(href) => localizeHref(href, locale)}
              openLater={openLater}
              setOpen={setOpen}
            />
          )
        })}
      </ul>
    </nav>
  )
}

const navLinkClass =
  'inline-flex h-10 items-center gap-1 rounded-btn px-3 text-[0.9375rem] font-medium text-ink-2 transition-colors duration-150 hover:text-ink focus-visible:text-ink'

const MenuItem: React.FC<{
  item: NavItem
  index: number
  isOpen: boolean
  openLater: (i: number) => void
  closeLater: () => void
  close: () => void
  setOpen: (i: number | null) => void
  localeHref: (href: string) => string
}> = ({ item, index, isOpen, openLater, closeLater, close, setOpen }) => {
  const panelId = useId()
  const columns = item.columns || []

  return (
    <li
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) close()
      }}
      onMouseEnter={() => openLater(index)}
      onMouseLeave={closeLater}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={cn(navLinkClass, isOpen && 'text-ink')}
        data-index={index}
        onClick={() => setOpen(isOpen ? null : index)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault()
            setOpen(index)
          }
        }}
        type="button"
      >
        {item.label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 transition-transform duration-200 ease-out-quart',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        aria-hidden={!isOpen}
        className={cn(
          'absolute left-1/2 top-full z-50 pt-2 transition-[opacity,transform,visibility] duration-150 ease-out-quart origin-top',
          isOpen
            ? 'visible translate-x-[-50%] opacity-100 scale-100'
            : 'invisible translate-x-[-50%] opacity-0 scale-[0.98] pointer-events-none',
        )}
        id={panelId}
        // `inert` keeps hidden menu content out of the tab order while it stays in the DOM.
        inert={!isOpen || undefined}
        role="region"
      >
        <div className="card-float flex gap-2 p-2">
          {columns.map((col, ci) => (
            <div className="min-w-[15rem] p-2" key={col.id || ci}>
              {col.title && (
                <p className="mb-1 px-2 type-caption font-medium text-ink-3">{col.title}</p>
              )}
              <ul className="flex flex-col">
                {(col.links || []).map((entry, li) => {
                  const href = resolveLinkHref(entry.link)
                  if (!href) return null
                  return (
                    <li key={entry.id || li}>
                      <LocaleLink
                        className="group flex items-start gap-3 rounded-card-inner px-2 py-2 transition-colors duration-150 hover:bg-surface-2"
                        href={href}
                        onClick={close}
                        {...(entry.link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                      >
                        {entry.icon && (
                          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-3 text-accent">
                            <Icon name={entry.icon} size={17} />
                          </span>
                        )}
                        <span className="flex flex-col">
                          <span className="text-[0.9375rem] font-medium text-ink">{entry.link.label}</span>
                          {entry.description && (
                            <span className="type-caption text-ink-3 pretty">{entry.description}</span>
                          )}
                        </span>
                      </LocaleLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </li>
  )
}
