import type { MapCoordinate } from '../types/map-types'

export interface LineStringFeatureInput {
  id: string
  coordinates: MapCoordinate[]
}

// Mapbox uses [lng, lat]
export const toLineStringCoordinates = (
  coordinates: MapCoordinate[],
): [number, number][] => {
  return coordinates.map(({ latitude, longitude }) => [longitude, latitude])
}

export const buildLineStringFeatureCollection = (
  lines: LineStringFeatureInput[],
) => ({
  type: 'FeatureCollection' as const,
  features: lines.map((line) => ({
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: toLineStringCoordinates(line.coordinates),
    },
    properties: {
      id: line.id,
    },
  })),
})
