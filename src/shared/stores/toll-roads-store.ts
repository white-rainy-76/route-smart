import { GetTollRoadsResponse } from '@/services/toll-roads/model/types/roads'
import { create } from 'zustand'

interface TollRoadsStore {
  tollRoads: GetTollRoadsResponse | null
  isLoading: boolean
  setTollRoads: (tollRoads: GetTollRoadsResponse | null) => void
  setLoading: (isLoading: boolean) => void
  clearTollRoads: () => void
}

export const useTollRoadsStore = create<TollRoadsStore>()((set) => ({
  tollRoads: null,
  isLoading: false,
  setTollRoads: (tollRoads) => set({ tollRoads }),
  setLoading: (isLoading) => set({ isLoading }),
  clearTollRoads: () => set({ tollRoads: null, isLoading: false }),
}))
