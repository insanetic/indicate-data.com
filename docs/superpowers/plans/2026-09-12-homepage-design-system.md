# Home page + design system implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Indicate Data home page (de + en) on a reusable design system, content model and i18n foundation inside this Payload 3 + Next 16 project.

**Architecture:** Payload localisation (de default, en) with all frontend routes under `app/(frontend)/[locale]`; a `Section` wrapper + shared field factories so every marketing block shares background, spacing, reveal and header conventions; code-built illustrations selected from the CMS; a seed that installs the whole site.

**Tech stack:** Payload 3.89 (Postgres), Next 16.3 App Router, React 19, Tailwind 4 (tokens in `globals.css`), lucide-react, next/font (Outfit) + geist, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-12-homepage-design-system-design.md`

## Global constraints

- Dev server runs in Docker (`indicate-datacomdemo-app-1`) with the source bind-mounted and no TTY. Any schema push that would drop data prompts and kills the process. Therefore: run `scripts/reset-content.ts` (clears pages, page versions, header/footer nav items) BEFORE touching `payload.config.ts` or collection/global field definitions. Host-side Payload scripts run with `NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload ./node_modules/.bin/payload run <file>`.
- Only `transform`, `opacity`, `filter`, `clip-path`, colour animate. No `transition: all`. Every animation has a `prefers-reduced-motion` variant.
- Colours in oklch tokens only; no hex in components (brand hex appear only as comments next to the token).
- Copy: sentence case, no tracked uppercase labels, no em dashes in UI copy, German formal "Sie". Every localised field gets both de and en in the seed.
- Files stay small: one block = `config.ts` + `Component.tsx` (+ `Client.tsx` when interactive).
- After schema changes: `pnpm generate:types` on the host; after new admin components: `pnpm generate:importmap`.
- Verification before claiming done: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test:int`, seed, screenshots of `/de` and `/en`.

---

### Task 1: Reset content safely and enable localisation

**Files:**
- Create: `scripts/reset-content.ts`
- Modify: `src/payload.config.ts`
- Modify: `src/collections/Pages/index.ts` (title localised, hero type default `none`, meta fields localised)
- Modify: `src/plugins/index.ts` (seo fields localised via overrides)

**Interfaces:**
- Produces: `src/i18n/config.ts` exporting `locales = ['de','en'] as const`, `type Locale`, `defaultLocale = 'de'`, `localeLabels`, `isLocale(x): x is Locale`.

- [ ] Write `scripts/reset-content.ts`: getPayload, `payload.delete({collection:'pages', where:{}})`, `payload.db.deleteVersions({collection:'pages', where:{}})`, `updateGlobal header/footer {navItems: []}` with `context:{disableRevalidate:true}`, print counts, `process.exit(0)`.
- [ ] Run it (host command above). Expected output: `pages 0`, `header navItems 0`, `footer navItems 0`.
- [ ] Add to `payload.config.ts`: `localization: { locales: [{code:'de', label:'Deutsch'}, {code:'en', label:'English'}], defaultLocale: 'de', fallback: true }` and `i18n: { supportedLanguages: { de, en } }` from `@payloadcms/translations/languages/{de,en}`.
- [ ] Localise `title`, seo `meta.title/description` (`MetaTitleField({ hasGenerateFn: true, overrides: { localized: true } })`, same for description) and set hero `type` default to `none`.
- [ ] Watch `docker logs -f indicate-datacomdemo-app-1` for "No changes detected" / push without prompt. Then `pnpm generate:types` and `pnpm exec tsc --noEmit`.

### Task 2: Locale routing

**Files:**
- Create: `src/i18n/config.ts`, `src/i18n/dictionaries.ts`, `src/i18n/negotiate.ts`, `src/proxy.ts`
- Create: `src/providers/Locale/index.tsx` (`LocaleProvider`, `useLocale()`)
- Create: `src/components/LocaleLink/index.tsx`
- Move: everything in `src/app/(frontend)/{page.tsx,[slug],posts,search,not-found.tsx,layout.tsx}` → `src/app/(frontend)/[locale]/…`
- Modify: `src/components/Link/index.tsx`, `src/components/RichText/index.tsx`, `src/utilities/getGlobals.ts` (locale param + cache key), `src/utilities/generatePreviewPath.ts` (locale in path), `src/collections/Pages/hooks/revalidatePage.ts` and `src/collections/Posts/hooks/revalidatePost.ts` (revalidate every locale), `src/utilities/generateMeta.ts` (alternates), sitemaps (both locales), `src/app/(frontend)/next/seed/route.ts` unchanged.
- Test: `tests/int/i18n.int.spec.ts`

**Interfaces:**
- `negotiateLocale(acceptLanguage: string | null): Locale`
- `localizeHref(href: string, locale: Locale): string` (prefixes internal absolute paths, leaves `http(s):`, `mailto:`, `#`, `/api`, `/admin`, already-prefixed paths alone)
- `getCachedGlobal(slug, depth, locale)`
- `getDictionary(locale)` returns `{ skipToContent, menu, close, search, languageName, notFoundTitle, notFoundText, backHome, readMore, allPosts }`.

- [ ] Write tests for `negotiateLocale` ("en-US,en;q=0.9,de;q=0.5" → en; null → de; "fr" → de) and `localizeHref` cases. Run `pnpm test:int` → fail.
- [ ] Implement `src/i18n/*`. Run tests → pass.
- [ ] Implement `proxy.ts` with matcher `['/((?!api|admin|next|_next|static|.*\\..*|pages-sitemap.xml|posts-sitemap.xml|robots.txt|sitemap.xml).*)']`; redirect `/` and any non-prefixed path to `/${locale}${path}` (307).
- [ ] Move routes; `[locale]/layout.tsx` validates locale (`notFound()`), sets `<html lang>`, loads fonts, wraps `LocaleProvider`, renders Header/Footer with locale, skip link, `<main id="content">`.
- [ ] Update queries in `[locale]/[slug]/page.tsx`, posts pages and search page to pass `locale`; `generateStaticParams` returns locale × slug.
- [ ] `pnpm exec tsc --noEmit`; open `http://localhost:3000/` → redirects to `/de`; `/en/posts` renders.

### Task 3: Design tokens, typography, motion utilities

**Files:**
- Modify: `src/app/(frontend)/globals.css` (replace theme block), `tailwind.config.mjs` (typography tweaks), `src/app/(frontend)/[locale]/layout.tsx` (fonts: Outfit via `next/font/google` as `--font-display`, GeistSans as `--font-sans`)
- Modify: `src/components/ui/button.tsx` (variants: `primary`, `secondary`, `ghost`, `inverse`, `link`; sizes `sm`, `md`, `lg`; pill radius; press scale)
- Create: `src/components/Container/index.tsx`, `src/components/Section/index.tsx`, `src/components/Eyebrow/index.tsx`, `src/components/BrandBars/index.tsx`, `src/components/Reveal/index.tsx` (CSS-only wrapper adding `data-reveal`).

**Interfaces:**
- `<Section background="default|tinted|dark" spacing="default|compact|none" id?>` renders `<section data-theme?>` with tokens swapped for dark.
- `<Eyebrow>` renders three-bar glyph + text.
- `<BrandBars size?>` SVG of the three bars (used by Eyebrow, agent thinking, hero backdrop).
- CSS utilities: `.reveal`, `.reveal-stagger > *`, `.marquee`, `.pill`, `.prose-marketing`.

- [ ] Write tokens exactly as in the spec §3.1 (`:root`), plus `[data-theme='dark']` remaps for dark sections, easing/duration tokens, type scale utilities (`.text-display-xl`, `.text-h2`, `.text-h3`, `.text-lead`, `.text-small`, `.text-caption`), `@keyframes reveal-in`, `@supports (animation-timeline: view())` block, reduced-motion block, `font-synthesis: none`, smoothing.
- [ ] Remove `html { opacity: 0 }` theme-flash hack and theme selector usage; keep `InitTheme` out of the layout (marketing site is light only).
- [ ] Type-check and view `/de` (still template content) to confirm fonts load without layout shift.

### Task 4: Shared field factories and block infrastructure

**Files:**
- Create: `src/fields/sectionHeader.ts`, `src/fields/sectionSettings.ts`, `src/fields/visual.ts`, `src/fields/iconSelect.ts`, `src/fields/localizedLink.ts` (wrapper of `link()` with localised label)
- Create: `src/components/Illustrations/index.tsx` (registry `illustrations: Record<IllustrationKey, React.FC<{className?: string}>>`, `illustrationOptions` for the select), placeholder components for `dashboard`, `agent`, `comparison`, `sources`, `team`, `integrations`, `alerts` (real drawings in Task 8)
- Create: `src/components/Icon/index.tsx` (`iconMap` of curated lucide icons: `chart`, `sparkles`, `plug`, `users`, `shield`, `clock`, `target`, `layers`, `bell`, `globe`, `building`, `briefcase`, `code`, `check`, `arrow-right`, `message`, `database`, `calendar`, `euro`, `percent`)
- Modify: `src/blocks/RenderBlocks.tsx` (wrap each block in `Section` using its `settings`, pass `locale`)

**Interfaces:**
- `sectionHeader()` → group `header: { eyebrow?, heading, lead? }` all localised.
- `sectionSettings()` → group `settings: { background: 'default'|'tinted'|'dark', spacing: 'default'|'compact'|'none', anchor?: string }`.
- `visual()` → group `visual: { type: 'illustration'|'image', illustration?: IllustrationKey, image?: media }` and `<Visual visual={…} className />` component resolving it.
- `iconSelect(name='icon')` → select with friendly bilingual labels.

- [ ] Implement factories with bilingual labels `{ de, en }`.
- [ ] Implement `RenderBlocks` with `blockComponents` map and `Section` wrapper; export `blockSlugs` array for the registry test.
- [ ] Test `tests/int/blocks.int.spec.ts`: every block slug in `Pages` layout config has a component in `blockComponents`.

### Task 5: Header, Footer, Site settings globals

**Files:**
- Create: `src/globals/SiteSettings/{config.ts,hooks/revalidateSiteSettings.ts}`
- Rewrite: `src/Header/{config.ts,Component.tsx,Component.client.tsx,Nav/index.tsx,Nav/MegaMenu.tsx,Nav/MobileMenu.tsx,RowLabel.tsx}`
- Rewrite: `src/Footer/{config.ts,Component.tsx,RowLabel.tsx}`
- Create: `src/components/LanguageSwitch/index.tsx`, `src/components/Logo/Logo.tsx` (inline SVG wordmark from the brand, `variant="dark"|"light"`)
- Modify: `src/payload.config.ts` (register global), `src/plugins/index.ts` (mcp: site-settings, descriptions)

**Interfaces:** field shapes per spec §5.2. Header client receives `{ data: Header, settings: SiteSettings, locale, dict }`.

- [ ] Configs with bilingual labels, localised text fields, `RowLabel` components showing the link label.
- [ ] Header: sticky, scroll-state via `useEffect` + `data-scrolled`, mega menus always in DOM (`aria-expanded`, `aria-hidden`), keyboard (Escape closes, arrow keys optional), mobile drawer with focus trap and `inert` on the page, language switch, CTAs.
- [ ] Footer: columns, legal, language switch, contact, © line.
- [ ] `pnpm generate:importmap`, type-check, view `/de`.

### Task 6: Blocks (configs + components)

For each: `src/blocks/<Name>/config.ts` (+ `Component.tsx`, `Client.tsx`). Register in `src/collections/Pages/index.ts` and `RenderBlocks`. Bilingual labels. Empty arrays render nothing.

- [ ] `Hero` (`hero`): `header` (eyebrow, heading, lead), `links` (max 2), `trustText`, `trustLogos[]` (media or text), `visual`. Component: 7/5 grid, intro choreography via `HeroIntro` client wrapper (sessionStorage gate, `data-intro="play|skip"` on the root; CSS keyframes keyed by `--i`).
- [ ] `LogoWall` (`logoWall`): `header.heading` optional, `logos[] {name, image?, url?}`, `display: marquee|grid`. Marquee track duplicated, `aria-hidden` on the clone.
- [ ] `FeatureTabs` (`featureTabs`): `header`, `tabs[] {label, icon, heading, description, points[] {icon, title, text}, visual, link?}`. Client: roving tabs (`role=tablist`, arrow keys), indicator via measured `transform`, panel crossfade (`key` remount + `@starting-style`).
- [ ] `AgentShowcase` (`agentShowcase`): `header`, `prompts[] {question, answer, chart: 'line'|'bars'|'donut'|'none', kpiLabel?, kpiValue?, kpiDelta?}`, `points[] {icon,title,text}`, `links`. Client: chips (`aria-pressed`), thinking state with `BrandBars` pulse, answer card with `MiniChart` (inline SVG, stroke-dashoffset draw). Dark section by default.
- [ ] `Steps` (`steps`): `header`, `steps[] {title, text, icon}`; connector line (`animation-timeline: view()` scaleX) and step numbers (content is a sequence, so numbering is appropriate).
- [ ] `Integrations` (`integrations`): `header`, `groups[] {title, items[] {name, logo?}}`, `link`, `visual` (default `integrations`).
- [ ] `CardGrid` (`cardGrid`): `header`, `layout: 'grid-3'|'grid-4'|'bento'`, `cards[] {icon, title, text, points[] {text}, link?, size: 'sm'|'lg'}`.
- [ ] `Stats` (`stats`): `header?`, `items[] {value, suffix?, label, note?}`; `tabular-nums`.
- [ ] `Testimonials` (`testimonials`): `header?`, `items[] {quote, name, role, company, avatar?, logo?}`; layout: one large quote when 1 item, two-up when 2, grid when more.
- [ ] `PricingTeaser` (`pricingTeaser`): `header`, `plans[] {name, price, period, description, points[] {text}, highlighted, link}`, `footnote`, `link`.
- [ ] `Faq` (`faq`): `header`, `items[] {question, answer(richText)}`, JSON-LD `FAQPage` emitted server-side.
- [ ] `CallToAction` (existing `cta`): add `settings`, `eyebrow`, `style: 'dark'|'tinted'`; restyle component.
- [ ] Type-check; every block renders with minimal data (quick manual check via seed in Task 9).

### Task 7: Motion pass

- [ ] Hero intro keyframes with `animation-fill-mode: both`, delays 0/80/160/240/400 ms, `--ease-out-expo`, gated by `[data-intro='play']`; reduced motion: opacity only 200 ms.
- [ ] Scroll-linked reveal: `.reveal { animation: reveal-in linear both; animation-timeline: view(); animation-range: entry 0% entry 35%; }` inside `@supports`, `@media (prefers-reduced-motion: reduce) { .reveal { animation: none } }`.
- [ ] Buttons: `transition: background-color, color, border-color, transform 150ms`; `:active { transform: scale(0.97) }`; `:focus-visible` outline 2 px `--brand-blue` offset 2 px.
- [ ] Route transitions: wrap page children in React `ViewTransition` (import from `react`) with a `default="page-fade"` class and CSS `::view-transition-old/new(page-fade)` 200 ms; skip if the import is unavailable.
- [ ] Verify with DevTools reduced-motion emulation: nothing moves.

### Task 8: Illustrations

`src/components/Illustrations/{Dashboard,Agent,Comparison,Sources,Team,Integrations,Alerts}.tsx`. Shared primitives in `src/components/Illustrations/primitives.tsx`: `Card`, `Kpi`, `Sparkline`, `Bars`, `Donut`, `Avatar`, `Chip`, `DotGrid`, `Backdrop`. Demo data in German-neutral numerals (€ 142, 84 %). Each root: `role="img"`, `aria-label`, `select-none pointer-events-none`. Chart series colours: blue, yellow, coral. No text smaller than 11 px equivalent.

- [ ] Build primitives, then each illustration, checking in the browser at 1440 and 375 px.

### Task 9: Seed

**Files:** rewrite `src/endpoints/seed/index.ts`, create `src/endpoints/seed/{site-settings.ts,header.ts,footer.ts,home.ts,contact-page.ts,media.ts}` and copy brand assets into `src/endpoints/seed/assets/` (logo svg, integration icons owned by Indicate). Keep `contact-form.ts`; drop demo posts/categories from the seed (leave existing posts in the DB untouched).

- [ ] Seed writes de first (default locale) then updates each localised doc with `locale: 'en'`.
- [ ] Home page content exactly per spec §4 in both languages.
- [ ] Run via the admin "Seed" button or `scripts/seed.ts` host script. Verify `/de` and `/en` render every section.

### Task 10: Verification and polish

- [ ] `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test:int`.
- [ ] Playwright `tests/e2e/frontend.e2e.spec.ts`: redirect, headline, tabs, FAQ, language switch, reduced motion.
- [ ] Screenshots at 1440/768/375 of every section; keyboard walk; Lighthouse on `/de`.
- [ ] Unslop pass (design + writing) on the rendered page; remove one accessory.
- [ ] Update `README.md` with the content-editing guide for marketers (where things live in the admin, how to translate, how to reorder sections).

## Self-review

Spec coverage: §3 tokens (T3), motion (T7), illustrations (T8); §4 IA (T5, T9); §5.1 (T1, T2); §5.2 (T4, T5, T6); §5.3 (T1, T9); §5.6 (T10). Types: `Locale`, `IllustrationKey`, `sectionHeader/sectionSettings/visual` names are used consistently above.
