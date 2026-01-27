import { createStore } from '../create-store'
import type { WeighStationsState, WeighStationsStore } from './types'

const initialState: WeighStationsState = {
  weighStations: null,
  isLoading: false,
}

export const useWeighStationsStore = createStore<WeighStationsStore>((set) => ({
  ...initialState,
  actions: {
    setWeighStations: (weighStations) =>
      set((state) => {
        state.weighStations = weighStations
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading
      }),

    clearWeighStations: () =>
      set((state) => {
        state.weighStations = null
        state.isLoading = false
      }),
  },
}))
