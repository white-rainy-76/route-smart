import { createStore } from '../create-store'
import type { TollsState, TollsStore } from './types'

const initialState: TollsState = {
  tolls: null,
  isLoading: false,
}

export const useTollsStore = createStore<TollsStore>((set) => ({
  ...initialState,
  actions: {
    setTolls: (tolls) =>
      set((state) => {
        state.tolls = tolls
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading
      }),

    clearTolls: () =>
      set((state) => {
        state.tolls = null
        state.isLoading = false
      }),
  },
}))
