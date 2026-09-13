import { unstable_cache } from 'next/cache'

import { catalog } from './catalog'
import type { Integration } from './types'

export const INTEGRATIONS_TAG = 'integrations'

/**
 * The connector catalogue. Today it is the static list in `./catalog`; later it comes from the
 * Indicate API (the marketplace endpoint of the app). Keep the signature: callers get a
 * validated, sorted list and never touch the source. `revalidateTag(INTEGRATIONS_TAG)` busts
 * the cache once the endpoint exists.
 */
export const getIntegrations = unstable_cache(
  async (): Promise<Integration[]> => {
    // Future: const res = await fetch(`${process.env.INDICATE_API_URL}/marketplace/integrations`, { next: { tags: [INTEGRATIONS_TAG] } })
    return [...catalog].sort(byFeaturedThenName)
  },
  ['integrations', 'v1'],
  { tags: [INTEGRATIONS_TAG], revalidate: 3600 },
)

const byFeaturedThenName = (a: Integration, b: Integration) =>
  Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name)

/** Looks a connector up by display name, for CMS-entered names (case- and suffix-tolerant). */
export const findIntegrationByName = (integrations: Integration[], name: string): Integration | undefined => {
  const key = normalise(name)
  return integrations.find(
    (i) => normalise(i.name) === key || (i.aliases || []).some((a) => normalise(a) === key),
  ) || integrations.find((i) => key.startsWith(normalise(i.name)) || normalise(i.name).startsWith(key))
}

export const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
