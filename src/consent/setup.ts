import { defineConsent } from '@subneo/payload-consent'
import { gtm } from '@subneo/payload-consent/integrations/gtm'

/**
 * This site's consent surface. Imported by payload.config.ts (global, log collection) and by
 * ConsentRoot (browser). The Tag Manager container id is not part of this module: the editor sets
 * it in the admin under Cookies & tracking → Integrations, and the server falls back to `GTM_ID`
 * from the container's environment, reading both per request. Neither set: no tracker, no banner.
 */
export const consentSetup = defineConsent({
  categories: [
    {
      key: 'necessary',
      required: true,
      texts: {
        de: { label: 'Notwendig', description: 'Für den Betrieb der Website erforderlich, etwa um Ihre Cookie-Auswahl zu speichern.' },
        en: { label: 'Necessary', description: 'Required to run the website, for example to remember your cookie choice.' },
      },
    },
    {
      key: 'analytics',
      signals: ['analytics_storage'],
      texts: {
        de: { label: 'Statistik', description: 'Hilft uns zu verstehen, welche Seiten besucht werden. Die Daten werden anonymisiert ausgewertet.' },
        en: { label: 'Statistics', description: 'Helps us understand which pages are visited. Data is evaluated anonymously.' },
      },
    },
    {
      key: 'marketing',
      signals: ['ad_storage', 'ad_user_data', 'ad_personalization'],
      texts: {
        de: { label: 'Marketing', description: 'Ermöglicht es, den Erfolg unserer Kampagnen zu messen und Ihnen relevante Inhalte zu zeigen.' },
        en: { label: 'Marketing', description: 'Lets us measure our campaigns and show you relevant content.' },
      },
    },
  ],
  integrations: [gtm()],
  logging: true,
})
