'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const PillarRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  return <div>{data?.title || `Säule ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}

export const TileRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ value?: string; suffix?: string; label?: string }>()
  return <div>{[data?.value && `${data.value}${data.suffix || ''}`, data?.label].filter(Boolean).join(' ') || 'Kachel'}</div>
}
