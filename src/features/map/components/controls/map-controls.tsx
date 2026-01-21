import { StyleSheet } from 'react-native'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import type { MapRef } from '../../types/map-types'
import { DriveModeButton } from './drive-mode-button'
import { FocusUserLocationButton } from './focus-user-location-button'

interface MapControlsProps {
  mapRef: React.RefObject<MapRef | null>
  driveModeEnabled: boolean
  onToggleDriveMode?: (enabled: boolean) => void
  buttonBottom?: SharedValue<number>
  buttonOpacity?: SharedValue<number>
  showMapControls?: boolean
}

export function MapControls({
  mapRef,
  driveModeEnabled,
  onToggleDriveMode,
  buttonBottom,
  buttonOpacity,
  showMapControls = true,
}: MapControlsProps) {
  const locationButtonStyle = useAnimatedStyle(() => {
    if (!buttonBottom || !buttonOpacity) {
      return {
        bottom: 100,
        opacity: 1,
        pointerEvents: 'auto',
      }
    }
    return {
      bottom: buttonBottom.value,
      opacity: buttonOpacity.value,
      pointerEvents: buttonOpacity.value > 0 ? 'auto' : 'none',
    }
  })

  if (!showMapControls) return null

  return (
    <Animated.View style={[styles.container, locationButtonStyle]}>
      <DriveModeButton
        mapRef={mapRef}
        driveModeEnabled={driveModeEnabled}
        onToggleDriveMode={onToggleDriveMode || (() => {})}
      />
      <FocusUserLocationButton mapRef={mapRef} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 1000,
    elevation: 20,
  },
})

