import { Map, MapBottomSheet } from '@/features/map'
import { useDrawer } from '@/shared/contexts/drawer-context'
import { useDirectionsActions } from '@/stores/directions/hooks'
import { MaterialIcons } from '@expo/vector-icons'
import { useCallback, useRef, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import type MapView from 'react-native-maps'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'

export default function HomeScreen() {
  const { openDrawer } = useDrawer()
  const mapRef = useRef<MapView>(null)
  const [sidebarButtonOpacity, setSidebarButtonOpacity] =
    useState<SharedValue<number> | null>(null)
  const [buttonBottom, setButtonBottom] = useState<
    SharedValue<number> | undefined
  >(undefined)
  const [buttonOpacity, setButtonOpacity] = useState<
    SharedValue<number> | undefined
  >(undefined)
  const [driveModeEnabled, setDriveModeEnabled] = useState(false)
  const { setIsTripActive } = useDirectionsActions()

  const handleStartTrip = useCallback(() => {
    setIsTripActive(true)
    setDriveModeEnabled(true)
  }, [setIsTripActive])

  const handleEndTrip = useCallback(() => {
    setIsTripActive(false)
    setDriveModeEnabled(false)
  }, [setIsTripActive])

  const handleButtonAnimationChange = useCallback(
    (bottom: SharedValue<number>, opacity: SharedValue<number>) => {
      setButtonBottom(bottom)
      setButtonOpacity(opacity)
    },
    [],
  )

  const sidebarButtonStyle = useAnimatedStyle(() => {
    if (!sidebarButtonOpacity) {
      return { opacity: 1, pointerEvents: 'auto' }
    }
    return {
      opacity: sidebarButtonOpacity.value,
      pointerEvents: sidebarButtonOpacity.value > 0 ? 'auto' : 'none',
    }
  })

  return (
    <View style={styles.container}>
      <Map
        className="flex-1"
        mapRef={mapRef}
        driveModeEnabled={driveModeEnabled}
        onToggleDriveMode={setDriveModeEnabled}
        buttonBottom={buttonBottom}
        buttonOpacity={buttonOpacity}
      />
      <Animated.View
        className="absolute left-5 top-[52px] w-10 h-10 bg-white rounded-full justify-center items-center z-[1000] shadow-lg"
        style={[styles.menuButton, sidebarButtonStyle]}>
        <TouchableOpacity
          className="w-full h-full justify-center items-center"
          onPress={openDrawer}>
          <MaterialIcons name="menu" size={24} color="#4964D8" />
        </TouchableOpacity>
      </Animated.View>
      <MapBottomSheet
        onButtonOpacityChange={setSidebarButtonOpacity}
        onButtonAnimationChange={handleButtonAnimationChange}
        onStartTrip={handleStartTrip}
        onEndTrip={handleEndTrip}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})
