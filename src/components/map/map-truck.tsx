import { useTruckStore } from '@/shared/store/truck-store'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { LatLng, Marker, Polyline } from 'react-native-maps'
import MapBase from './map-base'
import { TruckMarker } from './ui/markers/truck-marker'

type TruckMapProps = {
  initialPath: LatLng[]
}

export const TruckMap = ({ initialPath = [] }: TruckMapProps) => {
  const [routePath, setRoutePath] = useState<LatLng[]>([])
  const [truckPosition, setTruckPosition] = useState<LatLng | null>(null)
  const [isMapReady, setMapReady] = useState(false)
  const { stats, isLoading } = useTruckStore()
  // ! Idk how to deal with map not being able to render anything after switching tabs and coming back

  useEffect(() => {
    if (stats) {
      const newPoint = {
        latitude: stats.latitude,
        longitude: stats.longitude,
      }
      setTruckPosition(newPoint)
      setRoutePath((prev) => [...prev, newPoint])
    }
  }, [stats])

  return (
    <View className="relative">
      <MapBase setMapReady={setMapReady}>
        {routePath.length > 1 && (
          <Polyline
            coordinates={routePath}
            strokeWidth={4}
            strokeColor="#EF4444"
            geodesic={false}
          />
        )}
        {initialPath.length > 1 && (
          <Polyline
            coordinates={initialPath}
            strokeWidth={4}
            strokeColor="#3b82f6"
            geodesic
          />
        )}

        {truckPosition && (
          <Marker coordinate={truckPosition} anchor={{ x: 0.5, y: 0.95 }}>
            <TruckMarker isActive={true} />
          </Marker>
        )}
      </MapBase>

      {isLoading && (
        <View className="absolute inset-0 bg-white/70 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#4964D8" />
        </View>
      )}
    </View>
  )
}
