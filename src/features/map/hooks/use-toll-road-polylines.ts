import { useTollRoadsStore } from '@/shared/stores/toll-roads-store'
import { useMemo } from 'react'
import type { MapCoordinate } from '../types/map-types'

export interface TollRoadPolyline {
  id: string
  coordinates: MapCoordinate[]
}

export const useTollRoadPolylines = (): TollRoadPolyline[] => {
  const tollRoads = useTollRoadsStore((s) => s.tollRoads)

  return useMemo(() => {
    if (!tollRoads || tollRoads.length === 0) return []
    return tollRoads.map((tollRoad) => ({
      id: tollRoad.id,
      coordinates: tollRoad.coordinates.map((coord) => ({
        latitude: coord.lat,
        longitude: coord.lng,
      })),
    }))
  }, [tollRoads])
}

