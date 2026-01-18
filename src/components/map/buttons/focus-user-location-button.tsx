import { useUserLocation } from '@/shared/location'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import type MapView from 'react-native-maps'

interface FocusUserLocationButtonProps {
  mapRef: React.RefObject<MapView | null>
}

export function FocusUserLocationButton({
  mapRef,
}: FocusUserLocationButtonProps) {
  const userLocation = useUserLocation()

  const handleFocusUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      )
    }
  }

  return (
    <TouchableOpacity
      className="w-10 h-10 bg-white rounded-full justify-center items-center shadow-lg"
      style={{
        // shadowColor: '#000',
        // shadowOffset: {
        //   width: 0,
        //   height: 2,
        // },
        // shadowOpacity: 0.25,
        // shadowRadius: 3.84,
        // elevation: 5,
      }}
      onPress={handleFocusUserLocation}>
      <MaterialIcons name="my-location" size={24} color="#4964D8" />
    </TouchableOpacity>
  )
}
