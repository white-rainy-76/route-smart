import { z } from 'zod'

/**
 * What client sends to backend for Apple subscription verification.
 * - transactionJws: StoreKit2 signed transaction JWS (best signal)
 * - transactionId/originalTransactionId: helpful for server lookups & idempotency
 * - appAccountToken: UUID linking purchase to user account (set during purchase request)
 */
export const verifyAppleSubscriptionPayloadSchema = z.object({
  productId: z.string(),
  transactionJws: z.string(),
  transactionId: z.string().optional(),
  originalTransactionId: z.string().optional(),
  appAccountToken: z.string().uuid().optional(),
})

export const subscriptionEntitlementSchema = z.object({
  isActive: z.boolean(),
  productId: z.string().optional(),
  originalTransactionId: z.string().optional(),
  // ISO string (server should use a single canonical timezone, typically UTC)
  expiresAt: z.string().optional(),
  environment: z.enum(['Sandbox', 'Production']).optional(),
})

export const verifyAppleSubscriptionResponseSchema = z.object({
  entitlement: subscriptionEntitlementSchema,
})

export const getMyEntitlementResponseSchema = z.object({
  entitlement: subscriptionEntitlementSchema,
})


