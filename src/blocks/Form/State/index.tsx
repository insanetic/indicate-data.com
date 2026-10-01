import type { StateField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldErrorsImpl } from 'react-hook-form'

import React from 'react'

import { Select } from '../Select'
import { stateOptions } from './options'

export const State: React.FC<
  StateField & {
    control: Control
    errors: Partial<FieldErrorsImpl>
  }
> = ({ blockType: _blockType, ...props }) => <Select {...props} options={stateOptions} />
