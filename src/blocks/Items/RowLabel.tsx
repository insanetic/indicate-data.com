'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const ItemRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string; value?: string; unit?: string }>()
  const number = data?.value ? `${data.value}${data.unit || ''} · ` : ''
  return <div>{data?.title ? `${number}${data.title}` : `Eintrag ${rowNumber !== undefined ? rowNumber + 1 : ''}`}</div>
}
