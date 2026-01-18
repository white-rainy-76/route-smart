import { z } from 'zod'

export const GetSavedRouteByIdPayloadSchema = z.object({
  id: z.string().uuid(),
})

export type GetSavedRouteByIdPayload = z.infer<
  typeof GetSavedRouteByIdPayloadSchema
>
