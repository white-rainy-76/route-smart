import { z } from 'zod'

import { appleSignInPayloadSchema } from '../payload/apple-sign-in.payload'
import {
  signInPayloadSchema,
  signUpPayloadSchema,
} from '../payload/auth.payload'
import { refreshTokenPayloadSchema } from '../payload/refresh-token.payload'

export type SignInPayload = z.infer<typeof signInPayloadSchema>
export type SignUpPayload = z.infer<typeof signUpPayloadSchema>
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>
export type AppleSignInPayload = z.infer<typeof appleSignInPayloadSchema>
