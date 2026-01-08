import { useUserLocation } from '@/shared/location'
import { useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, {
  MapViewProps,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps'

interface MapProps extends Omit<MapViewProps, 'provider'> {
  className?: string
  mapRef?: React.RefObject<MapView | null>
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
  latitudeDelta: 25.0, // Широкий вид на всю страну
  longitudeDelta: 25.0,
}

export function Map({
  initialRegion = DEFAULT_REGION,
  customMapStyle = mapStyle,
  className,
  style,
  mapRef: externalMapRef,
  ...props
}: MapProps) {
  const internalMapRef = useRef<MapView>(null)
  const mapRef = externalMapRef || internalMapRef
  const userLocation = useUserLocation()

  return (
    <View className={className} style={style}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={customMapStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsPointsOfInterests={false}
        showsCompass={false}
        toolbarEnabled={false}
        {...props}>
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Ваше местоположение"
            pinColor="#4964D8"
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            flat={false}
          />
        )}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
})
