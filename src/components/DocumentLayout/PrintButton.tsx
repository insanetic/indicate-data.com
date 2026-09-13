'use client'

import { Printer } from 'lucide-react'
import React from 'react'

type Props = { label: string }

/** Plain print trigger; hidden when printing. */
export const PrintButton: React.FC<Props> = ({ label }) => (
  <button
    className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-1.5 type-caption text-ink-2 transition-colors duration-150 hover:border-line-strong hover:text-ink print:hidden"
    onClick={() => window.print()}
    type="button"
  >
    <Printer aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
    {label}
  </button>
)
