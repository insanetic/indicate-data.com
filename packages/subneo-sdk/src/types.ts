/**
 * Wire types of the Subneo public API (`GET /v1/plans`), mirroring the Go DTOs in
 * `api/http/v1/model/public/plan.go` and `entitlement.go` field for field.
 *
 * Conventions of the encoder (encoding/json/v2):
 * - money and other 64-bit integers arrive as decimal strings (`"49000000"`), never as numbers;
 * - capacities are `"5"` or `"infinite"`;
 * - `metadata` is always an object (`{}` when empty), arrays are always present (`[]` when empty);
 * - fields marked optional here are omitted on the wire when empty or zero.
 */

export type Cadence = 'day' | 'week' | 'month' | 'year'

export type PriceModel = 'flat' | 'graduated' | 'volume'

export type PackageRounding = 'up' | 'down'

/** `"none"` is input-only; a cleared fee is absent in responses. */
export type EtfKind = 'flat' | 'percent_remaining' | 'periods_remaining'

/** `"none"` is input-only; a cleared uplift is absent in responses. */
export type RenewalUpliftKind = 'flat' | 'percentage' | 'cpi_indexed'

export type EntitlementKind = 'boolean' | 'string' | 'number' | 'allocation' | 'consumable'

export type ResetPeriod = 'hour' | 'day' | 'week' | 'month' | 'year'

export type ResetAnchor = 'none' | 'subscription_start' | 'calendar_aligned'

/** A 64-bit integer as a decimal string, e.g. `"49000000"`. */
export type BigIntString = string

/** A quantity as a decimal string (`"5"`) or the literal `"infinite"`. */
export type Capacity = string

export const INFINITE: Capacity = 'infinite'

/** A decimal percentage as a string with trailing zeros trimmed, e.g. `"25"` or `"12.5"`. */
export type PercentString = string

/** RFC 3339 timestamp with milliseconds, e.g. `"2026-09-01T00:00:00.000Z"`. */
export type DateTimeString = string

/** Free-form key/value pairs set on the plan or version in the Subneo console. */
export type Metadata = Record<string, unknown>

export interface PlanList {
  data: Plan[]
}

export interface Plan {
  code: string
  name: string
  metadata: Metadata
  version: PlanVersion
  rates: PlanRate[]
  entitlements: PlanEntitlement[]
}

export interface PlanVersion {
  number: number
  effectiveFrom: DateTimeString
  taxCode?: string
  metadata: Metadata
}

/** One offer of a plan version: a single currency and billing period with its terms. */
export interface PlanRate {
  code: string
  /** ISO 4217, e.g. `"EUR"`. */
  currency: string
  amountMicros: BigIntString
  msrpAmountMicros?: BigIntString

  billingPeriod: Cadence
  billingPeriodCount: number

  trialPeriod?: Cadence
  trialPeriodCount?: number
  trialRequiresPaymentMethod: boolean

  commitmentPeriod?: Cadence
  commitmentPeriodCount?: number
  renewalCommitmentPeriod?: Cadence
  renewalCommitmentPeriodCount?: number

  noticePeriod?: Cadence
  noticePeriodCount?: number

  etfKind?: EtfKind
  etfAmountMicros?: BigIntString
  etfPercent?: PercentString
  etfPeriodsCount?: number

  autoRenew: boolean
  renewalUpliftKind?: RenewalUpliftKind
  renewalUpliftAmountMicros?: BigIntString
  renewalUpliftPercent?: PercentString

  /** Usage prices per feature in this rate's currency. A feature without one is free. */
  featureRates: PlanFeatureRate[]
}

export interface PlanFeatureRate {
  featureCode: string
  pricingModel: PriceModel
  /** Flat model: price per unit (or per package when `packageSize` is set). */
  amountMicros?: BigIntString
  /** Graduated and volume models. */
  tiers?: PriceTier[]
  /** Emitted as a bare number, unlike the micros fields. */
  packageSize?: number
  packageRounding?: PackageRounding
}

export interface PriceTier {
  /** Absent on the last, unbounded tier. */
  upToUnits?: BigIntString
  unitAmountMicros: BigIntString
  flatAmountMicros: BigIntString
}

export interface PlanEntitlement {
  featureCode: string
  name: string
  description?: string
  kind: EntitlementKind
  group: PlanFeatureGroup
  value: EntitlementValue
  /** Sort order within the plan version, ascending. */
  position: number
}

export interface PlanFeatureGroup {
  code: string
  name: string
}

/** Only the fields the entitlement's `kind` names are present. */
export interface EntitlementValue {
  bool?: boolean
  text?: string
  number?: BigIntString

  min?: Capacity
  included?: Capacity
  max?: Capacity

  resetPeriod?: ResetPeriod
  resetPeriodCount?: number
  resetAnchor?: ResetAnchor

  rolloverEnabled?: boolean
  rolloverMaxCarry?: Capacity
}

/** RFC 9457 problem details, `application/problem+json`. */
export interface Problem {
  type?: string
  status: number
  title: string
  detail?: string
  cause?: string
  instance?: string
  timestamp?: DateTimeString
  code?: string
  errors?: ProblemError[]
}

export interface ProblemError {
  detail: string
  pointer?: string
  code?: string
  args?: string[]
}
