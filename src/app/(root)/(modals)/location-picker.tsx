import { pointsEqual } from '@/components/route-form/route-form.validation'
import {
  LocationItem,
  LocationPickerEmpty,
  LocationPickerHeader,
  LocationPickerHistoryLabel,
  LocationPickerItem,
  LocationPickerMapPanel,
  LocationPickerSearch,
} from '@/features/location-picker'
import { useTheme } from '@/shared/hooks/use-theme'
import { useTranslation } from '@/shared/hooks/use-translation'
import {
  googlePlaceDetails,
  googlePlacesAutocomplete,
} from '@/shared/lib/google-places/google-places'
import {
  loadLocationPickerHistory,
  saveLocationPickerHistoryItem,
} from '@/shared/lib/location-picker/history'
import { useDirectionsActions } from '@/stores/directions/hooks'
import {
  useRouteActions,
  useRouteDestination,
  useRouteOrigin,
  useRouteWaypoints,
} from '@/stores/route/hooks'
import type { RoutePoint } from '@/stores/route/types'
import { useFocusEffect } from '@react-navigation/native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Platform,
  View,
} from 'react-native'

export default function LocationPickerScreen() {
  const router = useRouter()
  const { type, append } = useLocalSearchParams<{
    type: 'origin' | 'destination' | 'waypoint'
    append?: string
  }>()

  const { currentLanguage } = useTranslation()
  const { resolvedTheme } = useTheme()
  // IMPORTANT: keep zustand selectors stable (avoid returning new objects) to prevent
  // "getSnapshot should be cached" / maximum update depth issues.
  const origin = useRouteOrigin()
  const destination = useRouteDestination()
  const waypoints = useRouteWaypoints()
  const { setOrigin, setDestination, setWaypoints, addWaypoint } = useRouteActions()
  const { setSavedRouteId } = useDirectionsActions()

  const [searchQuery, setSearchQuery] = useState('')
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false)
  const [autocompleteRefresh, setAutocompleteRefresh] = useState(0)
  const [history, setHistory] = useState<LocationItem[]>([])
  const [results, setResults] = useState<LocationItem[]>([])
  const [keyboardOffset, setKeyboardOffset] = useState(0)

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

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardOffset(event.endCoordinates.height - 30)
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
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
      // map panel resets its own visibility
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
        return 'Where are you starting?'
      case 'destination':
        return 'Where are you going?'
      case 'waypoint':
        return 'Where would you like to stop?'
      default:
        return 'Select location'
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

      // Проверка на совпадение с уже выбранными точками
      const allPoints: RoutePoint[] = []
      if (origin) allPoints.push(origin)
      if (destination) allPoints.push(destination)
      allPoints.push(...waypoints)

      const duplicatePoint = allPoints.find((point) => pointsEqual(resolved, point))

      if (duplicatePoint) {
        Alert.alert(
          'Location already selected',
          'This location is already selected as origin, destination, or waypoint',
        )
        return
      }

      const nextHistory = await saveLocationPickerHistoryItem(resolved)
      if (isMountedRef.current) setHistory(nextHistory)

      // Очищаем savedRouteId при ручном изменении точек через location-picker
      setSavedRouteId(null)

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

  const backgroundColor = resolvedTheme === 'dark' ? '#0F172A' : '#FFFFFF'

  return (
    <View className="flex-1" style={{ backgroundColor }}>
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
        renderItem={({ item }) => <LocationPickerItem item={item} onPress={handleSelect} />}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
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

      <LocationPickerMapPanel
        type={type}
        currentLanguage={currentLanguage}
        keyboardOffset={keyboardOffset}
        onHistoryUpdate={(items) => {
          if (isMountedRef.current) setHistory(items)
        }}
      />
    </View>
  )
}


