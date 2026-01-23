import { z } from 'zod'

export const WeighStationSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  address: z.string().nullable(),
  web: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
})

export const WeighStationsAlongPolylineSectionSchema = z.object({
  weighStations: z.array(WeighStationSchema),
  sectionId: z.string().nullable(),
})

export const GetWeighStationsAlongPolylineSectionsResponseSchema = z.array(
  WeighStationsAlongPolylineSectionSchema,
)

export type WeighStation = z.infer<typeof WeighStationSchema>
export type WeighStationsAlongPolylineSection = z.infer<
  typeof WeighStationsAlongPolylineSectionSchema
>
export type GetWeighStationsAlongPolylineSectionsResponse = z.infer<
  typeof GetWeighStationsAlongPolylineSectionsResponseSchema
>
