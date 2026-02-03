import { z } from 'zod'
import {
  restoreSubscriptionPayloadSchema,
  subscriptionStatusPayloadSchema,
} from '../contracts/subscription.contract'

export type SubscriptionStatusPayload = z.infer<
  typeof subscriptionStatusPayloadSchema
>

export type RestoreSubscriptionPayload = z.infer<
  typeof restoreSubscriptionPayloadSchema
>

















