import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { Coordinate } from '@/shared/types'
import { AxiosRequestConfig } from 'axios'
import { CoordinatesDtoSchema } from '../contracts/coordinates.dto.contract'
import { DirectionsDtoSchema } from './contracts/direction.contract.dto'
import { mapDirections } from './mapper/direction.mapper'
import {
  PointRequestPayloadSchema,
  RouteRequestPayloadSchema,
} from './payload/directions.payload'
import { ActionType, Directions } from './types/directions'
import {
  PointRequestPayload,
  RouteRequestPayload,
} from './types/directions.payload'

export const handleFuelRoute = async (
  payload: RouteRequestPayload,
  action: ActionType,
  signal?: AbortSignal,
): Promise<Directions> => {
  const validatedPayload = RouteRequestPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }

  let endpoint: string
  switch (action) {
    case 'create':
      endpoint = `/fuelroutes-api/FuelRoute/create-fuel-route`
      break
    case 'edit':
      endpoint = `/fuelroutes-api/FuelRoute/edit-fuel-route`
      break
    default:
      throw new Error(`Unknown action type: ${action}`)
  }

  const response = await api
    .post(endpoint, validatedPayload, config)
    .then(responseContract(DirectionsDtoSchema))

  return mapDirections(response.data)
}

export const getNearestDropPoint = async (
  payload: PointRequestPayload,
  signal?: AbortSignal,
): Promise<Coordinate> => {
  const validatedPayload = PointRequestPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }
  const response = await api
    .post(`/fuelroutes-api/FuelRoute/drop-point-V2`, validatedPayload, config)
    .then(responseContract(CoordinatesDtoSchema))

  return {
    latitude: response.data.latitude,
    longitude: response.data.longitude,
  }
}

export const cancelDirectionsCreation = async (
  signal?: AbortSignal,
): Promise<void> => {
  const config: AxiosRequestConfig = { signal }
  await api.post(
    `/fuelroutes-api/FuelRoute/canselation-create-fuel-route-canselation`,
    {},
    config,
  )
}
