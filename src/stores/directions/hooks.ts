import { useDirectionsStore } from './directionsStore'
import {
  directionsActionsSelector,
  directionsLoadingSelector,
  directionsSelector,
  isTripActiveSelector,
  savedRouteIdSelector,
  selectedRouteSectionIdSelector,
} from './selectors'

export const useDirections = () => useDirectionsStore(directionsSelector)

export const useDirectionsLoading = () =>
  useDirectionsStore(directionsLoadingSelector)

export const useDirectionsSelectedRouteSectionId = () =>
  useDirectionsStore(selectedRouteSectionIdSelector)

export const useDirectionsSavedRouteId = () =>
  useDirectionsStore(savedRouteIdSelector)

export const useDirectionsTripActive = () =>
  useDirectionsStore(isTripActiveSelector)

export const useDirectionsActions = () =>
  useDirectionsStore(directionsActionsSelector)
