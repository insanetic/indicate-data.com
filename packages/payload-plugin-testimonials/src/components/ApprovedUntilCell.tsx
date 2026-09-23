'use client'

import React from 'react'

import { approvalEnded } from '../select'

/** List cell for `approvedUntil`: the date, red once it has passed. An unparseable value is shown as stored. */
export const ApprovedUntilCell: React.FC<{ cellData?: string | null }> = ({ cellData }) => {
  if (!cellData) return <span>—</span>
  const date = new Date(cellData)
  if (Number.isNaN(date.getTime())) return <span>{cellData}</span>
  const expired = approvalEnded(cellData)
  return <span style={expired ? { color: 'var(--theme-error-500)', fontWeight: 600 } : undefined}>{date.toLocaleDateString('de-DE')}</span>
}
