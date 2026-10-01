import type { Locale } from '@/i18n/config'

type Role = { title: string; focus: string }

type CareersCopy = {
  title: string
  roles: [Role, Role, Role]
  you: string
  application: string
  /** The application steps from the jobs page, in order. */
  steps: [string, string, string, string, string]
  start: { title: string; place: string; welcome: [string, string, string]; buddy: string }
  /** Four of the benefits; the first three light, one per exchange. */
  benefits: [string, string, string, string]
}

const de: CareersCopy = {
  title:
    'Deine Bewerbung bei Indicate: API Developer, Developer und Praktikum links; deine Bewerbung läuft durch Bewerbung, Kennenlernen, Meet the team, Angebot und Dein Start; rechts dein Start in Offenburg mit Buddy, flexiblen Arbeitszeiten, Equipment deiner Wahl, Teamevents und unbefristetem Vertrag',
  roles: [
    { title: 'API Developer', focus: 'Schnittstellen & Sync' },
    { title: 'Developer', focus: 'Produkt & Dashboards' },
    { title: 'Praktikum', focus: 'Daten & Kennzahlen' },
  ],
  you: 'Du',
  application: 'Deine Bewerbung',
  steps: ['Bewerbung', 'Erstes Kennenlernen', 'Meet the team', 'Angebot', 'Dein Start'],
  start: {
    title: 'Dein Start bei Indicate',
    place: 'Büro in Offenburg',
    welcome: ['Willkommen im Team, API Developer!', 'Willkommen im Team, Developer!', 'Willkommen zum Praktikum!'],
    buddy: 'Dein Buddy fürs Onboarding wartet schon.',
  },
  benefits: [
    'Flexible Arbeitszeiten',
    'Fancy Equipment',
    'Teamevents',
    'Unbefristeter Vertrag',
  ],
}

const en: CareersCopy = {
  title:
    'Applying to Indicate: API developer, developer and internship on the left; your application runs through applying, first chat, meet the team, offer and your start; on the right your start in Offenburg with a buddy, flexible hours, equipment of your choice, team events and a permanent contract',
  roles: [
    { title: 'API developer', focus: 'Interfaces & sync' },
    { title: 'Developer', focus: 'Product & dashboards' },
    { title: 'Internship', focus: 'Data & KPIs' },
  ],
  you: 'You',
  application: 'Your application',
  steps: ['Application', 'First chat', 'Meet the team', 'Offer', 'Your start'],
  start: {
    title: 'Your start at Indicate',
    place: 'Office in Offenburg',
    welcome: ['Welcome to the team, API developer!', 'Welcome to the team, developer!', 'Welcome to your internship!'],
    buddy: 'Your onboarding buddy is already waiting.',
  },
  benefits: [
    'Flexible hours',
    'Fancy equipment',
    'Team events',
    'Permanent contract',
  ],
}

export const careersCopy = { de, en }

export const careersCopyFor = (locale?: Locale | null): CareersCopy => (locale === 'en' ? en : de)
