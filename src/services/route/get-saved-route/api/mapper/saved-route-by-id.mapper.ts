import { SavedRouteById } from '../contracts/saved-routes.contract'
import { SavedRouteByIdDto } from '../contracts/saved-routes.dto.contract'

export const mapSavedRouteByIdDtoToData = (
  dto: SavedRouteByIdDto,
): SavedRouteById => {
  return {
    id: dto.id,
    geoJson: {
      type: dto.geoJson.type,
      coordinates: dto.geoJson.coordinates,
    },
  }
}
