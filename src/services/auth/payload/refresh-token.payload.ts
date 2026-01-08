import { z } from 'zod'

export const refreshTokenPayloadSchema = z.object({
  refreshToken: z.string(),
})
