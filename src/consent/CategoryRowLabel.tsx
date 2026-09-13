'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

export const CategoryRowLabel: React.FC<RowLabelProps> = () => {
  const { data } = useRowLabel<{ key?: string; label?: string }>()
  return <div>{data?.key ? `${data.key}${data.label ? `: ${data.label}` : ''}` : 'Kategorie / Category'}</div>
}
