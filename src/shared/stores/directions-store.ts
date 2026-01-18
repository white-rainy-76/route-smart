import { Directions } from '@/services/directions/types/directions'
import { create } from 'zustand'

interface DirectionsStore {
  directions: Directions | null
  isLoading: boolean
  selectedRouteSectionId: string | null
  savedRouteId: string | null
  isTripActive: boolean
  setDirections: (directions: Directions | null) => void
  setLoading: (isLoading: boolean) => void
  setSelectedRouteSectionId: (sectionId: string | null) => void
  setSavedRouteId: (savedRouteId: string | null) => void
  setIsTripActive: (isActive: boolean) => void
  clearDirections: () => void
}

export const useDirectionsStore = create<DirectionsStore>()((set) => ({
  directions: null,
  isLoading: false,
  selectedRouteSectionId: null,
  savedRouteId: null,
  isTripActive: false,
  setDirections: (directions) =>
    set({
      directions,
      selectedRouteSectionId:
        directions?.route && directions.route.length > 0
          ? directions.route[0].routeSectionId
          : null,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedRouteSectionId: (sectionId) =>
    set({ selectedRouteSectionId: sectionId }),
  setSavedRouteId: (savedRouteId) => set({ savedRouteId }),
  setIsTripActive: (isActive) => set({ isTripActive: isActive }),
  clearDirections: () =>
    set({
      directions: null,
      isLoading: false,
      selectedRouteSectionId: null,
      savedRouteId: null,
      isTripActive: false,
    }),
}))
