import type { PluginConfig as FormBuilderPluginConfig } from '@payloadcms/plugin-form-builder/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { createBeforeEmail } from '@/email/formEmails'
import { submissionLocaleField, withEmailLanguage } from '@/email/formFields'
import { rejectHoneypot } from '@/email/honeypot'

export const formBuilderOptions: FormBuilderPluginConfig = {
  fields: {
    payment: false,
  },
  // Language filter, team recipients for entries without "To", limit on visitor confirmations.
  beforeEmail: createBeforeEmail(),
  formOverrides: {
    fields: ({ defaultFields }) => {
      return defaultFields.map((field) => {
        if ('name' in field && field.name === 'confirmationMessage') {
          return {
            ...field,
            editor: lexicalEditor({
              features: ({ rootFeatures }) => {
                return [...rootFeatures, FixedToolbarFeature(), HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] })]
              },
            }),
          }
        }
        return withEmailLanguage(field)
      })
    },
  },
  formSubmissionOverrides: {
    fields: ({ defaultFields }) => [...defaultFields, submissionLocaleField],
    hooks: { beforeValidate: [rejectHoneypot] },
  },
}
