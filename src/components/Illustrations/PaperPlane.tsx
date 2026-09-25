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
/** Inside the keel, so the fourth facet folds away out of sight. */
const TUCK = at(-12, 10)

type Tri = [Pt, Pt, Pt]

/** Centre of a triangle: each facet turns around its own centre while it folds. */
const centre = (t: Tri): Pt => ({ x: (t[0].x + t[1].x + t[2].x) / 3, y: (t[0].y + t[1].y + t[2].y) / 3 })

/**
 * CSS `matrix()` that maps triangle `from` onto triangle `to` (an affine map exists for any
 * pair). Animating `none` → this matrix folds the paper without morphing a path, so it runs on
 * the compositor in every browser. Coordinates are stage units (`transform-box: view-box`); the
 * matrix is written for a `transform-origin` at `from`'s centre, since CSS interpolates the
 * rotation around the origin and a far one would swing the facet through a wide arc.
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
  const o = centre(from)
  // x' = L·x + t about the stage origin equals o + L·(x − o) + t', so t' = t − o + L·o.
  const e = q0.x - (a * p0.x + c * p0.y) - o.x + (a * o.x + c * o.y)
  const f = q0.y - (b * p0.x + d * p0.y) - o.y + (b * o.x + d * o.y)
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
const ROUTE: [Pt, Pt, Pt, Pt] = [NOSE, { x: NOSE.x + 44, y: NOSE.y }, { x: NOSE.x + 74, y: LAND.y + 6 }, { x: LAND.x - 8, y: LAND.y + 1 }]
const route = `M ${ROUTE[0].x} ${ROUTE[0].y} C ${ROUTE[1].x} ${ROUTE[1].y} ${ROUTE[2].x} ${ROUTE[2].y} ${ROUTE[3].x} ${ROUTE[3].y}`

/**
 * The flight, sampled along the route: at each step the nose sits on the curve, turned along
 * its direction and a little smaller. Steps are even in time, eased in distance (smoothstep),
 * like the trail that draws behind it; the rotation turns around the nose.
 */
const FLY_STEPS = 6
const flight = Array.from({ length: FLY_STEPS }, (_, i) => {
  const u = (i + 1) / FLY_STEPS
  const t = u * u * (3 - 2 * u)
  const [p0, p1, p2, p3] = ROUTE
  const m = 1 - t
  const x = m ** 3 * p0.x + 3 * m ** 2 * t * p1.x + 3 * m * t ** 2 * p2.x + t ** 3 * p3.x
  const y = m ** 3 * p0.y + 3 * m ** 2 * t * p1.y + 3 * m * t ** 2 * p2.y + t ** 3 * p3.y
  const dx = 3 * m ** 2 * (p1.x - p0.x) + 6 * m * t * (p2.x - p1.x) + 3 * t ** 2 * (p3.x - p2.x)
  const dy = 3 * m ** 2 * (p1.y - p0.y) + 6 * m * t * (p2.y - p1.y) + 3 * t ** 2 * (p3.y - p2.y)
  const turn = (Math.atan2(dy, dx) * 180) / Math.PI - (Math.atan2(NOSE.y - P.y, NOSE.x - P.x) * 180) / Math.PI
  return `translate(${(x - NOSE.x).toFixed(2)}px, ${(y - NOSE.y).toFixed(2)}px) rotate(${turn.toFixed(2)}deg) scale(${(1 - 0.45 * t).toFixed(3)})`
})

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
        {/* The route shows once there is a plane to fly it; the flight draws over it. */}
        <g className="loop-plane-route">
          <path className="hub-dots" d={route} fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="1.1" style={v({ '--gap': 4 })} />
        </g>

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

        {/* Envelope → plane → flight. */}
        <g
          className="loop-plane-fly"
          style={v({ '--ox': `${NOSE.x}px`, '--oy': `${NOSE.y}px`, ...Object.fromEntries(flight.map((step, i) => [`--k${i + 1}`, step])) })}
        >
          {facets.map((f, i) => (
            <polygon
              className="loop-plane-facet"
              key={i}
              points={points(f.tri)}
              stroke="var(--line-strong)"
              strokeLinejoin="round"
              strokeWidth="0.6"
              style={v({
                '--ox': `${centre(f.tri).x.toFixed(2)}px`,
                '--oy': `${centre(f.tri).y.toFixed(2)}px`,
                '--open': f.open ? affine(f.tri, f.open) : 'none',
                '--to': affine(f.tri, f.plane),
                ...Object.fromEntries(FOLD.map((t, k) => [`--f${k + 1}`, affine(f.tri, lerp(f.tri, f.plane, t))])),
                '--env': f.envelope,
                '--wing': f.wing,
              })}
            />
          ))}
        </g>

        {/* Delivered. */}
        <g className="loop-plane-tick" style={v({ '--ox': `${LAND.x}px`, '--oy': `${LAND.y}px` })}>
          <circle cx={LAND.x} cy={LAND.y} fill="var(--success-soft)" r={8} stroke="var(--success)" strokeOpacity="0.5" strokeWidth="0.8" />
          <path d={`M ${LAND.x - 3.4} ${LAND.y + 0.2} l 2.3 2.3 l 4.6 -4.8`} fill="none" stroke="var(--success-deep)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </g>
      </svg>
    </Scene>
  )
}
