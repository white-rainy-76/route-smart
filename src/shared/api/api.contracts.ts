import { z } from 'zod'

export const ApiErrorDataDtoSchema = z.object({
  errors: z.record(z.string(), z.array(z.string())),
})

export const ApiErrorDataSchema = z.array(z.string())
