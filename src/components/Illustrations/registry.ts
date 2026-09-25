/**
 * Illustration keys and friendly names. The marketer picks one of these in the CMS;
 * `index.tsx` maps each key to a code-built illustration.
 */
export const illustrationOptions = [
  { value: 'stage', label: { de: 'Hotel-Bühne: Workflows im Hintergrund, Dashboard, Resi, Wochenbericht (Hero, Loop)', en: 'Hotel stage: workflows behind, dashboard, Resi, weekly report (hero, loop)' } },
  { value: 'resiHub', label: { de: 'Resi im Zentrum: Quellen, Chat, Ergebnisse (Hero, Loop)', en: 'Resi at the centre: sources, chat, results (hero, loop)' } },
  { value: 'dashboard', label: { de: 'KPI-Sammlungen: Resi baut Widgets je Anbindung (Loop)', en: 'KPI collections: Resi builds widgets per connection (loop)' } },
  { value: 'agent', label: { de: 'Resi im Dashboard: geprüfte Antwort wird zum Widget (Loop)', en: 'Resi on a dashboard: a checked answer becomes a widget (loop)' } },
  { value: 'comparison', label: { de: 'Vergleich Plan vs. Ist', en: 'Plan vs. actual comparison' } },
  { value: 'sources', label: { de: 'Datenquellen fließen zusammen', en: 'Sources flowing together' } },
  { value: 'team', label: { de: 'Team & Rechte', en: 'Team & permissions' } },
  { value: 'integrations', label: { de: 'Integrations-Hub', en: 'Integrations hub' } },
  { value: 'alerts', label: { de: 'Hinweise & Trends', en: 'Alerts & trends' } },
  { value: 'builder', label: { de: 'Dashboard per Beschreibung (Loop)', en: 'Dashboard from a description (loop)' } },
  { value: 'flyingKpis', label: { de: 'Flying KPIs: Report wird versendet (Loop)', en: 'Flying KPIs: report being sent (loop)' } },
  { value: 'portfolio', label: { de: 'Hotelgruppe: Häuser laufen in der Zentrale zusammen (Loop)', en: 'Hotel group: properties converge at head office (loop)' } },
  { value: 'campaigns', label: { de: 'Agentur: ein Login, Kunden nacheinander, Report an den Kunden (Loop)', en: 'Agency: one login, clients in turn, report to the client (loop)' } },
  { value: 'agentChat', label: { de: 'Resi im Team: Systeme, Menschen, Dashboard, E-Mail (Hero, Loop)', en: 'Resi and the team: systems, people, dashboard, email (hero, loop)' } },
  { value: 'resi', label: { de: 'Resi bei der Arbeit: Quellen, Frage, Antwort (Loop)', en: 'Resi at work: sources, question, answer (loop)' } },
  { value: 'mcp', label: { de: 'MCP: Assistenten fragen den Indicate-Server (Loop)', en: 'MCP: assistants asking the Indicate server (loop)' } },
  { value: 'kpiStudio', label: { de: 'KPI Studio: eine Definition, überall derselbe Wert (Loop)', en: 'KPI Studio: one definition, the same value everywhere (loop)' } },
  { value: 'templates', label: { de: 'Vorlagen: einmal gebaut, an alle Häuser (Loop)', en: 'Templates: built once, rolled out to every property (loop)' } },
  { value: 'governance', label: { de: 'Governance: wer sieht was, mit Audit-Log (Loop)', en: 'Governance: who sees what, with audit log (loop)' } },
  { value: 'sync', label: { de: 'Sync: verbinden oder per Link verbinden lassen, Historie, Dedupe & Cleanse (Loop)', en: 'Sync: connect or send a link, history, dedupe & cleanse (loop)' } },
  { value: 'semanticLayer', label: { de: 'Semantic Layer: Katalog, Definition, überall gleich (Loop)', en: 'Semantic layer: catalogue, definition, same everywhere (loop)' } },
  { value: 'dimensions', label: { de: 'Dimensionen: Gruppierung und Perspektive (Loop)', en: 'Dimensions: grouping and perspective (loop)' } },
  { value: 'collections', label: { de: 'KPI-Sammlung: freigeben und teilen (Loop)', en: 'KPI collection: release and share (loop)' } },
  { value: 'paperPlane', label: { de: 'Bytes werden zum Papierflieger: Bericht geht raus (Loop, breit)', en: 'Bytes become a paper plane: the report goes out (loop, wide)' } },
] as const

export type IllustrationKey = (typeof illustrationOptions)[number]['value']
