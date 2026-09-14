import type { Consent } from '@/payload-types'

import type { Refs, T } from './content'

/** Texts for the consent layer. Button labels and gate texts come from the package defaults. */
export const consentGlobal = (t: T, refs: Refs): Partial<Consent> => ({
  enabled: true,
  revision: 1,
  privacyPage: refs.legal['privacy-policy'],
  imprintPage: refs.legal.imprint,
  trigger: { mode: 'floating', position: 'bottom-left' },
  banner: {
    title: t('Cookies auf dieser Website', 'Cookies on this website'),
    text: t(
      'Wir verwenden Cookies nur mit Ihrer Zustimmung für {categories}. Sie können Ihre Auswahl jederzeit unter „Cookie-Einstellungen“ ändern oder widerrufen.',
      'We use cookies only with your consent, for {categories}. You can change or withdraw your choice at any time under “Cookie settings”.',
    ),
  },
  settings: {
    title: t('Cookie-Einstellungen', 'Cookie settings'),
    text: t(
      'Wählen Sie, welche Kategorien Sie erlauben. Ihre Auswahl können Sie jederzeit über den Button unten links oder den Link in der Fußzeile ändern.',
      'Choose which categories you allow. You can change your selection at any time via the button at the bottom left or the link in the footer.',
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
          name: 'Cookie-Einwilligung',
          provider: 'Indicate Data GmbH',
          integration: 'none',
          purpose: t(
            'Speichert Ihre Entscheidung zu Cookies im Browser. Zum Nachweis der Einwilligung wird jede Entscheidung mit Zeitpunkt, Auswahl und einer zufälligen Kennung auf unserem Server protokolliert, ohne IP-Adresse.',
            'Stores your cookie decision in the browser. As proof of consent, every decision is recorded on our server with time, choices and a random identifier, without an IP address.',
          ),
          cookies: 'consent · 12 Monate / 12 months',
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
          name: 'Google Tag Manager / Google Analytics 4',
          provider: 'Google Ireland Limited',
          integration: 'gtm',
          purpose: t(
            'Reichweitenmessung und Analyse der Nutzung unserer Website. Wird erst nach Ihrer Zustimmung geladen.',
            'Reach measurement and analysis of the use of our website. Loads only after your consent.',
          ),
          cookies: '_ga, _ga_* · 2 Jahre / 2 years',
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
