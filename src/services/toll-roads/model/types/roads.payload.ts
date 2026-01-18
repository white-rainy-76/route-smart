import { z } from 'zod'
import { GetTollRoadsPayloadSchema } from '../../api/payload/toll-roads.payload'

export type GetTollRoadsPayload = z.infer<typeof GetTollRoadsPayloadSchema>
