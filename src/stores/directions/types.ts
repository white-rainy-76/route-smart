import type { Directions } from '@/services/directions/types/directions'

export interface DirectionsState {
  directions: Directions | null
  isLoading: boolean
  selectedRouteSectionId: string | null
  savedRouteId: string | null
  isTripActive: boolean
}

export interface DirectionsActions {
  setDirections: (directions: Directions | null) => void
  setLoading: (isLoading: boolean) => void
  setSelectedRouteSectionId: (sectionId: string | null) => void
  setSavedRouteId: (savedRouteId: string | null) => void
  setIsTripActive: (isActive: boolean) => void
  clearDirections: () => void
}

export interface DirectionsStore extends DirectionsState {
  actions: DirectionsActions
}
