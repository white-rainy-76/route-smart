import { z } from 'zod'

export const CoordinateDtoSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
})

export const TollRoadDtoSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  ref: z.string().nullable(),
  highwayType: z.string().nullable(),
  isToll: z.boolean().nullable(),
  coordinates: z.array(CoordinateDtoSchema),
})

// Toll roads by section IDs
export const GetTollRoadsResponseDtoSchema = z.array(TollRoadDtoSchema)
