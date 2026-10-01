import type { Locale } from '@/i18n/config'

type Value = { title: string; line: string }
type Message = { from: string; text: string }

type AboutCopy = {
  title: string
  values: { items: [Value, Value, Value] }
  team: { name: string; place: string; mission: string }
  /** What the team card says the value looks like today, per exchange. */
  today: [string, string, string]
  everyday: string
  experiment: { title: string; variants: [string, string]; decided: string }
  chat: { messages: [Message, Message]; resolved: string }
  release: { title: string; note: string; invite: string }
  /** Opening and closing quotation marks. */
  quote: [string, string]
}

const de: AboutCopy = {
  title:
    'Wer Indicate ist: Unsere Werte links, Indicate aus Offenburg mit der Mission in der Mitte, rechts wie die Werte im Alltag aussehen: ein Test entscheidet, das beste Argument gewinnt, ein Release wird gefeiert',
  values: {
    items: [
      { title: 'Agil und datenbasiert', line: 'Ausprobieren statt lange planen.' },
      { title: 'Zusammenarbeit auf Augenhöhe', line: 'Das beste Argument gewinnt.' },
      { title: 'Freude an der Arbeit', line: 'Gute Arbeit braucht Freude.' },
    ],
  },
  team: { name: 'Indicate Data', place: 'Offenburg · Baden-Württemberg', mission: 'Datenbasierte Entscheidungen für jedes Hotel.' },
  today: ['Heute: testen statt planen', 'Heute: jede Meinung zählt', 'Heute: Release feiern'],
  everyday: 'Bei uns im Alltag',
  experiment: { title: 'Test · neue Startseite im Dashboard', variants: ['Variante A', 'Variante B'], decided: 'B gewinnt · entschieden' },
  chat: {
    messages: [
      { from: 'Produkt', text: 'Ich würde den Filter oben lassen.' },
      { from: 'Entwicklung', text: 'Die Daten sagen: unten wird öfter genutzt.' },
    ],
    resolved: 'Überzeugt. Wir nehmen unten.',
  },
  release: { title: 'Release ist live', note: 'Danke an alle!', invite: 'Mario Kart um 17 Uhr?' },
  quote: ['„', '“'],
}

const en: AboutCopy = {
  title:
    'Who Indicate is: our values on the left, Indicate from Offenburg with its mission in the middle, and on the right what the values look like day to day: a test decides, the best argument wins, a release gets celebrated',
  values: {
    items: [
      { title: 'Agile and data-driven', line: 'Try fast, don’t plan for months.' },
      { title: 'Working as equals', line: 'The best argument wins.' },
      { title: 'Enjoying the work', line: 'Good work needs joy.' },
    ],
  },
  team: { name: 'Indicate Data', place: 'Offenburg · Germany', mission: 'Data-driven decisions for every hotel.' },
  today: ['Today: test, don’t plan', 'Today: every opinion counts', 'Today: celebrate the release'],
  everyday: 'Day to day',
  experiment: { title: 'Test · new dashboard home', variants: ['Variant A', 'Variant B'], decided: 'B wins · decided' },
  chat: {
    messages: [
      { from: 'Product', text: 'I would keep the filter at the top.' },
      { from: 'Engineering', text: 'The data says the bottom one gets used more.' },
    ],
    resolved: 'Convinced. Bottom it is.',
  },
  release: { title: 'Release is live', note: 'Thanks, everyone!', invite: 'Mario Kart at 5 pm?' },
  quote: ['“', '”'],
}

export const aboutCopy = { de, en }

export const aboutCopyFor = (locale?: Locale | null): AboutCopy => (locale === 'en' ? en : de)
