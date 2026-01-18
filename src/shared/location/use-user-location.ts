/**
 * React hook для получения координат пользователя
 * Использует useSyncExternalStore для подписки на store
 * UI ререндерится ТОЛЬКО когда setUserLocation вызван
 */

import { useSyncExternalStore } from 'react'
import { getUserLocation, subscribe, type UserLocation } from './location-store'

function subscribeNoop(): () => void {
  return () => {}
}

function getNull(): null {
  return null
}

/**
 * @param enabled When false, the hook does not subscribe to location updates and always returns null.
 *                Useful to avoid rerendering heavy trees when location is not needed.
 */
export function useUserLocation(enabled: boolean = true): UserLocation | null {
  const sub = enabled ? subscribe : subscribeNoop
  const get = enabled ? getUserLocation : getNull
  return useSyncExternalStore(sub, get, get)
}
