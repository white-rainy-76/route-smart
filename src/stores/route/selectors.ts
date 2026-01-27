import type { RoutePoint, RouteStore } from './types'

export const routeActionsSelector = (state: RouteStore) => state.actions

export const routeOriginSelector = (state: RouteStore) => state.origin

export const routeDestinationSelector = (state: RouteStore) => state.destination

export const routeWaypointsSelector = (state: RouteStore) => state.waypoints

export const routeWaypointsCountSelector = (state: RouteStore) =>
  state.waypoints.length

export const allRoutePointsSelector = (state: RouteStore): RoutePoint[] => {
  const points: RoutePoint[] = []
  if (state.origin) points.push(state.origin)
  if (state.destination) points.push(state.destination)
  points.push(...state.waypoints)
  return points
}

export const hasOriginAndDestinationSelector = (state: RouteStore): boolean =>
  !!state.origin && !!state.destination
