import { queryOptions } from '@tanstack/react-query'
import type { GetSavedRouteByIdPayload } from './payload/get-saved-route-by-id.payload'
import { getAllSavedRoute, getSavedRouteById } from './route.service'

export const ROUTES_ROOT_QUERY_KEY = ['routes']

export const routeQueries = {
  all: () => [...ROUTES_ROOT_QUERY_KEY],

  savedRouteById: (payload: GetSavedRouteByIdPayload) =>
    queryOptions({
      queryKey: [...ROUTES_ROOT_QUERY_KEY, 'saved-route-by-id', payload],
      queryFn: async ({ signal }) => {
        const data = await getSavedRouteById(payload, signal)
        return data
      },
    }),

  allSavedRoute: () =>
    queryOptions({
      queryKey: [...ROUTES_ROOT_QUERY_KEY, 'all-saved-route'],
      queryFn: async ({ signal }) => {
        const data = await getAllSavedRoute(signal)
        return data
      },
    }),
}
