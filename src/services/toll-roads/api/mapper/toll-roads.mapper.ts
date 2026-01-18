import type { GetTollRoadsResponse, TollRoad } from '../../model/types/roads'
import type {
  CoordinateDto,
  GetTollRoadsResponseDto,
  TollRoadDto,
} from '../../model/types/roads.dto'

/**
 * Maps a single TollRoadDto from the API to a TollRoad object.
 * @param dto The TollRoadDto object from the API response.
 * @returns A mapped TollRoad object.
 */
export const mapTollRoad = (dto: TollRoadDto): TollRoad => {
  return {
    id: dto.id,
    name: dto.name,
    ref: dto.ref,
    highwayType: dto.highwayType,
    isToll: dto.isToll,
    coordinates: dto.coordinates.map((coord: CoordinateDto) => ({
      lat: coord.latitude,
      lng: coord.longitude,
    })),
  }
}

/**
 * Maps the full API response DTO (GetTollRoadsResponseDto)
 * to the desired application data structure (GetTollRoadsResponse).
 * @param dto The raw DTO object received from the server (already validated by Zod).
 * @returns The mapped GetTollRoadsResponse object.
 */
export const mapGetTollRoads = (
  dto: GetTollRoadsResponseDto,
): GetTollRoadsResponse => {
  return dto.map(mapTollRoad)
}
