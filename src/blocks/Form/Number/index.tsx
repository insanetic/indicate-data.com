import type { TextField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import React from 'react'

import { controlClassName, Field, useFieldA11y, useFormLabels } from '../Field'

export const Number: React.FC<
  TextField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, label, register, required, width }) => {
  const labels = useFormLabels()
  const a11y = useFieldA11y(name, required)

  return (
    <Field label={label} name={name} required={required} width={width}>
      <Input
        className={controlClassName}
        defaultValue={defaultValue}
        inputMode="decimal"
        type="number"
        {...a11y}
        {...register(name, { required: required ? labels.required : false })}
      />
    </Field>
  )
}
