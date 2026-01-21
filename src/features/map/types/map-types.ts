/**
 * Общие типы для абстракции карты
 * Поддерживает react-native-maps (iOS) и @rnmapbox/maps (Android)
 */

export interface MapRegion {
  latitude: number
  longitude: number
  latitudeDelta: number
  longitudeDelta: number
}

export interface MapCoordinate {
  latitude: number
  longitude: number
}

export interface MapCamera {
  center: MapCoordinate
  pitch?: number
  zoom?: number
  heading?: number
}

export interface FitToCoordinatesOptions {
  edgePadding?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  animated?: boolean
}

/**
 * Абстракция для ссылки на карту
 * Методы должны быть реализованы для обеих платформ
 */
export interface MapRef {
  fitToCoordinates: (
    coordinates: MapCoordinate[],
    options?: FitToCoordinatesOptions,
  ) => void
  animateToRegion: (region: MapRegion, duration?: number) => void
  animateCamera: (camera: MapCamera, options?: { duration?: number }) => void
}

export type MapRefObject = React.RefObject<MapRef | null>

