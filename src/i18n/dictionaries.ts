import type { Locale } from './config'

/** UI strings that are not editable in the CMS (chrome, accessibility, system pages). */
const de = {
  skipToContent: 'Zum Inhalt springen',
  menu: 'Menü',
  openMenu: 'Menü öffnen',
  closeMenu: 'Menü schließen',
  mainNavigation: 'Hauptnavigation',
  footerNavigation: 'Fußzeile',
  language: 'Sprache',
  search: 'Suche',
  searchPlaceholder: 'Suchbegriff eingeben',
  noResults: 'Keine Ergebnisse gefunden.',
  posts: 'Blog',
  allPosts: 'Alle Beiträge',
  readMore: 'Weiterlesen',
  notFoundTitle: 'Diese Seite gibt es nicht.',
  notFoundText: 'Der Link ist veraltet oder die Adresse wurde falsch eingegeben.',
  backHome: 'Zur Startseite',
  previousPage: 'Vorherige Seite',
  nextPage: 'Nächste Seite',
  showing: 'Zeige',
  of: 'von',
  yourHotelData: 'Ihre Hoteldaten',
}

const en: typeof de = {
  skipToContent: 'Skip to content',
  menu: 'Menu',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  mainNavigation: 'Main navigation',
  footerNavigation: 'Footer',
  language: 'Language',
  search: 'Search',
  searchPlaceholder: 'Type to search',
  noResults: 'No results found.',
  posts: 'Blog',
  allPosts: 'All posts',
  readMore: 'Read more',
  notFoundTitle: 'This page does not exist.',
  notFoundText: 'The link is outdated or the address was mistyped.',
  backHome: 'Back to the home page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  showing: 'Showing',
  of: 'of',
  yourHotelData: 'Your hotel data',
}

export type Dictionary = typeof de

const dictionaries: Record<Locale, Dictionary> = { de, en }

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale]
