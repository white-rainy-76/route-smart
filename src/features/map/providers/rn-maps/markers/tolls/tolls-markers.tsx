import { TollMarker } from '@/features/map/components/marker-content/tolls/toll-marker'
import { useDirectionsSelectedRouteSectionId } from '@/stores/directions/hooks'
import { useTolls } from '@/stores/tolls/hooks'
import { useMemo } from 'react'
import { Marker } from 'react-native-maps'

export function TollsMarkers() {
  const tolls = useTolls()
  const selectedRouteSectionId = useDirectionsSelectedRouteSectionId()

  // Фильтруем толлы по выбранной секции
  const filteredTolls = useMemo(() => {
    if (!tolls || !selectedRouteSectionId) return []
    return tolls.filter((toll) => toll.routeSection === selectedRouteSectionId)
  }, [tolls, selectedRouteSectionId])

  return (
    <>
      {filteredTolls.map((toll) => (
        <Marker
          key={toll.id}
          coordinate={{
            latitude: toll.latitude,
            longitude: toll.longitude,
          }}
          anchor={{ x: 0.5, y: 1 }}
          tracksViewChanges={false}
          flat={false}>
          <TollMarker />
        </Marker>
      ))}
    </>
  )
}
