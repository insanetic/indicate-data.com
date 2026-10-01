import type { Locale } from '@/i18n/config'

type Partner = { kind: string; org: string; initials: string }
type Access = { role: string; via: string }
type View = { title: string; items: { label: string; open: boolean }[] }

type PartnersCopy = {
  title: string
  partners: [Partner, Partner, Partner]
  space: { label: string; name: string; twoFactor: string }
  /** Each partner's place in the space: role and how they get in. */
  access: [Access, Access, Access]
  /** What each partner sees, per exchange. */
  views: [View, View, View]
  note: string
  /** The view card before a partner's view lands. */
  pending: string
}

const de: PartnersCopy = {
  title:
    'Partner im Space von Hotel Alpenrose: Zentrale, Agentur und Berater bekommen je ihre Rolle mit 2FA; die Zentrale sieht über einen Multi-Space-Token alle freigegebenen Häuser, die Agentur Kampagnen-KPIs und Buchungsquellen, aber keine Gästeliste, der Berater liest Revenue-Dashboards und die Vorlagen der Gruppe',
  partners: [
    { kind: 'Zentrale', org: 'Seehotels Gruppe', initials: 'SG' },
    { kind: 'Agentur', org: 'Nordlicht Digital', initials: 'ND' },
    { kind: 'Berater', org: 'Revenue-Beratung', initials: 'RB' },
  ],
  space: { label: 'Space', name: 'Hotel Alpenrose', twoFactor: '2FA' },
  access: [
    { role: 'Admin', via: 'Multi-Space-Token' },
    { role: 'Analyst', via: 'Einladung' },
    { role: 'Leser', via: 'Einladung' },
  ],
  views: [
    {
      title: 'Zentrale sieht',
      items: [
        { label: 'Alpenrose', open: true },
        { label: 'Seehotel', open: true },
        { label: 'Bergblick', open: true },
      ],
    },
    {
      title: 'Agentur sieht',
      items: [
        { label: 'Kampagnen-KPIs', open: true },
        { label: 'Buchungsquellen', open: true },
        { label: 'Gästeliste', open: false },
      ],
    },
    {
      title: 'Berater sieht',
      items: [
        { label: 'Revenue-Dashboard', open: true },
        { label: 'Vorlagen der Gruppe', open: true },
        { label: 'Bearbeiten', open: false },
      ],
    },
  ],
  note: 'Gästedaten bleiben im Space',
  pending: 'Wer sieht was?',
}

const en: PartnersCopy = {
  title:
    "Partners in Hotel Alpenrose's space: head office, agency and consultant each get their role with 2FA; head office sees every released property through a multi-space token, the agency sees campaign KPIs and booking sources but no guest list, the consultant reads revenue dashboards and the group's templates",
  partners: [
    { kind: 'Head office', org: 'Seehotels group', initials: 'SG' },
    { kind: 'Agency', org: 'Nordlicht Digital', initials: 'ND' },
    { kind: 'Consultant', org: 'Revenue advisory', initials: 'RA' },
  ],
  space: { label: 'Space', name: 'Hotel Alpenrose', twoFactor: '2FA' },
  access: [
    { role: 'Admin', via: 'Multi-space token' },
    { role: 'Analyst', via: 'Invitation' },
    { role: 'Reader', via: 'Invitation' },
  ],
  views: [
    {
      title: 'Head office sees',
      items: [
        { label: 'Alpenrose', open: true },
        { label: 'Seehotel', open: true },
        { label: 'Bergblick', open: true },
      ],
    },
    {
      title: 'Agency sees',
      items: [
        { label: 'Campaign KPIs', open: true },
        { label: 'Booking sources', open: true },
        { label: 'Guest list', open: false },
      ],
    },
    {
      title: 'Consultant sees',
      items: [
        { label: 'Revenue dashboard', open: true },
        { label: 'Group templates', open: true },
        { label: 'Editing', open: false },
      ],
    },
  ],
  note: 'Guest data stays in the space',
  pending: 'Who sees what?',
}

export const partnersCopy = { de, en }

export const partnersCopyFor = (locale?: Locale | null): PartnersCopy => (locale === 'en' ? en : de)
