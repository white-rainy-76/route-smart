import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { AxiosRequestConfig } from 'axios'
import { GetTollRoadsResponse } from '../model/types/roads'
import { GetTollRoadsResponseDtoSchema } from './contracts/toll-roads.dto.contract'
import { mapGetTollRoads } from './mapper/toll-roads.mapper'
import {
  GetTollRoadsPayload,
  GetTollRoadsPayloadSchema,
} from './payload/toll-roads.payload'

export const getTollRoads = async (
  payload: GetTollRoadsPayload,
  signal?: AbortSignal,
): Promise<GetTollRoadsResponse> => {
  const validatedPayload = GetTollRoadsPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }

  const response = await api
    .post(`/fuelroutes-api/FuelRoute/get-toll-roads`, validatedPayload, config)
    .then(responseContract(GetTollRoadsResponseDtoSchema))

  return mapGetTollRoads(response.data)
}
