import { getServerSideURL } from '@/utilities/getURL'

// Rendered per request so the sitemap URL follows the runtime SITE_URL.
export const dynamic = 'force-dynamic'

/**
 * AI crawlers are named explicitly so a later change to the `*` group cannot shut them out by
 * accident. Answer engines fetch pages to cite them (search) or on a user's request (user); the
 * training crawlers feed model training. All are allowed; move a bot to `Disallow: /` to opt out.
 */
const aiCrawlers = {
  search: ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot'],
  user: ['ChatGPT-User', 'Claude-User', 'Perplexity-User', 'MistralAI-User'],
  training: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent'],
}

export function GET(): Response {
  const site = getServerSideURL()
  const aiGroup = [...aiCrawlers.search, ...aiCrawlers.user, ...aiCrawlers.training]
    .map((bot) => `User-agent: ${bot}`)
    .join('\n')

  const body = `User-agent: *
Disallow: /admin/

${aiGroup}
Allow: /
Disallow: /admin/

Sitemap: ${site}/sitemap.xml
Sitemap: ${site}/pages-sitemap.xml
Sitemap: ${site}/posts-sitemap.xml
`
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  })
}
