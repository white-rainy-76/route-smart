import { create } from 'zustand'

export interface RoutePoint {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

interface RouteStore {
  origin: RoutePoint | null
  destination: RoutePoint | null
  waypoints: RoutePoint[]

  // Actions
  setOrigin: (point: RoutePoint | null) => void
  setDestination: (point: RoutePoint | null) => void
  setWaypoints: (points: RoutePoint[]) => void
  addWaypoint: (point: RoutePoint) => void
  removeWaypoint: (id: string) => void
  updateWaypointOrder: (fromIndex: number, toIndex: number) => void
  clearRoute: () => void

  // Getters
  getAllPoints: () => RoutePoint[]
  hasOriginAndDestination: () => boolean
}

export const useRouteStore = create<RouteStore>()((set, get) => ({
  origin: null,
  destination: null,
  waypoints: [],

  setOrigin: (point) => set({ origin: point }),

  setDestination: (point) => set({ destination: point }),

  setWaypoints: (points) => set({ waypoints: points }),

  addWaypoint: (point) =>
    set((state) => ({
      waypoints: [...state.waypoints, point],
    })),

  removeWaypoint: (id) =>
    set((state) => ({
      waypoints: state.waypoints.filter((p) => p.id !== id),
    })),

  updateWaypointOrder: (fromIndex, toIndex) =>
    set((state) => {
      const newWaypoints = [...state.waypoints]
      const [removed] = newWaypoints.splice(fromIndex, 1)
      newWaypoints.splice(toIndex, 0, removed)
      return { waypoints: newWaypoints }
    }),

  clearRoute: () =>
    set({
      origin: null,
      destination: null,
      waypoints: [],
    }),

  getAllPoints: () => {
    const { origin, destination, waypoints } = get()
    const all: RoutePoint[] = []
    if (origin) all.push(origin)
    if (destination) all.push(destination)
    all.push(...waypoints)
    return all
  },

  hasOriginAndDestination: () => {
    const { origin, destination } = get()
    return !!origin && !!destination
  },
}))
