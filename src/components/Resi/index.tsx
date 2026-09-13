import React from 'react'

import { cn } from '@/utilities/ui'

/** The agent's name. Matched as a whole word so "Resi" in CMS copy gets the gradient. */
export const RESI = 'Resi'
const pattern = /(\bResi\b)/

/** True when a plain string names Resi. */
export const mentionsResi = (text: string | null | undefined): boolean => Boolean(text && pattern.test(text))

/** The name, set in the Resi gradient. Renders "Resi" unless given other children. */
export const ResiName: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children }) => (
  <span className={cn('resi-name', className)}>{children ?? RESI}</span>
)

/**
 * Wraps every mention of Resi in a plain CMS string with `<ResiName>`, so the name is always
 * set in the gradient. Strings without the name come back unchanged.
 */
export function withResi(text: string | null | undefined): React.ReactNode {
  if (!text) return text ?? null
  if (!pattern.test(text)) return text
  // One wrapper, so the text stays a single item inside flex parents (links, menu rows).
  return <span>{text.split(pattern).map((part, i) => (part === RESI ? <ResiName key={i} /> : part))}</span>
}

/**
 * Resi's mark: the three logo bars in white on a gradient disc. `thinking` pulses the bars
 * (same rhythm as the agent's thinking indicator).
 */
export const ResiMark: React.FC<{ size?: number; thinking?: boolean; className?: string }> = ({
  size = 32,
  thinking = false,
  className,
}) => (
  <span
    aria-hidden="true"
    className={cn('inline-flex shrink-0 items-center justify-center rounded-full text-white', className)}
    style={{ width: size, height: size, background: 'var(--gradient-resi)' }}
  >
    <svg className={cn(thinking && 'bars-thinking')} height={size * 0.5} viewBox="0 0 32 32" width={size * 0.5}>
      <path
        d="M7.23,17.93l6.06-10.5c1.07-1.85.43-4.22-1.42-5.29h0c-1.85-1.07-4.22-.43-5.29,1.42L.52,14.06c-1.07,1.85-.43,4.22,1.42,5.29h0c1.85,1.07,4.22.43,5.29-1.42Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
      <path
        d="M24,2.15h0c-1.85-1.07-4.22-.43-5.29,1.42L6.59,24.56c-1.07,1.85-.43,4.22,1.42,5.29h0c1.85,1.07,4.22.43,5.29-1.42L25.41,7.44c1.07-1.85.43-4.22-1.42-5.29Z"
        fill="currentColor"
      />
      <path
        d="M30.06,12.65h0c-1.85-1.07-4.22-.43-5.29,1.42l-6.06,10.5c-1.07,1.85-.43,4.22,1.42,5.29h0c1.85,1.07,4.22.43,5.29-1.42l6.06-10.5c1.07-1.85.43-4.22-1.42-5.29Z"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  </span>
)
