import { z } from 'zod'
import {
  DirectionsDtoSchema,
  RouteDtoSchema,
} from '../contracts/direction.contract.dto'

export type RouteDto = z.infer<typeof RouteDtoSchema>
export type DirectionsDto = z.infer<typeof DirectionsDtoSchema>
