import type { Page } from '@/payload-types'

import type { Refs, T } from './content'
import { cards, closing, hero, logos, story, testimonials } from './pages'

type PageData = Omit<Page, 'id' | 'createdAt' | 'updatedAt' | 'sizes'>

/**
 * "Über uns": why Indicate exists and how we work, told through hospitality focus, German
 * engineering under GDPR and a direct line to the people who build the product.
 */
export const aboutPage = (t: T, refs: Refs): Partial<PageData> => ({
  title: t('Über uns', 'About us'),
  slug: 'about',
  _status: 'published',
  hero: { type: 'none' },
  seo: {
    title: t('Über Indicate: Agentic Analytics aus Offenburg', 'About Indicate: agentic analytics from Offenburg'),
    description: t(
      'Indicate baut Analytics für Hotels, Hotelgruppen und ihre Agenturen. Entwickelt in Deutschland, betrieben nach DSGVO, mit direktem Draht zum Team.',
      'Indicate builds analytics for hotels, hotel groups and their agencies. Built in Germany, run under GDPR, with a direct line to the team.',
    ),
  },
  layout: [
    hero(t, refs, {
      eyebrow: t('Über Indicate', 'About Indicate'),
      heading: t('Wir bauen die Zahlenbasis der Hotellerie.', 'We build the numbers hospitality runs on.'),
      lead: t('Ein Datenmodell für PMS, Vertrieb und Marketing, und Antworten, die jeder im Haus versteht.', 'One data model for PMS, distribution and marketing, and answers everyone in the hotel understands.'),
      illustration: 'stage',
      secondary: { url: '/contact', label: t('Kontakt aufnehmen', 'Get in touch') },
    }),
    {
      blockType: 'pillars',
      blockName: t('Was uns antreibt', 'What drives us'),
      header: {
        eyebrow: t('Was uns antreibt', 'What drives us'),
        heading: t('Vier Dinge, an denen wir jede Entscheidung messen.', 'Four things we measure every decision against.'),
        align: 'left',
      },
      pillars: [
        { icon: 'check', title: t('Zahlen, denen man trauen kann', 'Numbers you can trust'), text: t('Jede Kennzahl hat eine Definition, eine Quelle und eine Version. Wer eine Zahl sieht, kann nachlesen, woher sie kommt.', 'Every KPI has a definition, a source and a version. Anyone who sees a number can read where it comes from.') },
        { icon: 'message', title: t('Antworten in normaler Sprache', 'Answers in plain language'), text: t('Analytics soll nicht nur Analysten dienen. Fragen, Dashboards und Reports funktionieren für alle im Haus.', 'Analytics should not be for analysts only. Questions, dashboards and reports work for everyone in the hotel.') },
        { icon: 'shield', title: t('Ihre Daten bleiben Ihre Daten', 'Your data stays your data'), text: t('Gastdaten verlassen Indicate nur, wenn Sie es ausdrücklich freigeben. Rollen, 2FA und Audit-Log sind Standard.', 'Guest data leaves Indicate only when you explicitly release it. Roles, 2FA and an audit log come as standard.') },
        { icon: 'building', title: t('Mit Hotels gebaut', 'Built with hotels'), text: t('Jede Funktion entsteht aus dem Alltag von Hotels, Hotelgruppen und ihren Agenturen, nicht aus einer Roadmap am Whiteboard.', 'Every feature comes from the daily work of hotels, hotel groups and their agencies, not from a whiteboard roadmap.') },
      ],
      tiles: [],
      settings: { background: 'tinted', spacing: 'default' },
    },
    story({
      name: t('Aus der Hotellerie', 'From hospitality'),
      eyebrow: t('Fokus', 'Focus'),
      heading: t('Eine Branche, in der Tiefe.', 'One industry, in depth.'),
      lead: t('Indicate kennt PMS, Channel-Manager, Gästekommunikation und Kampagnen. Deshalb sind Kennzahlen am ersten Tag fertig und nicht ein Projekt.', 'Indicate knows PMS, channel managers, guest communication and campaigns. That is why KPIs are ready on day one instead of being a project.'),
      illustration: 'sources',
      points: [
        { icon: 'bed', title: t('Hotels', 'Hotels'), text: t('Auslastung, ADR, Kanäle und Kampagnen in einem Bild.', 'Occupancy, ADR, channels and campaigns in one picture.') },
        { icon: 'buildings', title: t('Hotelgruppen', 'Hotel groups'), text: t('Alle Häuser nebeneinander, ein Login, ein Standard.', 'Every property side by side, one login, one standard.') },
        { icon: 'briefcase', title: t('Agenturen & Berater', 'Agencies & consultants'), text: t('Alle Kunden in einem Arbeitsplatz, Routine automatisiert.', 'Every client in one workspace, routine automated.') },
      ],
    }),
    story({
      name: t('Entwickelt in Deutschland', 'Built in Germany'),
      eyebrow: t('Herkunft', 'Origin'),
      heading: t('Entwickelt in Offenburg. Betrieben nach DSGVO.', 'Built in Offenburg. Run under GDPR.'),
      lead: t('Indicate Data ist eine GmbH mit Sitz in Baden-Württemberg. Verträge, Support und Datenschutz sprechen Ihre Sprache.', 'Indicate Data is a German company based in Baden-Württemberg. Contracts, support and data protection speak your language.'),
      illustration: 'governance',
      background: 'tinted',
      points: [
        { icon: 'lock', title: t('DSGVO ab Werk', 'GDPR by default'), text: t('Auftragsverarbeitung, Löschkonzepte und Rollen sind Teil des Produkts.', 'Processing agreements, deletion rules and roles are part of the product.') },
        { icon: 'globe', title: t('Deutsch und Englisch', 'German and English'), text: t('App, Dokumentation und Support in beiden Sprachen.', 'App, documentation and support in both languages.') },
        { icon: 'eye', title: t('Nachvollziehbar', 'Traceable'), text: t('Audit-Log und Versionen zeigen, wer was wann geändert hat.', 'Audit log and versions show who changed what and when.') },
      ],
      links: [{ link: { type: 'custom', url: '/governance', label: t('Mehr zu Data Governance', 'More about data governance'), appearance: 'link' } }],
    }),
    logos(t),
    cards({
      name: t('So arbeiten wir mit Ihnen', 'How we work with you'),
      eyebrow: t('Zusammenarbeit', 'Working together'),
      heading: t('Direkter Draht statt Ticketnummer.', 'A direct line instead of a ticket number.'),
      lead: t('Sie sprechen mit den Menschen, die Indicate bauen. Das prägt, wie wir Onboarding, Support und Roadmap organisieren.', 'You talk to the people who build Indicate. That shapes how we run onboarding, support and the roadmap.'),
      layout: 'grid-4',
      cards: [
        { icon: 'upload', title: t('Onboarding mit Ihren Daten', 'Onboarding with your data'), text: t('Wir verbinden Ihre Systeme gemeinsam und prüfen die ersten Kennzahlen mit Ihnen.', 'We connect your systems together and check the first KPIs with you.') },
        { icon: 'message', title: t('Support, der antwortet', 'Support that answers'), text: t('Fragen landen bei Menschen, die das Produkt kennen, nicht in einer Warteschlange.', 'Questions reach people who know the product, not a queue.') },
        { icon: 'target', title: t('Roadmap aus der Praxis', 'Roadmap from practice'), text: t('Was Hotels und Agenturen brauchen, entscheidet, was als Nächstes kommt.', 'What hotels and agencies need decides what comes next.') },
        { icon: 'users', title: t('Partner statt Anbieter', 'Partner, not vendor'), text: t('Wir arbeiten mit Agenturen und Softwarepartnern, damit Ihre Daten dort ankommen, wo Sie sie brauchen.', 'We work with agencies and software partners so your data arrives where you need it.') },
      ],
    }),
    testimonials(t),
    closing(
      t,
      refs,
      t('Lernen Sie Indicate kennen.', 'Get to know Indicate.'),
      t('Eine halbe Stunde mit Ihren Zahlen sagt mehr als jede Seite über uns.', 'Half an hour with your numbers says more than any page about us.'),
      undefined,
      // Only the label is localised in the link field, so the URL is the same one the footer
      // already uses for both languages (indicate-data.io/de/jobs serves the careers page).
      { url: 'https://indicate-data.io/de/jobs', label: t('Karriere', 'Careers'), external: true },
    ),
  ],
})
