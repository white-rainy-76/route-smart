import { z } from 'zod'

export const subscriptionStatusPayloadSchema = z.object({
  userId: z.string(),
})

export const subscriptionStatusResponseSchema = z.object({
  status: z.number().int().optional().nullable(),
  expiresAtUtc: z.string().optional().nullable(),
})

/**
 * Payload to link a restored Apple subscription to the current user (Account B).
 * Backend validates receipt/JWS with Apple and stores entitlement for this user.
 */
export const restoreSubscriptionPayloadSchema = z.object({
  productId: z.string(),
  /** iOS: JWS (purchaseToken); used by backend to verify with Apple */
  transactionJws: z.string().optional().nullable(),
  /** iOS: originalTransactionIdentifierIOS; helps link renewals */
  originalTransactionId: z.string().optional().nullable(),
  /** Optional; for idempotency / debug */
  transactionId: z.string().optional().nullable(),
})


