# Indicate Data website — home page, design system and content model

Date: 2026-09-12
Status: implemented under stated assumptions (the author was not available for review during the build; see "Assumptions")

## 1. Goal

Replace the template site with the first page of a new enterprise-grade marketing site for Indicate Data: the home page, plus the design system, content model, localisation and motion foundations that every later subpage reuses.

Audience: hoteliers (owners, GMs, revenue and marketing managers), hotel groups, hotel software providers and agencies. They are not technical. The page sells outcomes and possibilities in plain language while keeping enough substance (integrations, semantic layer, permissions, MCP) that a technical buyer or partner trusts it.

Non-goals for this iteration: subpages (product, solutions, pricing, about), blog redesign, forms beyond the existing contact form, analytics/consent tooling.

## 2. What we learned (inputs)

- Current site (indicate-data.io): logo = three diagonal rounded bars (yellow `#f4b608`, blue `#4889f4`, coral `#ff4d58`) + black "indicate" wordmark. Fonts Outfit + Mona Sans. Light off-white page, slate primary buttons. Positioning "The Agentic Data Platform". Customers named: Familotel AG, Alpenhof, Feldberger Hof, Hochegger Klippitz, Hotel Seeklause. Testimonials from Armin Biebl and Ilona Stöger-Wolfmeir (Familotel AG). Re:Guest AG holds a 33 % stake (June 2025). Legal: Indicate Data GmbH, Industriestr. 27, 77656 Offenburg. Contact hello@indicate-data.io. Demo booking via Google Calendar link; app at app.indicate-data.com; help centre support.indicate-data.com/docs; developer docs docs.indicate-data.io.
- Product (from the help centre): Spaces (one per hotel/brand), Projects, Dashboards, Widgets (line, area, bar, pie, table, scorecard, calendar heatmap), managed Insights/KPI collections per integration (Revenue, Occupancy, ADR, RevPAR, bookings, channel mix, forecasts), comparisons (previous period, previous year, plan vs actual, guide lines), filters and rankings, brand palettes, AI dashboard creation and summaries, "Chat with your data", MCP server for ChatGPT/Claude, roles (Guest, Reader, User, Admin, Owner), 2FA policy, audit log, API tokens, CSV import, connect links for partners. Integrations: Mews, Oracle Hospitality, elite PMS, ASA Hotelsoftware, simplify hospitality, Shiji, Re:Guest CRM, vioma OTA, Customer Alliance, Google Analytics 4, Search Console, Google Ads, Meta/Instagram, Microsoft Advertising, Pinterest Ads, HubSpot, Pipedrive, Inxmail, SendGrid, gastromatic, Passcreator, Matomo. Pricing: Core €100/month, Pro €500/month, Enterprise from €8,000/month; onboarding €800 once. Claims used on the current site: "40 % lower costs through automation", "ready in minutes", "13 months history".
- References: ClickHouse (liked: hero, logo marquee, "why" pillars, integration diagram, FAQ, footer; disliked: the two card/video sections), Databox (outcome-first copy, numbered how-it-works, tabbed platform showcase, audience cards), Slack (abstract product visuals: simplified UI fragments with tidy demo data, floated over soft backgrounds, cropped and layered).

## 3. Design direction

One memorable thing: the three bars from the logo become the site's motion and structure motif. They appear as the hero backdrop, as the eyebrow marker in front of every section title, as the "thinking" indicator of the AI agent, and as chart bars inside illustrations. Everything else stays quiet.

Tone: calm, confident, warm. Not playful, not corporate-grey. Copy speaks to a hotelier in the second person formal ("Sie") in German, and in plain English.

### 3.1 Colour (all tokens in oklch, defined once in `globals.css`)

| Token | Value | Use |
|---|---|---|
| `--brand-blue` | oklch(0.64 0.19 262) (#4889f4) | illustration accent, primary chart series, focus ring |
| `--brand-blue-deep` | oklch(0.50 0.19 262) | links, interactive text on light surfaces (≥ 5:1 on white) |
| `--brand-yellow` | oklch(0.80 0.17 80) (#f4b608) | secondary chart series, highlights on dark |
| `--brand-coral` | oklch(0.66 0.22 20) (#ff4d58) | alerts, negative deltas, third series |
| `--ink` | oklch(0.20 0.025 262) | headlines, primary button background |
| `--ink-2` | oklch(0.38 0.02 262) | body text |
| `--ink-3` | oklch(0.55 0.015 262) | muted text, captions |
| `--surface` | white | page |
| `--surface-2` | oklch(0.975 0.004 262) | tinted bands, cards on white |
| `--surface-3` | oklch(0.955 0.006 262) | hover on surface-2 |
| `--line` | oklch(0 0 0 / 0.08) | 1 px borders on light |
| `--night` | oklch(0.19 0.03 262) | dark sections, footer |
| `--night-2` | oklch(0.24 0.03 262) | raised cards on dark |
| `--line-on-night` | oklch(0.32 0.03 262) | solid borders on dark (alpha borders glow) |

Neutrals are cool (hue 262) so they agree with the brand blue. Brand hues are used at full chroma only inside illustrations and small accents; text stays ink. Dark mode of the site is not offered (a marketing site has one look); the existing template theme toggle is removed from the footer.

### 3.2 Typography

- Display: **Outfit** (variable 400–600) for h1–h3 and large numbers. Continuity with the current brand.
- Body and UI: **Geist Sans** (already in the project; has tabular figures). Geist Mono only for code in blog/docs.
- Scale (rem, unitless line-height): display-xl clamp(2.75, 1.5 + 4.5vw, 4.75)/1.02 tracking −0.025em; h2 clamp(2, 1.4 + 2.2vw, 3)/1.08 −0.02em; h3 1.5/1.2 −0.01em; lead 1.25/1.5; body 1.0625/1.6; small 0.9375/1.5; caption 0.8125/1.45.
- Headings `text-wrap: balance`, descriptive blocks `text-wrap: pretty`, body columns capped at 65ch, `font-synthesis: none`, smoothing set once on `html`.
- Eyebrows are sentence case in `--brand-blue-deep`, preceded by the three-bar glyph. No tracked uppercase labels.

### 3.3 Shape, depth, spacing

- Pill buttons (fully rounded); cards 20 px outer radius, inner elements 12 px (outer − padding). 
- Borders: alpha on light, solid on dark. Shadows: three stacked layers, used only on floating illustration cards and the sticky header.
- Section rhythm: `py-20 md:py-28`; consecutive tinted bands share edges. Container 80rem, gutter 1rem / 2rem.
- Grid: 12 columns at lg, 6 at md, 1 at mobile. Asymmetric two-column splits (7/5) for text + visual sections.

### 3.4 Motion (all durations and curves as tokens)

Tokens: `--ease-out-expo: cubic-bezier(0.19,1,0.22,1)`, `--ease-out-quart: cubic-bezier(0.25,1,0.5,1)`, `--ease-in-out-cubic: cubic-bezier(0.645,0.045,0.355,1)`, `--ease-drawer: cubic-bezier(0.32,0.72,0,1)`; `--dur-fast 150ms`, `--dur-base 250ms`, `--dur-slow 500ms`, `--dur-intro 900ms`.

| Where | Motion | Trigger | Reduced motion |
|---|---|---|---|
| Hero | One orchestrated intro: eyebrow, headline lines, lead, CTAs, then the visual (staggered 60–90 ms, translateY 12→0 + opacity, ease-out-expo). Plays once per session (`sessionStorage`). | page load | opacity only, 200 ms |
| Hero visual | Chart line draws once after the intro (stroke-dashoffset, 900 ms), agent bubble appears after it. No looping float. | intro | static final state |
| Section content | Scroll-linked reveal (`animation-timeline: view()`, opacity + 16 px, completes at 35 % of entry). 1:1 with scroll, reversible, zero JS; `@supports` fallback = visible. Children stagger by offset. | scroll position | disabled (visible) |
| Feature tabs | Indicator slides (transform, 250 ms, ease-out-quart); panel crossfades with 8 px shift and 2 px blur (250 ms). | click/keyboard | instant swap |
| Agent showcase | Choosing a question shows the three-bar "thinking" pulse (600 ms), then the answer card scales in from 0.97 and its chart draws (700 ms). | click | instant |
| Steps | Connector line grows with scroll (`animation-timeline: view()`). | scroll | static |
| Logo marquee | Linear, 40 s loop, pauses on hover/focus, duplicated track for seamlessness. | ambient | static wrapped grid |
| FAQ | grid-template-rows 0fr→1fr, 250 ms ease-out-quart; chevron rotates. | click | instant |
| Header | Sticky; background/blur and reduced padding after 24 px scroll (transition on transform/opacity/background 200 ms). Mega menu scales from 0.98 at `transform-origin: top`, 160 ms, content always in the DOM. Mobile drawer slides from the right, 300 ms `--ease-drawer`, focus trapped. | scroll/hover/click | opacity only |
| Buttons, cards | hover 150 ms colour via `color-mix`; press `scale(0.97)` 150 ms; card hover lifts an inner child by 2 px, never the hover target. Hover gated to `(hover:hover) and (pointer:fine)`. | pointer | no transform |
| Route changes | React `<ViewTransition>` crossfade around page content, 200 ms. | navigation | none |

Rules: only `transform`, `opacity`, `filter` (≤ 2 px blur), `clip-path` and colour animate; no `transition: all`; no auto-advancing carousels; no scroll hijacking.

### 3.5 Illustrations ("abstract, like Slack")

Code-built React/SVG components, not screenshots. Each shows one simplified product fragment with tidy demo data (a KPI row, one chart, one chat exchange, a permission list, a connector flow) at enlarged scale, on a rounded card with layered shadow, floating over a soft tinted backdrop with a faint dot grid. Chart series use blue, yellow, coral. Every illustration has `role="img"`, an `aria-label`, `user-select: none` and `pointer-events: none`.

Registry (`src/components/Illustrations`): `dashboard`, `agent`, `comparison`, `sources`, `team`, `integrations`, `alerts`. Blocks let the marketer either pick one by friendly name or upload an image; uploads win.

## 4. Information architecture (home page, German primary)

Header: logo · Produkt ▾ · Lösungen ▾ · Preise · Ressourcen ▾ · Kontakt · language switch · Anmelden (app) · **Demo buchen**.
Mega menus (content in DOM, hover/focus/click):
- Produkt: Dashboards & KPIs · KI-Agent · Datenquellen & Integrationen · KPI Studio & Semantic Layer · Sicherheit & Rollen
- Lösungen: Für Hotels · Für Hotelgruppen · Für Agenturen · Für Software-Anbieter (PMS, CRM)
- Ressourcen: Blog · Hilfe-Center · Entwickler-Dokumentation · Kontakt

Until subpages exist, product/solution links point to anchors on the home page; the marketer changes targets in the Header global.

Sections (each is a CMS block the marketer can reorder, hide, edit, translate):

1. **Hero** — eyebrow pill "Neu: KI-Agent für Ihre Hoteldaten"; H1 "Hotelzahlen, die Sie verstehen. Antworten, die Sie sofort nutzen können."; lead about PMS + channels + marketing in one dashboard, an agent that explains occupancy, ADR and RevPAR in plain words, ready in minutes without an IT project; CTAs "Demo buchen" / "So funktioniert's"; trust line naming Familotel, Alpenhof, Feldberger Hof; illustration `dashboard` with the agent bubble.
2. **Logo wall** — "Vertrauen von Hotels und Hotelgruppen" — marquee of customer wordmarks (text fallback until logos are uploaded).
3. **Feature tabs** "Ein Ort für alle Hotelzahlen" — tabs: Dashboards & KPIs · Vergleiche & Ziele · Datenquellen · Teams & Rechte; each tab = heading, three benefit rows with icons, illustration.
4. **Agent showcase** (dark) "Fragen Sie einfach." — question chips ("Wie war die Auslastung letzte Woche?", "Warum ist der ADR im März gesunken?", "Welcher Kanal bringt die meisten Direktbuchungen?"), answer card with mini chart; three trust bullets (answers only from verified KPIs, permissions respected, works in ChatGPT/Claude via MCP).
5. **Steps** "In drei Schritten zu klaren Zahlen" — Verbinden · Verstehen · Handeln.
6. **Integrations** "Passt zu Ihrer Hotel-Software" — hub illustration + logo/name grid grouped by PMS, Vertrieb & CRM, Marketing & Web, Betrieb; link to help-centre marketplace.
7. **Audience cards** "Für wen Indicate gemacht ist" — Hotels · Hotelgruppen · Agenturen · Software-Anbieter, each with three bullets and a link.
8. **Stats** — 40 % geringere Betriebskosten · Minuten bis zu den ersten Daten · 30+ Integrationen · 13 Monate Historie ab Tag 1.
9. **Testimonials** — the two Familotel quotes.
10. **Pricing teaser** — Core €100 · Pro €500 · Enterprise ab €8.000, three bullets each, "Alle Preise" link; note "Preise zzgl. MwSt., monatlich kündbar" only if true — omitted (not verified).
11. **FAQ** — six questions (setup time, which PMS, is it for non-technical people, where is data hosted/GDPR, agencies managing several hotels, what does the agent see) with FAQ JSON-LD.
12. **CTA** (dark) "Bereit, Ihre Zahlen zu verstehen?" — Demo buchen · Kontakt.

Footer: four link columns (Produkt, Lösungen, Ressourcen, Unternehmen), contact block, social (LinkedIn, Discord), language switch, legal row (Impressum, Datenschutz, AGB), "© Indicate Data GmbH, Offenburg".

English copy is written in parallel for every field (not machine-translated placeholders).

## 5. Architecture

### 5.1 Localisation

- Payload `localization`: locales `de` (default, label Deutsch) and `en` (English), `fallback: true`. Admin UI languages de + en.
- Localised: page title, SEO meta, every text/richText field inside blocks, header/footer labels, site settings tagline. Slugs are shared across locales (`/de/kontakt` and `/en/kontakt` resolve the same document). Adding a localised slug later is a contained change.
- Routing: every frontend page lives under `src/app/(frontend)/[locale]/…`; `[locale]/layout.tsx` is the root layout (`<html lang>` from `next/root-params`). `src/proxy.ts` redirects paths without a locale prefix to the best match of `Accept-Language` (default `de`), excluding `/admin`, `/api`, `/next`, `/_next`, sitemaps and files.
- `LocaleProvider` (client context) + `useLocale()`; `LocaleLink` prefixes internal hrefs; `CMSLink` and rich-text link converters use it. A tiny UI dictionary (`src/i18n/dictionaries.ts`) covers non-CMS strings (skip link, menu, search, 404).
- Metadata emits `alternates.languages` (hreflang) and canonical; sitemaps list both locales.
- Revalidation hooks revalidate `/de/…` and `/en/…` for a page; live preview and preview URLs include the locale.

### 5.2 Content model (Payload)

New global **Site settings** (`site-settings`): site name, logo (light/dark uploads, falls back to the built-in SVG wordmark), default OG image, tagline (localised), contact (email, phone, address rich text), social links, external URLs (app login, demo booking, help centre, developer docs), legal links.

**Header** global: `announcement` (enabled, localised text, link), `navItems[]` (label, link, optional `menu` with `columns[]` → `links[]` each label + description + icon + link), `secondaryCta`, `primaryCta`.

**Footer** global: `columns[]` (title, links[]), `legalLinks[]`, `bottomText` (localised), `showLanguageSwitch`.

**Pages** collection: hero group kept for backwards compatibility (type defaults to `none`); the new hero is a block so any page can use any hero. Layout blocks: `hero`, `logoWall`, `featureTabs`, `agentShowcase`, `steps`, `integrations`, `cardGrid` (layouts grid-3, grid-4, bento), `stats`, `testimonials`, `pricingTeaser`, `faq`, plus the template's `cta` (restyled, gets `style` and `eyebrow`), `content`, `mediaBlock`, `archive`, `formBlock`.

Shared field factories in `src/fields/`: `sectionHeader()` (eyebrow, heading, lead — localised), `sectionSettings()` (background: default | tinted | dark; spacing: default | compact | none; anchor id), `visual()` (illustration select or image upload), `iconSelect()` (curated Lucide icon list with friendly labels). Every block declares `interfaceName`, bilingual labels (`{ de, en }`) and `admin.initCollapsed`, and gets a `RowLabel`-style block name so the layout list reads well.

Rendering: `RenderBlocks` maps block types to components; each block is wrapped in `<Section>` which applies background, spacing, anchor and the reveal timeline. Blocks are server components; interactive ones (`featureTabs`, `agentShowcase`, `faq`, `logoWall` marquee, header) have a small client island.

MCP plugin: new global and the extended pages description are registered so the Payload MCP can read/write them after the server reloads.

### 5.3 Seeding

`src/endpoints/seed/` is rewritten around the Indicate site: media (logo assets, integration icons owned by Indicate), site settings, header, footer, home page (de + en, published), contact page (de + en, reusing the template form). The `/next/seed` route and the admin "Seed" button keep working. A `scripts/reset-content.ts` (run with `payload run`) clears pages and nav items first; it exists so the dev-mode schema push never hits a data-loss prompt (the dev server runs in Docker without a TTY, so a prompt would exit the process).

### 5.4 Files (new/changed, high level)

- `src/payload.config.ts` (localization, admin i18n, new global)
- `src/globals/SiteSettings/*`, `src/Header/*`, `src/Footer/*` (configs, components, hooks)
- `src/blocks/<Block>/{config.ts,Component.tsx,(Client.tsx)}` for the 11 new blocks; `src/blocks/RenderBlocks.tsx`
- `src/fields/{sectionHeader,sectionSettings,visual,iconSelect}.ts`
- `src/components/{Section,Eyebrow,BrandBars,Illustrations/*,LocaleLink,LanguageSwitch,Container,Icon}`
- `src/components/ui/button.tsx` (pill variants), `src/components/Link` (locale aware)
- `src/app/(frontend)/[locale]/**` (moved routes), `src/proxy.ts`, `src/app/(frontend)/globals.css` (tokens, type, motion utilities)
- `src/i18n/{config.ts,dictionaries.ts}`, `src/utilities/{getGlobals,generatePreviewPath,generateMeta}.ts`
- `src/endpoints/seed/**`, `scripts/reset-content.ts`
- `tests/int/*.int.spec.ts` (i18n helpers, block registry), `tests/e2e/frontend.e2e.spec.ts` (home renders in de and en, language switch, tabs, FAQ)

### 5.5 Error handling and edge cases

- Unknown locale → 404 via `notFound()` in the layout. Unknown slug → existing `PayloadRedirects` (redirects plugin) then 404 page in the right language.
- Missing uploads: logo wall and integrations render text wordmarks; visual fields render the chosen illustration; hero falls back to the `dashboard` illustration.
- Blocks with no items (empty arrays) render nothing rather than an empty band.
- Draft/live preview works per locale.

### 5.6 Testing and verification

- `pnpm generate:types`, `tsc --noEmit`, `pnpm lint` clean.
- Vitest: locale negotiation, href prefixing, every block in the collection config has a renderer.
- Playwright: `/` redirects to `/de`; home renders headline, tabs switch, FAQ opens, language switch reaches `/en`; `prefers-reduced-motion` renders content visible without animation.
- Manual: Lighthouse on `/de` (performance ≥ 90, accessibility ≥ 95), keyboard walk through header and tabs, 375 px viewport check, screenshot review of every section.

## 6. Assumptions (made because the author was unavailable)

1. URLs are always locale-prefixed (`/de/…`, `/en/…`); `/` redirects to `/de` unless the browser prefers English.
2. Slugs are not translated yet.
3. Fonts: Outfit (from Google via `next/font`) + Geist Sans (installed). Mona Sans dropped.
4. No site dark mode; the template's theme switcher is removed.
5. Customer logos are text wordmarks until real files are uploaded; quotes and customer names come from the current site. Numbers on the page are only those the current site already claims.
6. Nav links for not-yet-built subpages point to home-page anchors and are editable in the CMS.
7. The template's demo blog posts are left untouched (Posts are not localised yet); they move under `/[locale]/posts`.

## 7. Implementation notes (added after the build)

- The reset script could not be run (the tool sandbox blocks deletions), so the schema change was made purely additive: the template's `meta` group on pages and `navItems` on header/footer stay as hidden fields, posts/forms/search/categories are kept unlocalised via `src/plugins/unlocalizedCollections.ts`, and a few numeric fields inside new blocks (prices, KPI values, integration names) are shared across languages. All of it is reversible once `scripts/reset-content.ts` (or a migration) can run with a TTY.
- drizzle-kit prompts not only on data loss but also whenever a table both gains and loses columns ("created or renamed?"). Rule for this repo: additive changes only, or empty the affected tables first.
- `revalidateTag(tag, 'max')` serves stale data to the next request; for globals rendered into cached routes the hooks use `{ expire: 0 }`.
- The hero entrance is gated by a `beforeInteractive` script in the root layout (`html[data-intro-seen]`), not by an inline script inside the component.

## 8. Iteration 2 (same day, after feedback)

Direction changed to a dark-first page in the spirit of ClickHouse: near-black ground, the brand yellow as the single accent (blue and coral only inside charts), big centred typography, hairline borders and a faint grid instead of soft cards, tracked yellow eyebrows without the logo glyph, 6 px button radius, arrow links. Pricing, steps and the audience card grid were removed from the home page (blocks still exist); a "Why Indicate" pillars-and-tiles block replaced them. The hero got an animated product stage (count-ups, drawing chart, rising bars, typed agent answer), the agent section a streaming conversation that plays once when scrolled into view, and integrations a data-flow diagram with moving connectors. The final call to action is a full-bleed yellow band.
