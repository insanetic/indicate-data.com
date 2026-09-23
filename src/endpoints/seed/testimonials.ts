import type { T } from './content'

export const testimonialTagSlugs = ['hotellerie', 'agenturen'] as const
export type TestimonialTagSlug = (typeof testimonialTagSlugs)[number]

export const testimonialTagData = (t: T): Record<TestimonialTagSlug, { title: string }> => ({
  hotellerie: { title: t('Hotellerie', 'Hotels') },
  agenturen: { title: t('Agenturen', 'Agencies') },
})

/** Central testimonials; pages select them by tag. Keyed by name + company when upserting. */
export const testimonialData = (t: T) => [
  {
    name: 'Armin Biebl',
    company: 'Familotel AG',
    role: t('Vorstand', 'Board member'),
    quote: t(
      'Seit ich mit Indicate arbeite, ist meine Arbeit deutlich einfacher geworden. Die Benutzerfreundlichkeit ist ein großer Vorteil.',
      'Since I started using Indicate, my work has become significantly easier. The user-friendliness is a major advantage.',
    ),
    tags: ['hotellerie'] as TestimonialTagSlug[],
  },
  {
    name: 'Ilona Stöger-Wolfmeir',
    company: 'Familotel AG',
    role: t('Vorstand', 'Board member'),
    quote: t(
      'Indicate hat die Auswertung aller relevanten Kennzahlen drastisch vereinfacht und vereinheitlicht.',
      'Indicate has drastically simplified and standardised how we evaluate all relevant KPIs.',
    ),
    tags: ['hotellerie'] as TestimonialTagSlug[],
  },
]
