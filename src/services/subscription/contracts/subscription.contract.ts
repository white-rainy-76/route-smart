import { z } from 'zod'


export const subscriptionStatusPayloadSchema = z.object({
  userId: z.string(),
})

export const subscriptionStatusResponseSchema = z.object({
  status: z.number().int().optional().nullable(),
  expiresAtUtc: z.string().optional().nullable(),
})


