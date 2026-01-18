import { GetTollsAlongPolylineSectionsResponse } from '@/services/tolls/get-tolls-along-polyline-sections/types/toll-with-section'
import { create } from 'zustand'

interface TollsStore {
  tolls: GetTollsAlongPolylineSectionsResponse | null
  isLoading: boolean
  setTolls: (tolls: GetTollsAlongPolylineSectionsResponse | null) => void
  setLoading: (isLoading: boolean) => void
  clearTolls: () => void
}

export const useTollsStore = create<TollsStore>()((set) => ({
  tolls: null,
  isLoading: false,
  setTolls: (tolls) => set({ tolls }),
  setLoading: (isLoading) => set({ isLoading }),
  clearTolls: () => set({ tolls: null, isLoading: false }),
}))
