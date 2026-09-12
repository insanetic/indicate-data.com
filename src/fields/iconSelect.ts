import type { Field, SelectField } from 'payload'

import deepMerge from '@/utilities/deepMerge'
import { iconOptions } from '@/components/Icon/options'

/** Curated icon list with friendly names, so the marketer never sees icon ids. */
export const iconSelect = (overrides: Partial<SelectField> = {}): Field => {
  const field: SelectField = {
    name: 'icon',
    type: 'select',
    label: { de: 'Icon', en: 'Icon' },
    options: [...iconOptions],
  }
  return deepMerge(field, overrides)
}
