import { z } from 'zod'

export const GetTollRoadsPayloadSchema = z.array(z.string().uuid())

export type GetTollRoadsPayload = z.infer<typeof GetTollRoadsPayloadSchema>
