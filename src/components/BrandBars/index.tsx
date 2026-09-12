import React from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  /** Height in px; width follows the logo mark's proportions. */
  size?: number
  /** Pulses the bars one after another (agent "thinking"). */
  thinking?: boolean
  className?: string
}

/**
 * The three diagonal bars from the Indicate logo. Used as the eyebrow marker,
 * the agent's thinking indicator and inside illustrations.
 */
export const BrandBars: React.FC<Props> = ({ size = 14, thinking = false, className }) => (
  <svg
    aria-hidden="true"
    className={cn('inline-block shrink-0', thinking && 'bars-thinking', className)}
    height={size}
    viewBox="0 0 32 32"
    width={size}
  >
    <path
      d="M7.23,17.93l6.06-10.5c1.07-1.85.43-4.22-1.42-5.29h0c-1.85-1.07-4.22-.43-5.29,1.42L.52,14.06c-1.07,1.85-.43,4.22,1.42,5.29h0c1.85,1.07,4.22.43,5.29-1.42Z"
      fill="var(--brand-yellow)"
    />
    <path
      d="M24,2.15h0c-1.85-1.07-4.22-.43-5.29,1.42L6.59,24.56c-1.07,1.85-.43,4.22,1.42,5.29h0c1.85,1.07,4.22.43,5.29-1.42L25.41,7.44c1.07-1.85.43-4.22-1.42-5.29Z"
      fill="var(--brand-blue)"
    />
    <path
      d="M30.06,12.65h0c-1.85-1.07-4.22-.43-5.29,1.42l-6.06,10.5c-1.07,1.85-.43,4.22,1.42,5.29h0c1.85,1.07,4.22.43,5.29-1.42l6.06-10.5c1.07-1.85.43-4.22-1.42-5.29Z"
      fill="var(--brand-coral)"
    />
  </svg>
)
