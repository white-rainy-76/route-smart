import { useRouteStore } from './routeStore'
import {
  allRoutePointsSelector,
  hasOriginAndDestinationSelector,
  routeActionsSelector,
  routeDestinationSelector,
  routeOriginSelector,
  routeWaypointsCountSelector,
  routeWaypointsSelector,
} from './selectors'

export const useRouteOrigin = () => useRouteStore(routeOriginSelector)

export const useRouteDestination = () => useRouteStore(routeDestinationSelector)

export const useRouteWaypoints = () => useRouteStore(routeWaypointsSelector)

export const useRouteWaypointsCount = () =>
  useRouteStore(routeWaypointsCountSelector)

export const useRouteActions = () => useRouteStore(routeActionsSelector)

export const useAllRoutePoints = () => useRouteStore(allRoutePointsSelector)

export const useHasOriginAndDestination = () =>
  useRouteStore(hasOriginAndDestinationSelector)
