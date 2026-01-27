import {
  weighStationsActionsSelector,
  weighStationsLoadingSelector,
  weighStationsSelector,
} from './selectors'
import { useWeighStationsStore } from './weighStationsStore'

export const useWeighStations = () =>
  useWeighStationsStore(weighStationsSelector)

export const useWeighStationsLoading = () =>
  useWeighStationsStore(weighStationsLoadingSelector)

export const useWeighStationsActions = () =>
  useWeighStationsStore(weighStationsActionsSelector)
