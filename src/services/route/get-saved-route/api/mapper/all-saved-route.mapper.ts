import { SavedRouteItem } from '../contracts/saved-routes.contract'
import { GetAllSavedRouteDto } from '../contracts/saved-routes.dto.contract'

export const mapGetAllSavedRouteToSavedRouteItems = (
  dto: GetAllSavedRouteDto,
): SavedRouteItem[] => {
  return dto.map((route) => ({
    id: route.id,
    name: route.name,
    startLocation: {
      address: route.startLocation.address,
      latitude: route.startLocation.latitude,
      longitude: route.startLocation.longitude,
    },
    endLocation: {
      address: route.endLocation.address,
      latitude: route.endLocation.latitude,
      longitude: route.endLocation.longitude,
    },
    waypoints: route.viaPoints?.map((vp) => ({
      latitude: vp.latitude,
      longitude: vp.longitude,
      name: vp.name,
      address: vp.address,
      stopOrder: vp.stopOrder,
    })),
  }))
}
