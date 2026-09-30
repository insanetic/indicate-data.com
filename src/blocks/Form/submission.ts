import type { Locale } from '@/i18n/config'

/** Name of the hidden trap field; bots fill it, people never see it. Checked in src/email/honeypot.ts. */
export const HONEYPOT_FIELD = '_hp'

/** Body for POST /api/form-submissions: the fields as the form builder expects them, plus the page language. */
export const buildSubmissionBody = (formID: number | string | undefined, data: Record<string, unknown>, locale: Locale) => ({
  form: formID,
  locale,
  submissionData: Object.entries(data).map(([field, value]) => ({ field, value })),
})
