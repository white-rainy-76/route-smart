import {
    useDirections,
    useDirectionsSelectedRouteSectionId,
    useDirectionsTripActive,
} from '@/stores/directions/hooks'
import { useMemo } from 'react'
import type { MapCoordinate } from '../types/map-types'

export interface RoutePolylineSection {
  id: string
  coordinates: MapCoordinate[]
  isSelected: boolean
}

export const useRoutePolylines = (): RoutePolylineSection[] => {
  const directions = useDirections()
  const selectedRouteSectionId = useDirectionsSelectedRouteSectionId()
  const isTripActive = useDirectionsTripActive()

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

