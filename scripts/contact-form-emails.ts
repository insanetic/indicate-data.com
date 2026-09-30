/**
 * Sets the email entries of the existing contact form to the ones the seed installs:
 *   NODE_ENV=production DATABASE_URL=postgres://payload:payload@localhost:5433/payload \
 *     ./node_modules/.bin/payload run scripts/contact-form-emails.ts
 * Safe to run again: it replaces the form's `emails` list (manual edits to that list are lost).
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { applyContactFormEmails, contactFormEmails } from '../src/endpoints/seed/contact-form-emails'

const payload = await getPayload({ config })
try {
  const result = await applyContactFormEmails(payload)
  if (!result.updated) {
    payload.logger.warn('[contact-form-emails] no contact form found; run the seed first')
  } else {
    payload.logger.info(`[contact-form-emails] form ${result.id} before: ${result.before.join(' | ') || '(none)'}`)
    payload.logger.info(`[contact-form-emails] form ${result.id} now: ${contactFormEmails.map((e) => `${e.subject} (${e.language})`).join(' | ')}`)
  }
  process.exit(0)
} catch (error) {
  payload.logger.error({ err: error, msg: '[contact-form-emails] failed' })
  process.exit(1)
}
