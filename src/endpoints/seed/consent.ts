import type { Consent } from '@/payload-types'

import type { Refs, T } from './content'

/** Texts for the consent layer. Button labels come from src/consent/defaults.ts. */
export const consentGlobal = (t: T, refs: Refs): Partial<Consent> => ({
  enabled: true,
  revision: 1,
  privacyPage: refs.legal['privacy-policy'],
  imprintPage: refs.legal.imprint,
  banner: {
    title: t('Cookies auf dieser Website', 'Cookies on this website'),
    text: t(
      'Wir verwenden Cookies nur mit Ihrer Zustimmung, um zu verstehen, wie die Website genutzt wird. Ohne Ihre Zustimmung wird nichts erfasst.',
      'We only use cookies with your consent, to understand how the website is used. Nothing is recorded without your consent.',
    ),
  },
  settings: {
    title: t('Cookie-Einstellungen', 'Cookie settings'),
    text: t(
      'Wählen Sie, welche Kategorien Sie erlauben. Ihre Auswahl können Sie jederzeit über den Link in der Fußzeile ändern.',
      'Choose which categories you allow. You can change your selection at any time via the link in the footer.',
    ),
  },
  categories: [
    {
      key: 'necessary',
      label: t('Notwendig', 'Necessary'),
      description: t(
        'Für den Betrieb der Website erforderlich, etwa um Ihre Cookie-Auswahl zu speichern.',
        'Required to run the website, for example to remember your cookie choice.',
      ),
      services: [
        {
          name: t('Cookie-Auswahl', 'Cookie choice'),
          provider: 'Indicate Data GmbH',
          purpose: t('Speichert Ihre Entscheidung zu Cookies.', 'Stores your cookie decision.'),
          cookies: t('consent · 12 Monate', 'consent · 12 months'),
        },
      ],
    },
    {
      key: 'analytics',
      label: t('Statistik', 'Statistics'),
      description: t(
        'Hilft uns zu verstehen, welche Seiten besucht werden. Die Daten werden anonymisiert ausgewertet.',
        'Helps us understand which pages are visited. Data is evaluated anonymously.',
      ),
      services: [
        {
          name: 'Google Analytics 4',
          provider: 'Google Ireland Limited',
          purpose: t(
            'Reichweitenmessung und Analyse der Nutzung unserer Website.',
            'Reach measurement and analysis of the use of our website.',
          ),
          cookies: t('_ga, _ga_* · 2 Jahre', '_ga, _ga_* · 2 years'),
          privacyUrl: 'https://policies.google.com/privacy',
        },
      ],
    },
    {
      key: 'marketing',
      label: t('Marketing', 'Marketing'),
      description: t(
        'Ermöglicht es, den Erfolg unserer Kampagnen zu messen und Ihnen relevante Inhalte zu zeigen. Derzeit nicht im Einsatz.',
        'Lets us measure our campaigns and show you relevant content. Not in use at the moment.',
      ),
      services: [],
    },
  ],
})
