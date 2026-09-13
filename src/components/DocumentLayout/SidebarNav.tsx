'use client'

import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React from 'react'

import { LocaleLink } from '@/components/LocaleLink'
import { splitLocale } from '@/i18n/href'
import { cn } from '@/utilities/ui'
import type { SidebarContact, SidebarGroup } from './sidebarData'

type Props = {
  groups: SidebarGroup[]
  contact?: SidebarContact | null
  labels: { more: string; questions: string }
}

/**
 * Grouped document links with the current page marked. Sticky column from `lg`,
 * a disclosure titled "More documents" below that.
 */
export const SidebarNav: React.FC<Props> = ({ groups, contact, labels }) => {
  const pathname = usePathname()
  const current = splitLocale(pathname || '/').path

  const list = (
    <nav aria-label={labels.more} className="flex flex-col gap-7">
      {groups.map((group, gi) => (
        <div className="flex flex-col gap-2" key={gi}>
          <p className="type-caption font-medium uppercase tracking-wider text-ink-3">{group.title}</p>
          <ul className="flex flex-col border-l border-line">
            {group.links.map((link) => {
              const active = link.href === current
              return (
                <li key={link.href + link.label}>
                  <LocaleLink
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      '-ml-px block border-l py-1.5 pl-4 type-small transition-colors duration-150',
                      active ? 'border-accent text-ink' : 'border-transparent text-ink-2 hover:border-line-strong hover:text-ink',
                    )}
                    href={link.href}
                    {...(link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                  >
                    {link.label}
                  </LocaleLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      {contact && (contact.title || contact.email) && (
        <div className="rounded-md border border-line bg-surface-2 p-4">
          <p className="type-small font-medium text-ink">{contact.title || labels.questions}</p>
          {contact.text && <p className="mt-1 type-caption text-ink-2">{contact.text}</p>}
          {contact.email && (
            <a className="mt-2 block type-caption text-accent underline-offset-4 hover:underline" href={`mailto:${contact.email}`}>
              {contact.email}
            </a>
          )}
        </div>
      )}
    </nav>
  )

  return (
    <>
      <div className="hidden lg:block">{list}</div>
      <details className="group rounded-md border border-line bg-surface-2 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 type-small font-medium text-ink [&::-webkit-details-marker]:hidden">
          {labels.more}
          <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="border-t border-line px-4 py-4">{list}</div>
      </details>
    </>
  )
}
