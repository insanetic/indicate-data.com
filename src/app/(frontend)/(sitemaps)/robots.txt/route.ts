import { getServerSideURL } from '@/utilities/getURL'

// Rendered per request so the sitemap URL follows the runtime SITE_URL.
export const dynamic = 'force-dynamic'

export function GET(): Response {
  const site = getServerSideURL()
  const body = `User-agent: *
Disallow: /admin/

Sitemap: ${site}/sitemap.xml
Sitemap: ${site}/pages-sitemap.xml
Sitemap: ${site}/posts-sitemap.xml
`
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
