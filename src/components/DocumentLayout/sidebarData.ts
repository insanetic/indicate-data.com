import type { Sidebar } from '@/payload-types'

import { resolveLinkHref } from '@/components/Link'

export type SidebarLink = { href: string; label: string; newTab?: boolean }
export type SidebarGroup = { title: string; links: SidebarLink[] }
export type SidebarContact = { title?: string | null; text?: string | null; email?: string | null }

/** Flattens a CMS sidebar into plain groups the client component can render. */
export const sidebarGroupsFromDoc = (sidebar: Sidebar): SidebarGroup[] =>
  (sidebar.groups || []).map((group) => ({
    title: group.title,
    links: (group.links || []).flatMap((entry) => {
      const href = resolveLinkHref(entry.link)
      return href ? [{ href, label: entry.link.label, newTab: Boolean(entry.link.newTab) }] : []
    }),
  }))
