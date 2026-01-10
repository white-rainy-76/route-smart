import { z } from 'zod'

export const CoordinatesDtoSchema = z.object({
  latitude: z.number(), // after mapping this is a number
  longitude: z.number(), // after mapping this is a number
})
