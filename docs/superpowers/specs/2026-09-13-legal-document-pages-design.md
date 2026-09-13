# Legal document pages, reusable sidebar layout and new About page

Date: 2026-09-13
Status: approved in chat, to be implemented

## 1. Goal

Give the site a reusable "document with sidebar" layout for long-form text pages (terms, privacy, imprint and similar), a CMS-managed sidebar component that lists related pages, migrate the six legal documents from indicate-data.io verbatim (German original, English translation), and write a new marketing-style About page.

## 2. Inputs

- Live site (indicate-data.io): compliance sidebar with groups Bedingungen (Nutzungsbedingungen), Datenschutz (Datenschutzrichtlinie, DSGVO, Leistungsbeschreibung), Compliance (Cookie-Richtlinie), Kontakt (Impressum). Each translated page carries the note "Diese Übersetzung dient ausschließlich Informationszwecken. Bei allfälligen Widersprüchen zwischen dieser und der deutschen Version hat die deutsche Version Gültigkeit." Dates: privacy policy last updated 2026-08-17, effective 2026-08-31; GDPR, service description, cookie policy last updated 2024-03-30, effective 2024-04-02; terms and imprint show no date. Contact for privacy matters: compliance@indicate-data.io, Indicate Data GmbH, Industriestr. 27, 77656 Offenburg.
- Reference patterns: Stripe legal (grouped document sidebar, "last modified" line, translation notice), Vercel legal (numbered on-page TOC, effective date, list of previous versions), Notion legal hub (documents with one-line summaries).
- Founder decisions (2026-09-13): all six legal docs; body is one rich text per page (not one block per section); sidebar is an editable CMS document, not automatic; legal texts verbatim with typo fixes only; About page is written new with marketing focus and must not make the team feel small.
- Constraints from memory: schema changes must be additive (dev server in Docker without TTY); seed is idempotent by slug; clear `.next/dev/cache/fetch-cache` after seeding globals from the host.

## 3. Content model

### 3.1 Collection `sidebars` (label "Seitenleisten")

Fields:
- `title` text, required, admin title (not localised; internal name such as "Rechtliches").
- `groups` array (max 8), each: `title` text localised required; `links` array (max 12) of `link({ appearances: false, localized: true })`.
- `contact` group, optional: `enabled` checkbox; `title` text localised; `text` textarea localised; `email` email.
- Access: read public, write authenticated. `afterChange` hook revalidates the `sidebars` tag; pages that embed a sidebar are rendered fresh per request (pages are not fetch-cached), so no further invalidation is needed.

### 3.2 Block `document` (label "Dokument mit Seitenleiste")

Added to the Pages layout blocks and to `blockSlugs`/`blockComponents`. Fields:
- `header`: shared `sectionHeader()` (eyebrow, heading required, lead, align). The heading renders as `h1` when the block is first in the layout, else `h2`.
- `sidebar`: relationship to `sidebars`, optional.
- `body`: richText, localised, required. Lexical features: root features plus headings h2–h4, ordered/unordered lists, links, blockquote, horizontal rule, table (Payload `EXPERIMENTAL_TableFeature`), fixed and inline toolbars.
- `meta` group (row): `lastUpdated` date; `effectiveFrom` date; `version` text (e.g. "2.1"). Not localised.
- `bindingLanguage` select: `none` | `de` | `en`, default `de`, not localised. Label: "Verbindliche Sprache".
- `history` array, optional: `date` date required; `note` text localised required. Rendered collapsed as "Frühere Fassungen / Previous versions".
- `showToc` checkbox, default true.
- `settings`: shared `sectionSettings()`, default background `default`, spacing `none` (the block controls its own vertical rhythm because the header band is tinted).

### 3.3 Pages

No new page fields. Slugs (not localised): `terms-of-service`, `privacy-policy`, `gdpr`, `service-description`, `cookie-policy`, `imprint`, `about`.

## 4. Rendering

### 4.1 Components

- `src/blocks/Document/Component.tsx` (server): composes header band, meta row, translation notice, grid with sidebar, article, TOC, history.
- `src/components/DocumentLayout/SidebarNav.tsx` (client): renders groups and links; marks the current page with `aria-current="page"` and an active rail marker by comparing the link href with `usePathname()` (locale-prefixed). Contact card at the bottom. On `< lg` it renders as a `<details>` disclosure titled "Weitere Dokumente / More documents" placed above the article.
- `src/components/DocumentLayout/Toc.tsx` (client): "Auf dieser Seite / On this page"; list of h2 (and nested h3) anchors; scroll-spy via `IntersectionObserver` moves a marker with a 200 ms transform transition; under reduced motion the marker changes state without transition. On `< xl` it renders as a `<details>` above the article.
- `src/components/DocumentLayout/DocumentMeta.tsx` (server): `<dl>` row with "Stand", "Gültig ab", "Version", each as `<time dateTime>` formatted with `Intl.DateTimeFormat(locale, { dateStyle: 'long' })`, tabular numbers; plus a language tag: "Verbindliche Fassung" when the page locale equals the binding language.
- `src/components/DocumentLayout/TranslationNotice.tsx` (server): shown when `bindingLanguage !== 'none'` and page locale differs; bordered note (no glow) with the dictionary text and a `LocaleLink` to the same slug in the binding locale.
- Heading anchors: `RichText` gets an option `headingIds` that makes the heading converter emit `id` (slugified text, de-duplicated with a counter) and an anchor link revealed on hover ("#", `aria-label` "Link zu diesem Abschnitt").
- `src/utilities/lexical/headings.ts`: `extractHeadings(editorState)` returns `{ id, text, level }[]` for h2/h3 by walking the Lexical JSON, using the same `slugify` as the converter so ids match.

### 4.2 Layout

- `xl` and up: grid `16rem | minmax(0, 1fr) | 14rem`, gap 4rem; sidebar and TOC `sticky top-24`. Article `max-w-[70ch]`.
- `lg`: sidebar + article; TOC as disclosure above the article.
- `< lg`: sidebar disclosure, TOC disclosure, article.
- Header band: `bg-surface-2 border-b border-line`, eyebrow, `type-display` heading, `type-lead`, meta row. Article on `bg-surface`.
- Typography: `.prose-document` variant on top of `.prose`: h2 with `scroll-margin-top: 6rem`, `text-wrap: pretty` for paragraphs, ordered lists with `tabular-nums`, tables with `overflow-x: auto` wrapper, links `text-accent underline-offset-4`.
- Print (`@media print`): hide header, footer, sidebar, TOC, notices' link; white background, black ink, `a::after` shows external URLs.
- Reveal: none (long documents must not stagger in). Reduced motion respected everywhere.

### 4.3 Dictionary strings (`src/i18n/dictionaries.ts`)

`onThisPage`, `moreDocuments`, `lastUpdated`, `effectiveFrom`, `version`, `bindingVersion`, `translationNotice` ("Diese Übersetzung dient nur zur Information. Verbindlich ist die deutsche Fassung." / English equivalent, with the language name interpolated), `readBindingVersion`, `previousVersions`, `copyLink`, `contactQuestions`.

## 5. Seed content

- `src/endpoints/seed/legal.ts`: the six documents in DE and EN, as Lexical JSON built by a new seed helper `richText(md)` in `lexical.ts` that converts a tiny markdown subset (`##`, `###`, paragraphs, `-` lists, `1.` lists, `**bold**`, `[text](url)`, `---`, pipe tables) into Lexical nodes. Texts are copied verbatim from indicate-data.io (German from `/de/...`, English from `/en/...`), with typo fixes only. Dates per section 2; terms and imprint without dates until the founder supplies them.
- Sidebar "Rechtliches": groups and links as on the live site; contact card with compliance@indicate-data.io.
- `src/endpoints/seed/about.ts`: About page (section 6).
- `seed/index.ts`: upsert the sidebar first (by title), then the legal pages (`upsertPage`), then About; footer `legalLinks` become internal references to the pages (Impressum, Datenschutz, AGB) and the footer "Unternehmen" column gets "Über uns". Header gets no new entry.

## 6. About page (`about`)

Written new, marketing focus; never mentions team size or headcount, no invented numbers. Blocks in order:
1. `hero` (align left, illustration `stage`): eyebrow "Über Indicate", heading about building agentic analytics for the hospitality industry, one-line lead, CTAs demo + contact.
2. `pillars` "Was uns antreibt": 4 principles (data you can trust, answers in plain language, your data stays yours, built with hoteliers).
3. `featureStory` stacked ×2: "Aus der Hotellerie für die Hotellerie" (why hotels, PMS depth, hotel groups and agencies) and "Entwickelt in Deutschland, betrieben nach DSGVO" (Offenburg, EU hosting, no guest data leaves unless released; wording kept to what the seed already promises).
4. `logoWall`: partner and integration logos already in media.
5. `cardGrid` "So arbeiten wir mit Ihnen": direct line to the people who build the product, onboarding with your data, roadmap shaped by customers, support that answers.
6. `testimonials`: reuse existing quotes.
7. `ctaSection`: demo + "Karriere" link to the existing jobs page on indicate-data.io.

Open facts to improve the page later (not blocking): founding year, hosting provider/location, which partner logos may be shown, founder background, certifications.

## 7. Testing and verification

- Unit (vitest, existing setup): `slugify` and `extractHeadings` (ids unique, nesting), translation-notice decision (`shouldShowNotice(locale, binding)`), `richText(md)` seed helper round-trip on headings/lists/bold/links, block registry test picks up `document` automatically.
- Type check and lint.
- Seed from the host, clear fetch cache, restart app; Playwright screenshots of `/de/privacy-policy`, `/en/privacy-policy` (notice visible), `/de/imprint`, `/de/about` at 1440 and 390 px; print preview via `page.emulateMedia({ media: 'print' })`.

## 8. Out of scope / follow-ups

- A legal hub page listing documents with summaries and dates (Notion pattern).
- PDF export of previous versions.
- Localised slugs.
