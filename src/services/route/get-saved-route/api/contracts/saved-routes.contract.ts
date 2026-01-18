import { z } from 'zod'

// Location schema
export const LocationSchema = z.object({
  address: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
})

// ViaPoint schema
export const ViaPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  stopOrder: z.number(),
})

// Saved route item (for getAllSavedRoute)
export const SavedRouteItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  startLocation: LocationSchema,
  endLocation: LocationSchema,
  waypoints: z.array(ViaPointSchema).optional(),
})

export const GetAllSavedRouteSchema = z.array(SavedRouteItemSchema)

export type SavedRouteItem = z.infer<typeof SavedRouteItemSchema>
export type GetAllSavedRoute = z.infer<typeof GetAllSavedRouteSchema>
export type ViaPoint = z.infer<typeof ViaPointSchema>

// Saved route by id
export const GeoJsonSchema = z.object({
  type: z.string().nullable(),
  coordinates: z.array(z.array(z.number())),
})

export const SavedRouteByIdSchema = z.object({
  id: z.string().uuid(),
  geoJson: GeoJsonSchema,
})

export type SavedRouteById = z.infer<typeof SavedRouteByIdSchema>
