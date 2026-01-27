import { createStore } from '../create-store'
import type { TollRoadsState, TollRoadsStore } from './types'

const initialState: TollRoadsState = {
  tollRoads: null,
  isLoading: false,
}

export const useTollRoadsStore = createStore<TollRoadsStore>((set) => ({
  ...initialState,
  actions: {
    setTollRoads: (tollRoads) =>
      set((state) => {
        state.tollRoads = tollRoads
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading
      }),

    clearTollRoads: () =>
      set((state) => {
        state.tollRoads = null
        state.isLoading = false
      }),
  },
}))
