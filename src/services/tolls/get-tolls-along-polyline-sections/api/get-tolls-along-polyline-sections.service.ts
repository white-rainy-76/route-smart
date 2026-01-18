import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { AxiosRequestConfig } from 'axios'
import {
  GetTollsAlongPolylineSectionsResponse,
  GetTollsAlongPolylineSectionsResponseSchema,
} from '../types/toll-with-section'
import {
  GetTollsAlongPolylineSectionsPayload,
  GetTollsAlongPolylineSectionsPayloadSchema,
} from './payload/get-tolls-along-polyline-sections.payload'

export const getTollsAlongPolylineSections = async (
  payload: GetTollsAlongPolylineSectionsPayload,
  signal?: AbortSignal,
): Promise<GetTollsAlongPolylineSectionsResponse> => {
  const validatedPayload =
    GetTollsAlongPolylineSectionsPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }

  const response = await api
    .post(
      `/fuelroutes-api/FuelRoute/get-tolls-along-polyline-sections`,
      validatedPayload,
      config,
    )
    .then(responseContract(GetTollsAlongPolylineSectionsResponseSchema))

  return response.data
}
