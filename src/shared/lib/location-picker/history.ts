import AsyncStorage from '@react-native-async-storage/async-storage'

export interface LocationPickerHistoryItem {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

const HISTORY_KEY = 'location_picker_history_v1'
const HISTORY_LIMIT = 10

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function loadLocationPickerHistory(): Promise<
  LocationPickerHistoryItem[]
> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY)
  const parsed = safeParseJson<unknown>(raw)
  if (!Array.isArray(parsed)) return []

  return parsed
    .map((x) => {
      if (!x || typeof x !== 'object') return null
      const obj = x as Record<string, unknown>
      const id = typeof obj.id === 'string' ? obj.id : ''
      const name = typeof obj.name === 'string' ? obj.name : ''
      const address = typeof obj.address === 'string' ? obj.address : ''
      const latitude = typeof obj.latitude === 'number' ? obj.latitude : NaN
      const longitude = typeof obj.longitude === 'number' ? obj.longitude : NaN
      if (
        !id ||
        !name ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      )
        return null
      return { id, name, address, latitude, longitude }
    })
    .filter((x): x is LocationPickerHistoryItem => Boolean(x))
    .slice(0, HISTORY_LIMIT)
}

export async function saveLocationPickerHistoryItem(
  item: LocationPickerHistoryItem,
): Promise<LocationPickerHistoryItem[]> {
  const current = await loadLocationPickerHistory()
  const next = [item, ...current.filter((x) => x.id !== item.id)].slice(
    0,
    HISTORY_LIMIT,
  )

  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  return next
}

export async function clearLocationPickerHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY)
}
