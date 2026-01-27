import type { GetTollsAlongPolylineSectionsResponse } from '@/services/tolls/get-tolls-along-polyline-sections/types/toll-with-section'

export interface TollsState {
  tolls: GetTollsAlongPolylineSectionsResponse | null
  isLoading: boolean
}

export interface TollsActions {
  setTolls: (tolls: GetTollsAlongPolylineSectionsResponse | null) => void
  setLoading: (isLoading: boolean) => void
  clearTolls: () => void
}

export interface TollsStore extends TollsState {
  actions: TollsActions
}
