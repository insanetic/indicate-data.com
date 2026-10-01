import type { EmailField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import React from 'react'

import { controlClassName, Field, useFieldA11y, useFormLabels } from '../Field'

export const Email: React.FC<
  EmailField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, label, register, required, width }) => {
  const labels = useFormLabels()
  const a11y = useFieldA11y(name, required)

  return (
    <Field label={label} name={name} required={required} width={width}>
      <Input
        autoComplete="email"
        className={controlClassName}
        defaultValue={defaultValue}
        inputMode="email"
        spellCheck={false}
        type="email"
        {...a11y}
        {...register(name, {
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: labels.invalidEmail },
          required: required ? labels.required : false,
        })}
      />
    </Field>
  )
}
