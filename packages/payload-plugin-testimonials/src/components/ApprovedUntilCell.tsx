'use client'

import React from 'react'

/** List cell for `approvedUntil`: the date, red once it has passed. */
export const ApprovedUntilCell: React.FC<{ cellData?: string | null }> = ({ cellData }) => {
  if (!cellData) return <span>—</span>
  const date = new Date(cellData)
  const expired = date.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)
  return <span style={expired ? { color: 'var(--theme-error-500)', fontWeight: 600 } : undefined}>{date.toLocaleDateString('de-DE')}</span>
}
