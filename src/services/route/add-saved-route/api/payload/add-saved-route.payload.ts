import { z } from 'zod'

export const AddSavedRoutePayloadSchema = z.object({
  routeSectionId: z.string().uuid(),
  routeName: z
    .string()
    .optional()
    .transform((val) =>
      val && val.trim().length > 0 ? val.trim() : undefined,
    ),
})

export type AddSavedRoutePayload = z.infer<typeof AddSavedRoutePayloadSchema>
