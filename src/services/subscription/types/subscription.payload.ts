import { z } from 'zod'
import {
  subscriptionStatusPayloadSchema,
} from '../contracts/subscription.contract'

export type SubscriptionStatusPayload = z.infer<
  typeof subscriptionStatusPayloadSchema
>






