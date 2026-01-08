/**
 * Логика отслеживания геолокации
 * Фильтрует обновления, чтобы не спамить UI
 * Вне React. Нет state. Нет rerender.
 */

import type * as Location from 'expo-location'
import { startNativeLocation, stopNativeLocation } from './location-engine'
import { setUserLocation } from './location-store'

let last: { lat: number; lng: number } | null = null

// Округление до 4 знаков после запятой (~10 метров точности)
const PRECISION = 4

export async function startLocationTracking(): Promise<void> {
  await startNativeLocation((loc: Location.LocationObject) => {
    const lat = Number(loc.coords.latitude.toFixed(PRECISION))
    const lng = Number(loc.coords.longitude.toFixed(PRECISION))

    // Проверяем, изменились ли координаты значительно
    if (last && last.lat === lat && last.lng === lng) {
      return // ❌ Никаких обновлений — координаты не изменились
    }

    last = { lat, lng }

    // ✅ Обновляем store только при реальном изменении
    setUserLocation({
      latitude: lat,
      longitude: lng,
    })
  })
}

export function stopLocationTracking(): void {
  stopNativeLocation()
  last = null
}

export function resetLocationTracking(): void {
  last = null
  setUserLocation(null)
}
