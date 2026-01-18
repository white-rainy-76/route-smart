import { z } from 'zod'

export const PointRequestPayloadSchema = z.object({
  latitude: z.number().min(-90).max(90, {
    message: 'Latitude must be between -90 and 90 degrees.',
  }),
  longitude: z.number().min(-180).max(180, {
    message: 'Longitude must be between -180 and 180 degrees.',
  }),
  name: z.string().optional(),
  address: z.string().optional(),
})

export const RouteRequestPayloadSchema = z.object({
  origin: PointRequestPayloadSchema,
  destination: PointRequestPayloadSchema,
  ViaPoints: z.array(PointRequestPayloadSchema).optional(),
  originName: z.string().optional(),
  destinationName: z.string().optional(),
  savedRouteId: z.string().optional(),
  milesPerGallon: z.number().min(0),
})
