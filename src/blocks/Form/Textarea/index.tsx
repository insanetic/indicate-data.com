import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Textarea as TextAreaComponent } from '@/components/ui/textarea'
import { cn } from '@/utilities/ui'
import React from 'react'

import { controlClassName, Field, useFieldA11y, useFormLabels } from '../Field'

export const Textarea: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({ name, defaultValue, label, register, required, rows = 5, width }) => {
  const labels = useFormLabels()
  const a11y = useFieldA11y(name, required)

  return (
    <Field label={label} name={name} required={required} width={width}>
      {/* Grows with the text up to a cap, then scrolls. */}
      <TextAreaComponent
        className={cn(controlClassName, 'h-auto min-h-36 max-h-[24rem] resize-y py-3 leading-relaxed')}
        defaultValue={defaultValue}
        rows={rows}
        {...a11y}
        {...register(name, { required: required ? labels.required : false })}
      />
    </Field>
  )
}
