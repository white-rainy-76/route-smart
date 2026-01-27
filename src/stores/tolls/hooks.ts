import {
  tollsActionsSelector,
  tollsLoadingSelector,
  tollsSelector,
} from './selectors'
import { useTollsStore } from './tollsStore'

export const useTolls = () => useTollsStore(tollsSelector)

export const useTollsLoading = () => useTollsStore(tollsLoadingSelector)

export const useTollsActions = () => useTollsStore(tollsActionsSelector)
