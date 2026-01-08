import { z } from 'zod'
import { ApiErrorDataDtoSchema, ApiErrorDataSchema } from './api.contracts'

export type ApiErrorDataDto = z.infer<typeof ApiErrorDataDtoSchema>
export type ApiErrorData = z.infer<typeof ApiErrorDataSchema>
