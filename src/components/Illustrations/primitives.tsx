import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * Building blocks for the code-built illustrations. Everything is decorative:
 * the root of each illustration carries `role="img"` and an `aria-label`.
 */

export const Frame: React.FC<{
  label: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}> = ({ label, className, style, children }) => (
  <div
    aria-label={label}
    className={cn('relative select-none pointer-events-none text-left', className)}
    role="img"
    style={style}
  >
    {children}
  </div>
)

export const Backdrop: React.FC<{ className?: string; tone?: 'blue' | 'yellow' | 'coral' | 'mix' }> = ({
  className,
  tone = 'blue',
}) => {
  const tones = {
    blue: 'from-brand-blue-soft/70 to-transparent',
    yellow: 'from-brand-yellow-soft/70 to-transparent',
    coral: 'from-brand-coral-soft/70 to-transparent',
    mix: 'from-brand-blue-soft/60 via-brand-yellow-soft/40 to-transparent',
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        'absolute inset-0 rounded-[1.5rem] border border-line bg-gradient-to-br dot-grid',
        tones[tone],
        className,
      )}
    />
  )
}

export const Card: React.FC<{ className?: string; children: React.ReactNode; raised?: boolean }> = ({
  className,
  children,
  raised = true,
}) => (
  <div
    className={cn(
      'rounded-card border border-line bg-surface text-ink',
      raised && 'shadow-float',
      className,
    )}
  >
    {children}
  </div>
)

export const Chip: React.FC<{
  className?: string
  children: React.ReactNode
  tone?: 'blue' | 'yellow' | 'coral' | 'neutral' | 'green'
  style?: React.CSSProperties
}> = ({ className, children, tone = 'neutral', style }) => {
  const tones = {
    blue: 'bg-brand-blue-soft text-brand-blue-deep',
    yellow: 'bg-brand-yellow-soft text-ink',
    coral: 'bg-brand-coral-soft text-brand-coral',
    green: 'bg-[oklch(0.3_0.07_160)] text-[oklch(0.8_0.15_160)]',
    neutral: 'bg-surface-2 text-ink-2',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[0.6875rem] font-medium leading-5 tnum',
        tones[tone],
        className,
      )}
      style={style}
    >
      {children}
    </span>
  )
}

export const Kpi: React.FC<{
  label: string
  value: string
  delta?: string
  positive?: boolean
  className?: string
  style?: React.CSSProperties
}> = ({ label, value, delta, positive = true, className, style }) => (
  <div className={cn('flex flex-col gap-1', className)} style={style}>
    <span className="text-[0.75rem] leading-4 text-ink-3">{label}</span>
    <span className="font-display text-[1.5rem] leading-none font-medium tnum tracking-tight">
      {value}
    </span>
    {delta && (
      <span
        className={cn('text-[0.75rem] leading-4 font-medium tnum', positive ? 'text-[oklch(0.5_0.14_160)]' : 'text-brand-coral')}
      >
        {delta}
      </span>
    )}
  </div>
)

export const Avatar: React.FC<{ initials: string; tone?: 'blue' | 'yellow' | 'coral'; className?: string }> = ({
  initials,
  tone = 'blue',
  className,
}) => {
  const tones = {
    blue: 'bg-brand-blue text-white',
    yellow: 'bg-brand-yellow text-ink',
    coral: 'bg-brand-coral text-white',
  }
  return (
    <span
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-full text-[0.6875rem] font-semibold',
        tones[tone],
        className,
      )}
    >
      {initials}
    </span>
  )
}

/** Smooth line chart. `points` are 0–100 values, left to right. */
export const Sparkline: React.FC<{
  points: number[]
  color?: string
  secondary?: number[]
  secondaryColor?: string
  className?: string
  draw?: boolean
  fill?: boolean
  height?: number
}> = ({
  points,
  color = 'var(--brand-blue)',
  secondary,
  secondaryColor = 'var(--brand-yellow)',
  className,
  draw = false,
  fill = true,
  height = 60,
}) => {
  const w = 100
  const path = toPath(points, w, height)
  const area = `${path} L ${w} ${height} L 0 ${height} Z`
  const id = React.useId()
  return (
    <svg
      aria-hidden="true"
      className={cn('w-full', className)}
      preserveAspectRatio="none"
      viewBox={`0 0 ${w} ${height}`}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${id})`} />}
      {secondary && (
        <path
          d={toPath(secondary, w, height)}
          fill="none"
          stroke={secondaryColor}
          strokeDasharray="2 2"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <path
        className={draw ? 'draw-line' : undefined}
        d={path}
        fill="none"
        pathLength={1}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function toPath(points: number[], w: number, h: number) {
  const n = points.length
  const xs = points.map((_, i) => (i / (n - 1)) * w)
  const ys = points.map((p) => h - (p / 100) * (h - 6) - 3)
  let d = `M ${xs[0]} ${ys[0]}`
  for (let i = 1; i < n; i++) {
    const cx = (xs[i - 1] + xs[i]) / 2
    d += ` C ${cx} ${ys[i - 1]}, ${cx} ${ys[i]}, ${xs[i]} ${ys[i]}`
  }
  return d
}

/** Vertical bars, values 0–100. Optional second series drawn behind. */
export const Bars: React.FC<{
  values: number[]
  compare?: number[]
  color?: string
  compareColor?: string
  className?: string
  labels?: string[]
}> = ({
  values,
  compare,
  color = 'var(--brand-blue)',
  compareColor = 'var(--surface-3)',
  className,
  labels,
}) => (
  <div className={cn('flex h-full items-end gap-1.5', className)}>
    {values.map((v, i) => (
      <div className="flex h-full flex-1 flex-col justify-end gap-1" key={i}>
        <div className="relative flex h-full items-end">
          {compare && (
            <div
              className="absolute inset-x-0 bottom-0 rounded-[3px]"
              style={{ height: `${compare[i]}%`, background: compareColor }}
            />
          )}
          <div
            className="relative w-full rounded-[3px]"
            style={{ height: `${v}%`, background: color, marginInline: compare ? '18%' : 0 }}
          />
        </div>
        {labels && <span className="text-center text-[0.625rem] leading-3 text-ink-3">{labels[i]}</span>}
      </div>
    ))}
  </div>
)

/** Donut with up to three segments (percentages). */
export const Donut: React.FC<{ segments: { value: number; color: string }[]; className?: string; label?: string }> = ({
  segments,
  className,
  label,
}) => {
  const r = 15.9155
  const offsets = segments.reduce<number[]>((acc, s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + segments[i - 1].value)
    return acc
  }, [])
  return (
    <svg aria-hidden="true" className={cn('size-full', className)} viewBox="0 0 42 42">
      <circle cx="21" cy="21" fill="none" r={r} stroke="var(--surface-3)" strokeWidth="6" />
      {segments.map((s, i) => (
        <circle
          cx="21"
          cy="21"
          fill="none"
          key={i}
          r={r}
          stroke={s.color}
          strokeDasharray={`${s.value} ${100 - s.value}`}
          strokeDashoffset={25 - offsets[i]}
          strokeWidth="6"
        />
      ))}
      {label && (
        <text
          fill="var(--ink)"
          fontFamily="var(--font-display)"
          fontSize="8"
          fontWeight="500"
          textAnchor="middle"
          x="21"
          y="23.5"
        >
          {label}
        </text>
      )}
    </svg>
  )
}

export const Row: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('flex items-center gap-2', className)}>{children}</div>
)

export const Line: React.FC<{ w?: string; className?: string }> = ({ w = '60%', className }) => (
  <span className={cn('block h-2 rounded-pill bg-surface-3', className)} style={{ width: w }} />
)
