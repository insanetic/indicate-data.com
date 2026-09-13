import type { Problem } from './types'

/** Thrown for every failed request. Carries the parsed problem document when the server sent one. */
export class SubneoError extends Error {
  readonly status: number
  readonly code: string | undefined
  readonly problem: Problem | undefined

  constructor(message: string, options: { status: number; code?: string; problem?: Problem; cause?: unknown }) {
    super(message, { cause: options.cause })
    this.name = 'SubneoError'
    this.status = options.status
    this.code = options.code
    this.problem = options.problem
  }
}

export const isSubneoError = (value: unknown): value is SubneoError =>
  value instanceof SubneoError || (typeof value === 'object' && value !== null && (value as Error).name === 'SubneoError')
