/**
 * Illustration keys and friendly names. The marketer picks one of these in the CMS;
 * `index.tsx` maps each key to a code-built illustration.
 */
export const illustrationOptions = [
  { value: 'stage', label: { de: 'Produktbühne: Dashboard, Agent, Report (Hero)', en: 'Product stage: dashboard, agent, report (hero)' } },
  { value: 'resiHub', label: { de: 'Resi im Zentrum: Quellen, Chat, Ergebnisse (Hero, Loop)', en: 'Resi at the centre: sources, chat, results (hero, loop)' } },
  { value: 'dashboard', label: { de: 'Dashboard mit Kennzahlen', en: 'Dashboard with KPIs' } },
  { value: 'agent', label: { de: 'KI-Agent im Gespräch', en: 'AI agent conversation' } },
  { value: 'comparison', label: { de: 'Vergleich Plan vs. Ist', en: 'Plan vs. actual comparison' } },
  { value: 'sources', label: { de: 'Datenquellen fließen zusammen', en: 'Sources flowing together' } },
  { value: 'team', label: { de: 'Team & Rechte', en: 'Team & permissions' } },
  { value: 'integrations', label: { de: 'Integrations-Hub', en: 'Integrations hub' } },
  { value: 'alerts', label: { de: 'Hinweise & Trends', en: 'Alerts & trends' } },
  { value: 'builder', label: { de: 'Dashboard per Beschreibung (Loop)', en: 'Dashboard from a description (loop)' } },
  { value: 'flyingKpis', label: { de: 'Flying KPIs: Report wird versendet (Loop)', en: 'Flying KPIs: report being sent (loop)' } },
  { value: 'portfolio', label: { de: 'Hotelgruppe: Häuser laufen in der Zentrale zusammen (Loop)', en: 'Hotel group: properties converge at head office (loop)' } },
  { value: 'campaigns', label: { de: 'Agentur: ein Login, Kunden nacheinander, Report an den Kunden (Loop)', en: 'Agency: one login, clients in turn, report to the client (loop)' } },
  { value: 'agentChat', label: { de: 'Agent: Chat mit Quelle und Kontext (Loop)', en: 'Agent: chat with source and context (loop)' } },
  { value: 'resi', label: { de: 'Resi bei der Arbeit: Quellen, Frage, Antwort (Loop)', en: 'Resi at work: sources, question, answer (loop)' } },
  { value: 'mcp', label: { de: 'MCP: Claude ruft Indicate-Kennzahlen ab (Loop)', en: 'MCP: Claude calling Indicate KPIs (loop)' } },
  { value: 'kpiStudio', label: { de: 'KPI Studio: Definition, Vorschau, Version (Loop)', en: 'KPI Studio: definition, preview, version (loop)' } },
  { value: 'templates', label: { de: 'Vorlagen: Template anwenden (Loop)', en: 'Templates: applying a template (loop)' } },
  { value: 'governance', label: { de: 'Governance: Spaces, Rollen, Audit-Log (Loop)', en: 'Governance: spaces, roles, audit log (loop)' } },
  { value: 'sync', label: { de: 'Sync: verbinden oder per Link verbinden lassen, Historie, Dedupe & Cleanse (Loop)', en: 'Sync: connect or send a link, history, dedupe & cleanse (loop)' } },
  { value: 'semanticLayer', label: { de: 'Semantic Layer: Katalog, Definition, überall gleich (Loop)', en: 'Semantic layer: catalogue, definition, same everywhere (loop)' } },
  { value: 'dimensions', label: { de: 'Dimensionen: Gruppierung und Perspektive (Loop)', en: 'Dimensions: grouping and perspective (loop)' } },
  { value: 'collections', label: { de: 'KPI-Sammlung: freigeben und teilen (Loop)', en: 'KPI collection: release and share (loop)' } },
] as const

export type IllustrationKey = (typeof illustrationOptions)[number]['value']
