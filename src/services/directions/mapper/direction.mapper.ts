import { z } from 'zod'
import { DirectionsDtoSchema } from '../contracts/direction.contract.dto'
import { Directions } from '../types/directions'

export const mapDirections = (
  dto: z.infer<typeof DirectionsDtoSchema>,
): Directions => ({
  routeId: dto.routeId,
  route: dto.routeDtos,
  waypoints: dto.waypoints?.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
    stopOrder: point.stopOrder,
    name: point.name,
    address: point.address,
  })),
})
