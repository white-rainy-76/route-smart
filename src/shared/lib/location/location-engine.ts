/**
 * Нативная подписка на GPS (Expo Location)
 * Вне React. Только нативный код.
 */

import * as Location from 'expo-location'
import { Platform } from 'react-native'

let subscription: Location.LocationSubscription | null = null
let headingSubscription: Location.LocationSubscription | null = null

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
      // BestForNavigation is important on iOS for better course/heading behavior.
      // On Android it can generate very frequent updates; use High + larger intervals.
      accuracy:
        Platform.OS === 'ios'
          ? Location.Accuracy.BestForNavigation
          : Location.Accuracy.High,
      distanceInterval: Platform.OS === 'android' ? 5 : 1, // meters
      timeInterval: Platform.OS === 'android' ? 2000 : 1000, // ms
    },
    onLocation,
  )
}

export function stopNativeLocation(): void {
  subscription?.remove()
  subscription = null
}

export async function startNativeHeading(
  onHeading: (heading: Location.LocationHeadingObject) => void,
): Promise<void> {
  if (headingSubscription) return

  const { status } = await Location.requestForegroundPermissionsAsync()
  if (status !== 'granted') {
    console.warn('Location permission not granted')
    return
  }

  headingSubscription = await Location.watchHeadingAsync(onHeading)
}

export function stopNativeHeading(): void {
  headingSubscription?.remove()
  headingSubscription = null
}
