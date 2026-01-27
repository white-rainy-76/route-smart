import type { TollRoadsStore } from './types'

export const tollRoadsActionsSelector = (state: TollRoadsStore) =>
  state.actions

export const tollRoadsSelector = (state: TollRoadsStore) => state.tollRoads

export const tollRoadsLoadingSelector = (state: TollRoadsStore) =>
  state.isLoading
