import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import { defaultLocale, type Locale } from '@/i18n/config'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(
  slug: T,
  depth = 0,
  locale: Locale = defaultLocale,
): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
    locale,
  })

  return global
}

/** Bump when the shape of a global changes, so stale cache entries are never read again. */
const CACHE_VERSION = 'v3'

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(
  slug: T,
  depth = 0,
  locale: Locale = defaultLocale,
) =>
  unstable_cache(async () => getGlobal<T>(slug, depth, locale), [slug, String(depth), locale, CACHE_VERSION], {
    tags: [`global_${slug}`],
  })
