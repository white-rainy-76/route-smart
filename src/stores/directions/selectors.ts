import type { DirectionsStore } from './types'

export const directionsActionsSelector = (state: DirectionsStore) => state.actions

export const directionsSelector = (state: DirectionsStore) => state.directions

export const directionsLoadingSelector = (state: DirectionsStore) =>
  state.isLoading

export const selectedRouteSectionIdSelector = (state: DirectionsStore) =>
  state.selectedRouteSectionId

export const savedRouteIdSelector = (state: DirectionsStore) => state.savedRouteId

export const isTripActiveSelector = (state: DirectionsStore) => state.isTripActive
