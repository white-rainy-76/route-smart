import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useTollsStore } from '@/shared/stores/tolls-store'
import { useMemo } from 'react'
import { Marker } from 'react-native-maps'
import { TollMarker } from './toll-marker'

export function TollsMarkers() {
  const tolls = useTollsStore((s) => s.tolls)
  const selectedRouteSectionId = useDirectionsStore(
    (s) => s.selectedRouteSectionId,
  )

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
