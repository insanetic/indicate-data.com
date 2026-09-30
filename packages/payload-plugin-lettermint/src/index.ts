export { l } from './labels'
export {
  bareAddress,
  formatAddress,
  splitAddressList,
  toAddressList,
  toLettermintBody,
  type LettermintSendBody,
  type MappedBody,
} from './message'
export { LettermintError, pingToken, sendMail, type ClientOptions, type LettermintSendResponse } from './client'
export { readToken, tokenHint } from './token'
export { createLettermintAdapter, type LettermintResult } from './adapter'
export { getEmailSettings, optionsOf, readEmailSettings } from './settings'
export * from './types'
