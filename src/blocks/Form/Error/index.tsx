'use client'

import { CircleAlert } from 'lucide-react'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { getDictionary } from '@/i18n/dictionaries'
import { useLocale } from '@/providers/Locale'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  const labels = getDictionary(useLocale()).form

  return (
    <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive" id={`${name}-error`}>
      <CircleAlert aria-hidden className="size-4 shrink-0" />
      {(errors[name]?.message as string) || labels.required}
    </p>
  )
}
