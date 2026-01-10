import {
  LocationItem,
  LocationPickerEmpty,
  LocationPickerHeader,
  LocationPickerHistoryLabel,
  LocationPickerItem,
  LocationPickerMapModal,
  LocationPickerSearch,
} from '@/components/location-picker'
import { ShowOnMapButton } from '@/components/ui/show-on-map-button'
import { useTranslation } from '@/shared/hooks/use-translation'
import {
  googlePlaceDetails,
  googlePlacesAutocomplete,
} from '@/shared/lib/google-places/google-places'
import {
  loadLocationPickerHistory,
  saveLocationPickerHistoryItem,
} from '@/shared/lib/location-picker/history'
import { useRouteStore } from '@/shared/stores/route-store'
import { useFocusEffect } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function LocationPickerScreen() {
  const router = useRouter()
  const { type, append } = useLocalSearchParams<{
    type: 'origin' | 'destination' | 'waypoint'
    append?: string
  }>()

  const insets = useSafeAreaInsets()
  const { currentLanguage } = useTranslation()
  // IMPORTANT: keep zustand selectors stable (avoid returning new objects) to prevent
  // "getSnapshot should be cached" / maximum update depth issues.
  const origin = useRouteStore((s) => s.origin)
  const destination = useRouteStore((s) => s.destination)
  const waypoints = useRouteStore((s) => s.waypoints)
  const setOrigin = useRouteStore((s) => s.setOrigin)
  const setDestination = useRouteStore((s) => s.setDestination)
  const setWaypoints = useRouteStore((s) => s.setWaypoints)
  const addWaypoint = useRouteStore((s) => s.addWaypoint)

  const [searchQuery, setSearchQuery] = useState('')
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false)
  const [autocompleteRefresh, setAutocompleteRefresh] = useState(0)
  const [history, setHistory] = useState<LocationItem[]>([])
  const [results, setResults] = useState<LocationItem[]>([])
  const [isMapVisible, setIsMapVisible] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    loadLocationPickerHistory().then((items) => {
      if (!isMountedRef.current) return
      // Limit history to maximum 9 items
      setHistory(items.slice(0, 9))
    })
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      // Every time user enters this screen, reset input/draft to what is stored.
      const existing =
        type === 'origin' ? origin : type === 'destination' ? destination : null

      const nextQuery = existing ? existing.name || existing.address || '' : ''
      setSearchQuery(nextQuery)
      setResults([])
      const shouldAutoSearch = nextQuery.trim().length >= 2
      setIsAutocompleteLoading(shouldAutoSearch)
      setIsMapVisible(false)
      setIsCommitting(false)
      if (shouldAutoSearch) setAutocompleteRefresh((v) => v + 1)

      return undefined
    }, [type, origin, destination]),
  )

  const showHistory = searchQuery.trim().length === 0
  const data = showHistory ? history.slice(0, 9) : results

  const placeholder = useMemo(() => {
    switch (type) {
      case 'origin':
        return 'Enter your start point'
      case 'destination':
        return 'Enter your destination'
      case 'waypoint':
        return 'Enter stop location'
      default:
        return 'Search location'
    }
  }, [type])

  useEffect(() => {
    if (showHistory) {
      setResults([])
      setIsAutocompleteLoading(false)
      return
    }

    const query = searchQuery.trim()
    if (query.length < 2) {
      setResults([])
      setIsAutocompleteLoading(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false
    setIsAutocompleteLoading(true)

    const timeout = setTimeout(async () => {
      try {
        const predictions = await googlePlacesAutocomplete({
          input: query,
          language: currentLanguage,
          signal: controller.signal,
        })

        if (cancelled) return
        if (!isMountedRef.current) return

        setResults(
          predictions.map((p) => ({
            id: p.placeId,
            name: p.mainText || p.description,
            address: p.secondaryText || p.description,
            latitude: 0,
            longitude: 0,
          })),
        )
      } catch (err) {
        if (controller.signal.aborted) return
        if (cancelled) return
        if (!isMountedRef.current) return
        console.warn('googlePlacesAutocomplete failed', err)
      } finally {
        if (cancelled) return
        if (!isMountedRef.current) return
        setIsAutocompleteLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      controller.abort()
      if (isMountedRef.current) setIsAutocompleteLoading(false)
    }
  }, [searchQuery, showHistory, currentLanguage, autocompleteRefresh])

  const getTitle = () => {
    switch (type) {
      case 'origin':
        return 'Start Point'
      case 'destination':
        return 'Destination'
      case 'waypoint':
        return 'Add Stop'
      default:
        return 'Location'
    }
  }

  const handleSelect = (item: LocationItem) => {
    ;(async () => {
      setIsAutocompleteLoading(false)

      const resolved =
        item.latitude !== 0 && item.longitude !== 0
          ? item
          : await (async () => {
              const details = await googlePlaceDetails({
                placeId: item.id,
                language: currentLanguage,
              })
              if (!details) return null
              return {
                id: details.placeId,
                name: details.name || item.name,
                address: details.address || item.address,
                latitude: details.latitude,
                longitude: details.longitude,
              } satisfies LocationItem
            })()

      if (!resolved) return

      const nextHistory = await saveLocationPickerHistoryItem(resolved)
      if (isMountedRef.current) setHistory(nextHistory)

      switch (type) {
        case 'origin':
          setOrigin(resolved)
          break
        case 'destination':
          setDestination(resolved)
          break
        case 'waypoint':
          if (append === '1' || append === 'true') {
            const all = [
              ...(origin ? [origin] : []),
              ...waypoints,
              ...(destination ? [destination] : []),
              resolved,
            ]
            if (all.length === 1) {
              setOrigin(all[0])
              setDestination(null)
              setWaypoints([])
            } else {
              setOrigin(all[0])
              setDestination(all[all.length - 1])
              setWaypoints(all.slice(1, -1))
            }
          } else {
            addWaypoint(resolved)
          }
          break
        default:
          break
      }

      router.back()
    })()
  }

  const handleSearchChange = (text: string) => {
    setSearchQuery(text)
  }

  const handleClear = () => {
    setSearchQuery('')
    setResults([])
    setIsAutocompleteLoading(false)

    // Clear stored value as well (for origin/destination).
    if (type === 'origin') setOrigin(null)
    if (type === 'destination') setDestination(null)
  }

  const openMap = () => {
    // Map picker does not require a draft point.
    setIsMapVisible(true)
  }

  const handleDone = async (point: LocationItem) => {
    if (isCommitting) return
    if (
      !Number.isFinite(point.latitude) ||
      !Number.isFinite(point.longitude) ||
      point.latitude === 0 ||
      point.longitude === 0
    )
      return

    setIsCommitting(true)
    try {
      const nextHistory = await saveLocationPickerHistoryItem(point)
      if (isMountedRef.current) setHistory(nextHistory)

      switch (type) {
        case 'origin':
          setOrigin(point)
          break
        case 'destination':
          setDestination(point)
          break
        case 'waypoint':
          addWaypoint(point)
          break
        default:
          break
      }

      router.back()
    } finally {
      if (isMountedRef.current) setIsCommitting(false)
    }
  }

  const initialMapRegion = useMemo(() => {
    const existing =
      type === 'origin' ? origin : type === 'destination' ? destination : null
    const latitude = existing?.latitude ?? 39.8283
    const longitude = existing?.longitude ?? -98.5795
    return {
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
  }, [type, origin, destination])

  return (
    <View className="flex-1 bg-white">
      <LocationPickerHeader title={getTitle()} onBack={() => router.back()} />

      <LocationPickerSearch
        value={searchQuery}
        onChangeText={handleSearchChange}
        onClear={handleClear}
        placeholder={placeholder}
        autoFocus
      />

      {showHistory && history.length > 0 && <LocationPickerHistoryLabel />}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LocationPickerItem item={item} onPress={handleSelect} />
        )}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
        ListEmptyComponent={
          !showHistory && searchQuery.length >= 2 && !isAutocompleteLoading ? (
            <LocationPickerEmpty />
          ) : null
        }
        ListFooterComponent={
          isAutocompleteLoading ? (
            <View style={{ paddingVertical: 14, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#4964D8" />
            </View>
          ) : (
            <View style={{ height: 20 }} />
          )
        }
      />

      <View
        className="absolute left-0 right-0 items-center"
        style={{ bottom: insets.bottom + 16 }}>
        <ShowOnMapButton onPress={openMap} />
      </View>

      <LocationPickerMapModal
        visible={isMapVisible}
        language={currentLanguage}
        initialRegion={initialMapRegion}
        onClose={() => setIsMapVisible(false)}
        onDone={handleDone}
      />
    </View>
  )
}
