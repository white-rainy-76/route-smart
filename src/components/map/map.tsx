import { MapLoader } from '@/components/ui'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useRouteStore } from '@/shared/stores/route-store'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import MapView, {
  MapViewProps,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { DriveModeButton, FocusUserLocationButton } from './buttons'
import {
  LocationPuckMarker,
  OriginDestinationMarker,
  UserLocationMarker,
  WaypointMarker,
} from './markers'
import { RouteTimeMarkers } from './markers/route-time-markers'
import {
  TemporaryLocationMarkerUI,
  useTemporaryLocationMarker,
} from './markers/temporary-location-marker-handler'
import { TollsMarkers } from './markers/tolls/tolls-markers'
import { useDriveModeCamera } from './useDriveModeCamera'

interface MapProps extends Omit<MapViewProps, 'provider'> {
  className?: string
  mapRef?: React.RefObject<MapView | null>
  driveModeEnabled?: boolean
  onToggleDriveMode?: (enabled: boolean) => void
  buttonBottom?: SharedValue<number>
  buttonOpacity?: SharedValue<number>
  showMapControls?: boolean
}

// Стиль для скрытия точек интереса (POI)
const mapStyle = [
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
]

// Координаты центра США
const DEFAULT_REGION = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 25.0,
  longitudeDelta: 25.0,
}

export const Map = memo(function Map({
  initialRegion = DEFAULT_REGION,
  customMapStyle = mapStyle,
  className,
  style,
  mapRef: externalMapRef,
  driveModeEnabled = false,
  onToggleDriveMode,
  buttonBottom,
  buttonOpacity,
  showMapControls = true,
  ...props
}: MapProps) {
  const internalMapRef = useRef<MapView>(null)
  const mapRef = externalMapRef || internalMapRef
  const origin = useRouteStore((s) => s.origin)
  const destination = useRouteStore((s) => s.destination)
  const waypoints = useRouteStore((s) => s.waypoints)
  const directions = useDirectionsStore((s) => s.directions)
  const isLoading = useDirectionsStore((s) => s.isLoading)
  const selectedRouteSectionId = useDirectionsStore(
    (s) => s.selectedRouteSectionId,
  )
  const isTripActive = useDirectionsStore((s) => s.isTripActive)
  console.log('map' )
  // Анимированный стиль для кнопок - позиционируется чуть выше bottom sheet
  const locationButtonStyle = useAnimatedStyle(() => {
    if (!buttonBottom || !buttonOpacity) {
      return {
        bottom: 100,
        opacity: 1,
        pointerEvents: 'auto',
      }
    }
    return {
      bottom: buttonBottom.value,
      opacity: buttonOpacity.value,
      pointerEvents: buttonOpacity.value > 0 ? 'auto' : 'none',
    }
  })

  //  Временный маркер при long press
  const {
    temporaryMarker,
    isLoadingAddress,
    handleLongPress,
    handleMapPress,
    handleAddTemporaryMarker,
  } = useTemporaryLocationMarker()

  // Режим слежки за пользователем (drive mode)
  const { pauseAndAutoResumeDriveMode } = useDriveModeCamera({
    mapRef,
    driveModeEnabled,
  })

  const isValidPoint = useCallback(
    (p: { latitude: number; longitude: number } | null | undefined) => {
      if (!p) {
        return false
      }
      if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) {
        // Avoid spamming logs from render; invalid coords should just not render a marker.
        if (__DEV__) {
          console.warn('isValidPoint: invalid coordinates', {
            latitude: p.latitude,
            longitude: p.longitude,
          })
        }
        return false
      }
      // In this app, 0/0 is used as "not resolved yet"
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

  useEffect(() => {
    if (!mapRef.current) return
    if (routeCoordinates.length < 2) return
    mapRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 80, right: 60, bottom: 260, left: 60 },
      animated: true,
    })
  }, [mapRef, routeCoordinates])

  // IMPORTANT:
  // On iOS, forcing Google provider without a Google Maps API key can crash on startup in release builds.
  // In dev this may "work" because .env is present locally, but EAS production build may not embed it.
  const hasGoogleMapsKey = Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY,
  )
  const provider =
    Platform.OS === 'android' || hasGoogleMapsKey ? PROVIDER_GOOGLE : undefined

  // Android (react-native-maps): polylines/markers can sometimes "stick" visually after route updates.
  // Forcing a full MapView remount on routeId change reliably clears previous overlays.
  const mapViewKey =
    Platform.OS === 'android'
      ? `mapview-${provider ?? 'default'}-${directions?.routeId ?? 'no-route'}`
      : 'mapview-ios'

  return (
    <View className={className} style={style}>
      <MapView
        key={mapViewKey}
        ref={mapRef}
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
              tracksViewChanges={Platform.OS === 'android'}>
              <WaypointMarker index={idx + 1} />
            </Marker>
          ) : null,
        )}

        {/* Route polyline(s) */}
        {directions?.route
          ?.filter((section) => {
            // В режиме поездки показываем только выбранный маршрут
            if (isTripActive) {
              return section.routeSectionId === selectedRouteSectionId
            }
            // В обычном режиме показываем все маршруты
            return true
          })
          .map((section) => {
            const isSelected = section.routeSectionId === selectedRouteSectionId
            return (
              <Polyline
                key={section.routeSectionId}
                coordinates={section.mapPoints.map(([latitude, longitude]) => ({
                  latitude,
                  longitude,
                }))}
                strokeColor={isSelected ? '#4964D8' : '#9CA3AF'}
                strokeWidth={isSelected ? 4 : 3}
              />
            )
          })}

        {/* Маркеры с временем маршрута для переключения секций */}
        <RouteTimeMarkers />

        {/* Toll roads polylines */}
        {/* {tollRoads?.map((tollRoad) => (
          <Polyline
            key={tollRoad.id}
            coordinates={tollRoad.coordinates.map((coord) => ({
              latitude: coord.lat,
              longitude: coord.lng,
            }))}
            strokeColor="#F59E0B"
            strokeWidth={3}
          />
        ))} */}

        {/* Tolls markers - только для выбранной секции */}
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
      {showMapControls && (
        <Animated.View
          style={[styles.locationButtonContainer, locationButtonStyle]}>
          <DriveModeButton
            mapRef={mapRef}
            driveModeEnabled={driveModeEnabled}
            onToggleDriveMode={onToggleDriveMode || (() => {})}
          />
          <FocusUserLocationButton mapRef={mapRef} />
        </Animated.View>
      )}
      <MapLoader isLoading={isLoading || isLoadingAddress} />
    </View>
  )
})

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  locationButtonContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
    // Keep above the map, but below BottomSheetHeader (which needs to block touches).
    elevation: 20,
  },
})
