import { api } from '@/shared/api/api.instance'
import { AxiosRequestConfig } from 'axios'
import {
  AddSavedRoutePayload,
  AddSavedRoutePayloadSchema,
} from './payload/add-saved-route.payload'

export const addSavedRoute = async (
  payload: AddSavedRoutePayload,
  signal?: AbortSignal,
): Promise<void> => {
  const validatedPayload = AddSavedRoutePayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }

  await api.post('/fuelroutes-api/FuelRoute/Save', validatedPayload, config)
}
