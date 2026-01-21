import { UserLocationMarkerFill } from '@/features/map/components/marker-content/location/user-location-marker-fill'
import { useUserLocation } from '@/shared/lib/location'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { AnimatedRegion, MarkerAnimated } from 'react-native-maps'

const ANIMATION_DURATION = 500 // ms for smooth movement

export function UserLocationMarker() {
  const userLocation = useUserLocation()
  const animatedCoordinate = useRef(
    new AnimatedRegion({
      latitude: userLocation?.latitude ?? 0,
      longitude: userLocation?.longitude ?? 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current

  useEffect(() => {
    if (!userLocation) return

    // Animate marker to new position smoothly
    animatedCoordinate
      .timing({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      } as any)
      .start()
  }, [userLocation, animatedCoordinate])

  if (!userLocation) return null

  return (
    <MarkerAnimated
      coordinate={animatedCoordinate as any}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={Platform.OS === 'android'}
      flat={false}>
      <UserLocationMarkerFill />
    </MarkerAnimated>
  )
}
