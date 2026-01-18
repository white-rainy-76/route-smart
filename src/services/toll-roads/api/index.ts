// schemas and mappers
export {
  GetTollRoadsResponseSchema,
  TollRoadSchema,
} from './contracts/toll-roads.contract'
export {
  GetTollRoadsResponseDtoSchema,
  TollRoadDtoSchema,
} from './contracts/toll-roads.dto.contract'
export { mapGetTollRoads, mapTollRoad } from './mapper/toll-roads.mapper'

// mutations and queries
export { useGetTollRoadsMutation } from './get-toll-roads.mutation'
export { getTollRoads } from './get-toll-roads.service'
