import { z } from 'zod'

export const GetTollsAlongPolylineSectionsPayloadSchema = z.array(z.string())

export type GetTollsAlongPolylineSectionsPayload = z.infer<
  typeof GetTollsAlongPolylineSectionsPayloadSchema
>
