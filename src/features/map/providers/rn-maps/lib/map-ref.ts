import type MapView from 'react-native-maps'
import type { MapCoordinate, MapRef } from '../../../types/map-types'

export const createRNMapsMapRef = (
  mapViewRef: React.RefObject<MapView | null>,
): MapRef | null => {
  if (!mapViewRef.current) return null

  return {
    fitToCoordinates: (coordinates: MapCoordinate[], options) => {
      if (mapViewRef.current) {
        mapViewRef.current.fitToCoordinates(coordinates, {
          edgePadding: options?.edgePadding || {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
          animated: options?.animated !== false,
        })
      }
    },
    animateToRegion: (region, duration = 1000) => {
      if (mapViewRef.current) {
        mapViewRef.current.animateToRegion(region, duration)
      }
    },
    animateCamera: (camera, options) => {
      if (mapViewRef.current) {
        mapViewRef.current.animateCamera(camera as any, options || {})
      }
    },
  }
}
