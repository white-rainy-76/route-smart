import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { AxiosRequestConfig } from 'axios'
import {
  getMyEntitlementResponseSchema,
  verifyAppleSubscriptionPayloadSchema,
  verifyAppleSubscriptionResponseSchema,
} from './contracts/subscription.contract'
import { VerifyAppleSubscriptionPayload } from './types/subscription.payload'
import {
  GetMyEntitlementResponse,
  VerifyAppleSubscriptionResponse,
} from './types/subscription'

/**
 * Backend endpoints are intentionally "stubs" — adjust paths to your backend.
 *
 * Recommended backend behavior:
 * - Verify Apple JWS / transactionId via App Store Server API
 * - Persist entitlement per user
 * - Return canonical entitlement to the app
 */
const ENDPOINTS = {
  verifyApple: '/billing-api/iap/apple/verify',
  myEntitlement: '/billing-api/iap/entitlement',
} as const

export async function verifyAppleSubscription(
  payload: VerifyAppleSubscriptionPayload,
  signal?: AbortSignal,
): Promise<VerifyAppleSubscriptionResponse> {
  const validatedPayload = verifyAppleSubscriptionPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }
  const response = await api
    .post(ENDPOINTS.verifyApple, validatedPayload, config)
    .then(responseContract(verifyAppleSubscriptionResponseSchema))
  return response.data
}

export async function getMyEntitlement(
  signal?: AbortSignal,
): Promise<GetMyEntitlementResponse> {
  const config: AxiosRequestConfig = { signal }
  const response = await api
    .get(ENDPOINTS.myEntitlement, config)
    .then(responseContract(getMyEntitlementResponseSchema))
  return response.data
}



















