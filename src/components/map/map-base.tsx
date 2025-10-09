import { useTheme } from '@/shared/lib/theme'
import { Feather } from '@expo/vector-icons'
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import MapView, { Camera, PROVIDER_GOOGLE, Region } from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { darkMapStyle, lightMapStyle } from './const/map-styles'

interface MapBaseProps {
  children?: React.ReactNode
  initialRegion?: Region
  enableBottomSheet?: boolean
  bottomSheetContent?: React.ReactNode
  setMapReady: (value: boolean) => void
  onBottomSheetClose?: () => void
}

const DEFAULT_MAP_HEIGHT = 300

const MapBase: React.FC<MapBaseProps> = ({
  children,
  initialRegion,
  enableBottomSheet = false,
  bottomSheetContent,
  setMapReady,
  onBottomSheetClose,
}) => {
  const { theme } = useTheme()
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get('window'),
  )
  const mapRef = useRef<MapView>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const insets = useSafeAreaInsets()

  // BottomSheet snap points
  const snapPoints = useMemo(() => ['25%', '75', '100%'], [])

  // Default region based on language
  const defaultRegion: Region = useMemo(() => {
    // For English language, center on USA
    return {
      latitude: 39.8283,
      longitude: -98.5795,
      latitudeDelta: 40,
      longitudeDelta: 40,
    }
  }, [])

  // Map style based on theme
  const mapStyle = useMemo(() => {
    return theme.mode === 'dark' ? darkMapStyle : lightMapStyle
  }, [theme.mode])

  // Memoize functions to prevent unnecessary re-renders
  const zoomBy = useCallback((delta: number) => {
    if (!mapRef.current) return

    mapRef.current
      ?.getCamera()
      .then((cam: Camera) => {
        if (cam && typeof cam.zoom === 'number') {
          mapRef.current?.animateCamera({
            ...cam,
            zoom: cam.zoom + delta,
          })
        } else {
          console.warn('Current map camera zoom is undefined or not a number.')
          mapRef.current?.animateCamera({ ...cam, zoom: 10 })
        }
      })
      .catch((error) => {
        console.error('Error getting camera:', error)
      })
  }, [])

  const handleZoomIn = useCallback(() => zoomBy(1), [zoomBy])
  const handleZoomOut = useCallback(() => zoomBy(-1), [zoomBy])

  // Toggle full-screen mode
  const handleFullScreenToggle = useCallback(() => {
    try {
      setMapReady(false)
      setIsFullScreen((prev) => {
        if (enableBottomSheet) {
          if (!prev) {
            bottomSheetRef.current?.expand()
          } else {
            bottomSheetRef.current?.close()
          }
        }
        return !prev
      })
    } catch (error) {
      console.error('Error toggling full screen:', error)
    }
  }, [enableBottomSheet, setMapReady])

  // Handle map ready
  const handleMapReady = useCallback(() => {
    try {
      setMapReady(true)
    } catch (error) {
      console.error('Error setting map ready:', error)
    }
  }, [setMapReady])

  // If bottomSheetContent becomes null, close BottomSheet
  useEffect(() => {
    try {
      if (!bottomSheetContent) {
        bottomSheetRef.current?.close()
      } else {
        bottomSheetRef.current?.snapToIndex(0) // Open BottomSheet if there is content
      }
    } catch (error) {
      console.error('Error handling bottom sheet content change:', error)
    }
  }, [bottomSheetContent])

  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window)
    })

    return () => subscription?.remove()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        setMapReady(false)
        setIsFullScreen(false)
        if (bottomSheetRef.current) {
          bottomSheetRef.current.close()
        }
      } catch (error) {
        console.error('Error during cleanup:', error)
      }
    }
  }, [setMapReady])

  const renderMap = useCallback(
    () => (
      <MapView
        key={`map-${screenDimensions.width}-${screenDimensions.height}`}
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        onMapReady={handleMapReady}
        style={
          isFullScreen
            ? {
                height: screenDimensions.height,
                width: screenDimensions.width,
              }
            : styles.map
        }
        initialRegion={initialRegion || defaultRegion}
        mapType="standard"
        customMapStyle={mapStyle}
        showsUserLocation={true}
        showsMyLocationButton={false}
        mapPadding={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}>
        {children}
      </MapView>
    ),
    [
      isFullScreen,
      screenDimensions,
      initialRegion,
      defaultRegion,
      handleMapReady,
      children,
      mapStyle,
    ],
  )

  return (
    <>
      {/* Normal mode: Render map within parent layout */}
      {!isFullScreen && (
        <View style={styles.container}>
          {renderMap()}
          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              className="p-2 rounded-lg shadow-lg"
              style={{ backgroundColor: theme.colors.background.secondary }}
              onPress={handleZoomIn}>
              <Feather
                name="plus"
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2 rounded-lg shadow-lg"
              style={{ backgroundColor: theme.colors.background.secondary }}
              onPress={handleZoomOut}>
              <Feather
                name="minus"
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2 rounded-lg shadow-lg"
              style={{ backgroundColor: theme.colors.background.secondary }}
              onPress={handleFullScreenToggle}>
              <Feather
                name={isFullScreen ? 'minimize-2' : 'maximize-2'}
                size={24}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Full-screen mode: Render map in a Modal */}
      {isFullScreen && (
        <Modal
          animationType="none"
          transparent={false}
          visible={isFullScreen}
          onRequestClose={handleFullScreenToggle}>
          <GestureHandlerRootView
            className="flex-1"
            style={{ backgroundColor: theme.colors.background.primary }}>
            {renderMap()}
            {/* Control Buttons */}
            <View style={[styles.controlsContainer, { top: insets.top + 10 }]}>
              <TouchableOpacity
                className="p-2 rounded-lg shadow-lg"
                style={{ backgroundColor: theme.colors.background.secondary }}
                onPress={handleZoomIn}>
                <Feather
                  name="plus"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 rounded-lg shadow-lg"
                style={{ backgroundColor: theme.colors.background.secondary }}
                onPress={handleZoomOut}>
                <Feather
                  name="minus"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-2 rounded-lg shadow-lg"
                style={{ backgroundColor: theme.colors.background.secondary }}
                onPress={handleFullScreenToggle}>
                <Feather
                  name={isFullScreen ? 'minimize-2' : 'maximize-2'}
                  size={24}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            </View>
            {/* BottomSheet (only if enabled and in full-screen mode) */}
            {enableBottomSheet && (
              <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose={false}
                backgroundStyle={{
                  backgroundColor: theme.colors.background.secondary,
                }}
                handleIndicatorStyle={{
                  backgroundColor: theme.colors.border.primary,
                }}
                topInset={insets.top}>
                <BottomSheetView className="flex-1 p-4">
                  {bottomSheetContent}
                </BottomSheetView>
              </BottomSheet>
            )}
          </GestureHandlerRootView>
        </Modal>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  map: {
    height: DEFAULT_MAP_HEIGHT,
    width: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
    gap: 8,
  },
})

export default MapBase
