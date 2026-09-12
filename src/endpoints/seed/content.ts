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
              ...anchor('integrations', t('Datenquellen & Integrationen', 'Data sources & integrations')),
              description: t('Über 30 Anbindungen', 'More than 30 connections'),
              icon: 'plug',
            },
            {
              ...anchor('product', t('Teams & Rechte', 'Teams & permissions')),
              description: t('Spaces, Rollen, Zwei-Faktor', 'Spaces, roles, two-factor'),
              icon: 'users',
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
            { ...anchor('solutions', t('Einzelhotels', 'Independent hotels')), icon: 'building', description: t('Alle Zahlen des Hauses', 'Every number of the property') },
            { ...anchor('solutions', t('Hotelgruppen', 'Hotel groups')), icon: 'buildings', description: t('Ein Space pro Haus', 'One space per property') },
            { ...anchor('solutions', t('Agenturen', 'Agencies')), icon: 'briefcase', description: t('Kundenberichte mit Buchungsdaten', 'Client reports with booking data') },
            { ...anchor('solutions', t('Software-Anbieter', 'Software providers')), icon: 'code', description: t('Analytics für Ihre Kunden', 'Analytics for your customers') },
          ],
        },
      ],
    },
    { label: t('Preise', 'Pricing'), type: 'link', ...anchor('pricing', t('Preise', 'Pricing')) },
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
        anchor('pricing', t('Preise', 'Pricing')),
      ],
    },
    {
      title: t('Lösungen', 'Solutions'),
      links: [
        anchor('solutions', t('Einzelhotels', 'Independent hotels')),
        anchor('solutions', t('Hotelgruppen', 'Hotel groups')),
        anchor('solutions', t('Agenturen', 'Agencies')),
        anchor('solutions', t('Software-Anbieter', 'Software providers')),
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
        eyebrow: t('Analytics und KI-Agent für Hotels', 'Analytics and AI agent for hotels'),
        heading: t(
          'Alle Hotelzahlen an einem Ort. Und ein Agent, der sie erklärt.',
          'Every hotel number in one place. And an agent that explains them.',
        ),
        lead: t(
          'Indicate verbindet PMS, Buchungskanäle, Marketing und Website in einem Dashboard. Fragen Sie nach Auslastung, ADR oder RevPAR in ganz normalen Worten und bekommen Sie Antworten aus geprüften Kennzahlen. Einsatzbereit in Minuten, ohne IT-Projekt.',
          'Indicate brings your PMS, booking channels, marketing and website together in one dashboard. Ask about occupancy, ADR or RevPAR in plain words and get answers from verified figures. Up and running in minutes, no IT project needed.',
        ),
        align: 'left',
      },
      links: [
        external(refs.links.demoUrl, t('Demo buchen', 'Book a demo'), 'default'),
        anchor('how-it-works', t('So funktioniert es', 'See how it works'), 'outline'),
      ],
      trust: {
        text: t('Im Einsatz bei Hotels und Hotelgruppen wie', 'Used by hotels and hotel groups such as'),
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
          'Dashboards, Vergleiche und Datenquellen, die ohne Schulung verständlich sind. Für das Team an der Rezeption genauso wie für die Geschäftsführung.',
          'Dashboards, comparisons and data sources that make sense without training. For the front desk as much as for the owner.',
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
        {
          label: t('Teams & Rechte', 'Teams & permissions'),
          icon: 'users',
          heading: t('Jeder sieht genau das, was er sehen soll', 'Everyone sees exactly what they should'),
          description: t(
            'Ein Space pro Hotel oder Marke, Rollen von Gast bis Owner und Zwei-Faktor-Anmeldung für alle, wenn Sie es wollen.',
            'One space per hotel or brand, roles from guest to owner, and two-factor sign-in for everyone if you want it.',
          ),
          points: [
            {
              icon: 'buildings',
              title: t('Ein Space pro Haus', 'One space per property'),
              text: t('Agenturen und Gruppen verwalten viele Hotels getrennt voneinander.', 'Agencies and groups manage many hotels separately.'),
            },
            {
              icon: 'shield',
              title: t('Rollen und Zwei-Faktor', 'Roles and two-factor'),
              text: t('Gast, Leser, Nutzer, Admin, Owner. Zwei-Faktor lässt sich für alle erzwingen.', 'Guest, reader, user, admin, owner. Two-factor can be required for everyone.'),
            },
            {
              icon: 'eye',
              title: t('Audit-Log', 'Audit log'),
              text: t('Wer hat was verbunden, eingeladen oder geändert.', 'Who connected, invited or changed what.'),
            },
          ],
          visual: { type: 'illustration', illustration: 'team' },
        },
      ],
      settings: { background: 'default', spacing: 'default', anchor: 'product' },
    },
    {
      blockType: 'agentShowcase',
      blockName: t('KI-Agent', 'AI agent'),
      header: {
        eyebrow: t('KI-Agent', 'AI agent'),
        heading: t('Fragen Sie einfach.', 'Just ask.'),
        lead: t(
          'Der Indicate Agent antwortet aus Ihren geprüften Kennzahlen, nicht aus dem Bauch. In der App, in ChatGPT oder in Claude.',
          'The Indicate agent answers from your verified figures, not from a hunch. In the app, in ChatGPT or in Claude.',
        ),
        align: 'left',
      },
      prompts: [
        {
          question: t('Wie war die Auslastung letzte Woche?', 'What was our occupancy last week?'),
          answer: t(
            'Letzte Woche lag die Auslastung bei 84 %, 6 Punkte über der Vorwoche. Der Anstieg kam vor allem von Direktbuchungen am Wochenende.',
            'Occupancy was 84 % last week, 6 points above the week before. Most of the increase came from direct bookings over the weekend.',
          ),
          chart: 'line',
          kpiLabel: t('Auslastung, letzte Woche', 'Occupancy, last week'),
          kpiValue: '84 %',
          kpiDelta: '+6',
        },
        {
          question: t('Warum ist der ADR im März gesunken?', 'Why did ADR drop in March?'),
          answer: t(
            'Der ADR fiel im März um 4,2 % auf 138 €. Grund war ein höherer Anteil an OTA-Buchungen mit Rabatt; die Direktrate blieb stabil.',
            'ADR fell 4.2 % to €138 in March. A larger share of discounted OTA bookings caused it; the direct rate stayed stable.',
          ),
          chart: 'bars',
          kpiLabel: t('ADR, März', 'ADR, March'),
          kpiValue: '138 €',
          kpiDelta: '−4,2 %',
        },
        {
          question: t('Welcher Kanal bringt die meisten Direktbuchungen?', 'Which channel brings the most direct bookings?'),
          answer: t(
            '54 % der Buchungen kamen im letzten Quartal direkt über Ihre Website, 28 % über OTAs. Google Ads brachte davon die meisten Erstbuchungen.',
            '54 % of bookings last quarter came directly through your website, 28 % through OTAs. Google Ads brought most of the first-time bookings.',
          ),
          chart: 'donut',
          kpiLabel: t('Direktanteil, letztes Quartal', 'Direct share, last quarter'),
          kpiValue: '54 %',
          kpiDelta: '+3',
        },
      ],
      points: [
        {
          icon: 'shield',
          title: t('Antworten nur aus geprüften Kennzahlen', 'Answers only from verified KPIs'),
          text: t(
            'Der Agent liest ausschließlich die freigegebenen Kennzahlen, nie rohe Tabellen.',
            'The agent reads only the released KPIs, never raw tables.',
          ),
        },
        {
          icon: 'lock',
          title: t('Rechte werden respektiert', 'Permissions are respected'),
          text: t(
            'Jede Person bekommt nur Antworten zu Hotels, die sie sehen darf.',
            'Everyone gets answers only about the hotels they are allowed to see.',
          ),
        },
        {
          icon: 'message',
          title: t('Auch in ChatGPT und Claude', 'Also in ChatGPT and Claude'),
          text: t(
            'Über den MCP-Server arbeitet der Agent in dem Werkzeug, das Ihr Team schon nutzt.',
            'Through the MCP server the agent works in the tool your team already uses.',
          ),
        },
      ],
      links: [external(refs.links.demoUrl, t('Agent im Gespräch erleben', 'See the agent in a demo'), 'default')],
      settings: { background: 'dark', spacing: 'default', anchor: 'agent' },
    },
    {
      blockType: 'steps',
      blockName: t('So funktioniert es', 'How it works'),
      header: {
        eyebrow: t('So funktioniert es', 'How it works'),
        heading: t('In drei Schritten zu klaren Zahlen', 'Clear numbers in three steps'),
        align: 'center',
      },
      steps: [
        {
          icon: 'plug',
          title: t('Verbinden', 'Connect'),
          text: t(
            'PMS, Channel Manager, Google und Meta mit wenigen Klicks anbinden. Die ersten Daten sind meist nach Minuten da, spätestens nach 72 Stunden.',
            'Connect your PMS, channel manager, Google and Meta in a few clicks. First data usually arrives within minutes, at the latest after 72 hours.',
          ),
        },
        {
          icon: 'chart',
          title: t('Verstehen', 'Understand'),
          text: t(
            'Fertige Dashboards zeigen Auslastung, Umsatz und Kanäle. Der Agent erklärt, was sich verändert hat und warum.',
            'Ready-made dashboards show occupancy, revenue and channels. The agent explains what changed and why.',
          ),
        },
        {
          icon: 'target',
          title: t('Handeln', 'Act'),
          text: t(
            'Ziele setzen, Abweichungen früh sehen und Berichte mit dem Team oder dem Eigentümer teilen.',
            'Set targets, spot deviations early and share reports with the team or the owner.',
          ),
        },
      ],
      settings: { background: 'default', spacing: 'default', anchor: 'how-it-works' },
    },
    {
      blockType: 'integrations',
      blockName: t('Integrationen', 'Integrations'),
      header: {
        eyebrow: t('Integrationen', 'Integrations'),
        heading: t('Passt zu der Software, die Sie schon haben', 'Works with the software you already run'),
        lead: t(
          'Über 30 Anbindungen aus Hotellerie und Marketing. Fehlt eine, sprechen wir darüber.',
          'More than 30 connections from hospitality and marketing. If one is missing, let’s talk.',
        ),
        align: 'left',
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
      settings: { background: 'tinted', spacing: 'default', anchor: 'integrations' },
    },
    {
      blockType: 'cardGrid',
      blockName: t('Für wen', 'Who it is for'),
      header: {
        eyebrow: t('Für wen', 'Who it is for'),
        heading: t('Gemacht für Hotels und die, die mit ihnen arbeiten', 'Built for hotels and the people who work with them'),
        align: 'left',
      },
      layout: 'grid-4',
      cards: [
        {
          icon: 'building',
          title: t('Einzelhotels', 'Independent hotels'),
          text: t('Alle Zahlen des Hauses, ohne Excel-Abende.', 'Every number of the property, without evenings in Excel.'),
          points: [
            { text: t('Fertige Dashboards ab Tag 1', 'Ready-made dashboards from day one') },
            { text: t('Der Agent beantwortet Fragen der Direktion', 'The agent answers the manager’s questions') },
            { text: t('Ab 100 € im Monat', 'From €100 a month') },
          ],
        },
        {
          icon: 'buildings',
          title: t('Hotelgruppen', 'Hotel groups'),
          text: t('Ein Space pro Haus, ein Blick auf alle.', 'One space per property, one view of all of them.'),
          points: [
            { text: t('Häuser miteinander vergleichen', 'Compare properties with each other') },
            { text: t('Kennzahlen zentral definiert', 'KPIs defined centrally') },
            { text: t('Rollen pro Standort', 'Roles per location') },
          ],
        },
        {
          icon: 'briefcase',
          title: t('Agenturen', 'Agencies'),
          text: t('Marketing-Ergebnisse neben den Buchungszahlen des Kunden.', 'Marketing results next to the client’s booking numbers.'),
          points: [
            { text: t('Ein Space pro Kunde', 'One space per client') },
            { text: t('Dashboards im Branding des Kunden', 'Dashboards in the client’s branding') },
            { text: t('Verbindungslinks ohne Kundenzugang', 'Connect links without client credentials') },
          ],
        },
        {
          icon: 'code',
          title: t('Software-Anbieter', 'Software providers'),
          text: t('Analytics für Ihre Kunden, ohne eigenes BI-Team.', 'Analytics for your customers, without your own BI team.'),
          points: [
            { text: t('Kennzahlen als JSON definiert', 'KPIs defined as JSON') },
            { text: t('API und White-Label', 'API and white label') },
            { text: t('MCP für eigene Agenten', 'MCP for your own agents') },
          ],
        },
      ],
      settings: { background: 'default', spacing: 'default', anchor: 'solutions' },
    },
    {
      blockType: 'stats',
      blockName: t('Kennzahlen', 'Stats'),
      header: { align: 'center' },
      items: [
        { value: '40', suffix: ' %', label: t('geringere Betriebskosten durch Automatisierung', 'lower operating costs through automation'), note: t('Durchschnitt unserer Kunden', 'Average across our customers') },
        { value: '30', suffix: '+', label: t('Anbindungen an Hotel- und Marketing-Systeme', 'connections to hotel and marketing systems') },
        { value: '13', label: t('Monate Datenhistorie ab dem ersten Tag', 'months of history from day one') },
        { value: '5', label: t('Rollen, von Gast bis Owner', 'roles, from guest to owner') },
      ],
      settings: { background: 'tinted', spacing: 'compact' },
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
      settings: { background: 'default', spacing: 'default' },
    },
    {
      blockType: 'pricingTeaser',
      blockName: t('Preise', 'Pricing'),
      header: {
        eyebrow: t('Preise', 'Pricing'),
        heading: t('Klein anfangen, mitwachsen', 'Start small, grow with it'),
        lead: t(
          'Ein Space pro Hotel, monatlich abgerechnet. Onboarding und Agenten-Plätze kommen dazu, wenn Sie sie brauchen.',
          'One space per hotel, billed monthly. Onboarding and agent seats are added when you need them.',
        ),
        align: 'center',
      },
      plans: [
        {
          name: 'Core',
          price: '100 €',
          period: t('pro Monat', 'per month'),
          description: t('Für einzelne Hotels und Pilotprojekte', 'For single hotels and pilot projects'),
          points: [
            { text: t('5 Anbindungen', '5 connections') },
            { text: t('Tägliche Aktualisierung', 'Daily refresh') },
            { text: t('13 Monate Historie', '13 months of history') },
            { text: t('25 GB Speicher', '25 GB storage') },
          ],
          highlighted: false,
          links: [external(refs.links.demoUrl, t('Demo buchen', 'Book a demo'), 'outline')],
        },
        {
          name: 'Pro',
          price: '500 €',
          period: t('pro Monat', 'per month'),
          description: t('Für Gruppen, Agenturen und wachsende Teams', 'For groups, agencies and growing teams'),
          points: [
            { text: t('10 Anbindungen', '10 connections') },
            { text: t('Mehrere Aktualisierungen pro Tag', 'Several refreshes a day') },
            { text: t('Eigene Kennzahlen mit KPI Studio', 'Your own KPIs with KPI Studio') },
            { text: t('Dashboards in Ihren Farben', 'Dashboards in your colours') },
            { text: t('Audit-Log und API-Zugang', 'Audit log and API access') },
          ],
          highlighted: true,
          links: [external(refs.links.demoUrl, t('Demo buchen', 'Book a demo'), 'default')],
        },
        {
          name: 'Enterprise',
          price: '8.000 €',
          period: t('pro Monat und mehr', 'per month and up'),
          description: t('Für Ketten und Software-Anbieter', 'For chains and software providers'),
          points: [
            { text: t('Unbegrenzte Historie', 'Unlimited history') },
            { text: t('White-Label', 'White label') },
            { text: t('Eigener Ansprechpartner und SLA', 'Dedicated contact and SLA') },
            { text: t('Individuelle Kennzahlen', 'Custom KPIs') },
          ],
          highlighted: false,
          links: [pageRef(refs.contactPageId, t('Gespräch vereinbaren', 'Talk to us'), 'outline')],
        },
      ],
      footnote: t(
        'KI-Agent ab 20 € pro Nutzer und Monat. Bei jährlicher Zahlung 10 % günstiger.',
        'AI agent from €20 per user and month. 10 % less with annual billing.',
      ),
      settings: { background: 'tinted', spacing: 'default', anchor: 'pricing' },
    },
    {
      blockType: 'faq',
      blockName: 'FAQ',
      header: {
        eyebrow: t('Häufige Fragen', 'Common questions'),
        heading: t('Was Hoteliers uns vor dem Start fragen', 'What hoteliers ask before they start'),
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
      settings: { background: 'dark', spacing: 'default' },
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
