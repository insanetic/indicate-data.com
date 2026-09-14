'use client'
import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

export const CategoryRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ key?: string; label?: string }>()
  return <div>{data?.key ? `${data.key}${data.label ? `: ${data.label}` : ''}` : 'Kategorie / Category'}</div>
}

export const ServiceRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ name?: string; integration?: string }>()
  const integration = data?.integration && data.integration !== 'none' ? ` (${data.integration})` : ''
  return <div>{data?.name ? `${data.name}${integration}` : 'Dienst / Service'}</div>
}
