// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { contactForm } from '@/endpoints/seed/contact-form'
import { applyContactFormEmails, contactFormEmails } from '@/endpoints/seed/contact-form-emails'

describe('contact form emails', () => {
  it('has one team mail and one confirmation per language', () => {
    expect(contactFormEmails.map((e) => e.language)).toEqual(['all', 'de', 'en'])
    const [team, de, en] = contactFormEmails
    expect(team).toMatchObject({ emailTo: '', emailFrom: '', replyTo: '{{email}}', subject: 'Neue Kontaktanfrage: {{name}}' })
    expect(JSON.stringify(team.message)).toContain('{{*:table}}')
    for (const confirmation of [de, en]) expect(confirmation).toMatchObject({ emailTo: '{{email}}', replyTo: 'hello@indicate-data.io' })
  })

  it('never repeats what the visitor typed in a confirmation', () => {
    for (const confirmation of contactFormEmails.slice(1)) {
      expect(confirmation.subject).not.toMatch(/\{\{/)
      expect(JSON.stringify(confirmation.message)).not.toMatch(/\{\{/)
    }
  })

  it('is what the seed installs', () => {
    expect(contactForm.emails).toBe(contactFormEmails)
  })
})

describe('applyContactFormEmails', () => {
  const fakePayload = (docs: unknown[]) => {
    const find = vi.fn(async () => ({ docs }))
    const update = vi.fn(async () => ({}))
    return { payload: { find, update } as never, find, update }
  }

  it('replaces the email entries of the existing contact form', async () => {
    const { payload, find, update } = fakePayload([{ id: 3, emails: [{ emailTo: 'hello@indicate-data.io', subject: 'Alt' }] }])
    expect(await applyContactFormEmails(payload)).toEqual({ updated: true, id: 3, before: ['Alt → hello@indicate-data.io'] })
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'forms', where: { title: { equals: 'Kontaktformular' } } }))
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ collection: 'forms', id: 3, data: { emails: contactFormEmails } }))
  })

  it('does nothing without a contact form', async () => {
    const { payload, update } = fakePayload([])
    expect(await applyContactFormEmails(payload)).toEqual({ updated: false })
    expect(update).not.toHaveBeenCalled()
  })
})
