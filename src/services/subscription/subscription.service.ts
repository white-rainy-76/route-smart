import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { AxiosRequestConfig } from 'axios'
import {
  restoreSubscriptionPayloadSchema,
  subscriptionStatusPayloadSchema,
  subscriptionStatusResponseSchema,
} from './contracts/subscription.contract'
import { SubscriptionStatusResponse } from './types/subscription'
import {
  RestoreSubscriptionPayload,
  SubscriptionStatusPayload,
} from './types/subscription.payload'

const ENDPOINTS = {
  subscriptionStatus: 'payment-api/api/billing/subscription/status',
  subscriptionReassign:
    'payment-api/api/billing/subscription/reassign-by-original-transaction-id',
} as const

export async function getSubscriptionStatus(
  payload: SubscriptionStatusPayload,
  signal?: AbortSignal,
): Promise<SubscriptionStatusResponse> {
  const validatedPayload = subscriptionStatusPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal, params: validatedPayload }
  const response = await api
    .get(ENDPOINTS.subscriptionStatus, config)
    .then(responseContract(subscriptionStatusResponseSchema))
  return response.data
}

/**
 * Reassign a subscription to the current user by originalTransactionId (e.g. Account B).
 * Backend validates receipt/JWS with Apple and stores entitlement for this user.
 * Call this after restorePurchases() when user switched accounts but has active sub on same Apple ID.
 */
export async function restoreSubscription(
  payload: RestoreSubscriptionPayload,
  signal?: AbortSignal,
): Promise<void> {
  const validatedPayload = restoreSubscriptionPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }
  await api.post(ENDPOINTS.subscriptionReassign, validatedPayload, config)
}



















