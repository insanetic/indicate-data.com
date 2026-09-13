'use client'

import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

import { BrandBars } from '@/components/BrandBars'
import { CMSLink, resolveLinkHref } from '@/components/Link'
import { Icon } from '@/components/Icon'
import { LocaleLink } from '@/components/LocaleLink'
import { splitLocale } from '@/i18n/href'
import { cn } from '@/utilities/ui'

export type NavItem = NonNullable<Header['items']>[number]

const OPEN_DELAY = 60
const CLOSE_DELAY = 140

/**
 * Desktop navigation. Menu panels are always in the DOM (visually hidden when closed), open on
 * hover intent, click or keyboard, close on Escape, outside click or blur. Panels are centred
 * under the whole nav (not under their trigger), so a wide menu stays inside the viewport.
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
    <nav aria-label={label} className="relative hidden lg:block" ref={rootRef}>
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
          const active = menuHrefs(item).some((href) => href !== '/' && currentPath.startsWith(href))
          return (
            <MenuItem
              active={active}
              close={close}
              closeLater={closeLater}
              index={i}
              isOpen={open === i}
              item={item}
              key={item.id || i}
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

/** Internal hrefs of every entry in a menu, used to mark the trigger of the current section. */
const menuHrefs = (item: NavItem): string[] =>
  (item.columns || []).flatMap((col) =>
    (col.links || []).map((entry) => resolveLinkHref(entry.link)).filter((h): h is string => Boolean(h && h.startsWith('/'))),
  )

const MenuItem: React.FC<{
  item: NavItem
  index: number
  isOpen: boolean
  active: boolean
  openLater: (i: number) => void
  closeLater: () => void
  close: () => void
  setOpen: (i: number | null) => void
}> = ({ item, index, isOpen, active, openLater, closeLater, close, setOpen }) => {
  const panelId = useId()
  const columns = item.columns || []
  const featured = item.featured?.enabled && item.featured.title ? item.featured : null
  const featuredHref = featured?.link ? resolveLinkHref(featured.link) : null

  return (
    <li
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) close()
      }}
      onMouseEnter={() => openLater(index)}
      onMouseLeave={closeLater}
    >
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={cn(navLinkClass, (isOpen || active) && 'text-ink')}
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
          className={cn('size-4 transition-transform duration-200 ease-out-quart', isOpen && 'rotate-180')}
        />
      </button>

      {/* The panel is positioned against the <nav>: centred under it, the same for every menu. */}
      <div
        aria-hidden={!isOpen}
        className={cn(
          'absolute left-1/2 top-full z-50 origin-top pt-2 transition-[opacity,transform,visibility] duration-150 ease-out-quart motion-reduce:transition-none',
          isOpen
            ? 'visible -translate-x-1/2 translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none invisible -translate-x-1/2 -translate-y-1 scale-[0.98] opacity-0',
        )}
        id={panelId}
        // `inert` keeps hidden menu content out of the tab order while it stays in the DOM.
        inert={!isOpen || undefined}
        role="region"
      >
        <div className="card-float flex gap-2 p-2">
          {columns.map((col, ci) => (
            <div className="flex w-[16rem] flex-col p-2" key={col.id || ci}>
              {col.title && <p className="mb-1 px-2 type-caption font-medium text-ink-3">{col.title}</p>}
              <ul className="flex flex-col">
                {(col.links || []).map((entry, li) => {
                  const href = resolveLinkHref(entry.link)
                  if (!href) return null
                  return (
                    <li key={entry.id || li}>
                      <LocaleLink
                        className="group flex items-start gap-3 rounded-card-inner px-2 py-2 transition-colors duration-150 hover:bg-surface-2 focus-visible:bg-surface-2"
                        href={href}
                        onClick={close}
                        {...(entry.link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                      >
                        {entry.icon && (
                          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-3 text-accent transition-colors duration-150 group-hover:border-line-strong">
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

          {featured && featuredHref && (
            <LocaleLink
              className="group hidden w-[16rem] flex-col justify-between gap-6 rounded-card-inner border border-line bg-surface-3 p-4 transition-colors duration-150 hover:border-line-strong focus-visible:border-line-strong xl:flex"
              href={featuredHref}
              onClick={close}
              {...(featured.link?.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
            >
              <BrandBars size={18} />
              <span className="flex flex-col gap-1.5">
                <span className="font-display text-lg font-medium leading-tight text-ink">{featured.title}</span>
                {featured.text && <span className="type-caption text-ink-2 pretty">{featured.text}</span>}
                {featured.link?.label && (
                  <span className="link-arrow mt-2 type-small font-medium">{featured.link.label}</span>
                )}
              </span>
            </LocaleLink>
          )}
        </div>
      </div>
    </li>
  )
}
