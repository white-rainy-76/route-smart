/**
 * Android реализация карты используя @rnmapbox/maps
 * Полилинии маршрутов и платных дорог
 */
import {
  Camera,
  LineLayer,
  MapView as MapboxMapView,
  ShapeSource,
} from '@rnmapbox/maps'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import type { SharedValue } from 'react-native-reanimated'
import { MapControls } from '../../components/controls/map-controls'
import { DEFAULT_REGION } from '../../const/map'
import { MAPBOX_STYLE_URL } from '../../const/mapbox'
import { useDriveModeCamera } from '../../hooks/use-drive-mode-camera'
import { useRoutePolylines } from '../../hooks/use-route-polylines'
import { useTollRoadPolylines } from '../../hooks/use-toll-road-polylines'
import {
  buildLineStringFeatureCollection,
  toLineStringCoordinates,
} from '../../lib/geojson'
import type { MapRef, MapRegion } from '../../types/map-types'
import { createMapboxMapRef } from './lib/map-ref'

// Styles and defaults are shared from const/*

interface MapboxMapProps {
  className?: string
  style?: any
  mapRef?: React.RefObject<MapRef | null>
  initialRegion?: MapRegion
  driveModeEnabled?: boolean
  onToggleDriveMode?: (enabled: boolean) => void
  buttonBottom?: SharedValue<number>
  buttonOpacity?: SharedValue<number>
  showMapControls?: boolean
}

export const MapboxMap = memo(function MapboxMap({
  initialRegion = DEFAULT_REGION,
  className,
  style,
  mapRef,
  driveModeEnabled = false,
  onToggleDriveMode,
  buttonBottom,
  buttonOpacity,
  showMapControls = true,
  ...props
}: MapboxMapProps) {
  const mapboxRef = useRef<MapboxMapView>(null)
  const wrappedMapRef = useRef<MapRef | null>(null)
  const tollRoadPolylines = useTollRoadPolylines()
  const routePolylines = useRoutePolylines()

  const handleCameraRef = useCallback(
    (camera: any | null) => {
      if (!camera) return
      const wrapper: MapRef = createMapboxMapRef(camera)
      wrappedMapRef.current = wrapper
      if (mapRef) {
        mapRef.current = wrapper
      }
    },
    [mapRef],
  )

  const { pauseAndAutoResumeDriveMode } = useDriveModeCamera({
    mapRef: wrappedMapRef,
    driveModeEnabled,
  })

  useEffect(() => {
    if (mapRef) {
      mapRef.current = wrappedMapRef.current
    }
  }, [mapRef])

  // Подготовка полилиний маршрутов для Mapbox
  // Mapbox использует GeoJSON LineString формат: [[lng, lat], [lng, lat], ...]
  const routeLines = useMemo(
    () =>
      routePolylines.map((section) => ({
        id: section.id,
        isSelected: section.isSelected,
        coordinates: toLineStringCoordinates(section.coordinates),
      })),
    [routePolylines],
  )

  // Подготовка полилиний платных дорог для Mapbox
  // Объединяем все в один FeatureCollection для лучшей производительности
  const tollRoadsFeatureCollection = useMemo(() => {
    if (tollRoadPolylines.length === 0) return null
    return buildLineStringFeatureCollection(tollRoadPolylines)
  }, [tollRoadPolylines])

  return (
    <View className={className} style={style}>
      <MapboxMapView
        ref={mapboxRef}
        style={styles.map}
        styleURL={MAPBOX_STYLE_URL}
        onRegionWillChange={
          driveModeEnabled ? pauseAndAutoResumeDriveMode : undefined
        }
        {...props}>
        <Camera
          ref={handleCameraRef}
          defaultSettings={{
            centerCoordinate: [initialRegion.longitude, initialRegion.latitude],
            zoomLevel: Math.log2(360 / initialRegion.longitudeDelta) || 10,
          }}
        />

        {/* Полилинии маршрутов */}
        {routeLines.map((routeLine) => (
          <ShapeSource
            key={`route-${routeLine.id}`}
            id={`route-source-${routeLine.id}`}
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeLine.coordinates,
              },
              properties: {},
            }}>
            <LineLayer
              id={`route-layer-${routeLine.id}`}
              style={{
                lineColor: routeLine.isSelected ? '#4964D8' : '#9CA3AF',
                lineWidth: routeLine.isSelected ? 4 : 3,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
          </ShapeSource>
        ))}

        {/* Полилинии платных дорог - объединены в один ShapeSource для производительности */}
        {tollRoadsFeatureCollection && (
          <ShapeSource
            id="toll-roads-source"
            shape={tollRoadsFeatureCollection}>
            <LineLayer
              id="toll-roads-layer"
              style={{
                lineColor: '#F59E0B', // Оранжевый цвет для платных дорог
                lineWidth: 3,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
          </ShapeSource>
        )}
      </MapboxMapView>
      <MapControls
        mapRef={wrappedMapRef}
        driveModeEnabled={driveModeEnabled}
        onToggleDriveMode={onToggleDriveMode}
        buttonBottom={buttonBottom}
        buttonOpacity={buttonOpacity}
        showMapControls={showMapControls}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
})
