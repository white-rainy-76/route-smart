import { createStore } from '../create-store'
import type { RouteState, RouteStore } from './types'

const initialState: RouteState = {
  origin: null,
  destination: null,
  waypoints: [],
}

export const useRouteStore = createStore<RouteStore>((set) => ({
  ...initialState,
  actions: {
    setOrigin: (point) =>
      set((state) => {
        state.origin = point
      }),

    setDestination: (point) =>
      set((state) => {
        state.destination = point
      }),

    setWaypoints: (points) =>
      set((state) => {
        state.waypoints = points
      }),

    addWaypoint: (point) =>
      set((state) => {
        state.waypoints.push(point)
      }),

    removeWaypoint: (id) =>
      set((state) => {
        state.waypoints = state.waypoints.filter((p) => p.id !== id)
      }),

    updateWaypointOrder: (fromIndex, toIndex) =>
      set((state) => {
        const [removed] = state.waypoints.splice(fromIndex, 1)
        if (!removed) return
        state.waypoints.splice(toIndex, 0, removed)
      }),

    clearRoute: () =>
      set((state) => {
        state.origin = null
        state.destination = null
        state.waypoints = []
      }),
  },
}))
