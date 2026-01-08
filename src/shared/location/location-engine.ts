/**
 * Нативная подписка на GPS (Expo Location)
 * Вне React. Только нативный код.
 */

import * as Location from 'expo-location'

let subscription: Location.LocationSubscription | null = null

export async function startNativeLocation(
  onLocation: (loc: Location.LocationObject) => void,
): Promise<void> {
  if (subscription) return

  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') {
    console.warn('Location permission not granted')
    return
  }

  subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 1, // GPS тик каждый метр
      timeInterval: 1000, // Или каждую секунду
    },
    onLocation,
  )
}

export function stopNativeLocation(): void {
  subscription?.remove()
  subscription = null
}

export function isLocationTracking(): boolean {
  return subscription !== null
}
