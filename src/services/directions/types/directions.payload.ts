import { z } from 'zod'

import {
  PointRequestPayloadSchema,
  RouteRequestPayloadSchema,
} from '../payload/directions.payload'

export type RouteRequestPayload = z.infer<typeof RouteRequestPayloadSchema>
export type PointRequestPayload = z.infer<typeof PointRequestPayloadSchema>
