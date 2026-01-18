import { z } from 'zod'
import {
  getMyEntitlementResponseSchema,
  subscriptionEntitlementSchema,
  verifyAppleSubscriptionResponseSchema,
} from '../contracts/subscription.contract'

export type SubscriptionEntitlement = z.infer<typeof subscriptionEntitlementSchema>
export type VerifyAppleSubscriptionResponse = z.infer<
  typeof verifyAppleSubscriptionResponseSchema
>
export type GetMyEntitlementResponse = z.infer<typeof getMyEntitlementResponseSchema>








