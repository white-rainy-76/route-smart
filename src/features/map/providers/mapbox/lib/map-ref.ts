import type { MapRef } from '../../../types/map-types'

export type MapboxCameraRef = {
  setCamera: (config: {
    centerCoordinate?: [number, number]
    zoomLevel?: number
    heading?: number
    pitch?: number
    animationDuration?: number
  }) => void
  fitBounds?: (
    ne: [number, number],
    sw: [number, number],
    padding?: number[] | number,
    animationDuration?: number,
  ) => void
}

export const createMapboxMapRef = (camera: MapboxCameraRef): MapRef => ({
  fitToCoordinates: (coordinates, options) => {
    if (coordinates.length < 2) return
    const lats = coordinates.map((coord) => coord.latitude)
    const lngs = coordinates.map((coord) => coord.longitude)
    const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)]
    const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)]
    const padding = options?.edgePadding
      ? [
          options.edgePadding.top,
          options.edgePadding.right,
          options.edgePadding.bottom,
          options.edgePadding.left,
        ]
      : undefined
    const duration = options?.animated === false ? 0 : 800
    if (camera.fitBounds) {
      camera.fitBounds(ne, sw, padding, duration)
      return
    }
    const longitudeDelta = Math.max(ne[0] - sw[0], 0.0001)
    const latitudeDelta = Math.max(ne[1] - sw[1], 0.0001)
    const zoomLevel = Math.log2(360 / Math.max(longitudeDelta, latitudeDelta))
    camera.setCamera({
      centerCoordinate: [(ne[0] + sw[0]) / 2, (ne[1] + sw[1]) / 2],
      zoomLevel,
      animationDuration: duration,
    })
  },
  animateToRegion: (region, duration = 1000) => {
    const zoomLevel = Math.log2(360 / region.longitudeDelta) || 10
    camera.setCamera({
      centerCoordinate: [region.longitude, region.latitude],
      zoomLevel,
      animationDuration: duration,
    })
  },
  animateCamera: (cameraInput, options) => {
    camera.setCamera({
      centerCoordinate: [
        cameraInput.center.longitude,
        cameraInput.center.latitude,
      ],
      zoomLevel: cameraInput.zoom,
      heading: cameraInput.heading,
      pitch: cameraInput.pitch,
      animationDuration: options?.duration,
    })
  },
})
