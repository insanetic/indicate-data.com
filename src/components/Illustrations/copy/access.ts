/**
 * Copy for the `governance` scene: an organisation, its three spaces, and who reaches which
 * space with which role. Role names are the app's own (Owner, Admin, User, Reader, Guest) and
 * stay English in both languages; the token keeps its product name.
 */
const de = {
  title: 'Organisation mit drei Spaces: je Person und Token leuchtet, welche Häuser sie mit welcher Rolle erreicht, und jeder Zugriff landet im Audit-Log',
  org: 'Alpen Hotels',
  orgNote: 'Organisation',
  policy: '2FA Pflicht',
  space: 'Space',
  guestData: 'Gästedaten bleiben hier',
  people: [
    { name: 'Lena H.', role: 'Direktorin' },
    { name: 'Markus W.', role: 'Zentrale' },
    { name: 'Agentur-Token', role: 'Nordlicht Marketing · API' },
  ],
  grants: ['Admin', 'Reader', 'Nur Dashboards'],
  audit: 'Audit-Log',
  retention: '30 Tage',
  log: [
    { who: 'Lena H.', what: 'Wochenreport geteilt' },
    { who: 'Markus W.', what: 'Vergleich geöffnet' },
    { who: 'Agentur-Token', what: 'Kampagnen gelesen' },
  ],
  /** The newest entry first; every entry ages one step per exchange. */
  ages: ['jetzt', 'vor 4 Min.', 'vor 9 Min.'],
}

type AccessCopy = typeof de

const en: AccessCopy = {
  title: 'An organisation with three spaces: for each person and token it lights which properties they reach and with which role, and every access lands in the audit log',
  org: 'Alpen Hotels',
  orgNote: 'Organisation',
  policy: '2FA required',
  space: 'Space',
  guestData: 'Guest data stays here',
  people: [
    { name: 'Lena H.', role: 'General manager' },
    { name: 'Markus W.', role: 'Head office' },
    { name: 'Agency token', role: 'Nordlicht Marketing · API' },
  ],
  grants: ['Admin', 'Reader', 'Dashboards only'],
  audit: 'Audit log',
  retention: '30 days',
  log: [
    { who: 'Lena H.', what: 'Weekly report shared' },
    { who: 'Markus W.', what: 'Comparison opened' },
    { who: 'Agency token', what: 'Campaigns read' },
  ],
  ages: ['just now', '4 min ago', '9 min ago'],
}

export const accessCopy = { de, en }
