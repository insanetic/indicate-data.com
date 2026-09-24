import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { locales } from '@/i18n/config'
import { getServerSideURL } from '@/utilities/getURL'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = getServerSideURL()

    const results = await payload.find({
      collection: 'pages',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // The posts index changes whenever a post does, so it carries the newest post's date.
    const newestPost = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1,
      sort: '-updatedAt',
      where: { _status: { equals: 'published' } },
      select: { updatedAt: true },
    })

    const dateFallback = new Date().toISOString()
    const postsLastmod = newestPost.docs[0]?.updatedAt

    // Search result pages stay out of the sitemap; they are not content.
    const defaultSitemap = locales.map((locale) => ({
      loc: `${SITE_URL}/${locale}/posts`,
      ...(postsLastmod ? { lastmod: postsLastmod } : {}),
    }))

    const sitemap = results.docs
      ? results.docs
          .filter((page) => Boolean(page?.slug))
          .flatMap((page) =>
            locales.map((locale) => ({
              loc:
                page?.slug === 'home'
                  ? `${SITE_URL}/${locale}`
                  : `${SITE_URL}/${locale}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            })),
          )
      : []

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap', 'posts-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
