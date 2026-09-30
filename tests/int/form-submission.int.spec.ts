// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { buildSubmissionBody, HONEYPOT_FIELD } from '@/blocks/Form/submission'
import { HONEYPOT_FIELD as serverTrapName } from '@/email/honeypot'

describe('form submission body', () => {
  it('sends the page language with the fields', () => {
    expect(buildSubmissionBody(4, { name: 'Ada', [HONEYPOT_FIELD]: '' }, 'en')).toEqual({
      form: 4,
      locale: 'en',
      submissionData: [
        { field: 'name', value: 'Ada' },
        { field: '_hp', value: '' },
      ],
    })
  })

  it('uses the trap name the server checks', () => {
    expect(serverTrapName).toBe(HONEYPOT_FIELD)
  })
})
