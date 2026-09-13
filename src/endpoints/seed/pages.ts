import type { Page } from '@/payload-types'

import { paragraphs } from './lexical'
import type { Refs, T } from './content'

type PageData = Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>
type Block = PageData['layout'][number]
type Appearance = 'default' | 'outline' | 'ghost' | 'link'
type IconKey = NonNullable<NonNullable<Extract<Block, { blockType: 'steps' }>['steps']>[number]['icon']>
type Illustration = NonNullable<NonNullable<Extract<Block, { blockType: 'hero' }>['visual']>['illustration']>

/** Slugs of the product and solution pages. The header, footer and cross-links point at these. */
export const productSlugs = ['agent', 'mcp', 'build-with-ai', 'integrations', 'kpi-studio', 'governance', 'dashboards', 'flying-kpis'] as const
export const solutionSlugs = ['hotels', 'hotel-groups', 'agencies'] as const
export type SubpageSlug = (typeof productSlugs)[number] | (typeof solutionSlugs)[number]

const external = <A extends Appearance>(url: string, label: string, appearance?: A) => ({
  link: { type: 'custom' as const, url, newTab: true, label, ...(appearance ? { appearance } : {}) },
})
const internal = <A extends Appearance>(url: string, label: string, appearance?: A) => ({
  link: { type: 'custom' as const, url, label, ...(appearance ? { appearance } : {}) },
})

/** Names of the subpages as they appear in menus, cross-links and eyebrows. */
export const pageNames = (t: T): Record<SubpageSlug, string> => ({
  agent: t('Resi, Ihre KI-Agentin', 'Resi, your AI agent'),
  mcp: 'Indicate MCP',
  'build-with-ai': t('Mit KI bauen', 'Build with AI'),
  integrations: t('Integrationen', 'Integrations'),
  'kpi-studio': 'KPI Studio',
  governance: 'Data Governance',
  dashboards: t('Dashboards & Vorlagen', 'Dashboards & templates'),
  'flying-kpis': 'Flying KPIs',
  hotels: t('Für Hotels', 'For hotels'),
  'hotel-groups': t('Für Hotelgruppen', 'For hotel groups'),
  agencies: t('Für Agenturen & Berater', 'For agencies & consultants'),
})

/** One-line descriptions, shared by the menus and the "goes well with" cards. */
export const pageBlurbs = (t: T): Record<SubpageSlug, string> => ({
  agent: t('Fragen wie im Flur, Antworten mit Zahl, Diagramm und Quelle', 'Ask like in the hallway, get the number, the chart and the source'),
  mcp: t('Ihre Zahlen in Claude, ChatGPT und Ihrem Editor', 'Your numbers in Claude, ChatGPT and your editor'),
  'build-with-ai': t('Dashboard beschreiben, fertig', 'Describe a dashboard, done'),
  integrations: t('Über 30 Anbindungen, Historie ab Tag eins', 'More than 30 connections, history from day one'),
  'kpi-studio': t('Eigene Kennzahlen, eine Definition, versioniert', 'Your own KPIs, one definition, versioned'),
  governance: t('Spaces, Rollen, 2FA und Audit-Log', 'Spaces, roles, 2FA and audit log'),
  dashboards: t('Fertige Vorlagen je System, in Ihren Farben', 'Ready-made templates per system, in your colours'),
  'flying-kpis': t('Reports nach Zeitplan, an jeden', 'Reports on a schedule, to anyone'),
  hotels: t('Kanäle, Kampagnen und Plan für Ihr Haus', 'Channels, campaigns and plan for your property'),
  'hotel-groups': t('Alle Häuser nebeneinander, ein Login', 'Every property side by side, one login'),
  agencies: t('Alle Kunden in einem Arbeitsplatz', 'Every client in one workspace'),
})

export const pageIcons: Record<SubpageSlug, IconKey> = {
  agent: 'message',
  mcp: 'sparkles',
  'build-with-ai': 'zap',
  integrations: 'plug',
  'kpi-studio': 'code',
  governance: 'shield',
  dashboards: 'chart',
  'flying-kpis': 'calendar',
  hotels: 'building',
  'hotel-groups': 'buildings',
  agencies: 'briefcase',
}

export const defaults = { background: 'default' as const, spacing: 'default' as const }

export const hero = (
  t: T,
  refs: Refs,
  o: { eyebrow: string; heading: string; lead: string; illustration: Illustration; secondary?: { url: string; label: string; external?: boolean }; demoLabel?: string },
): Block => ({
  blockType: 'hero',
  blockName: 'Hero',
  header: { eyebrow: o.eyebrow, heading: o.heading, lead: o.lead, align: 'center' },
  links: [
    external(refs.links.demoUrl, o.demoLabel || t('Demo buchen', 'Book a demo'), 'default'),
    ...(o.secondary
      ? [o.secondary.external ? external(o.secondary.url, o.secondary.label, 'outline') : internal(o.secondary.url, o.secondary.label, 'outline')]
      : []),
  ],
  trust: { text: null, logos: [] },
  visual: { type: 'illustration', illustration: o.illustration },
  settings: { ...defaults, spacing: 'compact' },
})

const steps = (t: T, heading: string, lead: string, items: { icon: IconKey; title: string; text: string }[]): Block => ({
  blockType: 'steps',
  blockName: t('So funktioniert es', 'How it works'),
  header: { eyebrow: t('So funktioniert es', 'How it works'), heading, lead, align: 'center' },
  steps: items,
  settings: { ...defaults, background: 'tinted' },
})

export const story = (
  o: {
    name: string
    eyebrow: string
    heading: string
    lead: string
    illustration: Illustration
    layout?: 'stacked' | 'visual-left' | 'visual-right'
    points: { icon: IconKey; title: string; text: string }[]
    links?: ReturnType<typeof internal<'default' | 'outline' | 'link'>>[]
    background?: 'default' | 'tinted'
  },
): Block => ({
  blockType: 'featureStory',
  blockName: o.name,
  header: { eyebrow: o.eyebrow, heading: o.heading, lead: o.lead, align: 'left' },
  layout: o.layout || 'stacked',
  visual: { type: 'illustration', illustration: o.illustration },
  points: o.points,
  links: o.links || [],
  settings: { ...defaults, background: o.background || 'default' },
})

export const cards = (
  o: {
    name: string
    eyebrow?: string
    heading: string
    lead?: string
    layout?: 'grid-3' | 'grid-4' | 'bento'
    cards: { icon: IconKey; title: string; text?: string; points?: string[]; link?: ReturnType<typeof internal<'link'>> }[]
    background?: 'default' | 'tinted'
  },
): Block => ({
  blockType: 'cardGrid',
  blockName: o.name,
  header: { eyebrow: o.eyebrow, heading: o.heading, lead: o.lead, align: 'left' },
  layout: o.layout || 'grid-3',
  cards: o.cards.map((c) => ({
    icon: c.icon,
    title: c.title,
    text: c.text,
    size: 'sm',
    points: (c.points || []).map((text) => ({ text })),
    links: c.link ? [c.link] : [],
  })),
  settings: { ...defaults, background: o.background || 'default' },
})

/** Three cross-links to neighbouring pages, the same block on every subpage. */
const related = (t: T, slugs: SubpageSlug[]): Block => {
  const names = pageNames(t)
  const blurbs = pageBlurbs(t)
  return cards({
    name: t('Passt dazu', 'Goes well with'),
    heading: t('Passt dazu', 'Goes well with'),
    layout: 'grid-3',
    background: 'tinted',
    cards: slugs.map((slug) => ({
      icon: pageIcons[slug],
      title: names[slug],
      text: blurbs[slug],
      link: internal(`/${slug}`, t('Mehr erfahren', 'Learn more'), 'link'),
    })),
  })
}

const faq = (t: T, items: { q: string; a: string }[]): Block => ({
  blockType: 'faq',
  blockName: 'FAQ',
  header: {
    eyebrow: t('Häufige Fragen', 'Common questions'),
    heading: t('Gut zu wissen', 'Good to know'),
    lead: t('Nicht dabei? Schreiben Sie uns.', 'Not answered here? Write to us.'),
    align: 'left',
  },
  items: items.map((i) => ({ question: i.q, answer: paragraphs([i.a]) })),
  settings: { ...defaults },
})

/** The closing CTA. `secondary` replaces the default "Kontakt aufnehmen" link when given. */
export const closing = (
  t: T,
  refs: Refs,
  heading: string,
  lead: string,
  demoLabel?: string,
  secondary?: { url: string; label: string; external?: boolean },
): Block => ({
  blockType: 'ctaSection',
  blockName: t('Abschluss', 'Closing'),
  header: { heading, lead, align: 'center' },
  links: [
    external(refs.links.demoUrl, demoLabel || t('Demo buchen', 'Book a demo'), 'default'),
    secondary
      ? (secondary.external ? external : internal)(secondary.url, secondary.label, 'outline')
      : internal('/contact', t('Kontakt aufnehmen', 'Get in touch'), 'outline'),
  ],
  settings: { ...defaults, background: 'accent' },
})

export const logos = (t: T): Block => ({
  blockType: 'logoWall',
  blockName: 'Logos',
  header: { heading: t('Im Einsatz bei Hotels, Hotelgruppen und Partnern', 'In use at hotels, hotel groups and partners') },
  display: 'marquee',
  logos: [
    { name: 'Familotel AG' },
    { name: 'Alpenhof' },
    { name: 'Feldberger Hof' },
    { name: 'Hochegger Klippitz' },
    { name: 'Hotel Seeklause' },
    { name: 'Re:Guest' },
  ],
  settings: { ...defaults, spacing: 'compact' },
})

export const testimonials = (t: T): Block => ({
  blockType: 'testimonials',
  blockName: t('Kundenstimmen', 'Testimonials'),
  header: {
    eyebrow: t('Kundenstimmen', 'Customers'),
    heading: t('Was Hotels über Indicate sagen', 'What hotels say about Indicate'),
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
  settings: { ...defaults },
})

const page = (t: T, slug: SubpageSlug, seo: { title: string; description: string }, layout: Block[]): Partial<PageData> => ({
  title: pageNames(t)[slug],
  slug,
  _status: 'published',
  hero: { type: 'none' },
  seo,
  layout,
})

/* ------------------------------------------------------------------ */
/* Product pages                                                         */
/* ------------------------------------------------------------------ */

const agentPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'agent',
    {
      title: t('Resi: Ihre KI-Agentin für Hotelzahlen', 'Resi: your AI agent for hotel numbers'),
      description: t(
        'Fragen Sie Resi, wie das Wochenende lief. Sie antwortet in Sekunden, mit Zahl, Diagramm und Quelle, aus den Daten Ihres Hauses.',
        'Ask Resi how the weekend went. She answers in seconds, with the number, the chart and the source, from your property’s own data.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: t('Resi · Ihre KI-Agentin für Hotelzahlen', 'Resi · your AI agent for hotel numbers'),
        heading: t('Sag hallo zu Resi.', 'Meet Resi.'),
        lead: t(
          '„Wie lief das Wochenende?“ Resi antwortet in Sekunden, mit Zahl, Diagramm und Quelle. Kein Export, kein Warten auf Montag.',
          '“How did the weekend go?” Resi answers in seconds, with the number, the chart and the source. No export, no waiting for Monday.',
        ),
        illustration: 'agentChat',
        secondary: { url: '/mcp', label: t('Auch in Claude und ChatGPT', 'Also in Claude and ChatGPT') },
      }),
      story({
        name: t('Resi bei der Arbeit', 'Resi at work'),
        eyebrow: t('Wer Resi ist', 'Who Resi is'),
        heading: t('Resi kennt Ihre Zahlen. Und Ihr Haus.', 'Resi knows your numbers. And your property.'),
        lead: t(
          'Resi ist die KI-Agentin in Indicate: Sie kennt jede Kennzahl Ihres Hauses, antwortet in normaler Sprache und zeigt, woher jede Zahl kommt.',
          'Resi is the AI agent in Indicate: she knows every KPI of your property, answers in plain language and shows where every number comes from.',
        ),
        illustration: 'resi',
        points: [
          {
            icon: 'database',
            title: t('Sieht nur, was Sie freigeben', 'Sees only what you release'),
            text: t('PMS, Ads, CRM: Sie wählen je Chat, worauf Resi schauen darf. Rohe Tabellen bleiben zu, bis Sie sie öffnen.', 'PMS, ads, CRM: you pick per chat what Resi may look at. Raw tables stay closed until you open them.'),
          },
          {
            icon: 'message',
            title: t('Behält den Faden', 'Keeps the thread'),
            text: t('„Und im November?“ „Gegen Vorjahr?“ Resi weiß noch, worum es ging, wie im Gespräch.', '“And in November?” “Against last year?” Resi remembers what you were talking about, like in a conversation.'),
          },
          {
            icon: 'globe',
            title: t('Deutsch, Englisch, Italienisch', 'German, English, Italian'),
            text: t('Fragen Sie, wie Sie wollen. Resi antwortet in der Sprache, die Ihr Admin für das Haus eingestellt hat.', 'Ask however you like. Resi answers in the language your admin set for the property.'),
          },
          {
            icon: 'sparkles',
            title: t('In der App und in Ihrem Chat', 'In the app and in your chat'),
            text: t('Dieselbe Resi, dieselben Rechte: in Indicate, in Claude, in ChatGPT und in Langdock.', 'The same Resi, the same permissions: in Indicate, in Claude, in ChatGPT and in Langdock.'),
          },
        ],
        links: [internal('/mcp', t('Resi in Claude und ChatGPT', 'Resi in Claude and ChatGPT'), 'link')],
      }),
      steps(
        t,
        t('Von der Frage zur belegten Antwort', 'From question to backed answer'),
        t('Drei Schritte, keine Formel, kein Export.', 'Three steps, no formula, no export.'),
        [
          {
            icon: 'database',
            title: t('Quellen wählen', 'Pick the sources'),
            text: t(
              'Sie bestimmen, welche Anbindungen der Chat sehen darf: PMS, Ads, CRM. Oder Sie chatten direkt über ein Dashboard.',
              'You decide which connections the chat may see: PMS, ads, CRM. Or you chat about a dashboard directly.',
            ),
          },
          {
            icon: 'message',
            title: t('Fragen wie einem Kollegen', 'Ask as you would a colleague'),
            text: t(
              'Auslastung, Stornos, Kampagnen, Herkunft. Rückfragen sind erlaubt, Resi behält den Faden.',
              'Occupancy, cancellations, campaigns, origin. Follow-ups are welcome; Resi keeps the thread.',
            ),
          },
          {
            icon: 'check',
            title: t('Antwort mit Beleg', 'Answer with evidence'),
            text: t(
              'Zahl, Diagramm und Quelle. Ein Klick, und die Antwort liegt als Widget auf Ihrem Dashboard.',
              'Number, chart and source. One click, and the answer sits on your dashboard as a widget.',
            ),
          },
        ],
      ),
      story({
        name: t('Antworten prüfen', 'Verifiable answers'),
        eyebrow: t('Geprüfte Kennzahlen', 'Verified KPIs'),
        heading: t('Antworten, die Sie prüfen können.', 'Answers you can check.'),
        lead: t(
          'Resi rechnet mit den Kennzahlen aus Ihrem Katalog, nie mit Vermutungen. Jede Antwort trägt ihre Quelle.',
          'Resi works with the KPIs in your catalogue, never with guesses. Every answer carries its source.',
        ),
        illustration: 'agent',
        layout: 'visual-right',
        points: [
          {
            icon: 'check',
            title: t('Quelle bei jeder Antwort', 'A source with every answer'),
            text: t('Welche Anbindung, welche Kennzahl, welche Version.', 'Which connection, which KPI, which version.'),
          },
          {
            icon: 'chart',
            title: t('Diagramm statt nur Text', 'A chart, not just text'),
            text: t('Antworten kommen mit Balken, Linie oder Tabelle, wenn es die Frage verlangt.', 'Answers come with bars, a line or a table when the question calls for it.'),
          },
          {
            icon: 'eye',
            title: t('Über ein Dashboard chatten', 'Chat about a dashboard'),
            text: t('Dashboard links, Chat rechts. Resi kennt jedes Widget darauf.', 'Dashboard on the left, chat on the right. Resi knows every widget on it.'),
          },
          {
            icon: 'upload',
            title: t('Aufs Dashboard legen', 'Put it on the dashboard'),
            text: t('Eine gute Antwort wird mit einem Klick zum Widget.', 'A good answer becomes a widget with one click.'),
          },
        ],
      }),
      cards({
        name: t('Rahmen', 'Guardrails'),
        eyebrow: t('Vom Admin gesetzt', 'Set by the admin'),
        heading: t('Der Rahmen, in dem Resi arbeitet.', 'The frame Resi works in.'),
        lead: t(
          'Administratoren legen fest, welches Modell antwortet, in welcher Sprache, mit welchem Budget und wie tief es in die Daten darf.',
          'Administrators decide which model answers, in which language, on what budget and how deep it may go into the data.',
        ),
        layout: 'grid-4',
        background: 'tinted',
        cards: [
          { icon: 'sparkles', title: t('Modell', 'Model'), text: t('Von schnell bis gründlich: Claude Haiku, Sonnet, Opus oder Fable, je Space wählbar.', 'From fast to thorough: Claude Haiku, Sonnet, Opus or Fable, chosen per space.') },
          { icon: 'globe', title: t('Sprache', 'Language'), text: t('Resi antwortet auf Deutsch, Englisch oder Italienisch, unabhängig von der Frage.', 'Resi answers in German, English or Italian, whatever the question was in.') },
          { icon: 'database', title: t('Warehouse-Zugriff', 'Warehouse access'), text: t('Standard ist der Kennzahlen-Katalog. Rohe Tabellen sieht Resi nur, wenn Sie es freigeben.', 'The KPI catalogue is the default. Resi sees raw tables only if you allow it.') },
          { icon: 'euro', title: t('KI-Budget', 'AI budget'), text: t('Ein Limit je Space mit Anzeige im Menü. Ist es erreicht, wartet Resi bis zum Reset.', 'A limit per space, shown in the menu. When it is reached, Resi waits for the reset.') },
        ],
      }),
      {
        blockType: 'agentShowcase',
        blockName: t('Beispiele', 'Examples'),
        header: {
          eyebrow: t('Beispiele', 'Examples'),
          heading: t('Fragen, die Hotels wirklich stellen', 'Questions hotels actually ask'),
          lead: t('Klicken Sie eine Frage, um die Antwort zu sehen.', 'Pick a question to see the answer.'),
          align: 'center',
        },
        prompts: [
          {
            question: t('Wie viele Anfragen kamen letzte Woche über Re:Guest, und wie viele wurden gebucht?', 'How many requests came through Re:Guest last week, and how many were booked?'),
            answer: t(
              '96 Anfragen, 71 Angebote, 36 Buchungen: eine Abschlussquote von 38 %. Die schnellsten Antworten unter zwei Stunden schlossen mit 51 % ab.',
              '96 requests, 71 offers, 36 bookings: a conversion of 38 %. The fastest replies, under two hours, converted at 51 %.',
            ),
            chart: 'bars',
            kpiLabel: t('Abschlussquote Re:Guest, letzte Woche', 'Re:Guest conversion, last week'),
            kpiValue: '38 %',
            kpiDelta: '+4',
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
          {
            question: t('Wo liegt die Auslastung im Oktober unter dem Ziel?', 'Where is October occupancy below target?'),
            answer: t(
              'In den Juniorsuiten und unter der Woche: 61 % gegen 75 % Ziel. Wochenenden liegen über Ziel, die Lücke sind Dienstag bis Donnerstag.',
              'In the junior suites and on weekdays: 61 % against a 75 % target. Weekends are above target; the gap is Tuesday to Thursday.',
            ),
            chart: 'bars',
            kpiLabel: t('Auslastung Juniorsuite, Oktober', 'Junior suite occupancy, October'),
            kpiValue: '61 %',
            kpiDelta: '−14',
          },
        ],
        points: [],
        channels: [{ name: 'Indicate App' }, { name: 'Claude' }, { name: 'ChatGPT' }],
        links: [external(refs.links.demoUrl, t('Live erleben', 'See it live'), 'default')],
        settings: { ...defaults },
      },
      related(t, ['mcp', 'build-with-ai', 'governance']),
      faq(t, [
        {
          q: t('Welche Daten sieht Resi?', 'What data does Resi see?'),
          a: t(
            'Die Kennzahlen aus Ihrem Katalog für die Quellen, die Sie im Chat gewählt haben. Rohe Tabellen sieht er nur, wenn ein Admin den Warehouse-Zugriff freigibt.',
            'The KPIs in your catalogue for the sources you picked in the chat. It sees raw tables only if an admin enables warehouse access.',
          ),
        },
        {
          q: t('Kann ich die Antwort behalten?', 'Can I keep an answer?'),
          a: t(
            'Ja. Jeder Chat bleibt in Ihrer Chronik, und jede Antwort mit Diagramm legen Sie per Klick als Widget auf ein Dashboard.',
            'Yes. Every chat stays in your history, and any answer with a chart goes onto a dashboard as a widget with one click.',
          ),
        },
        {
          q: t('Was kostet Resi?', 'What does Resi cost?'),
          a: t(
            'Die KI-Agentin kommt als Erweiterung ab 20 € pro Nutzer und Monat dazu. Fragen in der App und über MCP laufen über denselben Zugang und dasselbe Budget.',
            'The AI agent is an add-on from €20 per user and month. Questions in the app and through MCP share the same access and budget.',
          ),
        },
      ]),
      closing(t, refs, t('Stellen Sie Resi die erste Frage.', 'Ask Resi the first question.'), t('30 Minuten, Ihre Daten, echte Antworten.', '30 minutes, your data, real answers.')),
    ],
  )

const mcpPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'mcp',
    {
      title: t('Indicate MCP: Hotelzahlen in Claude, ChatGPT und Langdock', 'Indicate MCP: hotel numbers in Claude, ChatGPT and Langdock'),
      description: t(
        'Der Indicate MCP-Server gibt Ihrem KI-Assistenten geprüfte Kennzahlen aus PMS, Vertrieb und Marketing, mit denselben Rechten wie in der App.',
        'The Indicate MCP server gives your AI assistant verified KPIs from PMS, distribution and marketing, with the same permissions as in the app.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: 'Indicate MCP',
        heading: t('Ihre Hotelzahlen in Claude, ChatGPT und Langdock.', 'Your hotel numbers in Claude, ChatGPT and Langdock.'),
        lead: t(
          'Der MCP-Server gibt Ihrem Assistenten die Kennzahlen aus Indicate, mit denselben Rechten wie in der App.',
          'The MCP server gives your assistant the KPIs from Indicate, with the same permissions as in the app.',
        ),
        illustration: 'mcp',
        secondary: { url: refs.links.docsUrl, label: t('Einrichtung in den Docs', 'Setup in the docs'), external: true },
      }),
      steps(
        t,
        t('Eine Zeile, dann fragen', 'One line, then ask'),
        t('Der Server läuft bei Indicate. Sie richten nur den Zugang ein.', 'The server runs at Indicate. You only set up the access.'),
        [
          {
            icon: 'lock',
            title: t('Token oder App', 'Token or app'),
            text: t(
              'Ein Agent-Token für den Space, oder Sie melden Claude bzw. ChatGPT als App an und loggen sich wie gewohnt ein.',
              'An agent token for the space, or you register Claude or ChatGPT as an app and sign in as usual.',
            ),
          },
          {
            icon: 'code',
            title: t('Einrichten', 'Set up'),
            text: t(
              'Anleitungen für Claude Desktop, Claude Code und jeden MCP-fähigen Assistenten direkt in der App. Eine Zeile, fertig.',
              'Guides for Claude Desktop, Claude Code and any MCP-capable assistant right in the app. One line, done.',
            ),
          },
          {
            icon: 'message',
            title: t('Fragen', 'Ask'),
            text: t(
              'Ihr Assistent ruft Kennzahlen ab und rechnet mit geprüften Zahlen, nicht mit dem, was er sich merkt.',
              'Your assistant fetches KPIs and works with verified numbers, not with what it remembers.',
            ),
          },
        ],
      ),
      {
        blockType: 'spotlight',
        blockName: 'Resi',
        layout: 'compact',
        eyebrow: t('Die Agentin dahinter', 'The agent behind it'),
        heading: t('In Claude antwortet Resi. Dieselbe wie in der App.', 'In Claude, Resi answers. The same as in the app.'),
        text: t(
          'Was Resi in der App weiß, weiß sie auch in Claude: dieselben Kennzahlen, dieselben Rechte, über MCP.',
          'What Resi knows in the app, she knows in Claude too: the same KPIs, the same permissions, through MCP.',
        ),
        links: [internal('/agent', t('Resi kennenlernen', 'Meet Resi'), 'outline')],
        settings: { ...defaults, spacing: 'compact' },
      },
      story({
        name: t('Katalog statt Tabelle', 'Catalogue, not table'),
        eyebrow: t('Semantic Layer', 'Semantic layer'),
        heading: t('Der Katalog, nicht die Tabelle.', 'The catalogue, not the table.'),
        lead: t(
          'Der Assistent bekommt Kennzahlen mit ihrer Definition, nicht Zugriff auf Rohdaten. So rechnet Claude RevPAR genauso wie Ihr Dashboard.',
          'The assistant gets KPIs with their definition, not access to raw data. So Claude calculates RevPAR exactly like your dashboard.',
        ),
        illustration: 'semanticLayer',
        layout: 'visual-right',
        points: [
          {
            icon: 'layers',
            title: t('Kennzahlen-Katalog', 'KPI catalogue'),
            text: t('Auslastung, ADR, RevPAR, Werbekosten, Anfragen: alles, was in Ihren KPI-Sammlungen freigegeben ist.', 'Occupancy, ADR, RevPAR, ad spend, requests: everything released in your KPI collections.'),
          },
          {
            icon: 'code',
            title: t('Definition inklusive', 'Definition included'),
            text: t('Der Assistent kennt Formel, Dimensionen und Version jeder Kennzahl.', 'The assistant knows the formula, dimensions and version of every KPI.'),
          },
          {
            icon: 'lock',
            title: t('Gästedaten bleiben im Space', 'Guest data stays in the space'),
            text: t('Namen und Kontaktdaten werden nicht übertragen, es sei denn, Sie legen sie selbst in die Anfrage.', 'Names and contact details are not transferred unless you put them into the request yourself.'),
          },
          {
            icon: 'shield',
            title: t('Rechte gelten überall', 'Permissions apply everywhere'),
            text: t('Ein Token sieht nur die Spaces, für die es ausgestellt wurde.', 'A token sees only the spaces it was issued for.'),
          },
        ],
      }),
      cards({
        name: t('Clients', 'Clients'),
        eyebrow: t('Läuft in', 'Runs in'),
        heading: t('Der Assistent, den Ihr Team schon nutzt.', 'The assistant your team already uses.'),
        layout: 'grid-3',
        background: 'tinted',
        cards: [
          { icon: 'message', title: 'Claude', text: t('Claude Desktop auf macOS und Windows, mit Anleitung in der App. Anmeldung als App mit Ihrem Indicate-Login.', 'Claude Desktop on macOS and Windows, with a guide in the app. Sign in as an app with your Indicate login.') },
          { icon: 'sparkles', title: 'ChatGPT', text: t('Als App anmelden, mit Ihrem Indicate-Login. Fragen im Chat, Antworten aus dem Kennzahlen-Katalog.', 'Sign in as an app with your Indicate login. Ask in the chat, answers from the KPI catalogue.') },
          { icon: 'users', title: 'Langdock', text: t('Für Teams, die ihren KI-Arbeitsplatz in Europa betreiben: MCP-Server eintragen, fertig.', 'For teams running their AI workspace in Europe: add the MCP server, done.') },
          { icon: 'code', title: 'Claude Code', text: t('Ein Befehl im Terminal, und der Server ist verbunden. Für Datenteams und Agenturen mit eigenen Skripten.', 'One terminal command and the server is connected. For data teams and agencies with their own scripts.') },
          { icon: 'code', title: 'GitHub Copilot', text: t('Kennzahlen im Editor, neben dem Code Ihrer Website oder Ihres Datenteams.', 'KPIs in the editor, next to the code of your website or data team.') },
          { icon: 'plug', title: t('Jeder MCP-fähige Assistent', 'Any MCP-capable assistant'), text: t('Der Standard ist offen. Was MCP spricht, verbindet sich mit einem Agent-Token oder als App.', 'The standard is open. Anything that speaks MCP connects with an agent token or as an app.') },
        ],
      }),
      {
        blockType: 'agentShowcase',
        blockName: t('Beispiele', 'Examples'),
        header: {
          eyebrow: t('Beispiele', 'Examples'),
          heading: t('Was Ihr Assistent damit anfängt', 'What your assistant does with it'),
          lead: t('Dieselben Kennzahlen wie im Dashboard, in Ihrem Chat.', 'The same KPIs as on the dashboard, in your chat.'),
          align: 'center',
        },
        prompts: [
          {
            question: t('Hat die Sommerkampagne auf Meta gebracht, was wir geplant hatten?', 'Did the summer campaign on Meta deliver what we planned?'),
            answer: t(
              'Fast: 212 Buchungen statt 240 geplant, dafür mit 168 € ADR über Plan. Die Lücke liegt in KW 29 bis 31, dort lief keine Anzeige.',
              'Almost: 212 bookings against 240 planned, but with an ADR of €168 above plan. The gap sits in weeks 29 to 31, when no ad was running.',
            ),
            chart: 'line',
            kpiLabel: t('Buchungen Sommerkampagne Meta', 'Bookings, summer campaign on Meta'),
            kpiValue: '212',
            kpiDelta: '−28',
          },
          {
            question: t('Schreib mir die drei größten Veränderungen der Woche für den Eigentümer.', 'Write me the three biggest changes of the week for the owner.'),
            answer: t(
              'Pickup +38 Nächte gegenüber Vorwoche, vor allem Direktbuchungen. OTA-Anteil auf 42 % gesunken. Juniorsuiten unter der Woche weiter unter Ziel.',
              'Pickup +38 nights versus last week, mostly direct bookings. OTA share down to 42 %. Junior suites still below target on weekdays.',
            ),
            chart: 'bars',
            kpiLabel: t('Pickup diese Woche', 'Pickup this week'),
            kpiValue: '+38',
            kpiDelta: '+12',
          },
        ],
        points: [
          {
            icon: 'shield',
            title: t('Nur freigegebene Kennzahlen', 'Released KPIs only'),
            text: t('Der Assistent liest den Katalog, nie rohe Tabellen.', 'The assistant reads the catalogue, never raw tables.'),
          },
          {
            icon: 'lock',
            title: t('Rechte wie in der App', 'Permissions as in the app'),
            text: t('Jede Person sieht nur die Häuser, für die sie freigeschaltet ist.', 'Everyone sees only the properties they are cleared for.'),
          },
          {
            icon: 'euro',
            title: t('Ein Budget', 'One budget'),
            text: t('App und MCP teilen sich das KI-Budget des Space.', 'App and MCP share the space’s AI budget.'),
          },
        ],
        channels: [{ name: 'Claude' }, { name: 'ChatGPT' }, { name: 'Langdock' }, { name: 'Claude Code' }, { name: 'GitHub Copilot' }],
        links: [external(refs.links.docsUrl, t('Einrichtung lesen', 'Read the setup'), 'outline')],
        settings: { ...defaults },
      },
      related(t, ['agent', 'kpi-studio', 'governance']),
      faq(t, [
        {
          q: t('Was ist MCP?', 'What is MCP?'),
          a: t(
            'Das Model Context Protocol ist ein offener Standard, mit dem KI-Assistenten Werkzeuge und Daten anfragen. Indicate stellt so seinen Kennzahlen-Katalog bereit, ohne Export und ohne Kopie.',
            'The Model Context Protocol is an open standard that lets AI assistants request tools and data. Indicate exposes its KPI catalogue this way, without export and without a copy.',
          ),
        },
        {
          q: t('Welche Daten werden übertragen?', 'What data is transferred?'),
          a: t(
            'Nur die Kennzahlen, die Ihr Assistent für die Frage anfragt, mit den Rechten des Tokens. Gästedaten und rohe Tabellen bleiben im Space.',
            'Only the KPIs your assistant requests for the question, with the token’s permissions. Guest data and raw tables stay in the space.',
          ),
        },
        {
          q: t('Braucht mein Datenteam etwas anderes?', 'Does my data team need anything else?'),
          a: t(
            'Nein. Dasselbe MCP läuft in Claude Code und GitHub Copilot. Dazu kommen API-Tokens, Export und KPI Studio für eigene Definitionen.',
            'No. The same MCP runs in Claude Code and GitHub Copilot. Add API tokens, export and KPI Studio for your own definitions.',
          ),
        },
      ]),
      closing(t, refs, t('Verbinden Sie Ihren Assistenten mit Ihren Zahlen.', 'Connect your assistant to your numbers.'), t('In der Demo richten wir MCP gemeinsam ein.', 'We set up MCP together in the demo.')),
    ],
  )

const buildWithAiPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'build-with-ai',
    {
      title: t('Mit KI bauen: Dashboards aus einem Satz', 'Build with AI: dashboards from one sentence'),
      description: t(
        'Beschreiben Sie das Dashboard, Indicate baut es aus fertigen Kennzahlen: Widgets, Zeitraum, Vergleich. Anpassen per Klick oder mit dem nächsten Satz.',
        'Describe the dashboard and Indicate builds it from ready-made KPIs: widgets, period, comparison. Adjust with a click or the next sentence.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: t('Mit KI bauen', 'Build with AI'),
        heading: t('Beschreiben Sie das Dashboard. Indicate baut es.', 'Describe the dashboard. Indicate builds it.'),
        lead: t(
          'Ein Satz, und Widgets, Zeitraum und Vergleich stehen. Anpassen per Klick oder mit dem nächsten Satz.',
          'One sentence, and widgets, period and comparison are there. Adjust with a click or the next sentence.',
        ),
        illustration: 'builder',
        secondary: { url: '/dashboards', label: t('Oder mit einer Vorlage starten', 'Or start from a template') },
      }),
      steps(
        t,
        t('Vom Satz zum Dashboard', 'From sentence to dashboard'),
        t('Kein leeres Blatt. Die Kennzahlen sind schon da.', 'No blank canvas. The KPIs are already there.'),
        [
          {
            icon: 'message',
            title: t('Beschreiben', 'Describe'),
            text: t(
              '„Auslastung und ADR nach Kanal, Q4 gegen Vorjahr.“ Der Assistent wählt Kennzahlen, Widgets und Vergleich.',
              '“Occupancy and ADR by channel, Q4 against last year.” The assistant picks KPIs, widgets and comparison.',
            ),
          },
          {
            icon: 'zap',
            title: t('Prüfen und anpassen', 'Check and adjust'),
            text: t(
              '„Mit KI bearbeiten“ baut das Board um. „Widget hinzufügen“ lässt die KI bauen, oder Sie selbst im Studio.',
              '“Edit with AI” rebuilds the board. “Add widget” lets the AI build it, or you do in the studio.',
            ),
          },
          {
            icon: 'sparkles',
            title: t('Zusammenfassen lassen', 'Let it summarise'),
            text: t(
              'Die KI-Zusammenfassung schreibt, was auf dem Board passiert, in normalen Worten, mit Hinweis auf das Modell.',
              'The AI summary writes what is happening on the board in plain words, naming the model.',
            ),
          },
        ],
      ),
      story({
        name: t('Fertige Kennzahlen', 'Ready-made KPIs'),
        eyebrow: t('Kennzahlen je System', 'KPIs per system'),
        heading: t('Fertige Kennzahlen, kein leeres Blatt.', 'Ready-made KPIs, no blank canvas.'),
        lead: t(
          'Jede Anbindung bringt ihre KPI-Sammlung mit. Der Assistent baut daraus, Sie behalten die Kontrolle über jedes Widget.',
          'Every connection brings its KPI collection. The assistant builds from it; you keep control of every widget.',
        ),
        illustration: 'dashboard',
        layout: 'visual-right',
        points: [
          {
            icon: 'layers',
            title: t('KPI-Sammlungen je System', 'KPI collections per system'),
            text: t('Revenue, Auslastung, Kanalmix, Kampagnen, Anfragen: sauber definiert für Mews, Google Ads, Re:Guest und mehr.', 'Revenue, occupancy, channel mix, campaigns, requests: cleanly defined for Mews, Google Ads, Re:Guest and more.'),
          },
          {
            icon: 'chart',
            title: t('Neun Widget-Arten', 'Nine widget kinds'),
            text: t('Linie, Fläche, Balken, Säulen, Kreis, Punkte, Kalender, Scorecard, Tabelle.', 'Line, area, bar, column, pie, scatter, calendar, scorecard, table.'),
          },
          {
            icon: 'target',
            title: t('Vergleich eingebaut', 'Comparison built in'),
            text: t('Vorperiode, Vorjahr oder Hilfslinie mit Ziel, immer daneben.', 'Previous period, last year or a guide line with a target, always side by side.'),
          },
          {
            icon: 'palette',
            title: t('Ihre Farben', 'Your colours'),
            text: t('Die Palette Ihres Hauses liegt im Studio bereit.', 'Your property’s palette is ready in the studio.'),
          },
        ],
      }),
      cards({
        name: t('Startfragen', 'Starter prompts'),
        eyebrow: t('Startfragen', 'Starter prompts'),
        heading: t('Vier Ausgangspunkte, wenn Sie nicht wissen, wo Sie anfangen.', 'Four starting points if you do not know where to begin.'),
        layout: 'grid-4',
        background: 'tinted',
        cards: [
          { icon: 'building', title: t('Mein Hotel', 'My hotel'), text: t('Auslastung, ADR, RevPAR und Pickup der letzten 30 Tage gegen Vorjahr.', 'Occupancy, ADR, RevPAR and pickup for the last 30 days against last year.') },
          { icon: 'euro', title: t('Preise & Umsatz', 'Prices & revenue'), text: t('Umsatz je Kanal und Zimmerkategorie, mit Ziel als Hilfslinie.', 'Revenue by channel and room category, with a target guide line.') },
          { icon: 'users', title: t('Gäste & Buchungen', 'Guests & bookings'), text: t('Herkunft, Aufenthaltsdauer, Vorlaufzeit und Stornos.', 'Origin, length of stay, lead time and cancellations.') },
          { icon: 'trending', title: t('Online-Marketing', 'Online marketing'), text: t('Werbekosten, Kosten je Buchung und Klicks gegen Buchungen aus dem PMS.', 'Ad spend, cost per booking and clicks against bookings from the PMS.') },
        ],
      }),
      related(t, ['dashboards', 'agent', 'kpi-studio']),
      faq(t, [
        {
          q: t('Kann ich das Ergebnis selbst ändern?', 'Can I change the result myself?'),
          a: t(
            'Ja. Jedes Widget öffnet sich im Widget Studio: Datenreihen, Filter, Rangfolge, Hilfslinien und Farben. Oder Sie sagen dem Assistenten, was anders sein soll.',
            'Yes. Every widget opens in the Widget Studio: series, filters, ranking, guide lines and colours. Or you tell the assistant what should change.',
          ),
        },
        {
          q: t('Woher weiß die KI, was RevPAR ist?', 'How does the AI know what RevPAR is?'),
          a: t(
            'Aus dem Kennzahlen-Katalog. Jede Kennzahl hat dort eine Definition, die der Assistent liest, statt sie zu erraten.',
            'From the KPI catalogue. Every KPI has a definition there that the assistant reads instead of guessing.',
          ),
        },
        {
          q: t('Ist das im Preis enthalten?', 'Is it included in the price?'),
          a: t(
            'Das Bauen mit KI nutzt das KI-Budget des Space. Der Admin sieht den Verbrauch und setzt das Limit.',
            'Building with AI uses the space’s AI budget. The admin sees the usage and sets the limit.',
          ),
        },
      ]),
      closing(t, refs, t('Beschreiben Sie Ihr erstes Dashboard.', 'Describe your first dashboard.'), t('In der Demo bauen wir es mit Daten aus einem Haus wie Ihrem.', 'In the demo we build it with data from a property like yours.')),
    ],
  )

const dashboardsPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'dashboards',
    {
      title: t('Dashboards & Vorlagen für Hotels', 'Dashboards & templates for hotels'),
      description: t(
        'Fertige Dashboard-Vorlagen für PMS, Ads und CRM, neun Widget-Arten, Vergleiche mit Vorjahr und Ziel, geteilt in Ihren Farben.',
        'Ready-made dashboard templates for PMS, ads and CRM, nine widget kinds, comparisons with last year and target, shared in your colours.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: t('Dashboards & Vorlagen', 'Dashboards & templates'),
        heading: t('Fertige Dashboards für jedes System.', 'Ready-made dashboards for every system.'),
        lead: t(
          'Vorlagen für PMS, Ads und CRM, Widgets von Scorecard bis Kalender, geteilt in Ihren Farben.',
          'Templates for PMS, ads and CRM, widgets from scorecard to calendar, shared in your colours.',
        ),
        illustration: 'templates',
        secondary: { url: '/build-with-ai', label: t('Oder mit KI bauen', 'Or build with AI') },
      }),
      steps(
        t,
        t('Von der Vorlage zum eigenen Board', 'From template to your own board'),
        t('Vorlagen sind der schnellste Start. Danach ist alles Ihres.', 'Templates are the fastest start. After that, everything is yours.'),
        [
          {
            icon: 'layers',
            title: t('Vorlage wählen', 'Pick a template'),
            text: t(
              'Im Marktplatz: Vorlagen von Indicate, von Ihrer Gruppe oder Agentur, oder Ihre eigenen.',
              'In the marketplace: templates from Indicate, from your group or agency, or your own.',
            ),
          },
          {
            icon: 'plug',
            title: t('Kennzahlen zuordnen', 'Map the KPIs'),
            text: t(
              'Indicate ordnet die Kennzahlen der Vorlage Ihren Quellen zu. Fehlt eine, sehen Sie es sofort.',
              'Indicate maps the template’s KPIs to your sources. If one is missing, you see it at once.',
            ),
          },
          {
            icon: 'users',
            title: t('Teilen', 'Share'),
            text: t(
              'Als Start-Dashboard, per Link, als Favorit für das Team oder als Flying KPI per E-Mail.',
              'As the home dashboard, by link, as a favourite for the team or as a Flying KPI by e-mail.',
            ),
          },
        ],
      ),
      story({
        name: t('Vergleiche', 'Comparisons'),
        eyebrow: t('Vergleiche', 'Comparisons'),
        heading: t('Der Vergleich steht immer daneben.', 'The comparison is always right there.'),
        lead: t(
          'Eine Zahl allein sagt wenig. Jedes Widget trägt Vorperiode, Vorjahr oder Ziel, und weiß, ob höher oder niedriger besser ist.',
          'A number on its own says little. Every widget carries previous period, last year or target, and knows whether higher or lower is better.',
        ),
        illustration: 'comparison',
        layout: 'visual-left',
        points: [
          {
            icon: 'clock',
            title: t('Vorperiode und Vorjahr', 'Previous period and last year'),
            text: t('Gleicher Zeitraum, gleiche Wochentage, auf Wunsch wie-für-wie.', 'Same period, same weekdays, like-for-like on request.'),
          },
          {
            icon: 'target',
            title: t('Hilfslinien mit Ziel', 'Guide lines with a target'),
            text: t('Fester Wert, Trend, Perzentil oder eine Linie, die mehrere Widgets teilen.', 'Fixed value, trend, percentile or a line several widgets share.'),
          },
          {
            icon: 'trending',
            title: t('Polarität', 'Polarity'),
            text: t('Höher ist besser, niedriger ist besser, auf Ziel: die Farbe der Abweichung stimmt.', 'Higher is better, lower is better, on target: the deviation’s colour is right.'),
          },
          {
            icon: 'calendar',
            title: t('Zeitraum für alle', 'One period for all'),
            text: t('Der Zeitraum gilt für das ganze Board, einzelne Widgets dürfen abweichen.', 'The period applies to the whole board; single widgets may differ.'),
          },
        ],
      }),
      cards({
        name: t('Widgets', 'Widgets'),
        eyebrow: t('Neun Widget-Arten', 'Nine widget kinds'),
        heading: t('Die passende Form für jede Zahl.', 'The right shape for every number.'),
        layout: 'grid-3',
        background: 'tinted',
        cards: [
          { icon: 'chart', title: t('Diagramme', 'Charts'), points: [t('Linie und Fläche, auch gestapelt', 'Line and area, stacked too'), t('Balken und Säulen', 'Bar and column'), t('Kreis, Ring und Rose', 'Pie, donut and rose'), t('Punkte', 'Scatter')] },
          { icon: 'target', title: t('Kennzahlen', 'Scorecards'), points: [t('Wert mit Vergleich und Abweichung', 'Value with comparison and deviation'), t('Rangfolge: Top oder Flop N', 'Ranking: top or bottom N'), t('Filter je Datenreihe', 'Filters per series')] },
          { icon: 'calendar', title: t('Tabellen & Kalender', 'Tables & calendars'), points: [t('Tabelle mit Summen', 'Table with totals'), t('Kalender-Heatmap für Pickup und Ankünfte', 'Calendar heatmap for pickup and arrivals'), t('Export als CSV oder JSON', 'Export as CSV or JSON')] },
        ],
      }),
      cards({
        name: t('Vorlagen pflegen', 'Maintaining templates'),
        eyebrow: t('Vorlagen-Marktplatz', 'Template marketplace'),
        heading: t('Einmal gebaut, überall gepflegt.', 'Built once, maintained everywhere.'),
        lead: t(
          'Für Gruppen und Agenturen: Vorlagen mit Versionen und Änderungsprotokoll, veröffentlicht für ein privates Publikum.',
          'For groups and agencies: templates with revisions and a changelog, published to a private audience.',
        ),
        layout: 'grid-4',
        cards: [
          { icon: 'layers', title: t('Marktplatz', 'Marketplace'), text: t('Stöbern, Favoriten, meine Vorlagen, Gruppen.', 'Browse, favourites, my templates, groups.') },
          { icon: 'code', title: t('Revisionen', 'Revisions'), text: t('Jede Veröffentlichung mit Änderungsprotokoll.', 'Every publication with a changelog.') },
          { icon: 'users', title: t('Vorlagen-Gruppen', 'Template groups'), text: t('Ein privates Publikum: Ihre Häuser oder Ihre Kunden.', 'A private audience: your properties or your clients.') },
          { icon: 'buildings', title: t('Über Spaces duplizieren', 'Duplicate across spaces'), text: t('Kennzahlen werden dem Ziel-Space neu zugeordnet.', 'KPIs are remapped to the target space.') },
        ],
      }),
      related(t, ['build-with-ai', 'flying-kpis', 'hotel-groups']),
      faq(t, [
        {
          q: t('Welche Vorlagen gibt es?', 'Which templates are there?'),
          a: t(
            'Für jedes angebundene System eine Grundausstattung: PMS-Revenue und Auslastung, Google Ads und Meta, Re:Guest-Anfragen, Google Analytics. Gruppen und Agenturen veröffentlichen eigene.',
            'A basic set for every connected system: PMS revenue and occupancy, Google Ads and Meta, Re:Guest requests, Google Analytics. Groups and agencies publish their own.',
          ),
        },
        {
          q: t('Kann ich Dashboards im Branding meines Hauses teilen?', 'Can I share dashboards in my property’s branding?'),
          a: t(
            'Ja. Jeder Space hat eigene Farbpaletten und ein Logo. Die Palette liegt im Widget Studio bereit, das Logo erscheint im geteilten Dashboard.',
            'Yes. Every space has its own colour palettes and a logo. The palette is ready in the Widget Studio; the logo appears on the shared dashboard.',
          ),
        },
        {
          q: t('Was passiert, wenn eine Kennzahl der Vorlage bei mir fehlt?', 'What if my space lacks a KPI the template needs?'),
          a: t(
            'Beim Zuordnen sehen Sie jede fehlende Kennzahl. Sie wählen einen Ersatz, lassen das Widget weg oder verbinden die fehlende Quelle.',
            'While mapping you see every missing KPI. You pick a substitute, drop the widget or connect the missing source.',
          ),
        },
      ]),
      closing(t, refs, t('Sehen Sie die Vorlagen mit Ihren Zahlen.', 'See the templates with your numbers.'), t('In 30 Minuten steht Ihr erstes Dashboard.', 'Your first dashboard is up in 30 minutes.')),
    ],
  )

const flyingKpisPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'flying-kpis',
    {
      title: t('Flying KPIs: Reports nach Zeitplan', 'Flying KPIs: reports on a schedule'),
      description: t(
        'Jedes Dashboard als E-Mail, täglich, wöchentlich oder monatlich, an Ihr Team oder jede Adresse. Auf Wunsch mit Zusammenfassung vom Agenten.',
        'Any dashboard as e-mail, daily, weekly or monthly, to your team or any address. With a summary from the agent on request.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: 'Flying KPIs',
        heading: t('Berichte, die von allein ankommen.', 'Reports that arrive on their own.'),
        lead: t(
          'Jedes Dashboard als E-Mail, täglich, wöchentlich oder monatlich, an Ihr Team oder jede Adresse.',
          'Any dashboard as e-mail, daily, weekly or monthly, to your team or any address.',
        ),
        illustration: 'flyingKpis',
        secondary: { url: '/dashboards', label: t('Dashboards ansehen', 'See the dashboards') },
      }),
      steps(
        t,
        t('Einmal einstellen, nie wieder vergessen', 'Set once, never forgotten'),
        t('Ein Flying KPI ist ein Dashboard mit Rhythmus und Empfängern.', 'A Flying KPI is a dashboard with a rhythm and recipients.'),
        [
          {
            icon: 'chart',
            title: t('Dashboard wählen', 'Pick the dashboard'),
            text: t('Jedes Dashboard kann fliegen: der Wochenreport, der Monatsabschluss, das Kampagnen-Board.', 'Any dashboard can fly: the weekly report, the month-end close, the campaign board.'),
          },
          {
            icon: 'calendar',
            title: t('Rhythmus und Empfänger', 'Rhythm and recipients'),
            text: t('Täglich, wöchentlich oder monatlich. Mitglieder aus der Liste oder jede E-Mail-Adresse.', 'Daily, weekly or monthly. Members from the list or any e-mail address.'),
          },
          {
            icon: 'sparkles',
            title: t('Zusammenfassung dazu', 'Add a summary'),
            text: t('Auf Wunsch schreibt der Agent die wichtigsten Veränderungen in normalen Worten dazu.', 'On request the agent adds the biggest changes in plain words.'),
          },
        ],
      ),
      story({
        name: t('Ohne Login', 'No login needed'),
        eyebrow: t('Für alle, die keinen Login haben', 'For everyone without a login'),
        heading: t('Der Eigentümer braucht keinen Zugang. Nur den Report.', 'The owner does not need access. Just the report.'),
        lead: t(
          'Beirat, Bank, Eigentümer oder Kunde: Wer die Zahlen sehen soll, bekommt sie per E-Mail, ohne Konto und ohne Schulung.',
          'Board, bank, owner or client: whoever should see the numbers gets them by e-mail, without an account and without training.',
        ),
        illustration: 'dashboard',
        layout: 'visual-right',
        points: [
          {
            icon: 'users',
            title: t('Jede Adresse', 'Any address'),
            text: t('Empfänger aus dem Team oder frei eingetragen.', 'Recipients from the team or typed in freely.'),
          },
          {
            icon: 'clock',
            title: t('Zuletzt und nächstes Mal', 'Last time and next time'),
            text: t('Die Übersicht zeigt, wann ein Report zuletzt raus ging und wann der nächste kommt.', 'The overview shows when a report last went out and when the next one comes.'),
          },
          {
            icon: 'check',
            title: t('Pausieren statt löschen', 'Pause instead of delete'),
            text: t('Saisonpause? Ein Klick, und der Report wartet.', 'Off season? One click, and the report waits.'),
          },
          {
            icon: 'palette',
            title: t('In Ihren Farben', 'In your colours'),
            text: t('Der Report trägt Logo und Palette des Space, bei Agenturen die des Kunden.', 'The report carries the space’s logo and palette; for agencies, the client’s.'),
          },
        ],
      }),
      cards({
        name: t('Rhythmen', 'Rhythms'),
        eyebrow: t('Drei Rhythmen', 'Three rhythms'),
        heading: t('Was Hotels fliegen lassen.', 'What hotels let fly.'),
        layout: 'grid-3',
        background: 'tinted',
        cards: [
          { icon: 'clock', title: t('Täglich', 'Daily'), text: t('Pickup, Ankünfte und Stornos von gestern, morgens um acht an die Rezeption und den Revenue-Manager.', 'Yesterday’s pickup, arrivals and cancellations, at eight in the morning to the front desk and the revenue manager.') },
          { icon: 'calendar', title: t('Wöchentlich', 'Weekly'), text: t('Der Wochenreport für die Geschäftsführung, mit Zusammenfassung vom Agenten.', 'The weekly report for management, with a summary from the agent.') },
          { icon: 'euro', title: t('Monatlich', 'Monthly'), text: t('Der Monatsabschluss für Eigentümer und Beirat, oder für jeden Kunden einer Agentur.', 'The month-end close for owners and board, or for every client of an agency.') },
        ],
      }),
      related(t, ['dashboards', 'build-with-ai', 'agencies']),
      faq(t, [
        {
          q: t('Brauchen Empfänger ein Indicate-Konto?', 'Do recipients need an Indicate account?'),
          a: t('Nein. Sie tragen jede E-Mail-Adresse ein. Der Report kommt als E-Mail an.', 'No. You enter any e-mail address. The report arrives as an e-mail.'),
        },
        {
          q: t('Kann ich mehrere Reports einrichten?', 'Can I set up several reports?'),
          a: t('Ja, je Dashboard einen. Die Übersicht zeigt alle mit Status, letztem und nächstem Versand.', 'Yes, one per dashboard. The overview lists them all with status, last and next delivery.'),
        },
        {
          q: t('Was steht in der Zusammenfassung?', 'What is in the summary?'),
          a: t('Die größten Veränderungen der Widgets auf dem Dashboard, in normalen Worten, mit Hinweis auf das Modell, das sie geschrieben hat.', 'The biggest changes across the dashboard’s widgets, in plain words, naming the model that wrote them.'),
        },
      ]),
      closing(t, refs, t('Lassen Sie Ihren ersten Report fliegen.', 'Let your first report fly.'), t('In der Demo richten wir ihn gemeinsam ein.', 'We set it up together in the demo.')),
    ],
  )

const integrationsPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'integrations',
    {
      title: t('Integrationen: PMS, Vertrieb, Marketing und Betrieb', 'Integrations: PMS, distribution, marketing and operations'),
      description: t(
        'Über 30 Anbindungen: Mews, Oracle, elite, ASA, Shiji, Re:Guest, vioma, Google, Meta, HubSpot und mehr. Historie ab dem ersten Tag, Rhythmus nach Wahl.',
        'More than 30 connections: Mews, Oracle, elite, ASA, Shiji, Re:Guest, vioma, Google, Meta, HubSpot and more. History from day one, rhythm of your choice.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: t('Integrationen', 'Integrations'),
        heading: t('Verbinden, synchronisieren, fertig.', 'Connect, sync, done.'),
        lead: t(
          'Über 30 Anbindungen an PMS, Vertrieb, Marketing und Betrieb. Historie ab dem ersten Tag, Rhythmus nach Wahl.',
          'More than 30 connections to PMS, distribution, marketing and operations. History from day one, rhythm of your choice.',
        ),
        illustration: 'sync',
        secondary: { url: '#directory', label: t('Alle Anbindungen ansehen', 'See all connections') },
      }),
      steps(
        t,
        t('Drei Klicks bis zur ersten Zahl', 'Three clicks to the first number'),
        t('Kein Projekt, keine Migration. Verbinden und weiterarbeiten.', 'No project, no migration. Connect and carry on.'),
        [
          {
            icon: 'search',
            title: t('Im Marktplatz wählen', 'Pick in the marketplace'),
            text: t('Jede Anbindung zeigt vorab, welche Daten und Kennzahlen sie mitbringt.', 'Every connection shows upfront which data and KPIs it brings.'),
          },
          {
            icon: 'plug',
            title: t('Verbinden', 'Connect'),
            text: t('Selbst anmelden, oder per Verbindungslink das Hotel freigeben lassen. Sie sehen nie ein Passwort.', 'Sign in yourself, or let the hotel authorise through a connect link. You never see a password.'),
          },
          {
            icon: 'check',
            title: t('Daten fließen', 'Data flows'),
            text: t('Erste Zahlen in Minuten, die Historie wird nachgeladen, der Kennzahlen-Katalog ist fertig.', 'First numbers in minutes, the history is backfilled, the KPI catalogue is ready.'),
          },
        ],
      ),
      {
        blockType: 'integrations',
        blockName: t('Anbindungen', 'Connections'),
        header: {
          eyebrow: t('Indicate Connect', 'Indicate Connect'),
          heading: t('Die Systeme, mit denen Hotels arbeiten.', 'The systems hotels work with.'),
          lead: t('Von PMS bis Schulferien. Fehlt eines? Wir bauen es an.', 'From PMS to school holidays. Missing one? We build it.'),
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
              { name: 'apaleo' },
              { name: 'ASA Hotelsoftware' },
              { name: 'Shiji' },
              { name: 'Front Office Cloud' },
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
              { name: 'SendGrid' },
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
              { name: 'Pinterest' },
              { name: 'Matomo' },
            ],
          },
          {
            title: t('Betrieb', 'Operations'),
            items: [{ name: 'gastromatic' }, { name: 'Passcreator' }, { name: 'CSV Import' }, { name: 'Schulferien' }, { name: 'Feiertage' }],
          },
        ],
        links: [],
        settings: { ...defaults },
      },
      {
        blockType: 'integrationDirectory',
        blockName: t('Verzeichnis', 'Directory'),
        header: {
          eyebrow: t('Alle Anbindungen', 'All connections'),
          heading: t('Finden Sie Ihr System.', 'Find your system.'),
          lead: t(
            'PMS, Vertrieb, Marketing, Web und Betrieb. Suchen Sie nach Name oder Kategorie.',
            'PMS, sales, marketing, web and operations. Search by name or category.',
          ),
          align: 'left',
        },
        request: {
          title: t('Ihr System fehlt?', 'Missing your system?'),
          text: t(
            'Sagen Sie uns, welches. Für gängige Hotel- und Marketing-Systeme bauen wir Anbindungen laufend dazu; bis dahin hilft der CSV-Import.',
            'Tell us which one. We keep adding connections for the common hotel and marketing systems; until then the CSV import helps.',
          ),
          ...internal('/contact', t('Integration anfragen', 'Request an integration')),
        },
        settings: { ...defaults, background: 'tinted', anchor: 'directory' },
      },
      cards({
        name: t('Je Verbindung', 'Per connection'),
        eyebrow: t('Jede Verbindung bringt mit', 'Every connection comes with'),
        heading: t('Sync, der sich selbst meldet.', 'A sync that speaks up.'),
        layout: 'grid-4',
        background: 'tinted',
        cards: [
          { icon: 'clock', title: t('Eigener Zeitplan', 'Its own schedule'), text: t('Stündlich bis täglich, rund um die Uhr oder nur tagsüber. Sync jetzt, wenn es eilt.', 'Hourly to daily, around the clock or daytime only. Sync now when it is urgent.') },
          { icon: 'eye', title: t('Aktivität und Gesundheit', 'Activity and health'), text: t('Jeder Lauf mit Zeilen und Dauer. Hakt es, steht die Verbindung unter „Braucht Aufmerksamkeit“.', 'Every run with rows and duration. If it stalls, the connection shows under “Needs your attention”.') },
          { icon: 'users', title: t('Verbindungslink', 'Connect link'), text: t('Einmal gültig, mit Einwilligung und Hinweis auf personenbezogene Daten. Widerrufbar.', 'Single use, with consent and a note on personal data. Revocable.') },
          { icon: 'upload', title: t('Import', 'Import'), text: t('CSV für alles, was kein System hat: Budgets, Events, eigene Listen.', 'CSV for everything without a system: budgets, events, your own lists.') },
        ],
      }),
      related(t, ['kpi-studio', 'governance', 'agencies']),
      faq(t, [
        {
          q: t('Wie aktuell sind die Daten?', 'How fresh is the data?'),
          a: t(
            'So aktuell, wie Sie den Zeitplan der Verbindung setzen: stündlich bis täglich. Die Übersicht zeigt den letzten Lauf mit Zeilen und Dauer.',
            'As fresh as the schedule you set for the connection: hourly to daily. The overview shows the last run with rows and duration.',
          ),
        },
        {
          q: t('Wie weit reicht die Historie?', 'How far back does the history go?'),
          a: t('Indicate lädt beim Verbinden die Historie nach, soweit das System sie liefert; bei den meisten PMS 13 Monate und mehr.', 'Indicate backfills the history when connecting, as far as the system provides it; for most PMS 13 months and more.'),
        },
        {
          q: t('Mein System fehlt. Was nun?', 'My system is missing. Now what?'),
          a: t('Schreiben Sie uns. Für die gängigen Hotel- und Marketing-Systeme bauen wir Anbindungen laufend dazu; bis dahin hilft der CSV-Import.', 'Write to us. We keep adding connections for the common hotel and marketing systems; until then the CSV import helps.'),
        },
      ]),
      closing(t, refs, t('Verbinden Sie Ihr erstes System in der Demo.', 'Connect your first system in the demo.'), t('30 Minuten, und die ersten Zahlen stehen.', '30 minutes, and the first numbers are there.')),
    ],
  )

const kpiStudioPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'kpi-studio',
    {
      title: t('KPI Studio: eigene Kennzahlen, eine Definition', 'KPI Studio: your own KPIs, one definition'),
      description: t(
        'Eigene KPIs als Definition im Semantic Layer: Schema-Browser, Dry Run, Dimensionen, Versionen. Überall gleich berechnet, in Dashboards, Agent und MCP.',
        'Your own KPIs as definitions in the semantic layer: schema browser, dry run, dimensions, versions. Calculated the same everywhere: dashboards, agent and MCP.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: 'KPI Studio',
        heading: t('Jede Kennzahl, eine Definition.', 'Every KPI, one definition.'),
        lead: t(
          'Eigene KPIs im Semantic Layer: geprüft, versioniert und überall gleich berechnet.',
          'Your own KPIs in the semantic layer: checked, versioned and calculated the same everywhere.',
        ),
        illustration: 'kpiStudio',
        secondary: { url: refs.links.docsUrl, label: t('Entwickler-Dokumentation', 'Developer docs'), external: true },
      }),
      steps(
        t,
        t('Kennzahl, Dimension, Sammlung', 'KPI, dimension, collection'),
        t('Das Studio führt durch jeden Schritt, die Vorschau rechnet mit.', 'The studio walks you through each step; the preview keeps calculating.'),
        [
          {
            icon: 'search',
            title: t('Schema durchsuchen', 'Browse the schema'),
            text: t('Tabellen und Spalten Ihres Warehouse, gepflegt von Indicate. Spalten per Klick übernehmen.', 'Tables and columns of your warehouse, managed by Indicate. Take over columns with a click.'),
          },
          {
            icon: 'code',
            title: t('Kennzahl definieren', 'Define the KPI'),
            text: t('Formel als Definition im Editor, geprüft gegen das Schema. Der Dry Run zeigt das Ergebnis mit echten Daten.', 'The formula as a definition in the editor, validated against the schema. The dry run shows the result with real data.'),
          },
          {
            icon: 'layers',
            title: t('Dimensionen anlegen', 'Add dimensions'),
            text: t('Gruppierung und Perspektive aus einer Spalte: Kanal, Zimmerkategorie, Buchungs- oder Ankunftsdatum.', 'Grouping and perspective from a column: channel, room category, booking or arrival date.'),
          },
          {
            icon: 'check',
            title: t('In der Sammlung freigeben', 'Release into the collection'),
            text: t('Als Version in Ihrer KPI-Sammlung. Dashboards, Resi und MCP rechnen ab sofort damit, überall gleich.', 'As a version in your KPI collection. Dashboards, Resi and MCP use it from now on, the same everywhere.'),
          },
        ],
      ),
      cards({
        name: t('Bausteine', 'Building blocks'),
        eyebrow: t('Was Sie bauen', 'What you build'),
        heading: t('Drei Bausteine, eine Sprache.', 'Three building blocks, one language.'),
        lead: t(
          'Kennzahlen, Dimensionen und Sammlungen sind Definitionen im Semantic Layer. Was hier steht, gilt in jedem Dashboard, für Resi und in Claude.',
          'KPIs, dimensions and collections are definitions in the semantic layer. What is defined here holds in every dashboard, for Resi and in Claude.',
        ),
        layout: 'grid-3',
        cards: [
          {
            icon: 'code',
            title: t('Kennzahl', 'KPI'),
            text: t('Eine Formel über Tabellen und Spalten, mit Filter und Version. RevPAR, Kosten je Buchung oder Ihre eigene.', 'A formula over tables and columns, with filter and version. RevPAR, cost per booking or your own.'),
          },
          {
            icon: 'layers',
            title: t('Dimension', 'Dimension'),
            text: t('Wonach eine Kennzahl aufgeteilt wird und welches Datum zählt. Einmal angelegt, in jedem Widget wählbar.', 'What a KPI is split by and which date counts. Created once, selectable in every widget.'),
          },
          {
            icon: 'users',
            title: t('Sammlung', 'Collection'),
            text: t('Kennzahlen und Dimensionen gebündelt und versioniert. Die Einheit, die Sie freigeben und teilen.', 'KPIs and dimensions bundled and versioned. The unit you release and share.'),
          },
        ],
      }),
      story({
        name: t('Dimensionen', 'Dimensions'),
        eyebrow: t('Dimensionen', 'Dimensions'),
        heading: t('Dimensionen, die die Frage verstehen.', 'Dimensions that understand the question.'),
        lead: t(
          'Zwei Arten: Gruppierung teilt die Kennzahl auf, Perspektive entscheidet, welches Datum zählt. Buchungsdatum oder Ankunft macht bei Pickup den Unterschied.',
          'Two kinds: grouping splits the KPI, perspective decides which date counts. Booking date or arrival makes all the difference for pickup.',
        ),
        illustration: 'dimensions',
        layout: 'visual-right',
        points: [
          {
            icon: 'layers',
            title: t('Gruppierung', 'Grouping'),
            text: t('Kanal, Zimmerkategorie, Herkunft, Kampagne: einmal definiert, in jedem Widget wählbar.', 'Channel, room category, origin, campaign: defined once, selectable in every widget.'),
          },
          {
            icon: 'calendar',
            title: t('Perspektive', 'Perspective'),
            text: t('Welches Datum je Datensatz den Zeitraum bestimmt: Buchung, Ankunft, Abreise.', 'Which date on each record decides the period: booking, arrival, departure.'),
          },
          {
            icon: 'plug',
            title: t('Über Sammlungen hinweg', 'Across collections'),
            text: t('Dimensionen verknüpfen oder duplizieren, damit Ads und PMS dieselbe Kampagne meinen.', 'Link or duplicate dimensions so ads and PMS mean the same campaign.'),
          },
          {
            icon: 'eye',
            title: t('Insights-Explorer', 'Insights explorer'),
            text: t('Kennzahl, Gruppierung, Zeitraum, Filter: prüfen, bevor es aufs Dashboard geht.', 'KPI, grouping, period, filters: check before it goes on a dashboard.'),
          },
        ],
      }),
      story({
        name: t('Sammlungen teilen', 'Sharing collections'),
        eyebrow: t('KPI-Sammlungen', 'KPI collections'),
        heading: t('Einmal gebaut, für alle freigegeben.', 'Built once, released to everyone.'),
        lead: t(
          'Kennzahlen und Dimensionen bündeln Sie in einer Sammlung. Die teilen Sie mit Ihrer Hotelgruppe, Ihren Kunden oder der Community, und jedes Update kommt bei allen an.',
          'You bundle KPIs and dimensions into a collection. Share it with your hotel group, your clients or the community, and every update reaches all of them.',
        ),
        illustration: 'collections',
        layout: 'visual-left',
        points: [
          {
            icon: 'buildings',
            title: t('Hotelgruppe', 'Hotel group'),
            text: t('Die Zentrale definiert den Standard, jedes Haus rechnet damit. Vergleiche stimmen, weil die Definition dieselbe ist.', 'Head office defines the standard, every property uses it. Comparisons hold because the definition is the same.'),
          },
          {
            icon: 'briefcase',
            title: t('Kunden', 'Clients'),
            text: t('Agenturen und Berater geben ihr Kennzahlen-Set an alle Kunden weiter, mit Version und Änderungshistorie.', 'Agencies and consultants pass their KPI set on to every client, with version and change history.'),
          },
          {
            icon: 'globe',
            title: t('Community', 'Community'),
            text: t('Öffentliche Sammlungen übernehmen, eigene veröffentlichen. Branchenstandards wie RevPAR sind schon da.', 'Adopt public collections, publish your own. Industry standards like RevPAR are already there.'),
          },
          {
            icon: 'lock',
            title: t('Lesend geteilt', 'Shared read-only'),
            text: t('Empfänger nutzen die Sammlung, ändern sie aber nicht. Neue Versionen erscheinen bei allen, alte bleiben gültig.', 'Recipients use the collection but do not change it. New versions appear for everyone, old ones stay valid.'),
          },
        ],
      }),
      cards({
        name: t('Werkzeuge', 'Tools'),
        eyebrow: t('Im Studio', 'In the studio'),
        heading: t('Werkzeuge für Datenteams.', 'Tools for data teams.'),
        layout: 'grid-4',
        background: 'tinted',
        cards: [
          { icon: 'database', title: t('Schema-Browser', 'Schema browser'), text: t('Warehouse-Tabellen mit Spalten und Typen, direkt neben dem Editor.', 'Warehouse tables with columns and types, right beside the editor.') },
          { icon: 'zap', title: 'Dry Run', text: t('Die Definition gegen echte Daten rechnen, bevor sie jemand sieht.', 'Run the definition against real data before anyone sees it.') },
          { icon: 'upload', title: t('Import & Export', 'Import & export'), text: t('Definitionen importieren, das Schema als DDL exportieren, alles als JSON.', 'Import definitions, export the schema as DDL, all as JSON.') },
          { icon: 'clock', title: t('Versionen & Sunset', 'Versions & sunset'), text: t('Neue Versionen neben alten. Abgekündigte Kennzahlen mit Datum, damit nichts still bricht.', 'New versions beside old ones. Deprecated KPIs with a date, so nothing breaks silently.') },
        ],
      }),
      related(t, ['mcp', 'build-with-ai', 'governance']),
      faq(t, [
        {
          q: t('Muss ich das Studio nutzen?', 'Do I have to use the studio?'),
          a: t('Nein. Jede Anbindung bringt ihre Kennzahlen fertig mit. Das Studio ist für alles, was darüber hinausgeht: eigene Formeln, eigene Dimensionen.', 'No. Every connection brings its KPIs ready-made. The studio is for everything beyond: your own formulas, your own dimensions.'),
        },
        {
          q: t('Was ist der Semantic Layer?', 'What is the semantic layer?'),
          a: t('Die Schicht, in der jede Kennzahl genau einmal definiert ist. Dashboards, der Agent und MCP lesen dieselbe Definition, deshalb stimmen die Zahlen überall überein.', 'The layer where every KPI is defined exactly once. Dashboards, the agent and MCP read the same definition, which is why the numbers agree everywhere.'),
        },
        {
          q: t('Kann ich Kennzahlen mit anderen teilen?', 'Can I share KPIs with others?'),
          a: t('Ja. Eine KPI-Sammlung teilen Sie lesend mit anderen Spaces: von der Zentrale an die Häuser, von der Agentur an ihre Kunden oder öffentlich mit der Community. Updates kommen bei allen an.', 'Yes. You share a KPI collection read-only with other spaces: from head office to the properties, from an agency to its clients or publicly with the community. Updates reach everyone.'),
        },
      ]),
      closing(t, refs, t('Bringen Sie Ihre erste eigene Kennzahl mit.', 'Bring your first KPI of your own.'), t('In der Demo definieren wir sie gemeinsam.', 'We define it together in the demo.')),
    ],
  )

const governancePage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'governance',
    {
      title: t('Data Governance: Spaces, Rollen, 2FA, Audit-Log', 'Data governance: spaces, roles, 2FA, audit log'),
      description: t(
        'Organisationen und Spaces, fünf Rollen, Zwei-Faktor als Pflicht, Audit-Log und Tokens mit Reichweite. Gästedaten bleiben, wo sie sind.',
        'Organisations and spaces, five roles, two-factor as policy, audit log and scoped tokens. Guest data stays where it is.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: 'Data Governance',
        heading: t('Wer sieht was: klar geregelt.', 'Who sees what: clearly settled.'),
        lead: t(
          'Organisationen, Spaces und fünf Rollen. Zwei-Faktor als Pflicht, Audit-Log für alles.',
          'Organisations, spaces and five roles. Two-factor as policy, an audit log for everything.',
        ),
        illustration: 'governance',
      }),
      steps(
        t,
        t('Struktur, die mit Ihnen wächst', 'A structure that grows with you'),
        t('Ein Haus oder fünfzig: dieselben Regeln.', 'One property or fifty: the same rules.'),
        [
          {
            icon: 'building',
            title: t('Ein Space je Haus', 'One space per property'),
            text: t('Daten, Dashboards und Mitglieder gehören zum Space. Die Organisation darüber verbindet Ihre Häuser.', 'Data, dashboards and members belong to the space. The organisation above connects your properties.'),
          },
          {
            icon: 'users',
            title: t('Rollen vergeben', 'Assign roles'),
            text: t('Owner, Admin, User, Reader, Guest. Wer sehen darf, sieht; wer ändern darf, ändert.', 'Owner, admin, user, reader, guest. Those who may see, see; those who may change, change.'),
          },
          {
            icon: 'eye',
            title: t('Nachvollziehen', 'Trace'),
            text: t('Das Audit-Log hält fest, wer was wann getan hat: Verbindungen, Syncs, Tokens, Mitglieder.', 'The audit log records who did what and when: connections, syncs, tokens, members.'),
          },
        ],
      ),
      cards({
        name: t('Drei Ebenen', 'Three layers'),
        eyebrow: t('Zugang, Schutz, Nachweis', 'Access, protection, proof'),
        heading: t('Drei Ebenen, die zusammenpassen.', 'Three layers that fit together.'),
        layout: 'grid-3',
        cards: [
          { icon: 'users', title: t('Zugang', 'Access'), points: [t('Fünf Rollen je Space', 'Five roles per space'), t('Organisation mit Admins und Mitgliedern', 'Organisation with admins and members'), t('Gäste: nur lesen, nur ausgewählte Dashboards', 'Guests: read only, selected dashboards only')] },
          { icon: 'shield', title: t('Schutz', 'Protection'), points: [t('Zwei-Faktor je Konto, als Pflicht je Space', 'Two-factor per account, as policy per space'), t('Tokens mit Reichweite: ein Space oder mehrere', 'Scoped tokens: one space or several'), t('Service-Accounts für Automatisierung', 'Service accounts for automation')] },
          { icon: 'eye', title: t('Nachweis', 'Proof'), points: [t('Audit-Log, 30 Tage, filterbar nach Bereich', 'Audit log, 30 days, filterable by area'), t('Aktivität je Verbindung', 'Activity per connection'), t('Export der Integrationen als CSV', 'Export of integrations as CSV')] },
        ],
      }),
      story({
        name: t('Mit Partnern', 'With partners'),
        eyebrow: t('Mit Partnern arbeiten', 'Working with partners'),
        heading: t('Agentur, Berater, Zentrale: jeder sieht, was er soll.', 'Agency, consultant, head office: everyone sees what they should.'),
        lead: t(
          'Partner bekommen ihren Platz im Space, ohne Passwörter zu tauschen. Der Verbindungslink holt die Freigabe beim Hotel, nicht bei Ihnen.',
          'Partners get their place in the space without swapping passwords. The connect link gets the authorisation from the hotel, not from you.',
        ),
        illustration: 'team',
        layout: 'visual-right',
        background: 'tinted',
        points: [
          {
            icon: 'plug',
            title: t('Verbindungslink mit Einwilligung', 'Connect link with consent'),
            text: t('Einmal gültig, mit Ablauf, Einwilligung und Hinweis auf personenbezogene Daten.', 'Single use, with expiry, consent and a note on personal data.'),
          },
          {
            icon: 'lock',
            title: t('Gästedaten bleiben im Space', 'Guest data stays in the space'),
            text: t('Der Agent und MCP lesen Kennzahlen, keine Gästelisten.', 'The agent and MCP read KPIs, not guest lists.'),
          },
          {
            icon: 'buildings',
            title: t('Multi-Space-Tokens', 'Multi-space tokens'),
            text: t('Ein Token für die Zentrale oder Agentur, mit Reichweite über die freigegebenen Häuser.', 'One token for head office or the agency, scoped to the released properties.'),
          },
          {
            icon: 'layers',
            title: t('Vorlagen für ein privates Publikum', 'Templates for a private audience'),
            text: t('Vorlagen-Gruppen: Ihre Dashboards nur für Ihre Häuser oder Kunden.', 'Template groups: your dashboards only for your properties or clients.'),
          },
        ],
      }),
      related(t, ['integrations', 'mcp', 'hotel-groups']),
      faq(t, [
        {
          q: t('Wo liegen die Daten?', 'Where is the data stored?'),
          a: t('In einem von Indicate verwalteten Warehouse je Space, getrennt von anderen Kunden. Indicate Data GmbH sitzt in Offenburg, der Vertrag folgt der DSGVO.', 'In a warehouse per space managed by Indicate, separate from other customers. Indicate Data GmbH is based in Offenburg; the contract follows the GDPR.'),
        },
        {
          q: t('Kann ich Zwei-Faktor erzwingen?', 'Can I enforce two-factor?'),
          a: t('Ja. Die Richtlinie „Zwei-Faktor erforderlich“ gilt je Space. Wer sie nicht erfüllt, richtet 2FA beim nächsten Login ein.', 'Yes. The “require two-factor” policy applies per space. Anyone who does not meet it sets up 2FA at the next sign-in.'),
        },
        {
          q: t('Was sieht ein Gast?', 'What does a guest see?'),
          a: t('Nur die Dashboards, die Sie freigeben, nur lesend. Keine Daten, keine Einstellungen, keine Mitglieder.', 'Only the dashboards you release, read only. No data, no settings, no members.'),
        },
      ]),
      closing(t, refs, t('Sprechen wir über Ihre Struktur.', 'Let’s talk about your structure.'), t('Ein Haus oder eine Gruppe: In 30 Minuten steht der Plan.', 'One property or a group: the plan is ready in 30 minutes.')),
    ],
  )

/* ------------------------------------------------------------------ */
/* Solution pages                                                        */
/* ------------------------------------------------------------------ */

const hotelsPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'hotels',
    {
      title: t('Indicate für Hotels', 'Indicate for hotels'),
      description: t(
        'PMS, Kanäle und Kampagnen in einem Datenmodell. Dashboards auf Zuruf, Antworten vom Agenten, Reports nach Zeitplan. Für Ihr Haus.',
        'PMS, channels and campaigns in one data model. Dashboards on request, answers from the agent, reports on a schedule. For your property.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: t('Für Hotels', 'For hotels'),
        heading: t('Ihr Haus in Zahlen, jeden Morgen.', 'Your property in numbers, every morning.'),
        lead: t(
          'PMS, Kanäle und Kampagnen in einem Datenmodell. Fragen stellen, Reports empfangen, Strategie mit Zahlen.',
          'PMS, channels and campaigns in one data model. Ask questions, receive reports, strategy on numbers.',
        ),
        illustration: 'stage',
        demoLabel: t('Demo für Ihr Haus', 'Demo for your property'),
        secondary: { url: '/integrations', label: t('Passt es zu meinem PMS?', 'Does it fit my PMS?') },
      }),
      logos(t),
      cards({
        name: t('Was sich ändert', 'What changes'),
        eyebrow: t('Was sich ändert', 'What changes'),
        heading: t('Drei Fragen, die Sie ab morgen beantworten können.', 'Three questions you can answer from tomorrow.'),
        layout: 'grid-3',
        cards: [
          { icon: 'chart', title: t('Welche Kanäle und Segmente tragen?', 'Which channels and segments carry?'), text: t('Kanalmix, Herkunft und Zimmerkategorie mit ADR und Aufenthaltsdauer, gegen Vorjahr.', 'Channel mix, origin and room category with ADR and length of stay, against last year.') },
          { icon: 'euro', title: t('Hat die Kampagne gebracht, was geplant war?', 'Did the campaign deliver what was planned?'), text: t('Werbekosten aus Google und Meta treffen auf Buchungen und ADR aus dem PMS.', 'Ad spend from Google and Meta meets bookings and ADR from the PMS.') },
          { icon: 'target', title: t('Wo liegt der Plan daneben?', 'Where is the plan off?'), text: t('Zielwerte als Hilfslinie in jedem Widget. Abweichungen sehen Sie, bevor der Monat vorbei ist.', 'Targets as a guide line in every widget. You see deviations before the month is over.') },
        ],
      }),
      story({
        name: t('Dashboard auf Zuruf', 'Dashboard on request'),
        eyebrow: t('Mit KI bauen', 'Build with AI'),
        heading: t('Das Dashboard, das Sie beschreiben.', 'The dashboard you describe.'),
        lead: t(
          'Ein Satz an den Assistenten, und das Board steht: aus den Kennzahlen Ihres PMS, mit Vergleich und Ziel.',
          'One sentence to the assistant and the board is there: from your PMS’s KPIs, with comparison and target.',
        ),
        illustration: 'builder',
        background: 'tinted',
        points: [
          { icon: 'layers', title: t('Fertige Kennzahlen', 'Ready-made KPIs'), text: t('Auslastung, ADR, RevPAR, Pickup, Stornos, Kanalmix: kommen mit dem PMS.', 'Occupancy, ADR, RevPAR, pickup, cancellations, channel mix: come with the PMS.') },
          { icon: 'sparkles', title: t('Ein Satz statt Klickstrecke', 'One sentence, not a click path'), text: t('Der Assistent wählt Widgets und Vergleich, Sie passen per Klick an.', 'The assistant picks widgets and comparison; you adjust with a click.') },
          { icon: 'message', title: t('Fragen statt suchen', 'Ask instead of search'), text: t('„Warum ist der Pickup diese Woche höher?“ Der Agent antwortet mit Quelle.', '“Why is pickup higher this week?” The agent answers with a source.') },
        ],
        links: [internal('/build-with-ai', t('Mehr zum Bauen mit KI', 'More about building with AI'), 'link')],
      }),
      story({
        name: t('Wochenreport', 'Weekly report'),
        eyebrow: 'Flying KPIs',
        heading: t('Der Wochenreport kommt von allein.', 'The weekly report comes on its own.'),
        lead: t(
          'Montag um acht an Geschäftsführung und Eigentümer, mit den drei größten Veränderungen in normalen Worten.',
          'Monday at eight to management and owners, with the three biggest changes in plain words.',
        ),
        illustration: 'flyingKpis',
        points: [
          { icon: 'calendar', title: t('Täglich, wöchentlich, monatlich', 'Daily, weekly, monthly'), text: t('Pickup täglich an die Rezeption, der Abschluss monatlich an den Eigentümer.', 'Pickup daily to the front desk, the close monthly to the owner.') },
          { icon: 'users', title: t('Auch ohne Login', 'Even without a login'), text: t('Beirat und Bank bekommen den Report per E-Mail.', 'Board and bank receive the report by e-mail.') },
          { icon: 'sparkles', title: t('Mit Zusammenfassung', 'With a summary'), text: t('Der Agent schreibt dazu, was sich verändert hat.', 'The agent adds what has changed.') },
        ],
        links: [internal('/flying-kpis', t('Mehr zu Flying KPIs', 'More about Flying KPIs'), 'link')],
      }),
      {
        blockType: 'agentShowcase',
        blockName: t('Agent', 'Agent'),
        header: {
          eyebrow: 'Indicate Agent',
          heading: t('Fragen Sie Ihr Haus.', 'Ask your property.'),
          lead: t('In der App oder in Claude und ChatGPT, mit denselben Rechten.', 'In the app or in Claude and ChatGPT, with the same permissions.'),
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
        points: [],
        channels: [{ name: 'Indicate App' }, { name: 'Claude' }, { name: 'ChatGPT' }],
        links: [internal('/agent', t('Mehr zum Agenten', 'More about the agent'), 'outline')],
        settings: { ...defaults, background: 'tinted' },
      },
      testimonials(t),
      faq(t, [
        {
          q: t('Wie lange dauert es, bis ich erste Zahlen sehe?', 'How long until I see the first numbers?'),
          a: t('Die meisten Anbindungen liefern innerhalb von Minuten erste Daten, die Historie wird nachgeladen. Dashboards für Ihr PMS sind sofort da.', 'Most connections deliver first data within minutes; the history is backfilled. Dashboards for your PMS are ready immediately.'),
        },
        {
          q: t('Brauche ich jemanden, der sich mit Daten auskennt?', 'Do I need someone who knows data?'),
          a: t('Nein. Verbinden, Vorlage wählen oder das Dashboard beschreiben, fertig. Wer tiefer will, bekommt KPI Studio und MCP.', 'No. Connect, pick a template or describe the dashboard, done. Anyone who wants to go deeper gets KPI Studio and MCP.'),
        },
        {
          q: t('Was kostet Indicate für ein Haus?', 'What does Indicate cost for one property?'),
          a: t('Core ab 100 € im Monat, Pro ab 500 €, einmalig 800 € Onboarding. Die KI-Agentin kommt ab 20 € je Nutzer dazu.', 'Core from €100 a month, Pro from €500, a one-off €800 onboarding. The AI agent is added from €20 per user.'),
        },
      ]),
      closing(t, refs, t('Sehen Sie Indicate mit den Zahlen Ihres Hauses.', 'See Indicate with your property’s numbers.'), t('30 Minuten, echte Daten aus einem Haus wie Ihrem.', '30 minutes, real data from a property like yours.'), t('Demo für Ihr Haus', 'Demo for your property')),
    ],
  )

const hotelGroupsPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'hotel-groups',
    {
      title: t('Indicate für Hotelgruppen', 'Indicate for hotel groups'),
      description: t(
        'Ein Space pro Haus, ein Blick für die Zentrale. Vorlagen einmal bauen, Rollen je Haus, Vergleich über alle Häuser, Agent für die ganze Gruppe.',
        'One space per property, one view for head office. Build templates once, roles per property, comparison across all properties, an agent for the whole group.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: t('Für Hotelgruppen', 'For hotel groups'),
        heading: t('Alle Häuser nebeneinander. Ein Login.', 'Every property side by side. One login.'),
        lead: t(
          'Jedes Hotel behält Daten und Rechte, die Zentrale vergleicht alle Häuser mit Plan und Kampagnen.',
          'Every hotel keeps its data and permissions; head office compares all properties with plan and campaigns.',
        ),
        illustration: 'portfolio',
        demoLabel: t('Demo für Ihre Gruppe', 'Demo for your group'),
        secondary: { url: '/governance', label: t('Rollen und Spaces', 'Roles and spaces') },
      }),
      logos(t),
      cards({
        name: t('Was sich ändert', 'What changes'),
        eyebrow: t('Was sich ändert', 'What changes'),
        heading: t('Vier Dinge, die eine Gruppe braucht.', 'Four things a group needs.'),
        layout: 'grid-4',
        cards: [
          { icon: 'buildings', title: t('Ein Space je Haus', 'One space per property'), text: t('Daten, Dashboards und Team gehören zum Haus. Die Organisation darüber gehört Ihnen.', 'Data, dashboards and team belong to the property. The organisation above belongs to you.') },
          { icon: 'chart', title: t('Vergleich in der Zentrale', 'Comparison at head office'), text: t('Auslastung, ADR, Pickup und Plan je Haus nebeneinander, mit einem Klick ins Detail.', 'Occupancy, ADR, pickup and plan per property side by side, one click into the detail.') },
          { icon: 'layers', title: t('Vorlagen einmal bauen', 'Build templates once'), text: t('Das Gruppen-Dashboard als Vorlage, veröffentlicht nur für Ihre Häuser, mit Versionen.', 'The group dashboard as a template, published only to your properties, with versions.') },
          { icon: 'shield', title: t('Rollen je Haus', 'Roles per property'), text: t('Der Direktor sieht sein Haus, die Zentrale alle. 2FA als Pflicht für alle.', 'The manager sees their property, head office sees all. 2FA as policy for everyone.') },
        ],
      }),
      story({
        name: t('Organisation', 'Organisation'),
        eyebrow: 'Data Governance',
        heading: t('Eine Organisation, viele Spaces.', 'One organisation, many spaces.'),
        lead: t(
          'Mitglieder, Rollen und Richtlinien laufen über die Organisation. Ein Token mit Reichweite über alle Häuser versorgt die Zentrale.',
          'Members, roles and policies run through the organisation. One token scoped across all properties serves head office.',
        ),
        illustration: 'governance',
        background: 'tinted',
        points: [
          { icon: 'users', title: t('Mitglieder zentral', 'Members centrally'), text: t('Einmal eingeladen, in den richtigen Häusern mit der richtigen Rolle.', 'Invited once, in the right properties with the right role.') },
          { icon: 'lock', title: t('Richtlinien für alle', 'Policies for all'), text: t('Zwei-Faktor als Pflicht, Audit-Log je Space.', 'Two-factor as policy, an audit log per space.') },
          { icon: 'code', title: t('Multi-Space-Tokens', 'Multi-space tokens'), text: t('Für Ihr Datenteam und für MCP in der Zentrale.', 'For your data team and for MCP at head office.') },
        ],
        links: [internal('/governance', t('Mehr zu Data Governance', 'More about data governance'), 'link')],
      }),
      story({
        name: t('Vorlagen', 'Templates'),
        eyebrow: t('Dashboards & Vorlagen', 'Dashboards & templates'),
        heading: t('Einmal gebaut, für jedes Haus.', 'Built once, for every property.'),
        lead: t(
          'Das Standard-Dashboard der Gruppe wird Vorlage. Jedes Haus bekommt es mit seinen eigenen Quellen, Änderungen kommen als neue Version.',
          'The group’s standard dashboard becomes a template. Every property gets it with its own sources; changes arrive as a new version.',
        ),
        illustration: 'templates',
        points: [
          { icon: 'layers', title: t('Vorlagen-Gruppe', 'Template group'), text: t('Ein privates Publikum: nur Ihre Häuser sehen die Vorlage.', 'A private audience: only your properties see the template.') },
          { icon: 'plug', title: t('Kennzahlen neu zugeordnet', 'KPIs remapped'), text: t('Mews hier, Oracle dort: die Vorlage passt sich der Quelle an.', 'Mews here, Oracle there: the template adapts to the source.') },
          { icon: 'clock', title: t('Versionen mit Protokoll', 'Versions with a changelog'), text: t('Jede Änderung nachvollziehbar, jedes Haus zieht nach, wenn es will.', 'Every change traceable; every property follows when it wants.') },
        ],
        links: [internal('/dashboards', t('Mehr zu Vorlagen', 'More about templates'), 'link')],
      }),
      {
        blockType: 'agentShowcase',
        blockName: t('Agent', 'Agent'),
        header: {
          eyebrow: 'Indicate Agent',
          heading: t('Fragen Sie die ganze Gruppe.', 'Ask the whole group.'),
          lead: t('Der Agent kennt alle Häuser, für die Sie freigeschaltet sind.', 'The agent knows every property you are cleared for.'),
          align: 'center',
        },
        prompts: [
          {
            question: t('Welches Haus liegt im Oktober am weitesten unter Plan?', 'Which property is furthest below plan in October?'),
            answer: t(
              'Bergwald Lodge: 69 % Auslastung gegen 75 % Plan, vor allem unter der Woche. Seeblick und Alpenrose liegen über Plan, Stadthof knapp darunter.',
              'Bergwald Lodge: 69 % occupancy against a 75 % plan, mostly on weekdays. Seeblick and Alpenrose are above plan, Stadthof just below.',
            ),
            chart: 'bars',
            kpiLabel: t('Auslastung Bergwald Lodge, Oktober', 'Bergwald Lodge occupancy, October'),
            kpiValue: '69 %',
            kpiDelta: '−6',
          },
          {
            question: t('Wo hat die Meta-Kampagne der Gruppe am meisten gebracht?', 'Where did the group’s Meta campaign deliver most?'),
            answer: t(
              'In Seeblick: 96 Buchungen bei 1.700 € Werbekosten, 18 € je Buchung. Alpenrose 74 Buchungen, Bergwald 42. Stadthof hatte keine Landingpage, dort kam nichts an.',
              'In Seeblick: 96 bookings on €1,700 ad spend, €18 per booking. Alpenrose 74 bookings, Bergwald 42. Stadthof had no landing page, so nothing arrived there.',
            ),
            chart: 'bars',
            kpiLabel: t('Kosten je Buchung, Seeblick', 'Cost per booking, Seeblick'),
            kpiValue: '18 €',
            kpiDelta: '−5 €',
          },
        ],
        points: [],
        channels: [{ name: 'Indicate App' }, { name: 'Claude' }, { name: 'ChatGPT' }],
        links: [internal('/agent', t('Mehr zum Agenten', 'More about the agent'), 'outline')],
        settings: { ...defaults, background: 'tinted' },
      },
      testimonials(t),
      faq(t, [
        {
          q: t('Wir haben verschiedene PMS in den Häusern. Geht das?', 'Our properties run different PMS. Does that work?'),
          a: t('Ja. Jedes Haus verbindet sein System, die Kennzahlen sind gleich definiert. Der Vergleich in der Zentrale rechnet über alle.', 'Yes. Every property connects its own system; the KPIs are defined the same. The comparison at head office runs across all of them.'),
        },
        {
          q: t('Kann ein Direktor die anderen Häuser sehen?', 'Can a manager see the other properties?'),
          a: t('Nur, wenn Sie ihn dort als Mitglied eintragen. Rollen gelten je Space.', 'Only if you add them there as a member. Roles apply per space.'),
        },
        {
          q: t('Wie kommt ein neues Haus dazu?', 'How do we add a new property?'),
          a: t('Space anlegen, PMS verbinden, Vorlage der Gruppe anwenden. Der Verbindungslink lässt das Haus selbst freigeben.', 'Create the space, connect the PMS, apply the group’s template. The connect link lets the property authorise itself.'),
        },
      ]),
      closing(t, refs, t('Sehen Sie Ihre Gruppe nebeneinander.', 'See your group side by side.'), t('30 Minuten, echte Daten aus einer Gruppe wie Ihrer.', '30 minutes, real data from a group like yours.'), t('Demo für Ihre Gruppe', 'Demo for your group')),
    ],
  )

const agenciesPage = (t: T, refs: Refs): Partial<PageData> =>
  page(
    t,
    'agencies',
    {
      title: t('Indicate für Agenturen und Berater', 'Indicate for agencies and consultants'),
      description: t(
        'Alle Kunden in einem Arbeitsplatz, sauber getrennt. Kampagnen treffen auf Buchungen, Reports laufen von allein, Strategie entsteht gemeinsam.',
        'Every client in one workspace, cleanly separated. Campaigns meet bookings, reports run by themselves, strategy is built together.',
      ),
    },
    [
      hero(t, refs, {
        eyebrow: t('Für Agenturen & Berater', 'For agencies & consultants'),
        heading: t('Alle Kunden, ein Arbeitsplatz, messbare Wirkung.', 'Every client, one workspace, measurable results.'),
        lead: t(
          'Kampagnen treffen auf Buchungen aus dem PMS. Reports laufen von allein, Strategie entsteht gemeinsam mit dem Kunden.',
          'Campaigns meet bookings from the PMS. Reports run by themselves; strategy is built together with the client.',
        ),
        illustration: 'campaigns',
        demoLabel: t('Demo für Agenturen', 'Demo for agencies'),
        secondary: { url: '/integrations', label: t('Anbindungen ansehen', 'See the connections') },
      }),
      cards({
        name: t('Was sich ändert', 'What changes'),
        eyebrow: t('Was sich ändert', 'What changes'),
        heading: t('Vier Dinge, die eine Agentur braucht.', 'Four things an agency needs.'),
        layout: 'grid-4',
        cards: [
          { icon: 'briefcase', title: t('Mandantenfähig', 'Multi-tenant'), text: t('Ein Space je Kunde, ein Login für Sie. Rollen bis zum Owner, Zwei-Faktor.', 'One space per client, one login for you. Roles up to owner, two-factor.') },
          { icon: 'euro', title: t('Umsatz je Kampagne', 'Revenue per campaign'), text: t('Google Ads, Meta und Newsletter gegen Buchungen, ADR und Stornos aus dem PMS.', 'Google Ads, Meta and newsletter against bookings, ADR and cancellations from the PMS.') },
          { icon: 'calendar', title: t('Reports im Kunden-Branding', 'Reports in the client’s branding'), text: t('Monatsreports gehen von allein raus, in den Farben des Kunden.', 'Monthly reports go out by themselves, in the client’s colours.') },
          { icon: 'users', title: t('Strategie gemeinsam', 'Strategy together'), text: t('Kunde und Agentur sehen dasselbe Dashboard. Entscheidungen bleiben dokumentiert.', 'Client and agency see the same dashboard. Decisions stay on record.') },
        ],
      }),
      story({
        name: t('Verbindungslink', 'Connect link'),
        eyebrow: t('Integrationen', 'Integrations'),
        heading: t('Der Kunde gibt frei. Sie sehen kein Passwort.', 'The client authorises. You never see a password.'),
        lead: t(
          'Der Verbindungslink geht an den Kunden, der sein PMS oder Google-Konto selbst freigibt. Mit Einwilligung, Ablauf und Widerruf.',
          'The connect link goes to the client, who authorises their PMS or Google account themselves. With consent, expiry and revocation.',
        ),
        illustration: 'sync',
        background: 'tinted',
        points: [
          { icon: 'plug', title: t('Einmal gültig', 'Single use'), text: t('Per E-Mail versendet, mit Ablaufdatum, jederzeit widerrufbar.', 'Sent by e-mail, with an expiry date, revocable at any time.') },
          { icon: 'shield', title: t('Einwilligung dokumentiert', 'Consent on record'), text: t('Der Kunde bestätigt, was verbunden wird und ob personenbezogene Daten dabei sind.', 'The client confirms what is connected and whether personal data is involved.') },
          { icon: 'clock', title: t('Sync nach Zeitplan', 'Sync on schedule'), text: t('Stündlich bis täglich, mit Aktivität und Gesundheit je Verbindung.', 'Hourly to daily, with activity and health per connection.') },
        ],
        links: [internal('/integrations', t('Mehr zu Integrationen', 'More about integrations'), 'link')],
      }),
      story({
        name: t('Monatsreport', 'Monthly report'),
        eyebrow: 'Flying KPIs',
        heading: t('Zwölf Kunden, ein Monatsreport, null Handarbeit.', 'Twelve clients, one monthly report, zero manual work.'),
        lead: t(
          'Jeder Kunde bekommt sein Dashboard am Ersten per E-Mail, in seinen Farben, mit der Zusammenfassung vom Agenten.',
          'Every client gets their dashboard on the first by e-mail, in their colours, with the agent’s summary.',
        ),
        illustration: 'flyingKpis',
        points: [
          { icon: 'layers', title: t('Eine Vorlage für alle', 'One template for all'), text: t('Das Kampagnen-Dashboard als Vorlage, je Kunde mit seinen Quellen.', 'The campaign dashboard as a template, per client with their sources.') },
          { icon: 'palette', title: t('Im Branding des Kunden', 'In the client’s branding'), text: t('Logo und Palette je Space.', 'Logo and palette per space.') },
          { icon: 'sparkles', title: t('Mit Zusammenfassung', 'With a summary'), text: t('Der Agent schreibt die drei größten Veränderungen dazu.', 'The agent adds the three biggest changes.') },
        ],
        links: [internal('/flying-kpis', t('Mehr zu Flying KPIs', 'More about Flying KPIs'), 'link')],
      }),
      {
        blockType: 'agentShowcase',
        blockName: t('Agent', 'Agent'),
        header: {
          eyebrow: 'Indicate Agent',
          heading: t('Fragen Sie für jeden Kunden.', 'Ask for every client.'),
          lead: t('In der App oder in Claude und ChatGPT, mit den Rechten Ihres Tokens.', 'In the app or in Claude and ChatGPT, with your token’s permissions.'),
          align: 'center',
        },
        prompts: [
          {
            question: t('Hat die Sommerkampagne auf Meta für Hotel Alpenrose gebracht, was wir geplant hatten?', 'Did the summer campaign on Meta for Hotel Alpenrose deliver what we planned?'),
            answer: t(
              'Fast: 212 Buchungen statt 240 geplant, dafür mit 168 € ADR über Plan. Die Lücke liegt in KW 29 bis 31, dort lief keine Anzeige.',
              'Almost: 212 bookings against 240 planned, but with an ADR of €168 above plan. The gap sits in weeks 29 to 31, when no ad was running.',
            ),
            chart: 'line',
            kpiLabel: t('Buchungen Sommerkampagne Meta', 'Bookings, summer campaign on Meta'),
            kpiValue: '212',
            kpiDelta: '−28',
          },
          {
            question: t('Welcher Kunde hat im Oktober keine laufende Kampagne?', 'Which client has no campaign running in October?'),
            answer: t(
              'Seeblick Resort und Bergwald Lodge. Bei Seeblick endete die Herbstkampagne am 28. September, bei Bergwald ist keine geplant. Beide liegen im Oktober unter Plan.',
              'Seeblick Resort and Bergwald Lodge. Seeblick’s autumn campaign ended on 28 September; Bergwald has none planned. Both are below plan in October.',
            ),
            chart: 'bars',
            kpiLabel: t('Kunden ohne Kampagne, Oktober', 'Clients without a campaign, October'),
            kpiValue: '2',
            kpiDelta: '+2',
          },
        ],
        points: [],
        channels: [{ name: 'Indicate App' }, { name: 'Claude' }, { name: 'ChatGPT' }],
        links: [internal('/agent', t('Mehr zum Agenten', 'More about the agent'), 'outline')],
        settings: { ...defaults, background: 'tinted' },
      },
      faq(t, [
        {
          q: t('Wie viele Kunden kann ich anlegen?', 'How many clients can I set up?'),
          a: t('So viele Sie betreuen. Jeder Kunde ist ein Space, Sie wechseln mit einem Klick. Die Abrechnung läuft je Space oder über Ihre Organisation.', 'As many as you look after. Every client is a space; you switch with one click. Billing runs per space or through your organisation.'),
        },
        {
          q: t('Sieht der Kunde, was ich sehe?', 'Does the client see what I see?'),
          a: t('Wenn Sie ihn einladen, ja: dasselbe Dashboard, dieselben Zahlen. Rollen bestimmen, wer ändern darf.', 'If you invite them, yes: the same dashboard, the same numbers. Roles decide who may change things.'),
        },
        {
          q: t('Kann ich Indicate als Teil meiner Leistung anbieten?', 'Can I offer Indicate as part of my service?'),
          a: t('Ja. Viele Agenturen liefern Reporting und Strategie auf Indicate. Sprechen Sie mit uns über Partnerkonditionen.', 'Yes. Many agencies deliver reporting and strategy on Indicate. Talk to us about partner terms.'),
        },
      ]),
      closing(t, refs, t('Nehmen Sie einen Kunden mit in die Demo.', 'Bring one client to the demo.'), t('30 Minuten, echte Kampagnen- und PMS-Daten.', '30 minutes, real campaign and PMS data.'), t('Demo für Agenturen', 'Demo for agencies')),
    ],
  )

/** Every product and solution page, keyed by slug. */
export const subpages = (t: T, refs: Refs): Record<SubpageSlug, Partial<PageData>> => ({
  agent: agentPage(t, refs),
  mcp: mcpPage(t, refs),
  'build-with-ai': buildWithAiPage(t, refs),
  integrations: integrationsPage(t, refs),
  'kpi-studio': kpiStudioPage(t, refs),
  governance: governancePage(t, refs),
  dashboards: dashboardsPage(t, refs),
  'flying-kpis': flyingKpisPage(t, refs),
  hotels: hotelsPage(t, refs),
  'hotel-groups': hotelGroupsPage(t, refs),
  agencies: agenciesPage(t, refs),
})
