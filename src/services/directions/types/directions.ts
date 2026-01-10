import { z } from 'zod'
import {
  CoordinatePairSchema,
  DirectionsSchema,
  RouteSchema,
} from '../contracts/direction.contract'

export type CoordinatePair = z.infer<typeof CoordinatePairSchema>

export type Route = z.infer<typeof RouteSchema>
export type Directions = z.infer<typeof DirectionsSchema>

export type ActionType = 'create' | 'edit'
