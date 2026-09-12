'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const StepRowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<{ title?: string }>()
  const n = rowNumber !== undefined ? rowNumber + 1 : ''
  return <div>{data?.title ? `${n}. ${data.title}` : `Schritt ${n}`}</div>
}
