import * as Location from 'expo-location'
import { useEffect, useState } from 'react'

export interface LocationData {
  latitude: number
  longitude: number
  altitude: number | null
  accuracy: number | null
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
}

export interface LocationPermissionStatus {
  granted: boolean
  canAskAgain: boolean
  status: Location.PermissionStatus
}

/**
 * Hook for managing location permissions and getting current location
 */
export function useLocation() {
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus | null>(null)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check permission status on mount
  useEffect(() => {
    checkPermissionStatus()
  }, [])

  const checkPermissionStatus = async () => {
    try {
      const { status, canAskAgain } =
        await Location.getForegroundPermissionsAsync()
      setPermissionStatus({
        granted: status === 'granted',
        canAskAgain,
        status,
      })
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setIsLoading(false)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      setError(null)

      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync()

      const granted = status === 'granted'
      setPermissionStatus({
        granted,
        canAskAgain,
        status,
      })

      setIsLoading(false)
      return granted
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setIsLoading(false)
      return false
    }
  }

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setError(null)

      // Check if permission is granted
      if (!permissionStatus?.granted) {
        const granted = await requestPermission()
        if (!granted) {
          setError('Location permission not granted')
          return null
        }
      }

      setIsLoading(true)
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        altitude: currentLocation.coords.altitude ?? null,
        accuracy: currentLocation.coords.accuracy ?? null,
        altitudeAccuracy: currentLocation.coords.altitudeAccuracy ?? null,
        heading: currentLocation.coords.heading ?? null,
        speed: currentLocation.coords.speed ?? null,
      }

      setLocation(locationData)
      setIsLoading(false)
      return locationData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setIsLoading(false)
      return null
    }
  }

  const startLocationUpdates = async (
    callback: (location: LocationData) => void,
  ): Promise<Location.LocationSubscription | null> => {
    try {
      setError(null)

      // Check if permission is granted
      if (!permissionStatus?.granted) {
        const granted = await requestPermission()
        if (!granted) {
          setError('Location permission not granted')
          return null
        }
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (currentLocation) => {
          const locationData: LocationData = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            altitude: currentLocation.coords.altitude ?? null,
            accuracy: currentLocation.coords.accuracy ?? null,
            altitudeAccuracy: currentLocation.coords.altitudeAccuracy ?? null,
            heading: currentLocation.coords.heading ?? null,
            speed: currentLocation.coords.speed ?? null,
          }
          setLocation(locationData)
          callback(locationData)
        },
      )

      return subscription
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    }
  }

  return {
    permissionStatus,
    location,
    isLoading,
    error,
    requestPermission,
    getCurrentLocation,
    startLocationUpdates,
    checkPermissionStatus,
  }
}
