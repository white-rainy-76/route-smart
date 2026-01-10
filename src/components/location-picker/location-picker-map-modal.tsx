import { Button } from '@/components/ui/button'
import { googleReverseGeocode } from '@/shared/lib/google-places/google-places'
import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import type { Region } from 'react-native-maps'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Map } from '../map/map'
import type { LocationItem } from './location-picker-item'

interface LocationPickerMapModalProps {
  visible: boolean
  language: string
  initialRegion: Region
  onClose: () => void
  onDone: (point: LocationItem) => Promise<void> | void
}

function regionToCenter(region: Region) {
  return { latitude: region.latitude, longitude: region.longitude }
}

export function LocationPickerMapModal({
  visible,
  language,
  initialRegion,
  onClose,
  onDone,
}: LocationPickerMapModalProps) {
  const insets = useSafeAreaInsets()

  const [place, setPlace] = useState<LocationItem | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  const canDone = useMemo(() => {
    return Boolean(place) && !isSearching && !isCommitting
  }, [place, isSearching, isCommitting])

  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const searchByRegion = async (nextRegion: Region) => {
    const requestId = ++requestIdRef.current
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsSearching(true)
    try {
      const center = regionToCenter(nextRegion)
      const result = await googleReverseGeocode({
        latitude: center.latitude,
        longitude: center.longitude,
        language,
        signal: controller.signal,
      })
      if (controller.signal.aborted) return
      if (requestId !== requestIdRef.current) return
      if (!result) return

      setPlace({
        id: result.placeId,
        name: result.name,
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude,
      })
    } finally {
      if (controller.signal.aborted) return
      if (requestId !== requestIdRef.current) return
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (!visible) return
    setPlace(null)
    setIsSearching(false)
    setIsCommitting(false)
    requestIdRef.current++
    abortRef.current?.abort()
    // initial lookup
    searchByRegion(initialRegion)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialRegion, language])

  const handleDonePress = async () => {
    if (!place) return
    if (isCommitting) return

    setIsCommitting(true)
    try {
      await onDone(place)
      onClose()
    } finally {
      setIsCommitting(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Back button - top left, white rounded */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-0 left-0 z-10 w-10 h-10 bg-white rounded-full items-center justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ marginTop: insets.top + 12, marginLeft: 16 }}>
          <MaterialIcons name="arrow-back" size={24} color="#383838" />
        </TouchableOpacity>

        {/* Map - full screen */}
        <View style={{ flex: 1 }}>
          <Map
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            onRegionChangeComplete={(next) => {
              // reverse-geocode when camera stops
              searchByRegion(next)
            }}
          />

          {/* Center marker overlay */}
          <View pointerEvents="none" style={styles.centerMarkerWrap}>
            {place?.name ? (
              <View style={styles.label}>
                <Text style={styles.labelText} numberOfLines={2}>
                  {place.address}
                </Text>
              </View>
            ) : null}

            <MaterialIcons name="place" size={40} color="#4964D8" />
            {isSearching && (
              <View style={{ marginTop: 8 }}>
                <ActivityIndicator size="small" color="#4964D8" />
              </View>
            )}
          </View>
        </View>

        {/* Bottom section - white block with Done button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white"
          style={{
            height: 121 + insets.bottom,
            paddingBottom: insets.bottom,
          }}>
          <View className="flex-1 px-5 justify-center">
            <Button
              variant="primary"
              size="lg"
              disabled={!canDone}
              onPress={handleDonePress}
              className="w-full">
              Done
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centerMarkerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -48,
    alignItems: 'center',
  },
  label: {
    maxWidth: 280,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginBottom: 10,
  },
  labelText: {
    color: '#383838',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
})
