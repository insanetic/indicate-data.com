'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const StatRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ value?: string; suffix?: string; label?: string }>()
  return <div>{data?.value ? `${data.value}${data.suffix || ''} ${data.label || ''}` : 'Kennzahl'}</div>
}
