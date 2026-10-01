'use client'

import React from 'react'
import { useFormContext } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { getDictionary } from '@/i18n/dictionaries'
import { useLocale } from '@/providers/Locale'

import { Error } from '../Error'
import { Width } from '../Width'

/** Shared look of text inputs, textareas and select triggers; merged over the shadcn defaults. */
export const controlClassName =
  'h-12 rounded-[0.625rem] border-line-strong bg-surface px-4 text-base text-ink shadow-none placeholder:text-ink-3 transition-[border-color,box-shadow] hover:border-ink-3 focus-visible:border-[var(--focus)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_oklch,var(--focus)_18%,transparent)] aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-4 aria-invalid:focus-visible:ring-[color-mix(in_oklch,var(--destructive)_18%,transparent)] md:text-[0.9375rem]'

export const useFormLabels = () => getDictionary(useLocale()).form

/** Browser autofill hints for the field names our forms use. */
const autoCompleteByName: Record<string, string> = {
  name: 'name',
  firstName: 'given-name',
  lastName: 'family-name',
  email: 'email',
  phone: 'tel',
  hotel: 'organization',
  company: 'organization',
}

export const autoCompleteFor = (name: string) => autoCompleteByName[name]

/** Ids and aria attributes that tie a control to its label and error message. */
export const useFieldA11y = (name: string, required?: boolean | null) => {
  const {
    formState: { errors },
  } = useFormContext()
  const invalid = Boolean(errors[name])
  return {
    id: name,
    'aria-invalid': invalid || undefined,
    'aria-required': required || undefined,
    'aria-describedby': invalid ? `${name}-error` : undefined,
  }
}

/** Label, control and error for one form field. Optional fields are marked instead of required ones. */
export const Field: React.FC<{
  children: React.ReactNode
  label?: string | null
  name: string
  required?: boolean | null
  width?: number | string | null
}> = ({ children, label, name, required, width }) => {
  const labels = useFormLabels()
  const {
    formState: { errors },
  } = useFormContext()

  return (
    <Width width={width}>
      {label && (
        <Label className="mb-2 flex items-baseline gap-2 text-sm font-medium text-ink-2" htmlFor={name}>
          {label}
          {!required && <span className="text-xs font-normal text-ink-3">{labels.optional}</span>}
        </Label>
      )}
      {children}
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
