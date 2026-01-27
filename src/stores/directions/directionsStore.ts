import { createStore } from '../create-store'
import type { DirectionsState, DirectionsStore } from './types'

const initialState: DirectionsState = {
  directions: null,
  isLoading: false,
  selectedRouteSectionId: null,
  savedRouteId: null,
  isTripActive: false,
}

export const useDirectionsStore = createStore<DirectionsStore>((set) => ({
  ...initialState,
  actions: {
    setDirections: (directions) =>
      set((state) => {
        state.directions = directions
        state.selectedRouteSectionId =
          directions?.route && directions.route.length > 0
            ? directions.route[0].routeSectionId
            : null
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading
      }),

    setSelectedRouteSectionId: (sectionId) =>
      set((state) => {
        state.selectedRouteSectionId = sectionId
      }),

    setSavedRouteId: (savedRouteId) =>
      set((state) => {
        state.savedRouteId = savedRouteId
      }),

    setIsTripActive: (isActive) =>
      set((state) => {
        state.isTripActive = isActive
      }),

    clearDirections: () =>
      set((state) => {
        state.directions = null
        state.isLoading = false
        state.selectedRouteSectionId = null
        state.savedRouteId = null
        state.isTripActive = false
      }),
  },
}))
