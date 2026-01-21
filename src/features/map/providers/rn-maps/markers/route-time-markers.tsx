import { RouteTimeMarker } from '@/features/map/components/marker-content/route-time-marker'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useCallback, useMemo } from 'react'
import { Marker } from 'react-native-maps'

export function RouteTimeMarkers() {
  const directions = useDirectionsStore((s) => s.directions)
  const selectedRouteSectionId = useDirectionsStore(
    (s) => s.selectedRouteSectionId,
  )
  const isTripActive = useDirectionsStore((s) => s.isTripActive)
  const setSelectedRouteSectionId = useDirectionsStore(
    (s) => s.setSelectedRouteSectionId,
  )

  // Вычисляем средние точки секций для отображения маркеров с временем
  const sectionCenterPoints = useMemo(() => {
    if (!directions?.route) return []
    // В режиме поездки показываем только выбранный маршрут
    const routesToShow = isTripActive
      ? directions.route.filter(
          (section) => section.routeSectionId === selectedRouteSectionId,
        )
      : directions.route
    return routesToShow
      .map((section) => {
        const points = section.mapPoints
        if (points.length === 0) return null
        const midIndex = Math.floor(points.length / 2)
        const [latitude, longitude] = points[midIndex]
        return {
          routeSectionId: section.routeSectionId,
          latitude,
          longitude,
          driveTime: section.routeInfo.driveTime,
        }
      })
      .filter((point): point is NonNullable<typeof point> => point !== null)
  }, [directions, isTripActive, selectedRouteSectionId])

  // Обработчик нажатия на секцию
  const handleSectionPress = useCallback(
    (routeSectionId: string) => {
      setSelectedRouteSectionId(routeSectionId)
    },
    [setSelectedRouteSectionId],
  )

  return (
    <>
      {sectionCenterPoints.map((centerPoint) => {
        const isSelected = centerPoint.routeSectionId === selectedRouteSectionId
        // Android (react-native-maps): custom marker views may not visually update when children change.
        // Force a remount by including selection state and routeId in the key.
        // routeId ensures old markers are removed when a new route is built
        const markerKey = `section-marker-${directions?.routeId ?? 'route'}-${centerPoint.routeSectionId}-${
          isSelected ? 'selected' : 'default'
        }`
        return (
          <Marker
            key={markerKey}
            coordinate={{
              latitude: centerPoint.latitude,
              longitude: centerPoint.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
            flat={false}
            onPress={() => handleSectionPress(centerPoint.routeSectionId)}>
            <RouteTimeMarker
              driveTime={centerPoint.driveTime}
              isSelected={isSelected}
            />
          </Marker>
        )
      })}
    </>
  )
}
