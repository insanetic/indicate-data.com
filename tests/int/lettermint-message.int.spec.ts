// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { bareAddress, formatAddress, splitAddressList, toAddressList, toLettermintBody } from '@subneo/payload-lettermint'

describe('addresses', () => {
  it('splits on separating commas only', () => {
    expect(splitAddressList('a@x.io, "Doe, Jane" <j@y.io>,b@z.io')).toEqual(['a@x.io', '"Doe, Jane" <j@y.io>', 'b@z.io'])
    expect(splitAddressList(' , ')).toEqual([])
    expect(splitAddressList('"Say \\"hi, there\\"" <a@x.io>, b@x.io')).toEqual(['"Say \\"hi, there\\"" <a@x.io>', 'b@x.io'])
  })

  it('formats objects and quotes display names', () => {
    expect(formatAddress({ name: 'Indicate Data, Team', address: 'hi@x.io' })).toBe('"Indicate Data, Team" <hi@x.io>')
    expect(formatAddress({ name: 'Say "hi"', address: 'hi@x.io' })).toBe('"Say \\"hi\\"" <hi@x.io>')
    expect(formatAddress({ address: ' hi@x.io ' })).toBe('hi@x.io')
    expect(splitAddressList(formatAddress({ name: 'Indicate Data, Team', address: 'hi@x.io' }))).toHaveLength(1)
  })

  it('accepts every shape Payload may hand over', () => {
    expect(toAddressList(undefined)).toEqual([])
    expect(toAddressList('')).toEqual([])
    expect(toAddressList(['a@x.io', { name: 'B', address: 'b@x.io' }])).toEqual(['a@x.io', '"B" <b@x.io>'])
    expect(toAddressList('a@x.io, b@x.io')).toEqual(['a@x.io', 'b@x.io'])
  })

  it('reads the bare address', () => {
    expect(bareAddress('"Doe, Jane" <J@Y.io>')).toBe('J@Y.io')
    expect(bareAddress(' a@x.io ')).toBe('a@x.io')
  })
})

describe('toLettermintBody', () => {
  it('maps a form-builder message', () => {
    const { body, dropped } = toLettermintBody({
      from: '"Indicate Data" <noreply@x.io>',
      to: 'team@x.io, other@x.io',
      cc: '',
      bcc: '',
      replyTo: 'visitor@y.io',
      subject: 'Neue Anfrage',
      html: '<div>Hallo</div>',
    })
    expect(body).toEqual({
      from: '"Indicate Data" <noreply@x.io>',
      to: ['team@x.io', 'other@x.io'],
      reply_to: ['visitor@y.io'],
      subject: 'Neue Anfrage',
      html: '<div>Hallo</div>',
    })
    expect(dropped).toEqual([])
  })

  it('leaves from out when the message has none', () => {
    expect(toLettermintBody({ to: 'a@x.io', subject: 's', html: '<p>x</p>' }).body.from).toBeUndefined()
  })

  it('omits bodies Lettermint would reject and reads buffers', () => {
    const { body } = toLettermintBody({ to: 'a@x.io', subject: 's', html: 'ab', text: Buffer.from('plain text') })
    expect(body.html).toBeUndefined()
    expect(body.text).toBe('plain text')
  })

  it('reports options it cannot send', () => {
    const { body, dropped } = toLettermintBody({
      to: 'a@x.io',
      subject: 's',
      html: '<p>x</p>',
      attachments: [{ filename: 'a.txt', content: 'x' }],
      priority: 'high',
    })
    expect(dropped).toEqual(['attachments', 'priority'])
    expect(body).not.toHaveProperty('attachments')
  })
})
