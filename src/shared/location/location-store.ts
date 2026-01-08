/**
 * In-memory store для координат пользователя
 * Вне React. Никаких хуков внутри.
 */

export interface UserLocation {
  latitude: number
  longitude: number
}

let current: UserLocation | null = null
const listeners = new Set<() => void>()

export function getUserLocation(): UserLocation | null {
  return current
}

export function setUserLocation(next: UserLocation | null): void {
  current = next
  listeners.forEach((listener) => listener())
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}
