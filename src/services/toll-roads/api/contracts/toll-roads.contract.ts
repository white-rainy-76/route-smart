import { z } from 'zod'

export const CoordinateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export const TollRoadSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  ref: z.string().nullable(),
  highwayType: z.string().nullable(),
  isToll: z.boolean().nullable(),
  coordinates: z.array(CoordinateSchema),
})

// Toll roads by section IDs
export const GetTollRoadsResponseSchema = z.array(TollRoadSchema)
