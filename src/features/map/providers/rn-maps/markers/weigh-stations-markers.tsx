import { WeighStationMarker } from '@/features/map/components/marker-content/weigh-station-marker'
import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useWeighStationsStore } from '@/shared/stores/weigh-stations-store'
import { useMemo } from 'react'
import { Marker } from 'react-native-maps'

export function WeighStationsMarkers() {
  const weighStationsData = useWeighStationsStore((s) => s.weighStations)
  const selectedRouteSectionId = useDirectionsStore(
    (s) => s.selectedRouteSectionId,
  )

  // Фильтруем weigh stations по выбранной секции
  const filteredWeighStations = useMemo(() => {
    if (!weighStationsData || !selectedRouteSectionId) return []
    
    // Находим секцию с нужным sectionId
    const section = weighStationsData.find(
      (section) => section.sectionId === selectedRouteSectionId,
    )
    
    return section?.weighStations ?? []
  }, [weighStationsData, selectedRouteSectionId])

  return (
    <>
      {filteredWeighStations.map((weighStation) => (
        <Marker
          key={weighStation.id}
          coordinate={{
            latitude: weighStation.latitude,
            longitude: weighStation.longitude,
          }}
          anchor={{ x: 0.5, y: 1 }}
          tracksViewChanges={false}
          flat={false}>
          <WeighStationMarker />
        </Marker>
      ))}
    </>
  )
}
