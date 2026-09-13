import type { Integration } from './types'

const mark = (file: string) => `/integrations/${file}`

/**
 * The static connector catalogue: every integration the Indicate app ships (names and marks
 * match `src/assets/integration` in indicate-web). Replaced by the marketplace endpoint later;
 * until then this is the single place to add or edit a connector.
 */
export const catalog: Integration[] = [
  // PMS & hotel software
  {
    slug: 'mews',
    name: 'Mews',
    category: 'pms',
    description: {
      de: 'Reservierungen, Gäste, Zahlungen, Raten, Verfügbarkeit und Services aus dem Cloud-PMS.',
      en: 'Reservations, customers, payments, rates, availability and services from the cloud PMS.',
    },
    aliases: ['mews pms'],
    logo: mark('mews.webp'),
    status: 'available',
    featured: true,
  },
  {
    slug: 'oracle',
    name: 'Oracle Hospitality',
    category: 'pms',
    description: {
      de: 'OPERA Cloud: Reservierungen, Auslastung, ADR und RevPAR für Einzelhäuser und Gruppen.',
      en: 'OPERA Cloud: reservations, occupancy, ADR and RevPAR for single properties and groups.',
    },
    aliases: ['opera', 'opera cloud', 'oracle opera'],
    logo: mark('oracle.svg'),
    status: 'on-request',
  },
  {
    slug: 'elite_pms',
    name: 'elite PMS',
    category: 'pms',
    description: {
      de: 'Reservierungen, Aufenthalte, Gäste und Leistungen aus dem elite PMS, automatisch per Export.',
      en: 'Reservations, stays, guests and services from the elite PMS, automatically via export.',
    },
    aliases: ['elite', 'elite solutions', 'elite hotelsoftware'],
    logo: mark('elite_pms.png'),
    status: 'available',
    featured: true,
  },
  {
    slug: 'apaleo',
    name: 'apaleo',
    category: 'pms',
    description: {
      de: 'Verfügbarkeit und Belegung je Kategorie, täglich festgehalten für Pickup und Buchungstempo.',
      en: 'Availability and occupancy per unit group, snapshotted daily for pickup and booking pace.',
    },
    logo: mark('apaleo.png'),
    status: 'available',
  },
  {
    slug: 'asa_hotelsoftware',
    name: 'ASA Hotelsoftware',
    category: 'pms',
    description: {
      de: 'Tagesumsätze, Umsatzarten, Reservierungen und Buchungsvorschau, automatisch per Export.',
      en: 'Daily sales, turnover breakdowns, reservations and booking previews, automatically via export.',
    },
    aliases: ['asa'],
    logo: mark('asa_hotelsoftware.svg'),
    status: 'available',
  },
  {
    slug: 'shiji',
    name: 'Shiji',
    category: 'pms',
    description: {
      de: 'Reservierungen und Umsätze aus Shiji Enterprise Platform und Infrasys.',
      en: 'Reservations and revenue from the Shiji Enterprise Platform and Infrasys.',
    },
    aliases: ['shiji sep', 'shiji enterprise platform'],
    logo: mark('shiji.png'),
    status: 'on-request',
  },
  {
    slug: 'front_office_cloud',
    name: 'Front Office Cloud',
    category: 'pms',
    description: {
      de: 'Buchungsprognosen, Auslastung, Umsatzberichte und Gästeanalysen aus FrontOffice Cloud.',
      en: 'Booking forecasts, occupancy, turnover reports and guest analytics from FrontOffice Cloud.',
    },
    aliases: ['foc', 'frontoffice cloud', 'sitec'],
    logo: mark('front_office_cloud.png'),
    status: 'available',
  },

  {
    slug: 'familotel',
    name: 'FAMILOTEL',
    category: 'pms',
    description: {
      de: 'Reservierungen, Gäste, Preise und Verfügbarkeit der Familotel-Mitgliedshäuser.',
      en: 'Reservations, guests, pricing and availability of Familotel member properties.',
    },
    logo: mark('familotel.svg'),
    status: 'available',
  },
  {
    slug: 'simplify_hospitality',
    name: 'simplify hospitality',
    category: 'pms',
    description: {
      de: 'Reservierungen und Umsätze aus simplify, dem PMS für Ferienhotellerie.',
      en: 'Reservations and revenue from simplify, the PMS for leisure hotels.',
    },
    aliases: ['simplify'],
    status: 'on-request',
  },

  // Sales & guests
  {
    slug: 're_guest',
    name: 'Re:Guest',
    category: 'sales',
    description: {
      de: 'Anfragen, Antworten, Angebote und Abschlussquote aus CRM und Gästekommunikation.',
      en: 'Requests, replies, offers and conversion from the CRM and guest communication.',
    },
    aliases: ['reguest', 're:guest crm', 're:guest communication'],
    logo: mark('re_guest.png'),
    status: 'available',
    featured: true,
  },
  {
    slug: 'vioma_ota',
    name: 'vioma OTA',
    category: 'sales',
    description: {
      de: 'Buchungen, Preise und Verfügbarkeit je Zimmertyp aus der vioma Buchungsstrecke, mit Verlauf.',
      en: 'Bookings, prices and room-type availability from the vioma booking engine, with history.',
    },
    aliases: ['vioma', 'vioma availability'],
    logo: mark('vioma_ota.svg'),
    status: 'available',
  },
  {
    slug: 'customer_alliance',
    name: 'Customer Alliance',
    category: 'sales',
    description: {
      de: 'Bewertungen, Bewertungsstatistiken und Portal-Leistung aus dem Review-Management.',
      en: 'Reviews, review statistics and portal performance from the review management platform.',
    },
    logo: mark('customer_alliance.png'),
    status: 'available',
  },
  {
    slug: 'hubspot',
    name: 'HubSpot',
    category: 'sales',
    description: {
      de: 'Kontakte, Deals und Pipeline aus dem HubSpot CRM.',
      en: 'Contacts, deals and pipeline from the HubSpot CRM.',
    },
    aliases: ['hubspot crm'],
    logo: mark('hubspot.svg'),
    status: 'available',
  },
  {
    slug: 'pipedrive',
    name: 'Pipedrive',
    category: 'sales',
    description: {
      de: 'Deals, Aktivitäten, Organisationen, Personen, Pipelines und Phasen.',
      en: 'Deals, activities, organisations, persons, pipelines and stages.',
    },
    logo: mark('pipedrive.svg'),
    status: 'available',
  },
  {
    slug: 'inxmail',
    name: 'Inxmail',
    category: 'sales',
    description: {
      de: 'Mailings, Versand- und Klickstatistiken, Listen, Bounces und Abmeldungen.',
      en: 'Mailings, sending and click statistics, lists, bounces and unsubscribes.',
    },
    logo: mark('inxmail.png'),
    status: 'available',
  },
  {
    slug: 'sendgrid',
    name: 'SendGrid',
    category: 'sales',
    description: {
      de: 'Kontakte, Listen, Kampagnen und Statistiken, Bounces und Sperrlisten.',
      en: 'Contacts, lists, campaigns and stats, bounces and suppression lists.',
    },
    logo: mark('sendgrid.svg'),
    status: 'available',
  },

  // Marketing & ads
  {
    slug: 'google_ads',
    name: 'Google Ads',
    category: 'marketing',
    description: {
      de: 'Kampagnen, Kosten, Klicks und Conversions, gegen Buchungen und ADR aus dem PMS.',
      en: 'Campaigns, cost, clicks and conversions, against bookings and ADR from the PMS.',
    },
    aliases: ['adwords', 'google adwords', 'sea'],
    logo: mark('google_ads.webp'),
    status: 'available',
    featured: true,
  },
  {
    slug: 'meta_ads',
    name: 'Meta Ads',
    category: 'marketing',
    description: {
      de: 'Kampagnen, Anzeigengruppen, Kosten und Conversions aus Facebook- und Instagram-Anzeigen.',
      en: 'Campaigns, ad sets, spend and conversions from Facebook and Instagram ads.',
    },
    aliases: ['facebook ads', 'facebook marketing', 'instagram ads', 'meta'],
    logo: mark('meta_ads.svg'),
    status: 'available',
    featured: true,
  },
  {
    slug: 'microsoft_advertising',
    name: 'Microsoft Advertising',
    category: 'marketing',
    description: {
      de: 'Kampagnen, Anzeigengruppen, Keywords, Kosten und Conversions aus Bing Ads.',
      en: 'Campaigns, ad groups, keywords, cost and conversions from Bing Ads.',
    },
    aliases: ['bing ads', 'bing'],
    logo: mark('microsoft_advertising.svg'),
    status: 'available',
  },
  {
    slug: 'pinterest',
    name: 'Pinterest Ads',
    category: 'marketing',
    description: {
      de: 'Kampagnen, Kosten, Klicks und Impressionen aus Pinterest Ads.',
      en: 'Campaigns, cost, clicks and impressions from Pinterest Ads.',
    },
    aliases: ['pinterest'],
    logo: mark('pinterest.png'),
    status: 'available',
  },

  // Web & social
  {
    slug: 'google_analytics',
    name: 'Google Analytics 4',
    category: 'web',
    description: {
      de: 'Nutzer, Sitzungen, Quellen, Ereignisse und Conversions Ihrer Website.',
      en: 'Users, sessions, sources, events and conversions of your website.',
    },
    aliases: ['ga4', 'google analytics', 'analytics'],
    logo: mark('google_analytics.svg'),
    status: 'available',
    featured: true,
  },
  {
    slug: 'google_search_console',
    name: 'Google Search Console',
    category: 'web',
    description: {
      de: 'Suchanfragen, Impressionen, Klicks und Positionen in der Google-Suche.',
      en: 'Queries, impressions, clicks and positions in Google Search.',
    },
    aliases: ['search console', 'seo'],
    logo: mark('google_search_console.png'),
    status: 'available',
  },
  {
    slug: 'google_pagespeed_insights',
    name: 'Google PageSpeed Insights',
    category: 'web',
    description: {
      de: 'Lighthouse-Werte und Core Web Vitals Ihrer Seiten, mobil und Desktop.',
      en: 'Lighthouse scores and Core Web Vitals of your pages, mobile and desktop.',
    },
    aliases: ['pagespeed', 'core web vitals'],
    logo: mark('google_pagespeed_insights.svg'),
    status: 'available',
  },
  {
    slug: 'matomo',
    name: 'Matomo',
    category: 'web',
    description: {
      de: 'Besucher, Seiten, Verweildauer und Aktionen aus der Open-Source-Web-Analyse.',
      en: 'Visitors, pages, time on page and actions from the open-source web analytics.',
    },
    aliases: ['matomo analytics'],
    logo: mark('matomo.svg'),
    status: 'available',
  },
  {
    slug: 'instagram_business',
    name: 'Instagram',
    category: 'web',
    description: {
      de: 'Reichweite, Impressionen, Interaktionen und Zielgruppe Ihres Business-Kontos.',
      en: 'Reach, impressions, interactions and audience of your business account.',
    },
    aliases: ['instagram business'],
    logo: mark('instagram_business.svg'),
    status: 'available',
  },
  {
    slug: 'facebook_pages',
    name: 'Facebook Pages',
    category: 'web',
    description: {
      de: 'Interaktionen, Reichweite, Reaktionen und Beitragsstatistiken Ihrer Facebook-Seite.',
      en: 'Page interactions, reach, reactions and post analytics of your Facebook page.',
    },
    aliases: ['facebook seite'],
    logo: mark('facebook_pages.svg'),
    status: 'available',
  },
  {
    slug: 'youtube_analytics',
    name: 'YouTube Analytics',
    category: 'web',
    description: {
      de: 'Aufrufe, Wiedergabezeit, Abonnenten und Zugriffsquellen Ihres Kanals.',
      en: 'Views, watch time, subscribers and traffic sources of your channel.',
    },
    aliases: ['yt', 'youtube'],
    logo: mark('yt.png'),
    status: 'available',
  },

  // Operations
  {
    slug: 'gastromatic',
    name: 'gastromatic',
    category: 'operations',
    description: {
      de: 'Mitarbeitende, Einsätze, Zeiterfassung und Abwesenheiten aus der Personalplanung.',
      en: 'Employees, assignments, time tracking and absences from workforce planning.',
    },
    logo: mark('gastromatic.svg'),
    status: 'available',
  },
  {
    slug: 'passcreator',
    name: 'Passcreator',
    category: 'operations',
    description: {
      de: 'Wallet-Pass-Vorlagen, ausgegebene Pässe und ihre Nutzung im Zeitverlauf.',
      en: 'Wallet pass templates, issued passes and their usage over time.',
    },
    logo: mark('passcreator.webp'),
    status: 'available',
  },
  {
    slug: 'schulferien',
    name: 'Schulferien',
    category: 'operations',
    description: {
      de: 'Schulferien aller 16 Bundesländer als Dimension für jede Kennzahl.',
      en: 'School holidays of all 16 German states as a dimension for any KPI.',
    },
    aliases: ['ferien', 'school holidays'],
    logo: mark('schulferien.svg'),
    status: 'available',
  },
  {
    slug: 'bundesapi',
    name: 'Feiertage',
    category: 'operations',
    description: {
      de: 'Gesetzliche Feiertage bundesweit und je Bundesland, für Vergleiche wie-für-wie.',
      en: 'Public holidays nationwide and per German state, for like-for-like comparisons.',
    },
    aliases: ['bundesapi', 'public holidays', 'holidays'],
    logo: mark('bundesapi.jpg'),
    status: 'available',
  },

  // Data & import
  {
    slug: 'csv',
    name: 'CSV Import',
    category: 'data',
    description: {
      de: 'Budgets, Events, Listen: alles, was kein System hat, als Datei hochladen.',
      en: 'Budgets, events, lists: upload anything that has no system as a file.',
    },
    aliases: ['excel', 'upload', 'import', 'spreadsheet'],
    status: 'available',
  },
  {
    slug: 'github',
    name: 'GitHub',
    category: 'data',
    description: {
      de: 'Commits, Issues, Pull Requests und Aktivität Ihrer Repositories.',
      en: 'Commits, issues, pull requests and activity of your repositories.',
    },
    logo: mark('github.svg'),
    status: 'available',
  },
]
