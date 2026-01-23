import { GetWeighStationsAlongPolylineSectionsResponse } from '@/services/weigh-stations/get-weigh-stations-along-polyline-sections/types/weigh-stations-with-section'
import { create } from 'zustand'

interface WeighStationsStore {
  weighStations: GetWeighStationsAlongPolylineSectionsResponse | null
  isLoading: boolean
  setWeighStations: (
    weighStations: GetWeighStationsAlongPolylineSectionsResponse | null,
  ) => void
  setLoading: (isLoading: boolean) => void
  clearWeighStations: () => void
}

export const useWeighStationsStore = create<WeighStationsStore>()((set) => ({
  weighStations: null,
  isLoading: false,
  setWeighStations: (weighStations) => set({ weighStations }),
  setLoading: (isLoading) => set({ isLoading }),
  clearWeighStations: () => set({ weighStations: null, isLoading: false }),
}))
