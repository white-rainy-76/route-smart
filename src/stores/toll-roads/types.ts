import type { GetTollRoadsResponse } from '@/services/toll-roads/model/types/roads'

export interface TollRoadsState {
  tollRoads: GetTollRoadsResponse | null
  isLoading: boolean
}

export interface TollRoadsActions {
  setTollRoads: (tollRoads: GetTollRoadsResponse | null) => void
  setLoading: (isLoading: boolean) => void
  clearTollRoads: () => void
}

export interface TollRoadsStore extends TollRoadsState {
  actions: TollRoadsActions
}
