import { z } from 'zod'
import {
  subscriptionStatusResponseSchema,
} from '../contracts/subscription.contract'


export type SubscriptionStatusResponse = z.infer<
  typeof subscriptionStatusResponseSchema
>



















