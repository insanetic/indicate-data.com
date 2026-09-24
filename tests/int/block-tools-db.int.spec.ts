// @vitest-environment node
import { commitTransaction, getPayload, initTransaction, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { paragraphs } from '@/endpoints/seed/lexical'
import config from '@/payload.config'
import { copyBlockToPage } from '@/plugins/blockTools/copyBlock'

// Writes to the database in DATABASE_URL: opt-in with BLOCK_TOOLS_DB_TEST=1, never the shared dev DB (`payload`).
const databaseName = (() => {
  try {
    return new URL(process.env.DATABASE_URL || '').pathname.slice(1)
  } catch {
    return ''
  }
})()
const enabled = process.env.BLOCK_TOOLS_DB_TEST === '1' && databaseName !== '' && databaseName !== 'payload'
const describeDb = enabled ? describe : describe.skip

const run = `${Date.now()}`
const context = { disableRevalidate: true }
type Loose = Record<string, any>

const faq = (heading: string, question: string) => ({
  blockType: 'faq',
  header: { heading },
  items: [{ question, answer: paragraphs([question]) }],
})

describeDb(`copyBlockToPage against the database${enabled ? '' : ' (skipped: needs BLOCK_TOOLS_DB_TEST=1 and a DATABASE_URL other than /payload)'}`, () => {
  let payload: Payload
  let user: Loose
  let sourceId: number
  let targetId: number

  const read = (id: number, locale: 'de' | 'en', draft: boolean) =>
    payload.findByID({ collection: 'pages', id, locale, draft, depth: 0, fallbackLocale: false, context }) as Promise<Loose>

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    user = (await payload.find({ collection: 'users', limit: 1 })).docs[0]
    const source = await payload.create({ collection: 'pages', locale: 'de', context, data: { title: `BT source ${run}`, slug: `bt-source-${run}`, _status: 'published', layout: [faq('Quelle DE', 'Frage DE')] } as never })
    sourceId = source.id
    const src = await read(sourceId, 'de', false)
    await payload.update({ collection: 'pages', id: sourceId, locale: 'en', context, data: { layout: [{ ...src.layout[0], header: { heading: 'Source EN' }, items: [{ ...src.layout[0].items[0], question: 'Question EN' }] }] } as never })
    const target = await payload.create({ collection: 'pages', locale: 'de', context, data: { title: `BT target ${run}`, slug: `bt-target-${run}`, _status: 'published', layout: [faq('Ziel live', 'Q')] } as never })
    targetId = target.id
    // A pending draft on the target that differs from the published version.
    const tgt = await read(targetId, 'de', false)
    await payload.update({ collection: 'pages', id: targetId, locale: 'de', draft: true, context, data: { layout: [{ ...tgt.layout[0], header: { heading: 'Ziel Entwurf' } }] } as never })
  })

  afterAll(async () => {
    if (!payload) return
    await payload.delete({ collection: 'pages', where: { slug: { in: [`bt-source-${run}`, `bt-target-${run}`] } }, context })
  })

  it('appends to the pending draft in both languages and leaves the published version alone', async () => {
    const req = { payload, user: { ...user, collection: 'users' }, context } as unknown as PayloadRequest
    const shouldCommit = await initTransaction(req)
    const result = await copyBlockToPage({ collection: 'pages', field: 'layout', sourceId, targetId, blockId: (await read(sourceId, 'de', true)).layout[0].id, req })
    if (shouldCommit) await commitTransaction(req)

    const draftDe = await read(targetId, 'de', true)
    const draftEn = await read(targetId, 'en', true)
    expect(draftDe.layout.map((b: Loose) => b.header.heading)).toEqual(['Ziel Entwurf', 'Quelle DE'])
    expect(draftEn.layout[1]).toMatchObject({ id: result.blockId, header: { heading: 'Source EN' }, items: [{ question: 'Question EN' }] })
    expect(draftDe.layout[1].items[0].id).toBe(draftEn.layout[1].items[0].id)

    const published = await read(targetId, 'de', false)
    expect(published.layout.map((b: Loose) => b.header.heading)).toEqual(['Ziel live'])

    const source = await read(sourceId, 'de', true)
    expect(source.layout).toHaveLength(1)
  })
})
