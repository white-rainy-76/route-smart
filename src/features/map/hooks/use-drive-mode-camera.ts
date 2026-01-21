import { useUserLocation } from '@/shared/lib/location'
import { useCallback, useEffect, useRef } from 'react'
import type { MapCamera, MapRef } from '../types/map-types'

const DRIVE_AUTO_RESUME_MS = 4500
const DRIVE_MIN_UPDATE_INTERVAL_MS = 250

interface UseDriveModeCameraProps {
  mapRef: React.RefObject<MapRef | null>
  driveModeEnabled: boolean
}

function headingDeltaDeg(a: number, b: number): number {
  const diff = Math.abs(a - b)
  return Math.min(diff, 360 - diff)
}

export function useDriveModeCamera({
  mapRef,
  driveModeEnabled,
}: UseDriveModeCameraProps) {
  // Critical: do NOT subscribe to location updates unless drive mode is enabled.
  // Otherwise the whole <Map /> rerenders on every GPS/heading tick.
  const userLocation = useUserLocation(driveModeEnabled)
  const userLocationRef = useRef(userLocation)
  userLocationRef.current = userLocation
  const lastAppliedRef = useRef<{
    ts: number
    lat: number
    lng: number
    heading: number | null
  } | null>(null)

  const driveResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const followUserCamera = useCallback(
    (duration = 900) => {
      const loc = userLocationRef.current
      if (!loc) return
      if (!mapRef.current) return

      const now = Date.now()
      const nextHeading =
        loc.heading !== null && loc.heading !== undefined ? loc.heading : null

      const last = lastAppliedRef.current
      if (last) {
        const tooSoon = now - last.ts < DRIVE_MIN_UPDATE_INTERVAL_MS
        const posSame = last.lat === loc.latitude && last.lng === loc.longitude
        const headingSame =
          last.heading === null || nextHeading === null
            ? last.heading === nextHeading
            : headingDeltaDeg(last.heading, nextHeading) < 1
        // Avoid over-updating camera when only compass jitter changes heading.
        if (tooSoon && posSame && headingSame) return
      }

      // "Google-like" driving camera: follow + tilt + rotate (when heading is known)
      const camera: MapCamera = {
        center: { latitude: loc.latitude, longitude: loc.longitude },
        pitch: 60,
        zoom: 17.5,
      }

      if (nextHeading !== null) {
        camera.heading = nextHeading
      }

      mapRef.current.animateCamera(camera, { duration })
      lastAppliedRef.current = {
        ts: now,
        lat: loc.latitude,
        lng: loc.longitude,
        heading: nextHeading,
      }
    },
    [mapRef],
  )

  const pauseAndAutoResumeDriveMode = useCallback(() => {
    if (!driveModeEnabled) return
    if (driveResumeTimerRef.current) clearTimeout(driveResumeTimerRef.current)
    driveResumeTimerRef.current = setTimeout(() => {
      if (!driveModeEnabled) return
      followUserCamera(800)
    }, DRIVE_AUTO_RESUME_MS)
  }, [driveModeEnabled, followUserCamera])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (driveResumeTimerRef.current) {
        clearTimeout(driveResumeTimerRef.current)
        driveResumeTimerRef.current = null
      }
    }
  }, [])

  // Auto-follow on location updates when drive mode is enabled
  useEffect(() => {
    if (!driveModeEnabled) return
    // keep following on every fresh location update (unless user is currently panning/zooming)
    followUserCamera(750)
  }, [
    driveModeEnabled,
    userLocation?.latitude,
    userLocation?.longitude,
    userLocation?.heading,
    followUserCamera,
  ])

  return {
    pauseAndAutoResumeDriveMode,
  }
}
