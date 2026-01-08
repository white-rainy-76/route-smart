import { z } from 'zod'

export const authResponseSchema = z.object({
  userId: z.string(),
  token: z.string(),
  refreshToken: z.string(),
  refreshTokenExpiresAt: z.string().optional(),
})

export const refreshTokenResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  refreshTokenExpiresAt: z.string(),
})
