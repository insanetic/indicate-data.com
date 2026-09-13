import type { BigIntString } from './types'

export const MICROS_PER_UNIT = 1_000_000

/**
 * Converts a micros string to a decimal amount for display. Exact up to 2^53 micros
 * (about nine billion units), which covers every price a pricing page shows.
 */
export const microsToAmount = (micros: BigIntString | undefined | null): number => {
  if (micros === undefined || micros === null || micros === '') return 0
  if (!/^-?\d+$/.test(micros)) throw new RangeError(`not a micros string: ${micros}`)
  return Number(BigInt(micros)) / MICROS_PER_UNIT
}

export const amountToMicros = (amount: number): BigIntString => BigInt(Math.round(amount * MICROS_PER_UNIT)).toString()

export interface FormatMoneyOptions {
  /** Shows cents only when the amount has them; default `true`. */
  trimZeroCents?: boolean
  /** `"symbol"` (default) prints `€`, `"code"` prints `EUR`. */
  currencyDisplay?: 'symbol' | 'code' | 'narrowSymbol'
}

/** `formatMoney(100, 'EUR', 'de-DE')` → `"100 €"`, `formatMoney(12.5, 'EUR', 'en')` → `"€12.50"`. */
export const formatMoney = (amount: number, currency: string, locale: string, options: FormatMoneyOptions = {}): string => {
  const { trimZeroCents = true, currencyDisplay = 'symbol' } = options
  const whole = Number.isInteger(amount)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay,
    minimumFractionDigits: trimZeroCents && whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/** Whole-number percentage saved when paying `discounted` instead of `base`; `0` when nothing is saved. */
export const percentOff = (base: number, discounted: number): number => {
  if (base <= 0 || discounted >= base) return 0
  return Math.round((1 - discounted / base) * 100)
}
