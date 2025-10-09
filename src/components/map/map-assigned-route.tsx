import { AssignedRouteWithPassedRouteData } from '@/services/route/types/route'
import { useTruckStore } from '@/shared/store/truck-store'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { LatLng, Marker, Polyline } from 'react-native-maps'
import MapBase from './map-base'
import { GasStationMarker } from './ui/markers/gas-station-marker'
import { TruckMarker } from './ui/markers/truck-marker'

type MapAssignedRouteProps = {
  routeData: AssignedRouteWithPassedRouteData
  hasAssigned: boolean
}

export const MapAssignedRoute = ({
  routeData,
  hasAssigned,
}: MapAssignedRouteProps) => {
  const [routePath, setRoutePath] = useState<LatLng[]>([])
  const [truckPosition, setTruckPosition] = useState<LatLng | null>(null)
  const [isMapReady, setMapReady] = useState(false)
  const { stats, isLoading } = useTruckStore()

  // Memoize route paths to prevent unnecessary re-renders
  const assignedRoutePath: LatLng[] = useMemo(() => {
    if (!routeData.assignedRoute?.mapPoints) return []
    try {
      return routeData.assignedRoute.mapPoints.map((point) => ({
        latitude: point[0],
        longitude: point[1],
      }))
    } catch (error) {
      console.error('Error processing assigned route points:', error)
      return []
    }
  }, [routeData.assignedRoute?.mapPoints])

  const passedRoutePath: LatLng[] = useMemo(() => {
    if (!routeData.passedRoute?.mapPoints) return []
    try {
      return routeData.passedRoute.mapPoints
    } catch (error) {
      console.error('Error processing passed route points:', error)
      return []
    }
  }, [routeData.passedRoute?.mapPoints])

  // Memoize route start and end points
  const originPoint = useMemo(
    () => routeData.assignedRoute?.origin,
    [routeData.assignedRoute?.origin],
  )
  const destinationPoint = useMemo(
    () => routeData.assignedRoute?.destination,
    [routeData.assignedRoute?.destination],
  )

  // Memoize gas stations with coordinate validation
  const validFuelStations = useMemo(() => {
    if (!routeData.assignedRoute?.fuelStations) return []
    return routeData.assignedRoute.fuelStations.filter((station) => {
      const lat = station.position?.lat
      const lng = station.position?.lng
      return lat != null && lng != null && !isNaN(lat) && !isNaN(lng)
    })
  }, [routeData.assignedRoute?.fuelStations])

  // Handle truck position with cleanup
  useEffect(() => {
    if (!stats) return

    try {
      const newPoint = {
        latitude: stats.latitude,
        longitude: stats.longitude,
      }

      // Validate coordinates
      if (isNaN(newPoint.latitude) || isNaN(newPoint.longitude)) {
        console.warn('Invalid truck coordinates:', newPoint)
        return
      }

      setTruckPosition(newPoint)

      // Limit number of points in path for performance
      setRoutePath((prev) => {
        const newPath = [...prev, newPoint]
        // Keep only last 100 points to prevent memory leaks
        return newPath.slice(-100)
      })
    } catch (error) {
      console.error('Error updating truck position:', error)
    }
  }, [stats])

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      setRoutePath([])
      setTruckPosition(null)
      setMapReady(false)
    }
  }, [])

  // Memoize map ready handler
  const handleMapReady = useCallback(() => {
    setMapReady(true)
  }, [])

  // If route is not assigned, show only current location and truck movement
  if (!hasAssigned) {
    const currentLocation = routeData.currentLocation?.location

    return (
      <View className="relative">
        <MapBase setMapReady={handleMapReady}>
          {/* Real-time truck position */}
          {truckPosition && (
            <Marker coordinate={truckPosition} anchor={{ x: 0.5, y: 0.95 }}>
              <TruckMarker isActive={true} />
            </Marker>
          )}

          {/* Current location (if no truck data) */}
          {!truckPosition && currentLocation && (
            <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.95 }}>
              <TruckMarker isActive={false} />
            </Marker>
          )}

          {/* Truck movement path - only if there are enough points */}
          {routePath.length > 1 && (
            <Polyline
              coordinates={routePath}
              strokeWidth={3}
              strokeColor="#26b910"
              geodesic={false}
            />
          )}
        </MapBase>
      </View>
    )
  }

  return (
    <View className="relative">
      <MapBase setMapReady={handleMapReady}>
        {/* Completed route - red line */}
        {passedRoutePath.length > 1 && (
          <Polyline
            coordinates={passedRoutePath}
            strokeWidth={4}
            strokeColor="#EF4444"
            geodesic={false}
          />
        )}

        {/* Assigned route - blue line */}
        {assignedRoutePath.length > 1 && (
          <Polyline
            coordinates={assignedRoutePath}
            strokeWidth={4}
            strokeColor="#3b82f6"
            geodesic={false}
          />
        )}

        {/* Truck movement path - green line */}
        {/* {routePath.length > 1 && (
          <Polyline
            coordinates={routePath}
            strokeWidth={3}
            strokeColor="#26b910"
            geodesic={false}
          />
        )} */}

        {/* Real-time truck position */}
        {truckPosition && (
          <Marker coordinate={truckPosition} anchor={{ x: 0.5, y: 0.5 }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#26b910',
                borderColor: '#fff',
                borderWidth: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            />
          </Marker>
        )}

        {/* Route start point */}
        {originPoint && (
          <Marker coordinate={originPoint} anchor={{ x: 0.5, y: 0.5 }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#3b82f6',
                borderColor: '#fff',
                borderWidth: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            />
          </Marker>
        )}

        {/* Route end point */}
        {destinationPoint && (
          <Marker coordinate={destinationPoint} anchor={{ x: 0.5, y: 0.5 }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#EF4444',
                borderColor: '#fff',
                borderWidth: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}
            />
          </Marker>
        )}

        {/* Gas stations - only valid ones */}
        {validFuelStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.position!.lat,
              longitude: station.position!.lng,
            }}
            anchor={{ x: 0.5, y: 0.5 }}>
            <GasStationMarker station={station} />
          </Marker>
        ))}
      </MapBase>

      {isLoading && (
        <View className="absolute inset-0 bg-white/70 items-center justify-center z-50">
          <ActivityIndicator size="large" color="#4964D8" />
        </View>
      )}
    </View>
  )
}
