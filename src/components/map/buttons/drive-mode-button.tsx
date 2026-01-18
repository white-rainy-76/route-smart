import { useUserLocation } from '@/shared/location'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import type MapView from 'react-native-maps'

interface DriveModeButtonProps {
  mapRef: React.RefObject<MapView | null>
  driveModeEnabled: boolean
  onToggleDriveMode: (enabled: boolean) => void
}

export function DriveModeButton({
  mapRef,
  driveModeEnabled,
  onToggleDriveMode,
}: DriveModeButtonProps) {
  const userLocation = useUserLocation()

  const handleToggleDriveMode = () => {
    if (!userLocation) return
    const next = !driveModeEnabled
    onToggleDriveMode(next)
    if (next) {
      // Immediately bring the user into view when enabling drive mode
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          5000,
        )
      }
    } else {
      // Return camera to normal position when disabling drive mode
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          500,
        )
      }
    }
  }

  return (
    <TouchableOpacity
      className="w-10 h-10 rounded-full justify-center items-center shadow-lg"
      style={[
        {
          marginBottom: 12,
          backgroundColor: driveModeEnabled ? '#4964D8' : '#FFFFFF',
          // shadowColor: '#000',
          // shadowOffset: {
          //   width: 0,
          //   height: 2,
          // },
          // shadowOpacity: 0.25,
          // shadowRadius: 3.84,
          zIndex: -1,
          elevation: -1,
          transform: [{ rotate: '45deg' }], // Поворот на северо-восток (45 градусов)
        },
      ]}
      onPress={handleToggleDriveMode}>
      <MaterialIcons
        name="navigation"
        size={22}
        color={driveModeEnabled ? '#FFFFFF' : '#4964D8'}
      />
    </TouchableOpacity>
  )
}
