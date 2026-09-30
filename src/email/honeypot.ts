import { APIError, type CollectionBeforeValidateHook } from 'payload'

import { HONEYPOT_FIELD } from '@/blocks/Form/submission'

export { HONEYPOT_FIELD }

/** A filled trap fails the submission (nothing saved, nothing sent); an empty one is removed before save. */
export const rejectHoneypot: CollectionBeforeValidateHook = ({ data, operation }) => {
  if (operation !== 'create' || !data || !Array.isArray(data.submissionData)) return data
  const entries = data.submissionData as { field?: unknown; value?: unknown }[]
  const trap = entries.find((entry) => entry?.field === HONEYPOT_FIELD)
  if (trap && trap.value != null && String(trap.value).trim() !== '') {
    throw new APIError('Submission rejected.', 400, undefined, true)
  }
  return { ...data, submissionData: entries.filter((entry) => entry?.field !== HONEYPOT_FIELD) }
}
