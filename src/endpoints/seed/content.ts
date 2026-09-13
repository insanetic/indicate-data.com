import type { Locale } from '@/i18n/config'
import type { Footer, Header, Page, SiteSetting } from '@/payload-types'

import type { LegalSlug } from './legal'

import { paragraphs } from './lexical'
import { pageBlurbs, pageIcons, pageNames, type SubpageSlug } from './pages'

/** Picks the text for the locale being seeded. */
export type T = (de: string, en: string) => string
export const pick =
  (locale: Locale): T =>
  (de, en) =>
    locale === 'de' ? de : en

export type Refs = {
  contactPageId: number
  aboutPageId: number
  /** Ids of the product and solution pages, keyed by slug (see ./pages). */
  pages: Record<SubpageSlug, number>
  /** Ids of the legal pages, keyed by slug (see ./legal). */
  legal: Record<LegalSlug, number>
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
/** Link to one of the product or solution pages by slug. */
const subpage = <A extends Appearance>(refs: Refs, slug: SubpageSlug, label: string, appearance?: A) =>
  pageRef(refs.pages[slug], label, appearance)
/** Menu entry for a subpage: page link, one-line description and icon. */
const menuEntry = (t: T, refs: Refs, slug: SubpageSlug) => ({
  ...subpage(refs, slug, pageNames(t)[slug]),
  description: pageBlurbs(t)[slug],
  icon: pageIcons[slug],
})

export const siteSettings = (t: T, refs: Refs): Partial<SiteSetting> => ({
  siteName: 'Indicate Data',
  tagline: t(
    'Agentic Analytics für Hotels, Hotelgruppen und ihre Agenturen.',
    'Agentic analytics for hotels, hotel groups and their agencies.',
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
    enabled: false,
    text: t(
      'Der Indicate Agent arbeitet jetzt auch in ChatGPT und Claude.',
      'The Indicate agent now also works inside ChatGPT and Claude.',
    ),
    ...subpage(refs, 'mcp', t('Mehr erfahren', 'Learn more')),
  },
  items: [
    {
      label: t('Produkt', 'Product'),
      type: 'menu',
      featured: {
        enabled: true,
        title: t('Sehen Sie Indicate mit Ihren Zahlen.', 'See Indicate with your numbers.'),
        text: t('30 Minuten, echte Daten aus einem Haus wie Ihrem.', '30 minutes, real data from a property like yours.'),
        ...external(refs.links.demoUrl, t('Demo buchen', 'Book a demo')),
      },
      columns: [
        {
          title: 'Agentic Analytics',
          links: [menuEntry(t, refs, 'agent'), menuEntry(t, refs, 'mcp'), menuEntry(t, refs, 'build-with-ai')],
        },
        {
          title: t('Datenbasis', 'Trusted data'),
          links: [menuEntry(t, refs, 'integrations'), menuEntry(t, refs, 'kpi-studio'), menuEntry(t, refs, 'governance')],
        },
        {
          title: 'Reporting',
          links: [menuEntry(t, refs, 'dashboards'), menuEntry(t, refs, 'flying-kpis')],
        },
      ],
    },
    {
      label: t('Lösungen', 'Solutions'),
      type: 'menu',
      featured: {
        enabled: true,
        title: t('Nicht sicher, was passt?', 'Not sure what fits?'),
        text: t('Schreiben Sie uns, was Sie erreichen wollen. Wir antworten innerhalb eines Werktags.', 'Tell us what you want to achieve. We reply within one working day.'),
        ...pageRef(refs.contactPageId, t('Kontakt aufnehmen', 'Get in touch')),
      },
      columns: [
        {
          title: t('Für wen', 'Who it is for'),
          links: [menuEntry(t, refs, 'hotels'), menuEntry(t, refs, 'hotel-groups'), menuEntry(t, refs, 'agencies')],
        },
        {
          title: t('Partner', 'Partners'),
          links: [
            { ...external(refs.links.docsUrl, t('Software-Anbieter', 'Software providers')), icon: 'code', description: t('Analytics für Ihre Kunden, per API und MCP', 'Analytics for your customers, via API and MCP') },
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
      links: (['agent', 'mcp', 'build-with-ai', 'dashboards', 'flying-kpis', 'integrations', 'kpi-studio', 'governance'] as const).map((slug) =>
        subpage(refs, slug, pageNames(t)[slug]),
      ),
    },
    {
      title: t('Lösungen', 'Solutions'),
      links: [
        subpage(refs, 'hotels', t('Hotels', 'Hotels')),
        subpage(refs, 'hotel-groups', t('Hotelgruppen', 'Hotel groups')),
        subpage(refs, 'agencies', t('Agenturen & Berater', 'Agencies & consultants')),
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
        pageRef(refs.aboutPageId, t('Über uns', 'About us')),
        pageRef(refs.contactPageId, t('Kontakt', 'Contact')),
        external(refs.links.demoUrl, t('Demo buchen', 'Book a demo')),
        external('https://indicate-data.io/de/jobs', t('Karriere', 'Careers')),
        external('https://indicate-data.io/de/presse', t('Presse', 'Press')),
      ],
    },
  ],
  legalLinks: [
    pageRef(refs.legal.imprint, t('Impressum', 'Imprint')),
    pageRef(refs.legal['privacy-policy'], t('Datenschutz', 'Privacy')),
    pageRef(refs.legal['terms-of-service'], t('AGB', 'Terms')),
    pageRef(refs.legal['cookie-policy'], t('Cookies', 'Cookies')),
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
    title: t('Agentic Analytics für die Hotellerie', 'Agentic analytics for hospitality'),
    description: t(
      'Indicate verbindet PMS, Vertrieb und Marketing zu einem Datenmodell. Dashboards per Beschreibung, ein KI-Agent in App, Claude und ChatGPT, Reports nach Zeitplan.',
      'Indicate joins PMS, distribution and marketing into one data model. Dashboards from a description, an AI agent in the app, Claude and ChatGPT, reports on a schedule.',
    ),
  },
  layout: [
    {
      blockType: 'hero',
      blockName: 'Hero',
      header: {
        heading: t('Agentic Analytics für die Hotellerie.', 'Agentic analytics for hospitality.'),
        lead: t(
          'Ein Datenmodell für PMS, Vertrieb und Marketing. Dashboards auf Zuruf, Antworten vom Agenten, Reports nach Zeitplan.',
          'One data model for PMS, distribution and marketing. Dashboards on request, answers from the agent, reports on a schedule.',
        ),
        align: 'center',
      },
      links: [
        external(refs.links.demoUrl, t('Demo buchen', 'Book a demo'), 'default'),
        anchor('build', t('So funktioniert es', 'See how it works'), 'outline'),
      ],
      trust: { text: null, logos: [] },
      visual: { type: 'illustration', illustration: 'stage' },
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
      blockType: 'featureStory',
      blockName: t('Dashboards & Reporting', 'Dashboards & reporting'),
      header: {
        eyebrow: t('Dashboards & Assistent', 'Dashboards & assistant'),
        heading: t('Beschreiben Sie den Bericht. Indicate baut ihn.', 'Describe the report. Indicate builds it.'),
        lead: t(
          'Ein Satz an den Assistenten in der App, und das Dashboard steht. Aus fertigen Kennzahlen, mit Vergleich und Ziel.',
          'One sentence to the assistant in the app, and the dashboard is there. From ready-made KPIs, with comparison and target.',
        ),
        align: 'left',
      },
      layout: 'stacked',
      visual: { type: 'illustration', illustration: 'builder' },
      points: [
        {
          icon: 'chart',
          title: t('Fertige Kennzahlen je System', 'Ready-made KPIs per system'),
          text: t(
            'Umsatz, Auslastung, ADR, RevPAR, Pickup, Kanalmix und Kampagnenkosten, sauber definiert und für jedes Haus gleich berechnet.',
            'Revenue, occupancy, ADR, RevPAR, pickup, channel mix and campaign cost, cleanly defined and calculated the same way for every property.',
          ),
        },
        {
          icon: 'sparkles',
          title: t('Ein Satz statt einer Klickstrecke', 'One sentence instead of a click path'),
          text: t(
            '„Auslastung und ADR nach Kanal, Q4 gegen Vorjahr.“ Der Assistent wählt Widgets, Zeitraum und Vergleich, Sie passen per Klick an.',
            '“Occupancy and ADR by channel, Q4 against last year.” The assistant picks widgets, period and comparison; you adjust with a click.',
          ),
        },
        {
          icon: 'target',
          title: t('Plan gegen Ist, immer daneben', 'Plan against actual, always side by side'),
          text: t(
            'Budgets aus Excel hochladen, Ziellinien setzen, Abweichungen sofort sehen.',
            'Upload budgets from Excel, set guide lines, see every deviation at once.',
          ),
        },
        {
          icon: 'palette',
          title: t('Teilen in Ihren Farben', 'Share in your colours'),
          text: t(
            'Dashboards im Branding Ihres Hauses oder Ihres Kunden, per Link oder als PDF.',
            'Dashboards in the branding of your property or your client, by link or as PDF.',
          ),
        },
      ],
      links: [subpage(refs, 'build-with-ai', t('Mehr zum Bauen mit KI', 'More about building with AI'), 'link')],
      settings: { background: 'default', spacing: 'default', anchor: 'build' },
    },
    {
      blockType: 'agentShowcase',
      blockName: t('KI-Agent & MCP', 'AI agent & MCP'),
      header: {
        eyebrow: t('Indicate Agent & MCP', 'Indicate agent & MCP'),
        heading: t('Fragen Sie Ihre Daten. In der App oder in Ihrem Chat.', 'Ask your data. In the app or in your chat.'),
        lead: t(
          'Der Indicate Agent antwortet aus geprüften Kennzahlen und nennt die Quelle. Über MCP auch in Claude, ChatGPT oder Langdock, mit denselben Rechten wie in der App.',
          'The Indicate agent answers from verified KPIs and names the source. Through MCP also in Claude, ChatGPT or Langdock, with the same permissions as in the app.',
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
          question: t('Hat die Sommerkampagne auf Meta gebracht, was wir geplant hatten?', 'Did the summer campaign on Meta deliver what we planned?'),
          answer: t(
            'Fast: 212 Buchungen statt 240 geplant, dafür mit 168 € ADR über Plan. ROI 6,4× nach Werbekosten. Die Lücke liegt in KW 29 bis 31, dort lief keine Anzeige.',
            'Almost: 212 bookings against 240 planned, but with an ADR of €168 above plan. ROI 6.4× after ad spend. The gap sits in weeks 29 to 31, when no ad was running.',
          ),
          chart: 'line',
          kpiLabel: t('ROI Sommerkampagne Meta', 'ROI, summer campaign on Meta'),
          kpiValue: '6,4×',
          kpiDelta: '+1,2×',
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
          title: t('Nur freigegebene Kennzahlen', 'Released KPIs only'),
          text: t(
            'Der Agent liest das Datenmodell, nie rohe Tabellen. Gästedaten bleiben in Ihrem Space, bis Sie sie ausdrücklich freigeben.',
            'The agent reads the data model, never raw tables. Guest data stays in your space until you explicitly release it.',
          ),
        },
        {
          icon: 'lock',
          title: t('Rechte gelten überall', 'Permissions apply everywhere'),
          text: t(
            'Ob in der App, in Claude oder in ChatGPT: Jede Person sieht nur die Häuser, für die sie freigeschaltet ist.',
            'In the app, in Claude or in ChatGPT: everyone sees only the properties they are cleared for.',
          ),
        },
        {
          icon: 'message',
          title: t('Ihr Agent, Ihre Wahl', 'Your agent, your choice'),
          text: t(
            'Der MCP-Server verbindet jede Datenquelle mit dem Assistenten, den Ihr Team schon nutzt. Ein Zugang, kein Export.',
            'The MCP server connects every data source to the assistant your team already uses. One access, no export.',
          ),
        },
      ],
      channels: [{ name: 'Indicate App' }, { name: 'Claude' }, { name: 'ChatGPT' }, { name: 'Langdock' }],
      links: [
        external(refs.links.demoUrl, t('Agent live erleben', 'See the agent live'), 'default'),
        subpage(refs, 'mcp', t('Mehr zu MCP', 'More about MCP'), 'outline'),
      ],
      settings: { background: 'tinted', spacing: 'default', anchor: 'agent' },
    },
    {
      blockType: 'featureStory',
      blockName: 'Flying KPIs',
      header: {
        eyebrow: 'Flying KPIs',
        heading: t('Berichte, die von allein ankommen.', 'Reports that arrive on their own.'),
        lead: t(
          'Jedes Dashboard als E-Mail, PDF oder Digest, zum Termin Ihrer Wahl, an wen Sie wollen. Auch ohne Login.',
          'Any dashboard as email, PDF or digest, at the time you choose, to whoever you choose. No login needed.',
        ),
        align: 'left',
      },
      layout: 'stacked',
      visual: { type: 'illustration', illustration: 'flyingKpis' },
      points: [
        {
          icon: 'calendar',
          title: t('Zeitplan statt Erinnerung', 'A schedule instead of a reminder'),
          text: t(
            'Täglich, wöchentlich, monatlich oder zum Monatsabschluss. Einmal eingestellt, nie wieder vergessen.',
            'Daily, weekly, monthly or at month end. Set once, never forgotten.',
          ),
        },
        {
          icon: 'users',
          title: t('An jeden, auch ohne Login', 'To anyone, even without a login'),
          text: t(
            'Eigentümer, Beirat, Kunden oder die Bank bekommen den Report, ohne Zugang zur Plattform.',
            'Owners, board, clients or the bank receive the report without platform access.',
          ),
        },
        {
          icon: 'sparkles',
          title: t('Mit Zusammenfassung vom Agenten', 'With a summary from the agent'),
          text: t(
            'Auf Wunsch schreibt der Agent die drei wichtigsten Veränderungen der Woche in normalen Worten dazu.',
            'On request the agent adds the three biggest changes of the week in plain words.',
          ),
        },
      ],
      links: [subpage(refs, 'flying-kpis', t('Mehr zu Flying KPIs', 'More about Flying KPIs'), 'link')],
      settings: { background: 'default', spacing: 'default', anchor: 'flying-kpis' },
    },
    {
      blockType: 'integrations',
      blockName: t('Integrationen & Sync', 'Integrations & sync'),
      header: {
        eyebrow: t('Indicate Connect', 'Indicate Connect'),
        heading: t('Verbinden, synchronisieren, fertig.', 'Connect, sync, done.'),
        lead: t(
          'Über 30 Anbindungen an PMS, Vertrieb, Marketing und Betrieb, alle 15 Minuten aktuell, Historie ab dem ersten Tag. Hakt eine Quelle, meldet sich Indicate.',
          'More than 30 connections to PMS, distribution, marketing and operations, refreshed every 15 minutes, history from day one. If a source stalls, Indicate tells you.',
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
      links: [subpage(refs, 'integrations', t('Alle Integrationen ansehen', 'See all integrations'), 'default')],
      settings: { background: 'default', spacing: 'default', anchor: 'integrations' },
    },
    {
      blockType: 'featureStory',
      blockName: t('Für Hotels und Hotelgruppen', 'For hotels and hotel groups'),
      header: {
        eyebrow: t('Für Hotels und Hotelgruppen', 'For hotels and hotel groups'),
        heading: t('Strategie mit Zahlen, nicht mit Bauchgefühl.', 'Strategy on numbers, not gut feeling.'),
        lead: t(
          'Welche Kanäle, Segmente und Kampagnen bringen Umsatz, und wo hat der Plan Lücken? Für ein Haus oder die ganze Gruppe.',
          'Which channels, segments and campaigns bring revenue, and where does the plan have gaps? For one property or the whole group.',
        ),
        align: 'left',
      },
      layout: 'stacked',
      visual: { type: 'illustration', illustration: 'portfolio' },
      points: [
        {
          icon: 'buildings',
          title: t('Ein Space pro Haus, ein Blick für die Gruppe', 'One space per property, one view for the group'),
          text: t(
            'Jedes Hotel behält seine Daten und Rechte, die Zentrale vergleicht alle Häuser nebeneinander.',
            'Every hotel keeps its data and permissions; head office compares all properties side by side.',
          ),
        },
        {
          icon: 'euro',
          title: t('Kampagnen-ROI statt Klickzahlen', 'Campaign ROI instead of click counts'),
          text: t(
            'Werbekosten aus Google und Meta treffen auf Buchungen und ADR aus dem PMS. Sie sehen, ob eine Kampagne gebracht hat, was geplant war.',
            'Ad spend from Google and Meta meets bookings and ADR from the PMS. You see whether a campaign delivered what was planned.',
          ),
        },
        {
          icon: 'target',
          title: t('Lücken in der Strategie finden', 'Find the gaps in your strategy'),
          text: t(
            'Wochen ohne Kampagne, Segmente unter Plan, Kanäle mit sinkender Marge: Indicate zeigt sie, bevor der Monat vorbei ist.',
            'Weeks without a campaign, segments below plan, channels with shrinking margin: Indicate shows them before the month is over.',
          ),
        },
        {
          icon: 'code',
          title: t('Offen für Ihr Datenteam', 'Open for your data team'),
          text: t(
            'Eigene Kennzahlen im KPI Studio, Semantic Layer, API und Export. Ihr Team baut darauf auf, statt bei null anzufangen.',
            'Your own KPIs in KPI Studio, a semantic layer, API and export. Your team builds on it instead of starting from zero.',
          ),
        },
      ],
      links: [
        external(refs.links.demoUrl, t('Demo für Ihr Haus', 'Demo for your property'), 'default'),
        subpage(refs, 'hotels', t('Mehr für Hotels', 'More for hotels'), 'link'),
      ],
      settings: { background: 'default', spacing: 'default', anchor: 'hotels' },
    },
    {
      blockType: 'featureStory',
      blockName: t('Für Agenturen und Berater', 'For agencies and consultants'),
      header: {
        eyebrow: t('Für Agenturen und Berater', 'For agencies and consultants'),
        heading: t('Alle Kunden, ein Arbeitsplatz, messbare Wirkung.', 'Every client, one workspace, measurable results.'),
        lead: t(
          'Ein Login für alle Kunden, sauber getrennt. Kampagnen treffen auf Buchungen, Reports laufen von allein, Strategie entsteht gemeinsam.',
          'One login for every client, cleanly separated. Campaigns meet bookings, reports run by themselves, strategy is built together.',
        ),
        align: 'left',
      },
      layout: 'stacked',
      visual: { type: 'illustration', illustration: 'campaigns' },
      points: [
        {
          icon: 'buildings',
          title: t('Mandantenfähig von Haus aus', 'Multi-tenant by design'),
          text: t(
            'Ein Space pro Kunde, Rollen bis zum Owner, Zwei-Faktor. Der Kunde gibt sein PMS per Connect-Link selbst frei, Sie sehen nie ein Passwort.',
            'One space per client, roles up to owner, two-factor. The client authorises their PMS through a connect link; you never see a password.',
          ),
        },
        {
          icon: 'euro',
          title: t('Umsatz pro Kampagne, nicht nur Klicks', 'Revenue per campaign, not just clicks'),
          text: t(
            'Google Ads, Meta und Newsletter gegen Buchungen, ADR und Stornos. Was hat gegriffen, wo fehlt eine Kampagne?',
            'Google Ads, Meta and newsletter against bookings, ADR and cancellations. What worked, where is a campaign missing?',
          ),
        },
        {
          icon: 'zap',
          title: t('Routine automatisiert, für Sie und den Kunden', 'Routine automated, for you and the client'),
          text: t(
            'Monatsreports im Kunden-Branding, Hinweise bei Abweichungen und die Zusammenfassung vom Agenten gehen von allein raus, an jeden Kunden.',
            'Monthly reports in the client’s branding, alerts on deviations and the agent’s summary go out by themselves, to every client.',
          ),
        },
        {
          icon: 'users',
          title: t('Strategie gemeinsam, im selben Dashboard', 'Strategy together, in the same dashboard'),
          text: t(
            'Plan, Kampagnen und Kommentare teilen Sie mit dem Kunden. Beide sehen dieselben Zahlen, Entscheidungen bleiben dokumentiert.',
            'Share plan, campaigns and comments with the client. Both see the same numbers, decisions stay on record.',
          ),
        },
      ],
      links: [
        external(refs.links.demoUrl, t('Demo für Agenturen', 'Demo for agencies'), 'default'),
        subpage(refs, 'agencies', t('Mehr für Agenturen', 'More for agencies'), 'link'),
      ],
      settings: { background: 'tinted', spacing: 'default', anchor: 'agencies' },
    },
    {
      blockType: 'pillars',
      blockName: t('Warum Indicate', 'Why Indicate'),
      header: {
        eyebrow: t('Warum Indicate', 'Why Indicate'),
        heading: t('Ein Datenmodell. Ein Agent. Alle Häuser.', 'One data model. One agent. Every property.'),
        lead: t(
          'Gebaut für die Hotellerie, offen für Ihr Team und Ihre Partner.',
          'Built for hospitality, open to your team and your partners.',
        ),
        align: 'center',
      },
      pillars: [
        {
          icon: 'zap',
          title: t('Fertig in Minuten, nicht in Monaten', 'Ready in minutes, not months'),
          text: t(
            'Anbindung per Klick, Kennzahlen und Dashboards kommen fertig mit. Kein Projekt, keine Migration, 13 Monate Historie ab dem ersten Tag.',
            'Connect with a click, KPIs and dashboards come ready. No project, no migration, 13 months of history from day one.',
          ),
        },
        {
          icon: 'sparkles',
          title: t('KI, die Ihre Zahlen kennt', 'AI that knows your numbers'),
          text: t(
            'Assistent, Agent und MCP arbeiten auf geprüften Kennzahlen mit Quelle, nie auf rohen Tabellen. In der App oder in Claude, ChatGPT und Langdock.',
            'Assistant, agent and MCP work on verified KPIs with a source, never on raw tables. In the app or in Claude, ChatGPT and Langdock.',
          ),
        },
        {
          icon: 'shield',
          title: t('Sicher pro Haus und Kunde', 'Secure per property and client'),
          text: t(
            'Ein Space je Hotel oder Kunde, Rollen von Gast bis Owner, Zwei-Faktor und Audit-Log. Gästedaten bleiben, wo sie sind.',
            'One space per hotel or client, roles from guest to owner, two-factor and audit log. Guest data stays where it is.',
          ),
        },
      ],
      tiles: [
        { value: '30', suffix: '+', label: t('Anbindungen an Hotel- und Marketing-Systeme', 'connections to hotel and marketing systems'), links: [subpage(refs, 'integrations', t('Alle ansehen', 'See all'), 'link')] },
        { value: '13', label: t('Monate Historie ab dem ersten Tag', 'months of history from day one') },
        { value: '40', suffix: ' %', label: t('geringere Betriebskosten durch Automatisierung', 'lower operating costs through automation') },
        { label: t('Für Hotelgruppen', 'For hotel groups'), links: [subpage(refs, 'hotel-groups', t('Mehr erfahren', 'Learn more'), 'link')] },
        { label: t('Für Agenturen', 'For agencies'), links: [subpage(refs, 'agencies', t('Mehr erfahren', 'Learn more'), 'link')] },
      ],
      settings: { background: 'default', spacing: 'default', anchor: 'why' },
    },
    {
      blockType: 'testimonials',
      blockName: t('Kundenstimmen', 'Testimonials'),
      header: {
        eyebrow: t('Kundenstimmen', 'Customers'),
        heading: t('Was Hotels und Partner über Indicate sagen', 'What hotels and partners say about Indicate'),
        lead: t(
          'Im Einsatz bei Familotel AG, Alpenhof, Feldberger Hof, Hochegger Klippitz und Hotel Seeklause.',
          'In use at Familotel AG, Alpenhof, Feldberger Hof, Hochegger Klippitz and Hotel Seeklause.',
        ),
        align: 'left',
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
      blockType: 'faq',
      blockName: 'FAQ',
      header: {
        eyebrow: t('Häufige Fragen', 'Common questions'),
        heading: t('Was Sie vor dem Start wissen wollen', 'What you want to know before you start'),
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
          question: t('Brauche ich ein Datenteam?', 'Do I need a data team?'),
          answer: paragraphs([
            t(
              'Nein. Sie verbinden Ihre Systeme mit wenigen Klicks, Kennzahlen und Dashboards kommen fertig. Wenn Sie ein Datenteam haben, bekommt es KPI Studio, Semantic Layer, API und Export und baut auf dem Modell auf, statt bei null anzufangen.',
              'No. You connect your systems in a few clicks; KPIs and dashboards come ready. If you do have a data team, it gets KPI Studio, a semantic layer, API and export and builds on the model instead of starting from zero.',
            ),
          ]),
        },
        {
          question: t('Welche Daten sieht Claude oder ChatGPT?', 'What data does Claude or ChatGPT see?'),
          answer: paragraphs([
            t(
              'Nur die Kennzahlen, die Sie über den MCP-Server freigeben, mit den Rechten der angemeldeten Person. Gästedaten und rohe Tabellen werden nicht übertragen, es sei denn, Sie legen sie ausdrücklich in die Anfrage.',
              'Only the KPIs you release through the MCP server, with the permissions of the signed-in person. Guest data and raw tables are not transferred unless you explicitly put them into the request.',
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
              'Der Agent kommt als Erweiterung ab 20 € pro Nutzer und Monat dazu. Fragen in der App, in Claude, ChatGPT oder Langdock laufen über denselben Zugang.',
              'The agent is an add-on from €20 per user and month. Questions in the app, in Claude, ChatGPT or Langdock all run through the same access.',
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
        heading: t('Sehen Sie Indicate mit Ihren Zahlen.', 'See Indicate with your numbers.'),
        lead: t(
          '30 Minuten, echte Daten aus einem Haus wie Ihrem. Danach wissen Sie, ob es passt.',
          '30 minutes, real data from a property like yours. Then you know whether it fits.',
        ),
        align: 'center',
      },
      links: [
        external(refs.links.demoUrl, t('Demo buchen', 'Book a demo'), 'default'),
        pageRef(refs.contactPageId, t('Kontakt aufnehmen', 'Get in touch'), 'outline'),
      ],
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
