import { z } from 'zod'

export const GetWeighStationsAlongPolylineSectionsPayloadSchema = z.array(
  z.string(),
)

export type GetWeighStationsAlongPolylineSectionsPayload = z.infer<
  typeof GetWeighStationsAlongPolylineSectionsPayloadSchema
>
