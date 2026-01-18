import { z } from 'zod'

// DTO Location schema (from API)
export const LocationDtoSchema = z.object({
  address: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
})

// DTO ViaPoint schema (from API)
export const ViaPointDtoSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  name: z.string().nullable(),
  address: z.string().nullable(),
  stopOrder: z.number(),
})

// DTO Saved route item (from API for getAllSavedRoute)
export const GetAllSavedRouteItemDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  startLocation: LocationDtoSchema,
  endLocation: LocationDtoSchema,
  viaPoints: z.array(ViaPointDtoSchema).optional(),
})

export const GetAllSavedRouteDtoSchema = z.array(GetAllSavedRouteItemDtoSchema)

export type GetAllSavedRouteDto = z.infer<typeof GetAllSavedRouteDtoSchema>

// DTO Saved route by id (from API)
export const GeoJsonDtoSchema = z.object({
  type: z.string().nullable(),
  coordinates: z.array(z.array(z.number())),
})

export const SavedRouteByIdDtoSchema = z.object({
  id: z.string().uuid(),
  geoJson: GeoJsonDtoSchema,
})

export type SavedRouteByIdDto = z.infer<typeof SavedRouteByIdDtoSchema>
