import React from 'react'

import { cn } from '@/utilities/ui'

import { Scene } from './Scene'
import { BUILD, type Pt } from './stage'
import type { IllustrationProps } from './index'

/*
 * One 360 × 120 stage on a 3 : 1 box at every width, so it stays horizontal on phones and
 * SVG units never stretch. Timing: `.loop-plane-*` in scenes/plane.css (8 s).
 */
const W = 360
const H = 120

/** Raw data: a 6 × 3 grid of bits; each row later condenses into one KPI bar. */
const COLS = 6
const ROWS = [44, 60, 76]
const BIT = 7
const GRID_X = 70
const STEP = 10
const bitTone = (c: number, r: number) =>
  (c + r * 2) % 5 === 1 ? 'var(--brand-blue)' : (c * 3 + r) % 7 === 2 ? 'var(--brand-yellow)' : (c + r) % 6 === 4 ? 'var(--brand-coral)' : 'var(--line-strong)'
/** Where each bit comes from: scattered to the left, closer rows start closer. */
const bitFrom = (c: number, r: number) => ({ x: -46 - ((c * 13 + r * 29) % 34), y: ((c * 17 + r * 11) % 23) - 11 })

/** The KPIs the bits become: one bar per row, CI colours, lengths as a share of the grid. */
const BAR_W = (COLS - 1) * STEP + BIT
const bars = [
  { y: ROWS[0], w: 1, color: 'var(--brand-blue)' },
  { y: ROWS[1], w: 0.72, color: 'var(--brand-yellow)' },
  { y: ROWS[2], w: 0.48, color: 'var(--brand-coral)' },
]

/** The envelope the KPIs go into: four triangles fanned around the flap's tip. */
const E = { x: 196, y: 60, w: 56, h: 38 }
const A: Pt = { x: E.x - E.w / 2, y: E.y - E.h / 2 }
const B: Pt = { x: E.x + E.w / 2, y: E.y - E.h / 2 }
const C: Pt = { x: E.x + E.w / 2, y: E.y + E.h / 2 }
const D: Pt = { x: E.x - E.w / 2, y: E.y + E.h / 2 }
const M: Pt = { x: E.x, y: E.y + 3 }
/** The open flap points up; closing it is a reflection across the top edge. */
const M_OPEN: Pt = { x: E.x, y: A.y - (M.y - A.y) }

/** The paper plane the envelope folds into, nose to the right: two wings, a keel and its fold. */
const P = { x: 200, y: 60 }
const at = (x: number, y: number): Pt => ({ x: P.x + x, y: P.y + y })
const TAIL_TOP = at(-24, -16)
const NOSE = at(26, -2)
const TAIL_LOW = at(-22, 16)
const CREASE = at(-10, 3)
const KEEL = at(-4, 12)
const TUCK = at(-14, 7)

type Tri = [Pt, Pt, Pt]

/**
 * CSS `matrix()` that maps triangle `from` onto triangle `to` (an affine map exists for any
 * pair). Animating `none` → this matrix folds the paper without morphing a path, so it runs on
 * the compositor in every browser. Coordinates are stage units (`transform-box: view-box`).
 */
function affine(from: Tri, to: Tri): string {
  const [p0, p1, p2] = from
  const [q0, q1, q2] = to
  const u = [p1.x - p0.x, p1.y - p0.y, p2.x - p0.x, p2.y - p0.y] // columns u1, u2
  const v = [q1.x - q0.x, q1.y - q0.y, q2.x - q0.x, q2.y - q0.y]
  const det = u[0] * u[3] - u[2] * u[1]
  // U⁻¹ = 1/det · [u2y −u2x; −u1y u1x]; L = V · U⁻¹
  const i = [u[3] / det, -u[1] / det, -u[2] / det, u[0] / det] // [a b; c d] of U⁻¹ as column-major
  const a = v[0] * i[0] + v[2] * i[1]
  const b = v[1] * i[0] + v[3] * i[1]
  const c = v[0] * i[2] + v[2] * i[3]
  const d = v[1] * i[2] + v[3] * i[3]
  const e = q0.x - (a * p0.x + c * p0.y)
  const f = q0.y - (b * p0.x + d * p0.y)
  const n = (x: number) => Number(x.toFixed(4))
  return `matrix(${n(a)}, ${n(b)}, ${n(c)}, ${n(d)}, ${n(e)}, ${n(f)})`
}

/** Envelope facet → plane facet; `open` is the facet's pose before the flap closes. */
const facets: { tri: Tri; plane: Tri; open?: Tri; envelope: string; wing: string }[] = [
  { tri: [A, B, M], plane: [TAIL_TOP, NOSE, CREASE], open: [A, B, M_OPEN], envelope: 'var(--surface-3)', wing: 'var(--ink)' },
  { tri: [B, C, M], plane: [NOSE, TAIL_LOW, CREASE], envelope: 'var(--surface-2)', wing: 'var(--brand-blue)' },
  // Corners in the same turning order as the envelope's, so no in-between pose goes flat.
  { tri: [C, D, M], plane: [TAIL_LOW, CREASE, KEEL], envelope: 'var(--surface-2)', wing: 'color-mix(in oklab, var(--brand-blue) 55%, var(--surface))' },
  { tri: [D, A, M], plane: [KEEL, TUCK, CREASE], envelope: 'var(--surface-2)', wing: 'color-mix(in oklab, var(--brand-blue) 55%, var(--surface))' },
]
/** The fold in between: the facet part-way to the plane (smoothstep), so the matrices stay close. */
const FOLD = [0.074, 0.259, 0.5, 0.741, 0.926]
const lerp = (from: Tri, to: Tri, t: number): Tri =>
  from.map((p, i) => ({ x: p.x + (to[i].x - p.x) * t, y: p.y + (to[i].y - p.y) * t })) as Tri
const points = (t: Tri) => t.map((p) => `${p.x},${p.y}`).join(' ')

/** The route: from the nose, a gentle climb to the top right, where the tick lands. */
const LAND: Pt = { x: 334, y: 30 }
const route = `M ${NOSE.x + 2} ${NOSE.y} C ${NOSE.x + 44} ${NOSE.y} ${NOSE.x + 74} ${LAND.y + 6} ${LAND.x - 8} ${LAND.y + 1}`

const v = (vars: Record<string, string | number>) => vars as React.CSSProperties

/**
 * Looping scene (wide, 8 s): bytes become a report that flies. Bits stream in from the left
 * and snap into a grid; each row condenses into a KPI bar (blue, yellow, coral); the bars slide
 * into an envelope whose flap closes; the envelope folds into a paper plane, facet by facet;
 * the plane climbs away along its route with a yellow pulse, and a tick lands where it
 * arrives. The same stage at every width. Reduced motion shows the plane with its route and
 * the tick. Pure CSS (`.loop-plane-*`).
 */
export const PaperPlaneIllustration: React.FC<IllustrationProps> = ({ className, locale }) => {
  const label =
    locale === 'en'
      ? 'Raw data turns into three KPIs, goes into an envelope, folds into a paper plane and is delivered'
      : 'Rohdaten werden zu drei Kennzahlen, kommen in einen Umschlag, falten sich zum Papierflieger und kommen an'

  return (
    // The loop opens with the bits already streaming, so it needs no quiet build before it.
    <Scene className={cn('w-full', className)} label={label} lead={BUILD} style={{ '--loop': '8s' } as React.CSSProperties}>
      <svg aria-hidden="true" className="aspect-[3/1] w-full overflow-visible" viewBox={`0 0 ${W} ${H}`}>
        {/* The route, always faintly there; the flight draws over it. */}
        <path className="hub-dots" d={route} fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="1.1" style={v({ '--gap': 4 })} />

        {/* Bits: in from the left, into the grid, then they give way to the bars. */}
        {ROWS.map((y, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const from = bitFrom(c, r)
            return (
              <rect
                className="loop-plane-bit"
                fill={bitTone(c, r)}
                height={BIT}
                key={`${r}-${c}`}
                rx={1.6}
                style={v({ '--fx': `${from.x}px`, '--fy': `${from.y}px`, '--delay': `${(c * 0.07 + r * 0.05).toFixed(2)}s` })}
                width={BIT}
                x={GRID_X + c * STEP}
                y={y - BIT / 2}
              />
            )
          }),
        )}

        {/* KPI bars: grow out of their row, then slide into the envelope. */}
        {bars.map((bar, i) => (
          <rect
            className="loop-plane-bar"
            fill={bar.color}
            height={6}
            key={i}
            rx={3}
            style={v({ '--dx': `${E.x - 10 - GRID_X}px`, '--dy': `${E.y - bar.y}px`, '--delay': `${(i * 0.06).toFixed(2)}s` })}
            width={BAR_W * bar.w}
            x={GRID_X}
            y={bar.y - 3}
          />
        ))}

        {/* Envelope → plane → flight. */}
        <g className="loop-plane-fly" style={v({ '--ox': `${P.x}px`, '--oy': `${P.y}px`, '--tx': `${LAND.x - 14 - P.x}px`, '--ty': `${LAND.y + 2 - P.y}px` })}>
          {facets.map((f, i) => (
            <polygon
              className="loop-plane-facet"
              key={i}
              points={points(f.tri)}
              stroke="var(--line-strong)"
              strokeLinejoin="round"
              strokeWidth="0.6"
              style={v({
                '--open': f.open ? affine(f.tri, f.open) : 'none',
                '--to': affine(f.tri, f.plane),
                ...Object.fromEntries(FOLD.map((t, k) => [`--f${k + 1}`, affine(f.tri, lerp(f.tri, f.plane, t))])),
                '--env': f.envelope,
                '--wing': f.wing,
              })}
            />
          ))}
        </g>

        {/* The flight: a blue line draws behind the plane, a yellow pulse runs ahead. */}
        <path className="loop-plane-trail" d={route} fill="none" pathLength={1} stroke="var(--brand-blue)" strokeLinecap="round" strokeWidth="1.2" />
        <path
          className="loop-plane-comet"
          d={route}
          fill="none"
          pathLength={1}
          stroke="var(--brand-yellow)"
          strokeLinecap="round"
          strokeWidth="2.2"
          style={v({ '--comet': 0.1, '--comet-from': 0.15 })}
        />

        {/* Delivered. */}
        <g className="loop-plane-tick" style={v({ '--ox': `${LAND.x}px`, '--oy': `${LAND.y}px` })}>
          <circle cx={LAND.x} cy={LAND.y} fill="var(--success-soft)" r={8} stroke="var(--success)" strokeOpacity="0.5" strokeWidth="0.8" />
          <path d={`M ${LAND.x - 3.4} ${LAND.y + 0.2} l 2.3 2.3 l 4.6 -4.8`} fill="none" stroke="var(--success-deep)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </g>
      </svg>
    </Scene>
  )
}
