import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { passwordResetHTML, passwordResetSubject } from '../../email/passwordReset'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: {
    forgotPassword: {
      generateEmailSubject: passwordResetSubject,
      generateEmailHTML: passwordResetHTML,
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
