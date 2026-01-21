/**
 * iOS реализация карты используя react-native-maps
 */
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useRouteStore } from '@/shared/stores/route-store'
import { MapLoader } from '@/shared/ui'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  MapViewProps as RNMapsViewProps,
} from 'react-native-maps'
import type { SharedValue } from 'react-native-reanimated'
import { MapControls } from '../../components/controls/map-controls'
import { OriginDestinationMarker } from '../../components/marker-content/origin-destination-marker'
import { WaypointMarker } from '../../components/marker-content/waypoint-marker'
import { DEFAULT_REGION } from '../../const/map'
import { RN_MAP_STYLE } from '../../const/rn-maps'
import { useDriveModeCamera } from '../../hooks/use-drive-mode-camera'
import { useRoutePolylines } from '../../hooks/use-route-polylines'
import type { MapRef } from '../../types/map-types'
import { createRNMapsMapRef } from './lib/map-ref'
import { UserLocationMarker } from './markers/location-marker'
import { LocationPuckMarker } from './markers/location-puck-marker'
import { RouteTimeMarkers } from './markers/route-time-markers'
import {
  TemporaryLocationMarkerUI,
  useTemporaryLocationMarker,
} from './markers/temporary-location-marker-handler'
import { TollsMarkers } from './markers/tolls/tolls-markers'

interface RNMapsMapProps extends Omit<RNMapsViewProps, 'provider'> {
  className?: string
  mapRef?: React.RefObject<MapRef | null>
  driveModeEnabled?: boolean
  onToggleDriveMode?: (enabled: boolean) => void
  buttonBottom?: SharedValue<number>
  buttonOpacity?: SharedValue<number>
  showMapControls?: boolean
}

// Styles and defaults are shared from const/*

export const RNMapsMap = memo(function RNMapsMap({
  initialRegion = DEFAULT_REGION,
  customMapStyle = RN_MAP_STYLE,
  className,
  style,
  mapRef: externalMapRef,
  driveModeEnabled = false,
  onToggleDriveMode,
  buttonBottom,
  buttonOpacity,
  showMapControls = true,
  ...props
}: RNMapsMapProps) {
  const mapViewRef = useRef<MapView>(null)
  
  // Обертка для внешнего ref или создание внутреннего
  const wrappedMapRef = useRef<MapRef | null>(null)
  
  useEffect(() => {
    wrappedMapRef.current = createRNMapsMapRef(mapViewRef)
    if (externalMapRef) {
      ;(externalMapRef as any).current = wrappedMapRef.current
    }
  }, [externalMapRef])

  const origin = useRouteStore((s) => s.origin)
  const destination = useRouteStore((s) => s.destination)
  const waypoints = useRouteStore((s) => s.waypoints)
  const directions = useDirectionsStore((s) => s.directions)
  const isLoading = useDirectionsStore((s) => s.isLoading)

  // Временный маркер при long press
  const {
    temporaryMarker,
    isLoadingAddress,
    handleLongPress,
    handleMapPress,
    handleAddTemporaryMarker,
  } = useTemporaryLocationMarker()

  // Режим слежки за пользователем (drive mode)
  // Используем внутренний ref для MapView
  const { pauseAndAutoResumeDriveMode } = useDriveModeCamera({
    mapRef: wrappedMapRef,
    driveModeEnabled,
  })

  const isValidPoint = useCallback(
    (p: { latitude: number; longitude: number } | null | undefined) => {
      if (!p) {
        return false
      }
      if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) {
        if (__DEV__) {
          console.warn('isValidPoint: invalid coordinates', {
            latitude: p.latitude,
            longitude: p.longitude,
          })
        }
        return false
      }
      if (p.latitude === 0 || p.longitude === 0) {
        return false
      }
      return true
    },
    [],
  )

  const routeCoordinates = useMemo(() => {
    const sections = directions?.route ?? []
    return sections.flatMap((section) =>
      section.mapPoints.map(([latitude, longitude]) => ({
        latitude,
        longitude,
      })),
    )
  }, [directions])
  const routePolylines = useRoutePolylines()

  useEffect(() => {
    if (!mapViewRef.current) return
    if (routeCoordinates.length < 2) return
    mapViewRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 80, right: 60, bottom: 260, left: 60 },
      animated: true,
    })
  }, [routeCoordinates])

  const hasGoogleMapsKey = Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY,
  )
  const provider = hasGoogleMapsKey ? PROVIDER_GOOGLE : undefined

  const mapViewKey = `mapview-ios-${directions?.routeId ?? 'no-route'}`

  return (
    <View className={className} style={style}>
      <MapView
        key={mapViewKey}
        ref={mapViewRef}
        provider={provider}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={customMapStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsPointsOfInterests={false}
        showsCompass={false}
        toolbarEnabled={false}
        onLongPress={handleLongPress}
        onPress={handleMapPress}
        onPanDrag={driveModeEnabled ? pauseAndAutoResumeDriveMode : undefined}
        onTouchStart={
          driveModeEnabled ? pauseAndAutoResumeDriveMode : undefined
        }
        {...props}>
        {/* Origin / Destination / Waypoints */}
        {isValidPoint(origin) && (
          <Marker
            key={`origin-${origin!.id}-${origin!.latitude}-${origin!.longitude}`}
            coordinate={{
              latitude: origin!.latitude,
              longitude: origin!.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}>
            <OriginDestinationMarker variant="origin" />
          </Marker>
        )}

        {isValidPoint(destination) && (
          <Marker
            key={`destination-${destination!.id}-${destination!.latitude}-${destination!.longitude}`}
            coordinate={{
              latitude: destination!.latitude,
              longitude: destination!.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}>
            <OriginDestinationMarker variant="destination" />
          </Marker>
        )}

        {waypoints.map((wp, idx) =>
          isValidPoint(wp) ? (
            <Marker
              key={`waypoint-${wp.id}-${idx + 1}`}
              coordinate={{ latitude: wp.latitude, longitude: wp.longitude }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}>
              <WaypointMarker index={idx + 1} />
            </Marker>
          ) : null,
        )}

        {/* Route polyline(s) */}
        {routePolylines.map((section) => (
          <Polyline
            key={section.id}
            coordinates={section.coordinates}
            strokeColor={section.isSelected ? '#4964D8' : '#9CA3AF'}
            strokeWidth={section.isSelected ? 4 : 3}
          />
        ))}

        <RouteTimeMarkers />
        <TollsMarkers />

        {/* Маркер местоположения пользователя */}
        {driveModeEnabled ? <LocationPuckMarker /> : <UserLocationMarker />}

        {/* Временный маркер при long press */}
        <TemporaryLocationMarkerUI
          temporaryMarker={temporaryMarker}
          onAdd={handleAddTemporaryMarker}
        />
      </MapView>
      {/* Кнопки для управления картой */}
      <MapControls
        mapRef={wrappedMapRef}
        driveModeEnabled={driveModeEnabled}
        onToggleDriveMode={onToggleDriveMode}
        buttonBottom={buttonBottom}
        buttonOpacity={buttonOpacity}
        showMapControls={showMapControls}
      />
      <MapLoader isLoading={isLoading || isLoadingAddress} />
    </View>
  )
})

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
})

