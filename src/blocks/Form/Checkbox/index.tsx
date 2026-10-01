import type { CheckboxField } from '@payloadcms/plugin-form-builder/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { useFormContext } from 'react-hook-form'

import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { useFieldA11y, useFormLabels } from '../Field'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  const labels = useFormLabels()
  const a11y = useFieldA11y(name, required)
  const props = register(name, { required: required ? labels.required : false })
  const { setValue } = useFormContext()

  return (
    <Width width={width}>
      <div className="flex items-start gap-3">
        <CheckboxUi
          className="mt-0.5 size-5 border-line-strong bg-surface aria-invalid:border-destructive"
          defaultChecked={defaultValue}
          {...props}
          {...a11y}
          onCheckedChange={(checked) => {
            setValue(props.name, checked, { shouldValidate: true })
          }}
        />
        <Label className="cursor-pointer text-[0.9375rem] font-normal leading-snug text-ink-2" htmlFor={name}>
          {label}
          {!required && <span className="ml-2 text-xs text-ink-3">{labels.optional}</span>}
        </Label>
      </div>
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
