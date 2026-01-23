export const SUBSCRIPTION_STATUS = {
  UNKNOWN: 0,
  INCOMPLETE: 1,
  TRIALING: 2,
  ACTIVE: 3,
  PAST_DUE: 4,
  CANCELED: 5,
  UNPAID: 6,
} as const

export type SubscriptionStatusCode =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS]

export function normalizeSubscriptionStatus(
  status: number | null | undefined,
): SubscriptionStatusCode | null {
  if (typeof status !== 'number' || !Number.isFinite(status) || status <= 0) {
    return null
  }
  return status as SubscriptionStatusCode
}

export function isSubscriptionActive(status: number | null | undefined): boolean {
  return (
    status === SUBSCRIPTION_STATUS.TRIALING ||
    status === SUBSCRIPTION_STATUS.ACTIVE ||
    status === SUBSCRIPTION_STATUS.PAST_DUE
  )
}

export function hasSubscriptionHistory(
  status: number | null | undefined,
): boolean {
  return typeof status === 'number' && status > 0
}

export function getSubscriptionStatusLabel(
  status: number | null | undefined,
): string {
  switch (status) {
    case SUBSCRIPTION_STATUS.INCOMPLETE:
      return 'Incomplete'
    case SUBSCRIPTION_STATUS.TRIALING:
      return 'Trialing'
    case SUBSCRIPTION_STATUS.ACTIVE:
      return 'Active'
    case SUBSCRIPTION_STATUS.PAST_DUE:
      return 'Past due'
    case SUBSCRIPTION_STATUS.CANCELED:
      return 'Canceled'
    case SUBSCRIPTION_STATUS.UNPAID:
      return 'Unpaid'
    default:
      return 'Unknown'
  }
}
