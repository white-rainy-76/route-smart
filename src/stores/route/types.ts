export interface RoutePoint {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export interface RouteState {
  origin: RoutePoint | null
  destination: RoutePoint | null
  waypoints: RoutePoint[]
}

export interface RouteActions {
  setOrigin: (point: RoutePoint | null) => void
  setDestination: (point: RoutePoint | null) => void
  setWaypoints: (points: RoutePoint[]) => void
  addWaypoint: (point: RoutePoint) => void
  removeWaypoint: (id: string) => void
  updateWaypointOrder: (fromIndex: number, toIndex: number) => void
  clearRoute: () => void
}

export interface RouteStore extends RouteState {
  actions: RouteActions
}
