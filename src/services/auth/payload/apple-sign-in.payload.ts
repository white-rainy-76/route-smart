import { z } from 'zod'

export const appleSignInPayloadSchema = z.object({
  identityToken: z.string(),
})
