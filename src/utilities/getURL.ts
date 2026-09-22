import canUseDOM from './canUseDOM'

/**
 * Public origin of the site, read from the server environment at request time (`SITE_URL`), so a
 * container gets it from its environment or a mounted config file, never from the build.
 * `NEXT_PUBLIC_SERVER_URL` is accepted for older .env files.
 */
export const getServerSideURL = () => {
  return process.env.SITE_URL || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol
    const domain = window.location.hostname
    const port = window.location.port

    return `${protocol}//${domain}${port ? `:${port}` : ''}`
  }

  return getServerSideURL()
}
