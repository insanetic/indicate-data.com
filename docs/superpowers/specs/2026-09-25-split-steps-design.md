# Steps beside a scene (Split in steps mode)

Date: 2026-09-25
Status: draft, waiting for review

## Goal

The "How it works" row (Items block, style `steps`: numbered circles joined by a horizontal line)
is used on eight pages and looks flat, and the line rarely lines up with the circles. It is
replaced by the Split block in a new steps mode: the steps as a numbered vertical list beside a
scene, with the scene pinned while the steps scroll past and changing to the illustration of the
step that is most in view.

## Decisions (from the brainstorm)

- Extend Split, no new block. Split already has `mediaSide` left/right.
- One section scene, plus an optional scene per step. A step without its own scene shows the
  section scene. The component supports per-step scenes from day one; missing ones are filled in
  over time.
- On small screens Split always shows the media first, then the text, whichever side the scene sits
  on. This applies to every Split, not only steps mode.
- The old Items `steps` style is retired: existing rows are converted, the option is hidden from the
  picker (same `filterOptions` pattern as `cards`), the enum value stays for now.

## Split block changes

| Field | Type | Notes |
|---|---|---|
| `pointStyle` | select `points` / `steps` | default `points`; label "Darstellung der Punkte" / "Point style" |
| `points[].ownVisual` | checkbox | steps mode only; "Eigene Szene für diesen Schritt" / "Own scene for this step" |
| `points[].visual` | `visual()` group | steps mode and `ownVisual` ticked only |

`points[].visual` reuses the shared `visual()` field unchanged. The checkbox is the "empty" state:
without it a step falls back to the section scene.

`points` keeps `maxRows: 4` in both modes; all eight pages have three or four steps.

In steps mode the point `icon` is kept in the data but not rendered: the number takes its place.

## Rendering

### Points mode (unchanged apart from the order)

Media first below `lg`, then text. From `lg` the existing left/right placement applies.

### Steps mode, desktop (`lg` and up)

- Text column: eyebrow, heading, lead, then an ordered list. Each step: a two-digit number
  (`01`, `02`, …) in `font-display tnum`, title (`type-h4`), text (`type-small text-ink-2`). A thin
  vertical line runs through the numbers' column from the first to the last step.
- Active step: the step whose midpoint is closest to the viewport's vertical centre
  (IntersectionObserver with a centred root margin, one observer per section). Its number and its
  line segment use the accent colour; inactive steps keep `text-ink` titles and `text-ink-2` text
  (no fading to near-invisible). Before any step is active, step 1 is.
- Media column: `position: sticky`, top offset = header height + gap, vertically centred in the
  viewport. It holds one layer per distinct scene (section scene + each step's own scene); the
  active one is visible, the others `opacity: 0` and `inert`. Crossfade 200 ms ease-out on opacity.
  Loop illustrations of hidden layers are paused (the existing `.loop-*` classes run on
  `animation-play-state`; hidden layers get `data-paused`).
- Only when at least one step has its own scene: each step gets `min-height: 50vh` on `lg` so the
  scroll actually passes through the steps. Without per-step scenes the list keeps its natural
  height and the media column is not sticky: one scene beside a short list, no empty scroll space.
- `prefers-reduced-motion`: no crossfade, the scene switches instantly. Highlighting stays.
- Clicking a step number scrolls that step to the centre (smooth, instant with reduced motion).

### Steps mode, below `lg`

- Section scene first, unless step 1 has its own scene (so the same picture does not show twice).
- Heading, then the steps as the same numbered list. A step with its own scene shows it above its
  number and title. No sticky media and no active state; all numbers in the accent colour.

### Mobile order

Implemented with DOM order media → text and `lg:order-*` for the desktop sides, so screen readers
and small screens both get media first. (Today the DOM order is text → media.)

## Components

- `src/blocks/Split/Component.tsx`: server component, picks points or steps mode.
- `src/blocks/Split/Steps.tsx` (new, client): the list, the observer, the active index, and the
  media layers. Scenes are rendered on the server and passed in as `React.ReactNode` children
  (same pattern as `FeatureTabs`' `TabData.visual`), so the client component carries no
  illustration code.
- `src/components/Feature` stays the item shape for points mode.

## Content conversion

Every `heading` block directly followed by an `items` block with `style: 'steps'` becomes one
`split` block in steps mode:

| Split field | From |
|---|---|
| `header.eyebrow/heading/lead` | the heading block (its `align` is dropped: Split's text is left-aligned) |
| `mediaSide` | `right` |
| `pointStyle` | `steps` |
| `visual` | per page, see the table below |
| `points` | the items rows (`icon`, `title`, `text`); `ownVisual`/`visual` per the table below |
| `links` | the heading block's `links` (0–2, same limit) |
| `settings` | background from the items block, `gapTop` from the heading, `gapBottom` from the items |
| `id` | `<heading id>-split`, so every locale pass writes the same row |
| `hidden` | hidden if both parts were hidden |

An `items` steps row without a heading before it becomes a Split with an empty header. Items steps
rows are the only input; nothing else on the page changes. On production the phase 1 migration
first turns legacy `steps` blocks into heading + items steps, and this conversion picks them up
from there.

The converter lives next to the legacy one (`src/sections/steps.ts`, pure function over a layout)
and is run by the existing page runner pattern (`convertPages.ts`: published and draft per locale,
never-published main row too, idempotent). Scenes are assigned by page slug from a small map in the
converter; a page not in the map gets the section scene `builder` and no per-step scenes.

The seed (`src/endpoints/seed/pages.ts`) builds these sections as Split blocks directly, with the
same scenes, so a fresh seed and a converted database match.

### Proposed scenes

The section scene avoids repeating the page's hero scene, which sits directly above the steps.

| Page | Hero scene | Section scene | Per-step scenes |
|---|---|---|---|
| agent | agentChat | resi | 1 sources · 2 — · 3 dashboard |
| mcp | mcp | semanticLayer | 1 — · 2 — · 3 agentChat |
| build-with-ai | builder | dashboard | 1 — · 2 — · 3 alerts |
| dashboards | templates | comparison | 1 templates · 2 — · 3 team |
| flying-kpis | flyingKpis | dashboard | 1 — · 2 — · 3 alerts |
| integrations | sync | integrations | 1 — · 2 sources · 3 — |
| kpi-studio | kpiStudio | semanticLayer | 1 — · 2 kpiStudio · 3 dimensions · 4 collections |
| governance | governance | team | 1 — · 2 — · 3 governance |

"—" means the step shows the section scene. Pages whose steps would all fall back behave as one
scene beside a list (no pinning), which is fine. These are proposals to adjust in the admin later;
they only need to be good enough to ship.

## Production

- Schema: a migration adds `point_style` to the split block table and `own_visual` plus the visual
  columns to the split points table. The Items `style` enum is unchanged.
- Data: the same migration converts the pages through the runner, as the section-blocks migration
  does.
- Ordering constraint: this migration reads and writes pages through the Local API with the current
  config, so it only works on a database that already has the section blocks (phase 1). It ships
  in a deploy after phase 1 ran on production, the same rule as phase 2. Dev already has phase 1.
- Dev: schema arrives by push; the conversion runs with a script (`scripts/convert-steps.ts`), with
  a `pg_dump` backup first.

## Tests

- Converter (int): heading + steps → one Split with the mapped fields; steps without heading;
  hidden handling; ids stable across locales; idempotent; pages without steps untouched.
- Split render (int): DOM order media → text; `lg:order-*` per side; steps numbered `01…`;
  step 1 with own scene hides the top scene on mobile; no sticky/min-height without per-step scenes.
- Steps client (int, jsdom with a stubbed IntersectionObserver): the observed step becomes active
  and its layer visible; reduced motion drops the transition class.
- e2e (Playwright, kpi-studio page): scrolling to step 3 shows the `dimensions` layer; at 390 px
  width the scene comes before the heading.
- Items: `steps` no longer offered in the picker, still renders for an unconverted row.

## Out of scope

- New illustrations for steps that fall back today.
- Removing the `steps` value from the Items enum (with phase 2 or later).
- The legacy `steps` block (removed in phase 2).
