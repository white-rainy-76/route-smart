import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { AxiosRequestConfig } from 'axios'
import {
  GetWeighStationsAlongPolylineSectionsResponse,
  GetWeighStationsAlongPolylineSectionsResponseSchema,
} from '../types/weigh-stations-with-section'
import {
  GetWeighStationsAlongPolylineSectionsPayload,
  GetWeighStationsAlongPolylineSectionsPayloadSchema,
} from './payload/get-weigh-stations-along-polyline-sections.payload'

export const getWeighStationsAlongPolylineSections = async (
  payload: GetWeighStationsAlongPolylineSectionsPayload,
  signal?: AbortSignal,
): Promise<GetWeighStationsAlongPolylineSectionsResponse> => {
  const validatedPayload =
    GetWeighStationsAlongPolylineSectionsPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }

  const response = await api
    .post(
      `/fuelroutes-api/FuelRoute/weigh-stations-along-polyline-sections`,
      validatedPayload,
      config,
    )
    .then(responseContract(GetWeighStationsAlongPolylineSectionsResponseSchema))

  return response.data
}
