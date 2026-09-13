# Resi: the agent's name on the site

Date: 2026-09-13
Status: implemented under stated assumptions (built autonomously; open points at the end)

## 1. Goal

The AI agent is called Resi. The name is always set in the Resi gradient (blue on the left,
teal and mint on the right), wherever it appears. The home page introduces Resi with a
promotional banner, the agent page is built around Resi (hero and an animated section), the
MCP page cross-references Resi with a compact CTA, and the Product menu mentions Resi.

## 2. Identity in code

- Tokens in `globals.css`: `--resi-teal`, `--resi-mint`, `--gradient-resi`
  (`linear-gradient(100deg, var(--brand-blue) 0%, var(--resi-teal) 55%, var(--resi-mint) 100%)`).
  On the yellow accent band the gradient is redefined with darker stops of the same hues so the
  name stays legible.
- `src/components/Resi`: `ResiName` (gradient text), `ResiMark` (white logo bars on a gradient
  disc, `thinking` pulses them), `withResi(text)` (wraps every whole-word "Resi" in a plain CMS
  string), `mentionsResi(text)`.
- `withResi` is applied in every plain-text sink: `SectionHeading`, feature-story points and
  the stacked lead, card grid, steps, pillars, FAQ questions, hero trust line, `CMSLink` labels
  (except the yellow primary button), desktop and mobile navigation, the scene labels and the
  agent showcase. Rich text (FAQ answers, documents) cannot carry the gradient, so seeded copy
  never names Resi there; `tests/int/resi.int.spec.tsx` guards this.
- `.resi-ring`: a 1 px gradient border with a light travelling around the box (`@property
  --resi-angle` + conic gradient, 7 s, faster on hover; static full gradient under reduced
  motion). `.resi-aura`: a blurred gradient disc breathing behind the mark.

## 3. Surfaces

| Where | What |
|---|---|
| Home, after the logo wall | `spotlight` block, layout `banner`: mark with aura, "Sag hallo zu Resi." / "Meet Resi.", one sentence, outline link to `/agent`, arrow link to `/mcp`. |
| Home, agent showcase | Eyebrow and heading name Resi; the answer avatar is the Resi mark; the input says "Fragen Sie Resi …". |
| Agent page | Hero: eyebrow "Resi · Ihr KI-Agent", heading "Sag hallo zu Resi.", lead. New `featureStory` (stacked) with the `resi` scene right after the hero. Copy on the page names Resi instead of "der Agent". |
| MCP page, after the steps | `spotlight` block, layout `compact`: small mark, "In Claude antwortet Resi. Dieselbe wie in der App.", outline link "Resi kennenlernen". |
| Product menu | Entry "Resi, der Indicate Agent" with a gradient "Neu" tag (new localised `badge` field on menu entries, additive). The featured card is the Resi card (mark, ring, link to `/agent`). |

Page name (`pageNames.agent`) is "Resi, der Indicate Agent" / "Resi, the Indicate agent"; it
feeds the footer, the "Passt dazu" cards and the admin title.

## 4. The `resi` scene

`src/components/Illustrations/Resi.tsx`, 9 s clock, tracks `.loop-resi-q`, `.loop-resi-think`,
`.loop-resi-a` in `loops.css`. Left: the sources Resi may read, joined to the mark by flowing
connectors. Centre: the mark with aura and a slowly turning dashed orbit, the gradient name,
three chips (KPI catalogue, same permissions as in the app, languages). Right: three exchanges
take turns: question, "Resi prüft die Kennzahlen …", answer with KPI, delta and source. Reduced
motion shows the first exchange, finished.

## 5. Assumptions / open points

- "Sag hallo zu Resi." keeps the informal imperative as a slogan on an otherwise formal (Sie)
  site, as requested.
- No pronoun is used for Resi in English copy; German copy uses the name in every sentence.
- Yellow primary buttons never carry the name (the gradient is not legible on yellow), so
  button labels there say "Agent live erleben" rather than naming Resi.
- The announcement bar text still says "Der Indicate Agent …"; it is disabled and sits on the
  yellow band, where the darker gradient would apply if it were enabled.
