import type { Locale } from '@/i18n/config'
import type { Footer, Header, Page, SiteSetting } from '@/payload-types'

import { paragraphs } from './lexical'

/** Picks the text for the locale being seeded. */
export type T = (de: string, en: string) => string
export const pick =
  (locale: Locale): T =>
  (de, en) =>
    locale === 'de' ? de : en

export type Refs = {
  contactPageId: number
  media: Record<string, number>
  links: { appUrl: string; demoUrl: string; helpUrl: string; docsUrl: string }
}

type Appearance = 'default' | 'outline' | 'ghost' | 'link'

const external = <A extends Appearance>(url: string, label: string, appearance?: A) => ({
  link: { type: 'custom' as const, url, newTab: true, label, ...(appearance ? { appearance } : {}) },
})
const anchor = <A extends Appearance>(id: string, label: string, appearance?: A) => ({
  link: { type: 'custom' as const, url: `#${id}`, label, ...(appearance ? { appearance } : {}) },
})
const internal = <A extends Appearance>(url: string, label: string, appearance?: A) => ({
  link: { type: 'custom' as const, url, label, ...(appearance ? { appearance } : {}) },
})
const pageRef = <A extends Appearance>(id: number, label: string, appearance?: A) => ({
  link: {
    type: 'reference' as const,
    reference: { relationTo: 'pages' as const, value: id },
    label,
    ...(appearance ? { appearance } : {}),
  },
})

export const siteSettings = (t: T, refs: Refs): Partial<SiteSetting> => ({
  siteName: 'Indicate Data',
  tagline: t(
    'Die Analytics-Plattform mit KI-Agent für Hotels, Hotelgruppen und ihre Partner.',
    'The analytics platform with an AI agent for hotels, hotel groups and their partners.',
  ),
  contact: {
    email: 'hello@indicate-data.io',
    address: 'Indicate Data GmbH\nIndustriestraße 27\n77656 Offenburg',
  },
  links: refs.links,
  social: [
    { platform: 'linkedin', url: 'https://www.linkedin.com/company/indicate-data/' },
    { platform: 'discord', url: 'https://discord.gg/gyCF43pZaV' },
  ],
})

export const header = (t: T, refs: Refs): Partial<Header> => ({
  announcement: {
    enabled: true,
    text: t(
      'Der Indicate Agent arbeitet jetzt auch in ChatGPT und Claude.',
      'The Indicate agent now also works inside ChatGPT and Claude.',
    ),
    ...anchor('agent', t('Mehr erfahren', 'Learn more')),
  },
  items: [
    {
      label: t('Produkt', 'Product'),
      type: 'menu',
      columns: [
        {
          title: t('Plattform', 'Platform'),
          links: [
            {
              ...anchor('product', t('Dashboards & Kennzahlen', 'Dashboards & KPIs')),
              description: t('Fertige Kennzahlen für jedes System', 'Ready-made KPIs for every system'),
              icon: 'chart',
            },
            {
              ...anchor('agent', t('KI-Agent', 'AI agent')),
              description: t('Fragen in normalen Worten stellen', 'Ask questions in plain words'),
              icon: 'sparkles',
            },
            {
              ...anchor('integrations', t('Integrationen', 'Integrations')),
              description: t('PMS, Kanäle, Marketing, Web', 'PMS, channels, marketing, web'),
              icon: 'plug',
            },
            {
              ...anchor('why', t('Sicherheit & Rechte', 'Security & permissions')),
              description: t('Spaces, Rollen, Zwei-Faktor', 'Spaces, roles, two-factor'),
              icon: 'shield',
            },
          ],
        },
        {
          title: t('Für Fortgeschrittene', 'Going deeper'),
          links: [
            {
              ...external(refs.links.docsUrl, t('KPI Studio & Semantic Layer', 'KPI Studio & semantic layer')),
              description: t('Eigene Kennzahlen als JSON definieren', 'Define your own KPIs as JSON'),
              icon: 'code',
            },
            {
              ...external(refs.links.helpUrl, t('Hilfe-Center', 'Help centre')),
              description: t('Anleitungen und Antworten', 'Guides and answers'),
              icon: 'search',
            },
          ],
        },
      ],
    },
    {
      label: t('Lösungen', 'Solutions'),
      type: 'menu',
      columns: [
        {
          title: t('Für wen', 'Who it is for'),
          links: [
            { ...anchor('why', t('Einzelhotels', 'Independent hotels')), icon: 'building', description: t('Alle Zahlen des Hauses', 'Every number of the property') },
            { ...anchor('why', t('Hotelgruppen', 'Hotel groups')), icon: 'buildings', description: t('Ein Space pro Haus', 'One space per property') },
            { ...anchor('why', t('Agenturen', 'Agencies')), icon: 'briefcase', description: t('Kundenberichte mit Buchungsdaten', 'Client reports with booking data') },
            { ...external(refs.links.docsUrl, t('Software-Anbieter', 'Software providers')), icon: 'code', description: t('Analytics für Ihre Kunden', 'Analytics for your customers') },
          ],
        },
      ],
    },
    {
      label: t('Ressourcen', 'Resources'),
      type: 'menu',
      columns: [
        {
          title: t('Lernen', 'Learn'),
          links: [
            { ...internal('/posts', 'Blog'), icon: 'eye', description: t('Neues aus Produkt und Hotellerie', 'Product and hospitality news') },
            { ...external(refs.links.helpUrl, t('Hilfe-Center', 'Help centre')), icon: 'search', description: t('Anleitungen Schritt für Schritt', 'Step-by-step guides') },
            { ...external(refs.links.docsUrl, t('Entwickler-Dokumentation', 'Developer docs')), icon: 'code', description: t('API, MCP und Semantic Layer', 'API, MCP and semantic layer') },
          ],
        },
      ],
    },
    { label: t('Kontakt', 'Contact'), type: 'link', ...pageRef(refs.contactPageId, t('Kontakt', 'Contact')) },
  ],
  secondaryCta: { enabled: true, ...external(refs.links.appUrl, t('Anmelden', 'Sign in')) },
  primaryCta: { enabled: true, ...external(refs.links.demoUrl, t('Demo buchen', 'Book a demo')) },
})

export const footer = (t: T, refs: Refs): Partial<Footer> => ({
  columns: [
    {
      title: t('Produkt', 'Product'),
      links: [
        anchor('product', t('Dashboards & Kennzahlen', 'Dashboards & KPIs')),
        anchor('agent', t('KI-Agent', 'AI agent')),
        anchor('integrations', t('Integrationen', 'Integrations')),
        anchor('why', t('Warum Indicate', 'Why Indicate')),
      ],
    },
    {
      title: t('Lösungen', 'Solutions'),
      links: [
        anchor('why', t('Einzelhotels', 'Independent hotels')),
        anchor('why', t('Hotelgruppen', 'Hotel groups')),
        anchor('why', t('Agenturen', 'Agencies')),
        external(refs.links.docsUrl, t('Software-Anbieter', 'Software providers')),
      ],
    },
    {
      title: t('Ressourcen', 'Resources'),
      links: [
        internal('/posts', 'Blog'),
        external(refs.links.helpUrl, t('Hilfe-Center', 'Help centre')),
        external(refs.links.docsUrl, t('Entwickler-Dokumentation', 'Developer docs')),
        external(refs.links.appUrl, t('Anmelden', 'Sign in')),
      ],
    },
    {
      title: t('Unternehmen', 'Company'),
      links: [
        pageRef(refs.contactPageId, t('Kontakt', 'Contact')),
        external(refs.links.demoUrl, t('Demo buchen', 'Book a demo')),
        external('https://indicate-data.io/de/jobs', t('Karriere', 'Careers')),
        external('https://indicate-data.io/de/presse', t('Presse', 'Press')),
      ],
    },
  ],
  legalLinks: [
    external('https://indicate-data.io/de/imprint', t('Impressum', 'Imprint')),
    external('https://indicate-data.io/de/compliance/privacy-policy', t('Datenschutz', 'Privacy')),
    external('https://indicate-data.io/de/compliance/terms-of-service', t('AGB', 'Terms')),
  ],
  showContact: true,
  showLanguageSwitch: true,
  bottomText: 'Indicate Data GmbH, Offenburg',
})

type PageData = Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>

export const homePage = (t: T, refs: Refs): Partial<PageData> => ({
  title: t('Startseite', 'Home'),
  slug: 'home',
  _status: 'published',
  hero: { type: 'none' },
  seo: {
    title: t('Hotel-Analytics mit KI-Agent', 'Hotel analytics with an AI agent'),
    description: t(
      'Indicate verbindet PMS, Buchungskanäle und Marketing in einem Dashboard. Ein KI-Agent erklärt Auslastung, ADR und RevPAR in einfachen Worten.',
      'Indicate brings PMS, booking channels and marketing into one dashboard. An AI agent explains occupancy, ADR and RevPAR in plain words.',
    ),
  },
  layout: [
    {
      blockType: 'hero',
      blockName: 'Hero',
      header: {
        heading: t(
          'Alle Hotelzahlen an einem Ort. Und ein Agent, der sie erklärt.',
          'Every hotel number in one place. And an agent that explains them.',
        ),
        lead: t(
          'Indicate verbindet PMS, Buchungskanäle und Marketing in einem Dashboard und beantwortet Ihre Fragen aus geprüften Kennzahlen. Einsatzbereit in Minuten.',
          'Indicate brings your PMS, booking channels and marketing into one dashboard and answers your questions from verified figures. Ready in minutes.',
        ),
        align: 'center',
      },
      links: [
        external(refs.links.demoUrl, t('Demo buchen', 'Book a demo'), 'default'),
        anchor('agent', t('Agent ansehen', 'See the agent'), 'outline'),
      ],
      trust: {
        text: t('Im Einsatz bei', 'Used by'),
        logos: [{ name: 'Familotel' }, { name: 'Alpenhof' }, { name: 'Feldberger Hof' }, { name: 'Hochegger Klippitz' }],
      },
      visual: { type: 'illustration', illustration: 'dashboard' },
      settings: { background: 'default', spacing: 'default' },
    },
    {
      blockType: 'logoWall',
      blockName: 'Logos',
      header: {
        heading: t(
          'Hotels, Hotelgruppen und Partner, die mit Indicate arbeiten',
          'Hotels, hotel groups and partners working with Indicate',
        ),
      },
      display: 'marquee',
      logos: [
        { name: 'Familotel AG' },
        { name: 'Alpenhof' },
        { name: 'Feldberger Hof' },
        { name: 'Hochegger Klippitz' },
        { name: 'Hotel Seeklause' },
        { name: 'Re:Guest' },
      ],
      settings: { background: 'default', spacing: 'compact' },
    },
    {
      blockType: 'featureTabs',
      blockName: t('Plattform', 'Platform'),
      header: {
        eyebrow: t('Die Plattform', 'The platform'),
        heading: t('Ein Ort für alle Hotelzahlen', 'One place for every hotel number'),
        lead: t(
          'Verständlich für die Rezeption, belastbar für die Geschäftsführung.',
          'Clear enough for the front desk, solid enough for the owner.',
        ),
        align: 'center',
      },
      tabs: [
        {
          label: t('Dashboards & Kennzahlen', 'Dashboards & KPIs'),
          icon: 'chart',
          heading: t('Auslastung, ADR und RevPAR auf einen Blick', 'Occupancy, ADR and RevPAR at a glance'),
          description: t(
            'Fertige Kennzahlen für jedes angebundene System. Sie wählen Zeitraum und Hotel, Indicate zeigt die Zahlen, die zählen.',
            'Ready-made KPIs for every connected system. Pick the period and the property, Indicate shows the numbers that matter.',
          ),
          points: [
            {
              icon: 'chart',
              title: t('Fertige Kennzahlensets', 'Ready-made KPI sets'),
              text: t(
                'Umsatz, Auslastung, ADR, RevPAR, Buchungen und Kanalmix kommen mit jeder Integration mit.',
                'Revenue, occupancy, ADR, RevPAR, bookings and channel mix arrive with every integration.',
              ),
            },
            {
              icon: 'sparkles',
              title: t('Dashboards per Beschreibung', 'Dashboards from a description'),
              text: t(
                'Beschreiben Sie den Bericht, den Sie brauchen. Der Assistent baut ihn aus Ihren geprüften Kennzahlen.',
                'Describe the report you need. The assistant builds it from your verified KPIs.',
              ),
            },
            {
              icon: 'palette',
              title: t('In Ihren Farben', 'In your colours'),
              text: t(
                'Diagramme, Tabellen und Scorecards in der Palette Ihres Hauses.',
                'Charts, tables and scorecards in the palette of your property.',
              ),
            },
          ],
          visual: { type: 'illustration', illustration: 'dashboard' },
        },
        {
          label: t('Vergleiche & Ziele', 'Comparisons & targets'),
          icon: 'target',
          heading: t('Vormonat, Vorjahr oder Plan, immer daneben', 'Last month, last year or plan, always side by side'),
          description: t(
            'Jede Kennzahl lässt sich mit der Vorperiode, dem Vorjahr oder Ihrem Budget vergleichen. Ziellinien zeigen sofort, wo Sie stehen.',
            'Every KPI compares against the previous period, the previous year or your budget. Guide lines show at once where you stand.',
          ),
          points: [
            {
              icon: 'calendar',
              title: t('Zeitreise per Klick', 'Time travel in one click'),
              text: t('Monat gegen Monat, Jahr gegen Jahr, nach Ankunfts- oder Buchungsdatum.', 'Month over month, year over year, by arrival or booking date.'),
            },
            {
              icon: 'target',
              title: t('Plan gegen Ist', 'Plan versus actual'),
              text: t('Budgets aus Excel hochladen und jede Abweichung sehen.', 'Upload budgets from Excel and see every deviation.'),
            },
            {
              icon: 'trending',
              title: t('Pickup und Forecast', 'Pickup and forecast'),
              text: t('Vorausbuchungen für die nächsten 7 bis 365 Tage.', 'Bookings on the books for the next 7 to 365 days.'),
            },
          ],
          visual: { type: 'illustration', illustration: 'comparison' },
        },
        {
          label: t('Datenquellen', 'Data sources'),
          icon: 'plug',
          heading: t('PMS, Kanäle und Marketing in Minuten verbunden', 'PMS, channels and marketing connected in minutes'),
          description: t(
            'Verbinden Sie Ihre Systeme mit wenigen Klicks. Indicate holt die Daten täglich ab und meldet sich, wenn etwas nicht stimmt.',
            'Connect your systems in a few clicks. Indicate fetches the data every day and tells you when something is off.',
          ),
          points: [
            {
              icon: 'plug',
              title: t('Marketplace mit über 30 Anbindungen', 'Marketplace with more than 30 connections'),
              text: t('Mews, Oracle, ASA, Re:Guest, vioma, Google, Meta und mehr.', 'Mews, Oracle, ASA, Re:Guest, vioma, Google, Meta and more.'),
            },
            {
              icon: 'upload',
              title: t('Eigene Tabellen dazu', 'Your own spreadsheets too'),
              text: t('Budgets oder Zielwerte als CSV hochladen.', 'Upload budgets or targets as CSV.'),
            },
            {
              icon: 'bell',
              title: t('Verbindungsstatus im Blick', 'Connection health at a glance'),
              text: t('Jede Quelle zeigt, ob sie gesund ist, und pausiert bei Problemen.', 'Every source shows whether it is healthy and pauses when there is a problem.'),
            },
          ],
          visual: { type: 'illustration', illustration: 'sources' },
        },
      ],
      settings: { background: 'default', spacing: 'default', anchor: 'product' },
    },
    {
      blockType: 'agentShowcase',
      blockName: t('KI-Agent', 'AI agent'),
      header: {
        eyebrow: t('KI-Agent', 'AI agent'),
        heading: t('Fragen Sie Ihr Hotel.', 'Ask your hotel.'),
        lead: t(
          'Der Agent antwortet aus Ihren geprüften Kennzahlen und sagt dazu, woher die Zahl kommt. In der App, in ChatGPT oder in Claude.',
          'The agent answers from your verified figures and tells you where each number comes from. In the app, in ChatGPT or in Claude.',
        ),
        align: 'center',
      },
      prompts: [
        {
          question: t('Welche Zimmerkategorie verkauft sich im Oktober am schlechtesten?', 'Which room category sells worst in October?'),
          answer: t(
            'Die Juniorsuiten: nur 61 % Auslastung im Oktober, 14 Punkte unter dem Haus. Unter der Woche bleiben sie frei, am Wochenende sind sie fast voll.',
            'The junior suites: only 61 % occupancy in October, 14 points below the property. They stay empty on weekdays; at weekends they are almost full.',
          ),
          chart: 'bars',
          kpiLabel: t('Auslastung Juniorsuite, Oktober', 'Junior suite occupancy, October'),
          kpiValue: '61 %',
          kpiDelta: '−14',
        },
        {
          question: t('Lohnt sich Google Ads für uns im Winter?', 'Is Google Ads worth it for us in winter?'),
          answer: t(
            'Ja, aber knapper als im Sommer: 38 € Kosten pro Buchung im Januar gegenüber 22 € im Juli. Die Buchungen aus Ads haben mit 176 € trotzdem den höchsten ADR.',
            'Yes, but by a smaller margin than in summer: €38 per booking in January versus €22 in July. Bookings from Ads still have the highest ADR at €176.',
          ),
          chart: 'line',
          kpiLabel: t('Kosten pro Buchung, Januar', 'Cost per booking, January'),
          kpiValue: '38 €',
          kpiDelta: '+16 €',
        },
        {
          question: t('Wie viele Stornos kamen letzte Woche über Booking.com?', 'How many cancellations came through Booking.com last week?'),
          answer: t(
            '23 Stornierungen, 9 mehr als in der Vorwoche. 17 davon betrafen Ankünfte in den nächsten 7 Tagen. Zwei Drittel der frei gewordenen Nächte sind schon wieder verkauft.',
            '23 cancellations, 9 more than the week before. 17 of them were arrivals within the next 7 days. Two thirds of the freed nights are already sold again.',
          ),
          chart: 'bars',
          kpiLabel: t('Stornos Booking.com, letzte Woche', 'Booking.com cancellations, last week'),
          kpiValue: '23',
          kpiDelta: '+9',
        },
        {
          question: t('Welche Gästeherkunft bringt den höchsten ADR?', 'Which guest origin brings the highest ADR?'),
          answer: t(
            'Gäste aus der Schweiz: 189 € ADR bei 4,2 Nächten Aufenthalt. 71 % buchen direkt, die meisten mehr als 60 Tage im Voraus.',
            'Guests from Switzerland: €189 ADR with a 4.2-night stay. 71 % book directly, most of them more than 60 days ahead.',
          ),
          chart: 'line',
          kpiLabel: t('ADR Gäste aus der Schweiz', 'ADR, guests from Switzerland'),
          kpiValue: '189 €',
          kpiDelta: '+31 %',
        },
      ],
      points: [
        {
          icon: 'shield',
          title: t('Nur geprüfte Kennzahlen', 'Verified KPIs only'),
          text: t('Der Agent liest freigegebene Kennzahlen, nie rohe Tabellen.', 'The agent reads released KPIs, never raw tables.'),
        },
        {
          icon: 'lock',
          title: t('Rechte gelten auch hier', 'Permissions apply here too'),
          text: t('Jede Person bekommt nur Antworten zu Häusern, die sie sehen darf.', 'Everyone gets answers only about the properties they may see.'),
        },
        {
          icon: 'message',
          title: t('In ChatGPT und Claude', 'In ChatGPT and Claude'),
          text: t('Über den MCP-Server, im Werkzeug, das Ihr Team schon nutzt.', 'Through the MCP server, in the tool your team already uses.'),
        },
      ],
      links: [external(refs.links.demoUrl, t('Agent im Gespräch erleben', 'See the agent in a demo'), 'default')],
      settings: { background: 'tinted', spacing: 'default', anchor: 'agent' },
    },
    {
      blockType: 'integrations',
      blockName: t('Integrationen', 'Integrations'),
      header: {
        eyebrow: t('Integrationen', 'Integrations'),
        heading: t('Passt zu der Software, die Sie schon haben', 'Works with the software you already run'),
        lead: t(
          'Die Daten kommen aus den Systemen, die Sie schon haben, und landen dort, wo Ihr Team arbeitet.',
          'The data comes from the systems you already run and lands where your team works.',
        ),
        align: 'center',
      },
      visual: { type: 'illustration', illustration: 'integrations' },
      groups: [
        {
          title: t('PMS & Hotelsoftware', 'PMS & hotel software'),
          items: [
            { name: 'Mews', logo: refs.media.mews },
            { name: 'Oracle Hospitality', logo: refs.media.oracle },
            { name: 'elite PMS', logo: refs.media['elite-pms'] },
            { name: 'ASA Hotelsoftware' },
            { name: 'simplify hospitality' },
            { name: 'Shiji' },
          ],
        },
        {
          title: t('Vertrieb & Gäste', 'Sales & guests'),
          items: [
            { name: 'Re:Guest CRM', logo: refs.media['re-guest'] },
            { name: 'vioma OTA', logo: refs.media.vioma },
            { name: 'Customer Alliance' },
            { name: 'HubSpot' },
            { name: 'Pipedrive' },
            { name: 'Inxmail', logo: refs.media.inxmail },
          ],
        },
        {
          title: t('Marketing & Web', 'Marketing & web'),
          items: [
            { name: 'Google Analytics 4', logo: refs.media['google-analytics'] },
            { name: 'Google Search Console' },
            { name: 'Google Ads' },
            { name: 'Meta Ads', logo: refs.media.meta },
            { name: 'Instagram', logo: refs.media.instagram },
            { name: 'Microsoft Advertising' },
          ],
        },
        {
          title: t('Betrieb', 'Operations'),
          items: [
            { name: 'gastromatic' },
            { name: 'Passcreator' },
            { name: 'CSV Import' },
            { name: 'Schulferien' },
            { name: 'Feiertage' },
          ],
        },
      ],
      links: [external(refs.links.helpUrl, t('Alle Integrationen im Hilfe-Center', 'All integrations in the help centre'), 'link')],
      settings: { background: 'default', spacing: 'default', anchor: 'integrations' },
    },
    {
      blockType: 'pillars',
      blockName: t('Warum Indicate', 'Why Indicate'),
      header: {
        eyebrow: t('Warum Indicate', 'Why Indicate'),
        heading: t('Gemacht für Hotels, nicht für Datenteams', 'Built for hotels, not for data teams'),
        lead: t(
          'Fertig eingerichtet, verständlich für jeden im Haus und offen für alles, was Sie schon nutzen.',
          'Set up from the start, clear for everyone in the house and open to everything you already use.',
        ),
        align: 'center',
      },
      pillars: [
        {
          icon: 'zap',
          title: t('In Minuten startklar', 'Ready in minutes'),
          text: t(
            'PMS und Kanäle verbinden, fertige Dashboards bekommen. Kein Projekt, keine Schulung, keine Excel-Abende.',
            'Connect PMS and channels, get ready-made dashboards. No project, no training, no evenings in Excel.',
          ),
        },
        {
          icon: 'message',
          title: t('Antworten statt Tabellen', 'Answers instead of tables'),
          text: t(
            'Fragen Sie in normalen Worten. Der Agent antwortet aus geprüften Kennzahlen und sagt, woher sie kommen.',
            'Ask in plain words. The agent answers from verified KPIs and tells you where they come from.',
          ),
        },
        {
          icon: 'shield',
          title: t('Sicher pro Haus', 'Secure per property'),
          text: t(
            'Ein Space pro Hotel, Rollen von Gast bis Owner, Zwei-Faktor für alle. Gruppen und Agenturen behalten jedes Haus getrennt.',
            'One space per hotel, roles from guest to owner, two-factor for everyone. Groups and agencies keep every property separate.',
          ),
        },
      ],
      tiles: [
        { value: '40', suffix: ' %', label: t('geringere Betriebskosten durch Automatisierung', 'lower operating costs through automation') },
        { value: '30', suffix: '+', label: t('Anbindungen an Hotel- und Marketing-Systeme', 'connections to hotel and marketing systems'), links: [anchor('integrations', t('Alle ansehen', 'See all'), 'link')] },
        { value: '13', label: t('Monate Historie ab dem ersten Tag', 'months of history from day one') },
        { label: t('Für Hotelgruppen und Agenturen', 'For hotel groups and agencies'), links: [pageRef(refs.contactPageId, t('Gespräch vereinbaren', 'Talk to us'), 'link')] },
        { label: t('Für Software-Anbieter', 'For software providers'), links: [external(refs.links.docsUrl, t('Entwickler-Dokumentation', 'Developer docs'), 'link')] },
      ],
      settings: { background: 'default', spacing: 'default', anchor: 'why' },
    },
    {
      blockType: 'testimonials',
      blockName: t('Kundenstimmen', 'Testimonials'),
      header: {
        eyebrow: t('Kundenstimmen', 'Customers'),
        heading: t('Was Hoteliers über Indicate sagen', 'What hoteliers say about Indicate'),
        align: 'center',
      },
      items: [
        {
          quote: t(
            'Seit ich mit Indicate arbeite, ist meine Arbeit deutlich einfacher geworden. Die Benutzerfreundlichkeit ist ein großer Vorteil.',
            'Since I started using Indicate, my work has become significantly easier. The user-friendliness is a major advantage.',
          ),
          name: 'Armin Biebl',
          role: t('Vorstand', 'Board member'),
          company: 'Familotel AG',
        },
        {
          quote: t(
            'Indicate hat die Auswertung aller relevanten Kennzahlen drastisch vereinfacht und vereinheitlicht.',
            'Indicate has drastically simplified and standardised how we evaluate all relevant KPIs.',
          ),
          name: 'Ilona Stöger-Wolfmeir',
          role: t('Vorstand', 'Board member'),
          company: 'Familotel AG',
        },
      ],
      settings: { background: 'tinted', spacing: 'default' },
    },
    {
      blockType: 'faq',
      blockName: 'FAQ',
      header: {
        eyebrow: t('Häufige Fragen', 'Common questions'),
        heading: t('Was Hoteliers uns vor dem Start fragen', 'What hoteliers ask before they start'),
        lead: t('Nicht dabei? Schreiben Sie uns.', 'Not answered here? Write to us.'),
        align: 'left',
      },
      items: [
        {
          question: t('Wie lange dauert es, bis ich erste Zahlen sehe?', 'How long until I see the first numbers?'),
          answer: paragraphs([
            t(
              'Die meisten Anbindungen liefern innerhalb von Minuten erste Daten, spätestens nach 72 Stunden ist die Historie vollständig. Dashboards für Ihr PMS sind sofort da.',
              'Most connections deliver first data within minutes; the full history is there after 72 hours at the latest. Dashboards for your PMS are ready immediately.',
            ),
          ]),
        },
        {
          question: t('Muss ich technisch sein, um Indicate zu nutzen?', 'Do I need to be technical to use Indicate?'),
          answer: paragraphs([
            t(
              'Nein. Sie verbinden Ihre Systeme mit wenigen Klicks, alles andere kommt fertig. Wer tiefer will, kann eigene Kennzahlen im KPI Studio bauen, muss aber nicht.',
              'No. You connect your systems in a few clicks and everything else comes ready. Anyone who wants to go deeper can build their own KPIs in KPI Studio, but nobody has to.',
            ),
          ]),
        },
        {
          question: t('Welche Hotelsoftware wird unterstützt?', 'Which hotel software is supported?'),
          answer: paragraphs([
            t(
              'Unter anderem Mews, Oracle Hospitality, elite PMS, ASA, simplify hospitality und Shiji, dazu Re:Guest, vioma, Customer Alliance und die gängigen Google- und Meta-Werkzeuge. Die vollständige Liste steht im Hilfe-Center.',
              'Among others Mews, Oracle Hospitality, elite PMS, ASA, simplify hospitality and Shiji, plus Re:Guest, vioma, Customer Alliance and the usual Google and Meta tools. The full list is in the help centre.',
            ),
          ]),
        },
        {
          question: t('Wer sieht unsere Daten?', 'Who can see our data?'),
          answer: paragraphs([
            t(
              'Ihre Daten liegen in Ihrem eigenen Space. Rollen legen fest, wer was sieht, und Zwei-Faktor-Anmeldung lässt sich für alle erzwingen. Der Agent sieht nur freigegebene Kennzahlen.',
              'Your data lives in your own space. Roles define who sees what, and two-factor sign-in can be required for everyone. The agent only sees released KPIs.',
            ),
          ]),
        },
        {
          question: t('Wir betreuen mehrere Hotels. Geht das?', 'We look after several hotels. Does that work?'),
          answer: paragraphs([
            t(
              'Ja. Jedes Hotel bekommt einen eigenen Space, Sie wechseln mit einem Klick. Verbindungslinks erlauben es dem Hotel, sein PMS freizugeben, ohne dass Sie Zugangsdaten sehen.',
              'Yes. Each hotel gets its own space and you switch with one click. Connect links let the hotel authorise its PMS without you ever seeing credentials.',
            ),
          ]),
        },
        {
          question: t('Was kostet der KI-Agent?', 'What does the AI agent cost?'),
          answer: paragraphs([
            t(
              'Der Agent kommt als Erweiterung ab 20 € pro Nutzer und Monat dazu. Fragen in der App, in ChatGPT oder in Claude laufen über denselben Zugang.',
              'The agent is an add-on from €20 per user and month. Questions in the app, in ChatGPT or in Claude all run through the same access.',
            ),
          ]),
        },
      ],
      settings: { background: 'default', spacing: 'default', anchor: 'faq' },
    },
    {
      blockType: 'ctaSection',
      blockName: t('Abschluss', 'Closing'),
      header: {
        heading: t('Bereit, Ihre Zahlen zu verstehen?', 'Ready to understand your numbers?'),
        lead: t(
          'In 30 Minuten zeigen wir Ihnen Indicate mit Daten aus einem Hotel wie Ihrem.',
          'In 30 minutes we show you Indicate with data from a hotel like yours.',
        ),
        align: 'center',
      },
      links: [
        external(refs.links.demoUrl, t('Demo buchen', 'Book a demo'), 'default'),
        pageRef(refs.contactPageId, t('Kontakt aufnehmen', 'Get in touch'), 'outline'),
      ],
      note: t('Unverbindlich und ohne IT-Projekt.', 'No commitment, no IT project.'),
      settings: { background: 'accent', spacing: 'default' },
    },
  ],
})

export const contactPage = (t: T, formId: number): Partial<PageData> => ({
  title: t('Kontakt', 'Contact'),
  slug: 'contact',
  _status: 'published',
  hero: { type: 'none' },
  seo: {
    title: t('Kontakt', 'Contact'),
    description: t(
      'Sprechen Sie mit dem Indicate-Team über Ihre Hotelzahlen.',
      'Talk to the Indicate team about your hotel numbers.',
    ),
  },
  layout: [
    {
      blockType: 'hero',
      blockName: 'Hero',
      header: {
        eyebrow: t('Kontakt', 'Contact'),
        heading: t('Sprechen wir über Ihre Zahlen.', 'Let’s talk about your numbers.'),
        lead: t(
          'Schreiben Sie uns, was Sie erreichen wollen. Wir antworten innerhalb eines Werktags.',
          'Tell us what you want to achieve. We reply within one working day.',
        ),
        align: 'left',
      },
      links: [],
      visual: { type: 'illustration', illustration: 'agent' },
      settings: { background: 'default', spacing: 'compact' },
    },
    {
      blockType: 'formBlock',
      blockName: t('Formular', 'Form'),
      enableIntro: false,
      form: formId,
    },
  ],
})
