import React from 'react'

/**
 * Shared pieces of the chat stages (`resiHub`, `resi`): three exchanges of 4 s on one 12 s
 * clock, driven by the `.loop-hub-*` keyframes in loops.css.
 */
export const SLOT = 4
export const SLOTS = 3
export const LOOP = SLOT * SLOTS

export type Pt = { x: number; y: number }

export const delay = (s: number): React.CSSProperties => ({ '--delay': `${s.toFixed(2)}s` }) as React.CSSProperties
/** Delay into exchange `slot`, plus an optional stagger. */
export const slotDelay = (slot: number, extra = 0) => delay(slot * SLOT + extra)
/** Elements that act the same in every exchange run on a 4 s clock. */
export const perSlot = { '--loop': `${SLOT}s` } as React.CSSProperties

/** Stage position (viewBox units) as percentage variables, applied only where the stage is laid out. */
export const pos = (p: Pt, width = 200, height = 100) =>
  ({ '--x': `${(p.x / width) * 100}%`, '--y': `${(p.y / height) * 100}%` }) as React.CSSProperties

/** Orthogonal connector with rounded corners: along y of `a`, down/up at `bend`, along y of `b`. */
export function elbow(a: Pt, b: Pt, bend: number, r = 3): string {
  if (Math.abs(a.y - b.y) < 0.01) return `M ${a.x} ${a.y} H ${b.x}`
  const dy = Math.sign(b.y - a.y)
  const dx1 = Math.sign(bend - a.x)
  const dx2 = Math.sign(b.x - bend)
  return [
    `M ${a.x} ${a.y}`,
    `H ${bend - dx1 * r}`,
    `Q ${bend} ${a.y} ${bend} ${a.y + dy * r}`,
    `V ${b.y - dy * r}`,
    `Q ${bend} ${b.y} ${bend + dx2 * r} ${b.y}`,
    `H ${b.x}`,
  ].join(' ')
}

/** Smooth path through 0–100 values on a `w` × `h` box (top = 100). */
export function curve(values: number[], w: number, h: number, pad = 2): string {
  const step = w / (values.length - 1)
  const y = (v: number) => pad + (1 - v / 100) * (h - pad * 2)
  return values
    .map((v, i) => {
      const x = i * step
      if (i === 0) return `M ${x} ${y(v)}`
      const cx = ((i - 1) * step + x) / 2
      return `C ${cx} ${y(values[i - 1])}, ${cx} ${y(v)}, ${x} ${y(v)}`
    })
    .join(' ')
}

/** Phones: a short vertical link between stacked rows; a pulse rides it once per exchange. */
export const Connector: React.FC<{ out?: boolean; className?: string; color?: string }> = ({ out = false, className, color }) => (
  <svg aria-hidden="true" className={className ?? 'h-9 w-3 shrink-0'} viewBox="0 0 12 36">
    <path className="hub-dots" d="M 6 2 V 34" fill="none" stroke="var(--line-strong)" strokeLinecap="round" strokeWidth="2" style={{ '--gap': 6 } as React.CSSProperties} />
    {Array.from({ length: SLOTS }, (_, slot) => (
      <path
        className={out ? 'loop-hub-comet-out' : 'loop-hub-comet'}
        d="M 6 2 V 34"
        fill="none"
        key={slot}
        pathLength={1}
        stroke={color ?? (out ? 'var(--resi-mint)' : 'var(--resi-teal)')}
        strokeLinecap="round"
        strokeWidth="3"
        style={{ ...slotDelay(slot), '--comet': 0.3 } as React.CSSProperties}
      />
    ))}
  </svg>
)

/** Ring that lights around a tile or card while exchange `slot` uses it. */
export const Lit: React.FC<{ slot: number; tone?: 'in' | 'out'; stagger?: number }> = ({ slot, tone = 'in', stagger = 0 }) => (
  <span
    aria-hidden="true"
    className={
      'pointer-events-none absolute -inset-[2px] rounded-[inherit] border-2 ' +
      (tone === 'in' ? 'loop-hub-lit border-brand-blue' : 'loop-hub-glow border-resi-mint')
    }
    data-slot={slot}
    style={slotDelay(slot, stagger)}
  />
)
