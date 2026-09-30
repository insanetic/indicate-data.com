'use client'
import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

type Row = { code?: string; featureCode?: string; name?: string; value?: string; price?: number; packageSize?: number }

/** "code: name" for groups, features and plans; "feature: value" for entitlements and add-on prices. */
export const ManualRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<Row>()
  const code = data?.code || data?.featureCode
  const detail =
    data?.name ||
    data?.value ||
    (typeof data?.price === 'number' ? `${data.price} €${data.packageSize && data.packageSize > 1 ? ` / ${data.packageSize}` : ''}` : '')
  if (!code) return <div>{String((rowNumber ?? 0) + 1).padStart(2, '0')}</div>
  return <div>{detail ? `${code}: ${detail}` : code}</div>
}
