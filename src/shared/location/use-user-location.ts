/**
 * React hook для получения координат пользователя
 * Использует useSyncExternalStore для подписки на store
 * UI ререндерится ТОЛЬКО когда setUserLocation вызван
 */

import { useSyncExternalStore } from 'react'
import { getUserLocation, subscribe, type UserLocation } from './location-store'

export function useUserLocation(): UserLocation | null {
  return useSyncExternalStore(subscribe, getUserLocation, getUserLocation)
}
