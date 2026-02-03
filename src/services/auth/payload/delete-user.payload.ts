import { z } from 'zod'

export const deleteUserPayloadSchema = z.object({
  userId: z.string().uuid(),
})

export type DeleteUserPayload = z.infer<typeof deleteUserPayloadSchema>