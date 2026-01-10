import { z } from 'zod'
import { CoordinatePairSchema } from './direction.contract'

export const RouteInfoDtoSchema = z.object({
  gallons: z.number().min(0),
  miles: z.number().min(0),
  driveTime: z.number().min(0),
})

export const WaypointDtoSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  stopOrder: z.number(),
  name: z.string().optional(),
  address: z.string().optional(),
})

export const RouteDtoSchema = z.object({
  routeSectionId: z.string(),
  mapPoints: z.array(CoordinatePairSchema),
  routeInfo: RouteInfoDtoSchema,
})

export const DirectionsDtoSchema = z.object({
  routeId: z.string(),
  routeDtos: z.array(RouteDtoSchema),
  waypoints: z.array(WaypointDtoSchema).optional(),
})
