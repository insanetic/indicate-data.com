import type { SelectField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utilities/ui'
import React from 'react'
import { Controller } from 'react-hook-form'

import { controlClassName, Field, useFieldA11y, useFormLabels } from '../Field'

export const Select: React.FC<
  Omit<SelectField, 'blockType'> & {
    control: Control
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, label, options, required, width, defaultValue }) => {
  const labels = useFormLabels()
  const a11y = useFieldA11y(name, required)

  return (
    <Field label={label} name={name} required={required} width={width}>
      <Controller
        control={control}
        defaultValue={defaultValue ?? ''}
        name={name}
        render={({ field: { onBlur, onChange, value } }) => {
          const controlledValue = options.find((t) => t.value === value)

          return (
            <SelectComponent onValueChange={(val) => onChange(val)} value={controlledValue?.value}>
              <SelectTrigger className={cn(controlClassName, 'w-full')} onBlur={onBlur} {...a11y}>
                <SelectValue placeholder={labels.choose} />
              </SelectTrigger>
              <SelectContent>
                {options.map(({ label, value }) => {
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </SelectComponent>
          )
        }}
        rules={{ required: required ? labels.required : false }}
      />
    </Field>
  )
}
