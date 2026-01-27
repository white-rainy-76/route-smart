import { pointsEqual } from '@/components/route-form/route-form.validation'
import { saveLocationPickerHistoryItem } from '@/shared/lib/location-picker/history'
import { useDirectionsActions } from '@/stores/directions/hooks'
import {
  useRouteActions,
  useRouteDestination,
  useRouteOrigin,
  useRouteWaypoints,
} from '@/stores/route/hooks'
import { ShowOnMapButton } from '@/shared/ui/show-on-map-button'
import { useMemo, useState } from 'react'
import { Alert, View } from 'react-native'
import { LocationPickerMapModal } from './location-picker-map-modal'
import type { LocationItem } from './location-picker-item'

interface LocationPickerMapPanelProps {
  type: 'origin' | 'destination' | 'waypoint'
  currentLanguage: string
  keyboardOffset: number
  onHistoryUpdate: (items: LocationItem[]) => void
}

export function LocationPickerMapPanel({
  type,
  currentLanguage,
  keyboardOffset,
  onHistoryUpdate,
}: LocationPickerMapPanelProps) {
  const origin = useRouteOrigin()
  const destination = useRouteDestination()
  const waypoints = useRouteWaypoints()
  const { setOrigin, setDestination, addWaypoint } = useRouteActions()
  const { setSavedRouteId } = useDirectionsActions()
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  const openMap = () => {
    setIsMapVisible(true)
  }

  const initialMapRegion = useMemo(() => {
    const existing = type === 'origin' ? origin : type === 'destination' ? destination : null
    const latitude = existing?.latitude ?? 39.8283
    const longitude = existing?.longitude ?? -98.5795
    return {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
  }, [type, origin, destination])

  const handleDone = async (point: LocationItem) => {
    if (isCommitting) return
    if (
      !Number.isFinite(point.latitude) ||
      !Number.isFinite(point.longitude) ||
      point.latitude === 0 ||
      point.longitude === 0
    ) {
      return
    }

    setIsCommitting(true)
    try {
      const allPoints = []
      if (origin) allPoints.push(origin)
      if (destination) allPoints.push(destination)
      allPoints.push(...waypoints)

      const duplicatePoint = allPoints.find((p) => pointsEqual(point, p))
      if (duplicatePoint) {
        Alert.alert(
          'Location already selected',
          'This location is already selected as origin, destination, or waypoint',
        )
        setIsMapVisible(false)
        return
      }

      const nextHistory = await saveLocationPickerHistoryItem(point)
      onHistoryUpdate(nextHistory)

      // Очищаем savedRouteId при ручном изменении точек через map picker
      setSavedRouteId(null)

      switch (type) {
        case 'origin':
          setOrigin(point)
          break
        case 'destination':
          setDestination(point)
          break
        case 'waypoint':
          addWaypoint(point)
          break
        default:
          break
      }

      setIsMapVisible(false)
    } finally {
      setIsCommitting(false)
    }
  }

  return (
    <>
      <View
        className="absolute left-0 right-0"
        style={{ bottom: keyboardOffset }}>
        <ShowOnMapButton onPress={openMap} />
      </View>

      <LocationPickerMapModal
        visible={isMapVisible}
        language={currentLanguage}
        initialRegion={initialMapRegion}
        onClose={() => setIsMapVisible(false)}
        onDone={handleDone}
      />
    </>
  )
}
