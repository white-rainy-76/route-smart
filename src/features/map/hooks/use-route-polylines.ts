import { useDirectionsStore } from '@/shared/stores/directions-store'
import { useMemo } from 'react'
import type { MapCoordinate } from '../types/map-types'

export interface RoutePolylineSection {
  id: string
  coordinates: MapCoordinate[]
  isSelected: boolean
}

export const useRoutePolylines = (): RoutePolylineSection[] => {
  const directions = useDirectionsStore((s) => s.directions)
  const selectedRouteSectionId = useDirectionsStore((s) => s.selectedRouteSectionId)
  const isTripActive = useDirectionsStore((s) => s.isTripActive)

  return useMemo(() => {
    const sections = directions?.route ?? []
    return sections
      .filter((section) => {
        if (isTripActive) {
          return section.routeSectionId === selectedRouteSectionId
        }
        return true
      })
      .map((section) => ({
        id: section.routeSectionId,
        isSelected: section.routeSectionId === selectedRouteSectionId,
        coordinates: section.mapPoints.map(([latitude, longitude]) => ({
          latitude,
          longitude,
        })),
      }))
  }, [directions, isTripActive, selectedRouteSectionId])
}

