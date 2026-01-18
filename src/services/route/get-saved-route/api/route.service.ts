import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { AxiosRequestConfig } from 'axios'
import {
  SavedRouteById,
  SavedRouteItem,
} from './contracts/saved-routes.contract'
import {
  GetAllSavedRouteDtoSchema,
  SavedRouteByIdDtoSchema,
} from './contracts/saved-routes.dto.contract'
import { mapGetAllSavedRouteToSavedRouteItems } from './mapper/all-saved-route.mapper'
import { mapSavedRouteByIdDtoToData } from './mapper/saved-route-by-id.mapper'
import type { GetSavedRouteByIdPayload } from './payload/get-saved-route-by-id.payload'
import { GetSavedRouteByIdPayloadSchema } from './payload/get-saved-route-by-id.payload'

export const getSavedRouteById = async (
  payload: GetSavedRouteByIdPayload,
  signal?: AbortSignal,
): Promise<SavedRouteById> => {
  const validatedPayload = GetSavedRouteByIdPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }

  const response = await api
    .get(`/fuelroutes-api/FuelRoute/SavedRoutes/${validatedPayload.id}`, config)
    .then(responseContract(SavedRouteByIdDtoSchema))

  return mapSavedRouteByIdDtoToData(response.data)
}

export const getAllSavedRoute = async (
  signal?: AbortSignal,
): Promise<SavedRouteItem[]> => {
  const config: AxiosRequestConfig = { signal }

  const response = await api
    .get(`/fuelroutes-api/FuelRoute/GetAllSavedRoute`, config)
    .then(responseContract(GetAllSavedRouteDtoSchema))

  return mapGetAllSavedRouteToSavedRouteItems(response.data)
}
