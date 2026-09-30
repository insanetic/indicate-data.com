// @vitest-environment node
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { APIError, type CollectionConfig, type Config, type Field } from 'payload'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@subneo/payload-lettermint', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@subneo/payload-lettermint')>()),
  getEmailSettings: vi.fn(async () => ({
    fromAddress: 'noreply@indicate-data.io',
    fromName: 'Indicate Data',
    notifyTo: ['hello@indicate-data.io', 'sales@indicate-data.io'],
  })),
}))

import { createCap } from '@/email/confirmationCap'
import { createBeforeEmail } from '@/email/formEmails'
import { rejectHoneypot } from '@/email/honeypot'
import { formBuilderOptions } from '@/plugins/formBuilder'

const formEmails = [
  { emailTo: '', language: 'all' },
  { emailTo: '{{email}}', language: 'de' },
  { emailTo: '{{email}}', language: 'en' },
]
// What the form builder hands over: an empty emailTo has already become its fallback address.
const incoming = (visitor = 'visitor@example.org') =>
  ['noreply@indicate-data.io', visitor, visitor].map((to, i) => ({ to, subject: `s${i}`, html: '<div>x</div>', from: '', replyTo: '', cc: '', bcc: '' }))
const params = (data: Record<string, unknown>) => {
  const findByID = vi.fn(async () => ({ id: 7, emails: formEmails }))
  const warn = vi.fn()
  return { args: { data, req: { payload: { findByID, logger: { warn } } } } as never, findByID, warn }
}

describe('beforeEmail', () => {
  it("sends the team mail and the confirmation in the visitor's language", async () => {
    const out = await createBeforeEmail(createCap())(incoming(), params({ form: 7, locale: 'en' }).args)
    expect(out.map((e) => [e.subject, e.to])).toEqual([
      ['s0', 'hello@indicate-data.io, sales@indicate-data.io'],
      ['s2', 'visitor@example.org'],
    ])
  })

  it('treats a submission without locale as German', async () => {
    const out = await createBeforeEmail(createCap())(incoming(), params({ form: 7 }).args)
    expect(out.map((e) => e.subject)).toEqual(['s0', 's1'])
  })

  it('reads the form id from a populated doc', async () => {
    const { args, findByID } = params({})
    ;(args as { doc?: unknown }).doc = { form: { id: 7 }, locale: 'de' }
    await createBeforeEmail(createCap())(incoming(), args)
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ collection: 'forms', id: 7, depth: 0 }))
  })

  it('cap counts spellings of one address together and keeps the team mail', async () => {
    const beforeEmail = createBeforeEmail(createCap())
    for (const visitor of ['visitor@example.org', 'Visitor@Example.org ', ' VISITOR@example.org']) {
      expect(await beforeEmail(incoming(visitor), params({ form: 7, locale: 'de' }).args)).toHaveLength(2)
    }
    const { args, warn } = params({ form: 7, locale: 'de' })
    const out = await beforeEmail(incoming('visitor@EXAMPLE.org'), args)
    expect(out.map((e) => e.subject)).toEqual(['s0'])
    expect(warn.mock.calls[0][0]).toContain('example.org')
    expect(warn.mock.calls[0][0]).not.toContain('visitor')
  })
})

describe('beforeEmail with an address list', () => {
  it('drops a comma list without using up either address', async () => {
    const cap = createCap()
    const beforeEmail = createBeforeEmail(cap)
    for (let i = 0; i < 5; i++) {
      const { args, warn } = params({ form: 7, locale: 'de' })
      const out = await beforeEmail(incoming('a1@x.io, victim@y.org'), args)
      expect(out.map((e) => e.subject)).toEqual(['s0'])
      expect(warn).toHaveBeenCalled()
      expect(JSON.stringify(warn.mock.calls)).not.toMatch(/x\.io|victim|y\.org/)
    }
    expect(cap.allow('a1@x.io')).toBe(true)
    expect(cap.allow('victim@y.org')).toBe(true)
  })

  it('drops an unresolved placeholder', async () => {
    const { args, warn } = params({ form: 7, locale: 'de' })
    const out = await createBeforeEmail(createCap())(incoming('{{email}}'), args)
    expect(out.map((e) => e.subject)).toEqual(['s0'])
    expect(warn).toHaveBeenCalled()
  })
})

describe('beforeEmail with an HTML-escaped recipient', () => {
  // The form builder HTML-escapes `{{email}}` before this hook sees it.
  it('caps a display-name address on the bare address, whatever the name', async () => {
    const beforeEmail = createBeforeEmail(createCap())
    const sent: unknown[] = []
    for (const name of ['a', 'b', 'c', 'd']) {
      const { args, warn } = params({ form: 7, locale: 'de' })
      const out = await beforeEmail(incoming(`&quot;${name}&quot; &lt;victim@y.org&gt;`), args)
      sent.push(out.map((e) => [e.subject, e.to]))
      if (name === 'd') expect(warn.mock.calls[0][0]).toContain('y.org')
    }
    expect(sent).toEqual([
      [['s0', 'hello@indicate-data.io, sales@indicate-data.io'], ['s1', 'victim@y.org']],
      [['s0', 'hello@indicate-data.io, sales@indicate-data.io'], ['s1', 'victim@y.org']],
      [['s0', 'hello@indicate-data.io, sales@indicate-data.io'], ['s1', 'victim@y.org']],
      [['s0', 'hello@indicate-data.io, sales@indicate-data.io']],
    ])
  })

  it('drops an address with trailing text without using up the cap', async () => {
    const cap = createCap()
    const beforeEmail = createBeforeEmail(cap)
    for (const visitor of ['victim@y.org (1)', 'victim@y.org (2)']) {
      const { args, warn } = params({ form: 7, locale: 'de' })
      expect((await beforeEmail(incoming(visitor), args)).map((e) => e.subject)).toEqual(['s0'])
      expect(JSON.stringify(warn.mock.calls)).not.toMatch(/victim|y\.org/)
    }
    expect(cap.allow('victim@y.org')).toBe(true)
  })

  it('decodes an apostrophe in the address', async () => {
    const out = await createBeforeEmail(createCap())(incoming('o&#39;brien@x.io'), params({ form: 7, locale: 'de' }).args)
    expect(out.map((e) => e.to)).toEqual(['hello@indicate-data.io, sales@indicate-data.io', "o'brien@x.io"])
  })
})

describe('createCap', () => {
  it('allows three per rolling hour', () => {
    let now = 0
    const cap = createCap({ now: () => now })
    expect([cap.allow('a@x.io'), cap.allow('a@x.io'), cap.allow('a@x.io'), cap.allow('a@x.io')]).toEqual([true, true, true, false])
    now = 60 * 60 * 1000
    expect(cap.allow('a@x.io')).toBe(true)
  })
})

describe('rejectHoneypot', () => {
  const run = (value: string, operation = 'create') =>
    rejectHoneypot({ data: { form: 1, submissionData: [{ field: 'name', value: 'Ada' }, { field: '_hp', value }] }, operation } as never)

  it('rejects a filled trap', () => {
    expect(() => run('https://spam.example')).toThrow(APIError)
    expect(() => run('x')).toThrow(expect.objectContaining({ status: 400 }))
  })

  it('rejects a filled trap that is not a string', () => {
    const fill = (value: unknown) => rejectHoneypot({ data: { submissionData: [{ field: '_hp', value }] }, operation: 'create' } as never)
    expect(() => fill(1)).toThrow(APIError)
    expect(() => fill(['x'])).toThrow(APIError)
    expect(fill(null)).toEqual({ submissionData: [] })
  })

  it('strips an empty trap before save', () => {
    expect(run('')).toEqual({ form: 1, submissionData: [{ field: 'name', value: 'Ada' }] })
  })

  it('leaves other operations alone', () => {
    expect(run('x', 'update')).toMatchObject({ submissionData: [{ field: 'name' }, { field: '_hp' }] })
  })
})

describe('formBuilderOptions', () => {
  const flatten = (fields: Field[]): Field[] =>
    fields.flatMap((f) => (!('name' in f) && 'fields' in f ? flatten(f.fields as Field[]) : [f]))
  const byName = (fields: Field[], name: string) => flatten(fields).find((f) => 'name' in f && f.name === name) as Field & Record<string, unknown>

  it('adds the language to form emails and the locale and trap to submissions', async () => {
    const config = await formBuilderPlugin(formBuilderOptions)({ collections: [] } as unknown as Config)
    const forms = (config.collections as CollectionConfig[]).find((c) => c.slug === 'forms')!
    const emails = byName(forms.fields, 'emails') as unknown as { fields: Field[] }
    expect(byName(emails.fields, 'language')).toMatchObject({ type: 'select', defaultValue: 'all' })
    const submissions = (config.collections as CollectionConfig[]).find((c) => c.slug === 'form-submissions')!
    expect(byName(submissions.fields, 'locale')).toMatchObject({ type: 'select', defaultValue: 'de' })
    expect(submissions.hooks?.beforeValidate).toContain(rejectHoneypot)
  })
})
