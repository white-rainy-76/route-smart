/**
 * Логика отслеживания геолокации
 * Фильтрует обновления, чтобы не спамить UI
 * Вне React. Нет state. Нет rerender.
 */

import type * as Location from 'expo-location'
import { Platform } from 'react-native'
import {
  startNativeHeading,
  startNativeLocation,
  stopNativeHeading,
  stopNativeLocation,
} from './location-engine'
import { setUserLocation } from './location-store'

let last: {
  lat: number
  lng: number
  heading: number | null
  speed: number | null
  ts: number
  headingTs: number
} | null = null

// On Android sensors can be noisy and emit events very frequently.
// Use slightly lower precision and stronger throttling to avoid UI churn.
const PRECISION = Platform.OS === 'android' ? 5 : 6
const HEADING_DELTA_DEG = Platform.OS === 'android' ? 10 : 5
const HEADING_MIN_INTERVAL_MS = Platform.OS === 'android' ? 1000 : 250
const LOCATION_MIN_INTERVAL_MS = Platform.OS === 'android' ? 1500 : 0

function normalizeHeading(value: number | null): number | null {
  if (value === null) return null
  if (!Number.isFinite(value)) return null
  // expo-location uses -1 for "unknown heading" on some platforms
  if (value < 0) return null
  const normalized = ((value % 360) + 360) % 360
  return normalized
}

function headingChanged(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return a !== b
  const diff = Math.abs(a - b)
  const delta = Math.min(diff, 360 - diff)
  return delta >= HEADING_DELTA_DEG
}

export async function startLocationTracking(): Promise<void> {
  // Device/compass heading (works even when standing still, "like Google")
  await startNativeHeading((h: Location.LocationHeadingObject) => {
    const trueHeading =
      Number.isFinite(h.trueHeading) && h.trueHeading >= 0
        ? h.trueHeading
        : null
    const magHeading =
      Number.isFinite(h.magHeading) && h.magHeading >= 0 ? h.magHeading : null
    const nextHeading = normalizeHeading(trueHeading ?? magHeading ?? null)

    if (!last) return
    const now = Date.now()
    // Throttle heading events (Android can be extremely chatty)
    if (now - last.headingTs < HEADING_MIN_INTERVAL_MS) return
    if (!headingChanged(last.heading, nextHeading)) return

    last = { ...last, heading: nextHeading, headingTs: now }
    setUserLocation({
      latitude: last.lat,
      longitude: last.lng,
      heading: last.heading,
      speed: last.speed,
    })
  })

  await startNativeLocation((loc: Location.LocationObject) => {
    const now = Date.now()
    const lat = Number(loc.coords.latitude.toFixed(PRECISION))
    const lng = Number(loc.coords.longitude.toFixed(PRECISION))
    const speed =
      loc.coords.speed !== null && Number.isFinite(loc.coords.speed)
        ? loc.coords.speed
        : null

    // Проверяем, изменились ли координаты/скорость значительно.
    // Heading берём только из watchHeadingAsync (чтобы не было конфликтов с GPS-course).
    if (last && last.lat === lat && last.lng === lng && last.speed === speed) {
      return // ❌ Никаких обновлений — координаты не изменились
    }
    // Additional throttle to reduce UI updates on Android.
    if (last && LOCATION_MIN_INTERVAL_MS > 0 && now - last.ts < LOCATION_MIN_INTERVAL_MS) {
      return
    }

    // Keep current heading (updated by compass subscription) as-is.
    const nextHeading = last?.heading ?? null
    last = {
      lat,
      lng,
      heading: nextHeading,
      speed,
      ts: now,
      headingTs: last?.headingTs ?? 0,
    }

    // ✅ Обновляем store только при реальном изменении
    setUserLocation({
      latitude: lat,
      longitude: lng,
      heading: nextHeading,
      speed,
    })
  })
}

export function stopLocationTracking(): void {
  stopNativeLocation()
  stopNativeHeading()
  last = null
}

export function resetLocationTracking(): void {
  last = null
  setUserLocation(null)
}
