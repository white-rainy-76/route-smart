import { lazy, memo, Suspense } from 'react'
import { ActivityIndicator, Platform, View } from 'react-native'
import type { MapViewProps } from 'react-native-maps'
import type { SharedValue } from 'react-native-reanimated'
import { RNMapsMap } from '../providers/rn-maps/RNMapsMap'
import type { MapRef } from '../types/map-types'

// Реэкспорт типов из react-native-maps для совместимости
export type { MapViewProps }

interface MapProps extends Omit<MapViewProps, 'provider'> {
  className?: string
  mapRef?: React.RefObject<MapRef | null>
  driveModeEnabled?: boolean
  onToggleDriveMode?: (enabled: boolean) => void
  buttonBottom?: SharedValue<number>
  buttonOpacity?: SharedValue<number>
  showMapControls?: boolean
}

// Ленивая загрузка Mapbox только на Android, чтобы избежать импорта @rnmapbox/maps на iOS
const MapboxMapLazy =
  Platform.OS === 'android'
    ? lazy(() =>
        import('../providers/mapbox/MapboxMap').then((module) => ({
          default: module.MapboxMap,
        })),
      )
  : null

/**
 * Платформенно-специфичная абстракция карты
 * iOS: react-native-maps (Google Maps)
 * Android: @rnmapbox/maps (Mapbox)
 */
export const Map = memo(function Map(props: MapProps) {
  if (Platform.OS === 'android' && MapboxMapLazy) {
    return (
      <Suspense fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }>
        <MapboxMapLazy {...(props as any)} />
      </Suspense>
    )
  }
  return <RNMapsMap {...(props as any)} />
})
