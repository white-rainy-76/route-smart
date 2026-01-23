import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { AxiosRequestConfig } from 'axios'
import {
  subscriptionStatusPayloadSchema,
  subscriptionStatusResponseSchema
} from './contracts/subscription.contract'
import {
  SubscriptionStatusResponse
} from './types/subscription'
import {
  SubscriptionStatusPayload
} from './types/subscription.payload'

const ENDPOINTS = {
 
  subscriptionStatus: 'payment-api/api/billing/subscription/status',
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








