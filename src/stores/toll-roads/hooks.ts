import {
  tollRoadsActionsSelector,
  tollRoadsLoadingSelector,
  tollRoadsSelector,
} from './selectors'
import { useTollRoadsStore } from './tollRoadsStore'

export const useTollRoads = () => useTollRoadsStore(tollRoadsSelector)

export const useTollRoadsLoading = () =>
  useTollRoadsStore(tollRoadsLoadingSelector)

export const useTollRoadsActions = () =>
  useTollRoadsStore(tollRoadsActionsSelector)
