import { useTranslation } from '@/shared/hooks/use-translation'
import { googleReverseGeocode } from '@/shared/lib/google-places/google-places'
import { useRouteStore } from '@/shared/stores/route-store'
import { useCallback, useState } from 'react'
import type { LongPressEvent } from 'react-native-maps'
import { Marker } from 'react-native-maps'
import { TemporaryLocationMarker } from '.'

interface TemporaryMarker {
  latitude: number
  longitude: number
  name: string
  address: string
}

export function useTemporaryLocationMarker() {
  const { currentLanguage } = useTranslation()
  const [temporaryMarker, setTemporaryMarker] =
    useState<TemporaryMarker | null>(null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  const handleLongPress = useCallback(
    async (event: LongPressEvent) => {
      const { coordinate } = event.nativeEvent
      setIsLoadingAddress(true)

      try {
        const result = await googleReverseGeocode({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          language: currentLanguage,
        })

        if (result) {
          setTemporaryMarker({
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            address: result.address,
          })
        }
      } catch (error) {
        console.error('Failed to reverse geocode:', error)
      } finally {
        setIsLoadingAddress(false)
      }
    },
    [currentLanguage],
  )

  const handleMapPress = useCallback(() => {
    setTemporaryMarker(null)
  }, [])

  const handleAddTemporaryMarker = useCallback(() => {
    if (!temporaryMarker) return

    // Создаем RoutePoint
    const routePoint = {
      id: `temp-${Date.now()}`,
      name: temporaryMarker.name,
      address: temporaryMarker.address,
      latitude: temporaryMarker.latitude,
      longitude: temporaryMarker.longitude,
    }

    const store = useRouteStore.getState()

    // Если нет origin - добавляем как origin
    if (!store.origin) {
      store.setOrigin(routePoint)
    }
    // Если есть origin, но нет destination - добавляем как destination
    else if (!store.destination) {
      store.setDestination(routePoint)
    }
    // Если есть и origin, и destination - добавляем как waypoint
    else {
      store.addWaypoint(routePoint)
    }

    setTemporaryMarker(null)
  }, [temporaryMarker])

  return {
    temporaryMarker,
    isLoadingAddress,
    handleLongPress,
    handleMapPress,
    handleAddTemporaryMarker,
  }
}

interface TemporaryLocationMarkerUIProps {
  temporaryMarker: TemporaryMarker | null
  onAdd: () => void
}

export function TemporaryLocationMarkerUI({
  temporaryMarker,
  onAdd,
}: TemporaryLocationMarkerUIProps) {
  if (!temporaryMarker) return null

  return (
    <Marker
      coordinate={{
        latitude: temporaryMarker.latitude,
        longitude: temporaryMarker.longitude,
      }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={false}
      flat={false}
      onPress={onAdd}>
      <TemporaryLocationMarker
        address={temporaryMarker.address}
        name={temporaryMarker.name}
      />
    </Marker>
  )
}
