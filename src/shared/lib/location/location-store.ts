/**
 * In-memory store для координат пользователя
 * Вне React. Никаких хуков внутри.
 */

export interface UserLocation {
  latitude: number
  longitude: number
  heading?: number | null
  speed?: number | null
}

let current: UserLocation | null = null
const listeners = new Set<() => void>()

export function getUserLocation(): UserLocation | null {
  return current
}

function sameNumberOrNull(a: number | null | undefined, b: number | null | undefined): boolean {
  return (a ?? null) === (b ?? null)
}

function isSameLocation(a: UserLocation | null, b: UserLocation | null): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  return (
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    sameNumberOrNull(a.heading, b.heading) &&
    sameNumberOrNull(a.speed, b.speed)
  )
}

export function setUserLocation(next: UserLocation | null): void {
  // Prevent no-op updates from causing rerenders across the whole app.
  if (isSameLocation(current, next)) return
  current = next
  listeners.forEach((listener) => listener())
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}
