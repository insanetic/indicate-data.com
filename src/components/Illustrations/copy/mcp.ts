/** Copy for the `mcp` scene: three assistants ask the Indicate MCP server in turn. */
type McpTurn = {
  /** Assistant name, as it appears next to its mark (see `src/integrations/clients.ts`). */
  client: string
  q: string
  a: string
  /** Tool calls: tool name and its arguments. */
  calls: [string, string][]
}

type McpCopy = {
  label: string
  server: string
  healthy: string
  endpoint: string
  guard: string
  space: string
  kpis: string
  sources: string
  guest: string
  guestFields: string
  note: string
  calls: string
  via: string
  turns: [McpTurn, McpTurn, McpTurn]
}

const de: McpCopy = {
  label:
    'Claude, ChatGPT und Langdock fragen nacheinander den Indicate MCP Server. Er liest die Kennzahlen aus deinem Space mit denselben Rechten wie in der App und antwortet; Gästedaten bleiben im Space.',
  server: 'Indicate MCP',
  healthy: 'Läuft',
  endpoint: 'industry.indicate-data.io/mcp',
  guard: 'Gleiche Rechte wie in der App',
  space: 'Space Alpenrose',
  kpis: 'Kennzahlen',
  sources: 'Quellen',
  guest: 'Gästedaten',
  guestFields: 'Namen, E-Mails',
  note: 'Nur Aggregate · Gästedaten bleiben im Space',
  calls: 'Aufrufe',
  via: 'über Indicate MCP',
  turns: [
    {
      client: 'Claude',
      q: 'Wie lief die Meta-Sommerkampagne gegen die Buchungen in Mews?',
      a: '212 Buchungen bei 4.900 € Budget, 23 € je Buchung. Die Lücke: KW 29 bis 31, da lief keine Anzeige.',
      calls: [
        ['list_kpis', 'campaigns'],
        ['get_kpi', 'meta_ad_spend'],
        ['get_kpi', 'total_bookings'],
      ],
    },
    {
      client: 'ChatGPT',
      q: 'Wie voll sind wir nächstes Wochenende?',
      a: 'Samstag 94 %, Sonntag 71 %. Die ADR am Samstag liegt bei 168 €, 12 € über dem Vorjahr.',
      calls: [
        ['get_kpi', 'occupancy'],
        ['get_kpi', 'adr'],
      ],
    },
    {
      client: 'Langdock',
      q: 'ADR nach Kanal im September, für die Zentrale.',
      a: 'Direkt 172 €, Booking.com 151 €, Expedia 146 €. RevPAR 119 €, 9 % über dem Vorjahr.',
      calls: [
        ['get_kpi', 'adr · channel'],
        ['get_kpi', 'revpar'],
      ],
    },
  ],
}

const en: McpCopy = {
  label:
    'Claude, ChatGPT and Langdock take turns asking the Indicate MCP server. It reads the KPIs from your space with the same permissions as in the app and answers; guest data stays in the space.',
  server: 'Indicate MCP',
  healthy: 'Healthy',
  endpoint: 'industry.indicate-data.io/mcp',
  guard: 'Same permissions as in the app',
  space: 'Space Alpenrose',
  kpis: 'KPIs',
  sources: 'Sources',
  guest: 'Guest data',
  guestFields: 'names, e-mails',
  note: 'Aggregates only · guest data stays in the space',
  calls: 'calls',
  via: 'via Indicate MCP',
  turns: [
    {
      client: 'Claude',
      q: 'How did the Meta summer campaign do against the bookings in Mews?',
      a: '212 bookings on €4,900 spend, €23 per booking. The gap: weeks 29 to 31, when no ad ran.',
      calls: [
        ['list_kpis', 'campaigns'],
        ['get_kpi', 'meta_ad_spend'],
        ['get_kpi', 'total_bookings'],
      ],
    },
    {
      client: 'ChatGPT',
      q: 'How full are we next weekend?',
      a: 'Saturday 94 %, Sunday 71 %. Saturday’s ADR is €168, €12 above last year.',
      calls: [
        ['get_kpi', 'occupancy'],
        ['get_kpi', 'adr'],
      ],
    },
    {
      client: 'Langdock',
      q: 'ADR by channel in September, for head office.',
      a: 'Direct €172, Booking.com €151, Expedia €146. RevPAR €119, 9 % above last year.',
      calls: [
        ['get_kpi', 'adr · channel'],
        ['get_kpi', 'revpar'],
      ],
    },
  ],
}

export const mcpCopy = { de, en }
