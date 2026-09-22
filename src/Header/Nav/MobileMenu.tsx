'use client'

import { ChevronDown, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import type { Header } from '@/payload-types'

import { CMSLink, resolveLinkHref } from '@/components/Link'
import { LocaleLink } from '@/components/LocaleLink'
import { cn } from '@/utilities/ui'
import { useHydrated } from '@/utilities/useHydrated'

import type { HeaderLabels } from '../Component.client'
import { NavBadge, type NavItem } from './DesktopNav'
import { withResi } from '@/components/Resi'

type LinkData = NonNullable<Header['primaryCta']>['link'] | null | undefined

/**
 * Full-height drawer from the right for narrow screens. Focus is trapped while open,
 * the page behind is inert, Escape closes.
 *
 * The drawer is portalled into `<body>`: it must not render inside the sticky header, because the
 * header bar switches to `backdrop-blur` once the page is scrolled and an element with a
 * backdrop-filter becomes the containing block for its `position: fixed` descendants. Inside the
 * header the drawer would collapse into the 4rem header box the moment the visitor has scrolled.
 * The portal also lifts it out of the header's `z-40` stacking context.
 */
export const MobileMenu: React.FC<{
  items: NavItem[]
  labels: HeaderLabels
  primary: LinkData
  secondary: LinkData
}> = ({ items, labels, primary, secondary }) => {
  // Open state is tied to the path it was opened on, so a navigation closes the drawer.
  const [openState, setOpenState] = useState<{ open: boolean; path: string }>({ open: false, path: '' })
  const [expanded, setExpanded] = useState<number | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname() || '/'
  const id = useId()
  // The portal target only exists in the browser; the closed drawer contributes nothing to the
  // server HTML, so rendering it from the first client pass on costs no layout and no flash.
  const hydrated = useHydrated()

  // From `lg` up the drawer and its trigger are hidden: a drawer left open across that breakpoint
  // could not be closed, and the page would stay inert and scroll-locked.
  useEffect(() => {
    const desktop = window.matchMedia('(width >= 64rem)')
    const onChange = () => desktop.matches && setOpenState((s) => (s.open ? { ...s, open: false } : s))
    onChange()
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [])
  const open = openState.path === pathname && openState.open
  const setOpen = (next: boolean | ((v: boolean) => boolean)) =>
    setOpenState({ open: typeof next === 'function' ? next(open) : next, path: pathname })

  useEffect(() => {
    if (!open) return
    const main = document.getElementById('content')
    const footer = document.querySelector('footer')
    main?.setAttribute('inert', '')
    footer?.setAttribute('inert', '')

    // Scroll lock. `overflow: hidden` on the document alone makes the page behind snap back to the
    // top, because a scrollport that no longer overflows clamps its offset to zero. Holding the
    // body at its current offset keeps the page where the visitor left it, here and on iOS.
    const { scrollY } = window
    const { body } = document
    const restore = { position: body.style.position, top: body.style.top, left: body.style.left, right: body.style.right }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'

    const focusable = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) || [],
      )
    focusable()[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenState({ open: false, path: pathname })
        triggerRef.current?.focus()
      }
      if (e.key === 'Tab') {
        const els = focusable()
        if (els.length === 0) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      main?.removeAttribute('inert')
      footer?.removeAttribute('inert')
      Object.assign(body.style, restore)
      // `behavior: 'instant'` because the site sets `scroll-behavior: smooth`: closing the menu
      // would otherwise animate the page from the top back down to where the visitor was.
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' })
    }
  }, [open, pathname])

  const surface = (
    <div className="lg:hidden">
      <div
        aria-hidden={!open}
        className={cn(
          'fixed inset-0 z-50 bg-night/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setOpen(false)}
      />

      <div
        aria-label={labels.menu}
        aria-modal="true"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-[min(24rem,100vw)] flex-col bg-surface shadow-float transition-transform duration-300 ease-drawer',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        id={id}
        inert={!open || undefined}
        ref={drawerRef}
        role="dialog"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="type-small font-medium text-ink-3">{labels.menu}</span>
          <button
            aria-label={labels.closeMenu}
            className="pressable inline-flex size-11 items-center justify-center rounded-pill hover:bg-surface-2"
            onClick={() => {
              setOpen(false)
              triggerRef.current?.focus()
            }}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav aria-label={labels.mainNavigation} className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6">
          <ul className="flex flex-col">
            {items.map((item, i) => {
              const isMenu = item.type === 'menu' && (item.columns?.length || 0) > 0
              if (!isMenu) {
                return (
                  <li key={item.id || i}>
                    <CMSLink
                      {...item.link}
                      appearance="inline"
                      className="flex min-h-12 items-center rounded-card-inner px-3 text-lg font-medium text-ink hover:bg-surface-2"
                      label={item.label}
                    />
                  </li>
                )
              }
              const isExpanded = expanded === i
              return (
                <li key={item.id || i}>
                  <button
                    aria-expanded={isExpanded}
                    className="flex min-h-12 w-full items-center justify-between rounded-card-inner px-3 text-lg font-medium text-ink hover:bg-surface-2"
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    type="button"
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn('size-5 transition-transform duration-200', isExpanded && 'rotate-180')}
                    />
                  </button>
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows] duration-250 ease-out-quart',
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="overflow-hidden">
                      {item.featured?.enabled && item.featured.title && item.featured.link && resolveLinkHref(item.featured.link) && (
                        <div className="px-3 pb-2 pt-1">
                          <LocaleLink
                            className="flex flex-col gap-0.5 rounded-card-inner border border-line bg-surface-2 px-3 py-3"
                            href={resolveLinkHref(item.featured.link) as string}
                          >
                            <span className="type-small font-medium text-ink">{withResi(item.featured.title)}</span>
                            {item.featured.link?.label && (
                              <span className="link-arrow type-caption font-medium">{withResi(item.featured.link.label)}</span>
                            )}
                          </LocaleLink>
                        </div>
                      )}
                      {(item.columns || []).map((col, ci) => (
                        <div className="px-3 pb-2" key={col.id || ci}>
                          {col.title && (
                            <p className="pb-1 pt-2 type-caption font-medium text-ink-3">{col.title}</p>
                          )}
                          <ul>
                            {(col.links || []).map((entry, li) => {
                              const href = resolveLinkHref(entry.link)
                              if (!href) return null
                              return (
                                <li key={entry.id || li}>
                                  <LocaleLink
                                    className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-[0.9375rem] text-ink-2 hover:bg-surface-2 hover:text-ink"
                                    href={href}
                                  >
                                    {withResi(entry.link.label)}
                                    {entry.badge && <NavBadge>{entry.badge}</NavBadge>}
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
            })}
          </ul>
        </nav>

        <div className="flex flex-col gap-3 border-t border-line p-5">
          {primary?.label && (
            <CMSLink {...primary} appearance="primary" className="w-full" track={{ location: 'mobile-menu' }} />
          )}
          {secondary?.label && <CMSLink {...secondary} appearance="secondary" className="w-full" />}
        </div>
      </div>
    </div>
  )

  return (
    <div className="lg:hidden">
      <button
        aria-controls={id}
        aria-expanded={open}
        aria-label={open ? labels.closeMenu : labels.openMenu}
        className="pressable inline-flex size-11 items-center justify-center rounded-pill text-ink hover:bg-surface-2"
        onClick={() => setOpen((v) => !v)}
        ref={triggerRef}
        type="button"
      >
        {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </button>

      {hydrated && createPortal(surface, document.body)}
    </div>
  )
}
