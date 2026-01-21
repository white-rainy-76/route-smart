import { z } from 'zod'
import { verifyAppleSubscriptionPayloadSchema } from '../contracts/subscription.contract'

export type VerifyAppleSubscriptionPayload = z.infer<
  typeof verifyAppleSubscriptionPayloadSchema
>

















