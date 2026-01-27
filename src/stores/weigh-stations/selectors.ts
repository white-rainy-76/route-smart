import type { WeighStationsStore } from './types'

export const weighStationsActionsSelector = (state: WeighStationsStore) =>
  state.actions

export const weighStationsSelector = (state: WeighStationsStore) =>
  state.weighStations

export const weighStationsLoadingSelector = (state: WeighStationsStore) =>
  state.isLoading
