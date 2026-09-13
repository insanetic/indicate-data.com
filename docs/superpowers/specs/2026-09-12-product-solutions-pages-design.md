# Product & Solutions menus and subpages

Date: 2026-09-12
Status: implemented under stated assumptions (built autonomously; open points listed at the end)

## 1. Goal

Turn the home page's anchors into real pages: one page per product capability and per audience, reached from hover mega-menus ("Produkt", "Lösungen"). Pages share one layout language (the home page's block system) but differ in content, length and section count. Everything is seeded content (`src/endpoints/seed/content.ts`), rendered by the existing blocks, with code-built looping scenes per feature.

## 2. Inputs

- Product truth from `../indicate-web` (Angular app): app rail = Chat with your data · Analytics · Flying KPI · Data Sources · Data Studio · Settings. Widgets: line, area, bar, column, pie, scatter, calendar, scorecard, table. Comparisons: previous period, same period last year, guide lines with polarity (no budget module). AI: "Describe your dashboard → Generate", "Edit with AI", AI summary; in-app chat with source picking and "chat about this dashboard"; MCP server (`industry.indicate-data.io/mcp`) with setup guides for Claude Desktop, Claude Code, VS Code, OAuth apps for Claude and ChatGPT, agent tokens, admin-set model/language, warehouse-access toggle, AI budget. Flying KPIs: one dashboard per report, daily/weekly/monthly, e-mail to members or any address, optional AI summary. Integrations: ~30 connectors (PMS, CRM, ads, web, ops), per-connection schedule (hourly to daily), connect invites with consent + PII flag, reconnect link. Governance: organisations → spaces, roles owner/admin/user/reader/guest, 2FA policy, audit log (30 days, filterable), API/agent tokens, service accounts, brand palettes. KPI Studio: JSON DSL in a Monaco editor validated by a semantic-layer schema, schema browser, dry run, import DSL/export DDL, grouping vs perspective dimensions, KPI collections, versions with deprecation/sunset, Insights explorer. Templates: marketplace with browse/favourites/my templates/groups, revisions + changelog, remap & rebuild.
- Competitor patterns (Databox, ThoughtSpot, Metabase, Sigma, AgencyAnalytics, Geckoboard, Whatagraph, Lighthouse): three-column product menus with one-line descriptions, sparse icons, occasional featured card; solutions split by company type; feature pages = hero + product visual → how it works → 3–5 capability sections → cross-links → FAQ → CTA; MCP pages titled "your data in Claude/ChatGPT"; names: "AI Analyst", "MCP", "Semantic Layer", "Data Governance", "Dashboard Templates", "Integrations".
- Founder feedback (memory): stacked feature stories with wide scenes, calm looping motion (6–10 s), no negative copy, no invented ROI numbers, deterministic and reusable.

## 3. Naming and information architecture

Product menu, three columns (Databox pattern), plus a featured card at ≥ xl:

| Column | Entry (DE / EN) | Slug | Description (DE) |
|---|---|---|---|
| Agentic Analytics | Indicate Agent | `agent` | Fragen in normaler Sprache, Antworten aus geprüften Kennzahlen |
| | Indicate MCP | `mcp` | Ihre Zahlen in Claude, ChatGPT und Ihrem Editor |
| | Mit KI bauen / Build with AI | `build-with-ai` | Dashboard beschreiben, fertig |
| Datenbasis / Trusted data | Integrationen / Integrations | `integrations` | Über 30 Anbindungen, Historie ab Tag eins |
| | KPI Studio | `kpi-studio` | Eigene Kennzahlen, eine Definition, versioniert |
| | Data Governance | `governance` | Spaces, Rollen, 2FA und Audit-Log |
| Reporting | Dashboards & Vorlagen / Dashboards & Templates | `dashboards` | Fertige Vorlagen je System, in Ihren Farben |
| | Flying KPIs | `flying-kpis` | Reports nach Zeitplan, an jeden |

Solutions menu: column "Für wen / Who it is for" with Hotels (`hotels`), Hotelgruppen / Hotel groups (`hotel-groups`), Agenturen & Berater / Agencies & consultants (`agencies`); column "Partner" with Software-Anbieter (developer docs). Featured card: book a demo.

Resources and Contact stay as they are. Footer columns mirror the menus. Home page feature stories get a "Mehr erfahren" link to their page.

## 4. Page template (order of blocks; pages drop what they do not need)

Feature page: `hero` (eyebrow = feature name, one-line lead, demo + secondary CTA, the feature's own scene) → `steps` (how it works, 3) → 2–3 × `featureStory` (stacked; one may be side-by-side with a compact scene) → optional `cardGrid` (what you get: widget kinds, connectors, roles) → optional `agentShowcase` (agent, mcp, solutions) → `cardGrid` "Passt dazu / Goes with" (3 cross-links) → `faq` (3–5) → `ctaSection`.

Solution page: `hero` → `logoWall` → `cardGrid` (what changes for this audience) → 2–3 × `featureStory` in the audience's words → `agentShowcase` with audience-specific questions → `testimonials` → `faq` → `ctaSection`.

## 5. Components

- Header: `featured` group (enabled, title, text, link) on menu items; desktop panel anchored to the nav's left edge (origin top-left, 150 ms), columns 16 rem, featured card hidden below xl; mobile drawer shows the featured entry as a link row. Additive schema only.
- Hero: renders the CMS-chosen visual; the layered home stage is registered as illustration `stage` (default) so feature pages can pick their own scene.
- New wide looping scenes (`src/components/Illustrations`, clock tracks in `loops.css`): `agentChat`, `mcp`, `kpiStudio`, `templates`, `governance`, `sync`. Reduced motion shows the finished frame.

## 6. Assumptions / open points

- Langdock is kept only where the founder already wrote it (home page). New pages name Claude, ChatGPT, Claude Code and VS Code, which have setup guides in the app.
- Sync cadence is described as "stündlich bis täglich" on the integrations page; the home page's "15 Minuten" is left untouched.
- No alerting feature is promised; comparisons and guide lines carry the "plan vs actual" story.
- Slugs are not localised (Payload `slugField`), so `/de/flying-kpis` and `/en/flying-kpis`.
