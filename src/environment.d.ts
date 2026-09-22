declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      /** Public origin, e.g. https://indicate-data.com. Read at request time, never at build time. */
      SITE_URL?: string
      /** Older name for SITE_URL; still honoured. */
      NEXT_PUBLIC_SERVER_URL?: string
      /** Google Tag Manager container id; empty disables tracking and the consent banner. */
      GTM_ID?: string
      /** Subneo public API key (`sneo_…`); the CMS global can override it. */
      SUBNEO_API_KEY?: string
      SUBNEO_API_URL?: string
      /** Bearer token accepted by POST /api/subneo-pricing/refresh. */
      SUBNEO_REFRESH_SECRET?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
