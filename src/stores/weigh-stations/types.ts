import type { GetWeighStationsAlongPolylineSectionsResponse } from '@/services/weigh-stations/get-weigh-stations-along-polyline-sections/types/weigh-stations-with-section'

export interface WeighStationsState {
  weighStations: GetWeighStationsAlongPolylineSectionsResponse | null
  isLoading: boolean
}

export interface WeighStationsActions {
  setWeighStations: (
    weighStations: GetWeighStationsAlongPolylineSectionsResponse | null,
  ) => void
  setLoading: (isLoading: boolean) => void
  clearWeighStations: () => void
}

export interface WeighStationsStore extends WeighStationsState {
  actions: WeighStationsActions
}
