import type { TollsStore } from './types'

export const tollsActionsSelector = (state: TollsStore) => state.actions

export const tollsSelector = (state: TollsStore) => state.tolls

export const tollsLoadingSelector = (state: TollsStore) => state.isLoading
