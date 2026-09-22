import { getServerSideURL } from '@/utilities/getURL'

// Sitemap index pointing at the two collection sitemaps. Rendered per request so the site URL
// comes from the runtime environment, not from the build (this replaced next-sitemap's postbuild).
export const dynamic = 'force-dynamic'

export function GET(): Response {
  const site = getServerSideURL()
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${site}/pages-sitemap.xml</loc></sitemap>
  <sitemap><loc>${site}/posts-sitemap.xml</loc></sitemap>
</sitemapindex>
`
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  })
}
