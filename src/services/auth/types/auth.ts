import { z } from 'zod'
import {
  authResponseSchema,
  refreshTokenResponseSchema,
} from '../contracts/auth.contract'

export type AuthResponse = z.infer<typeof authResponseSchema>
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>
