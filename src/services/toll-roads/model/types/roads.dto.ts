import { z } from 'zod'
import {
  CoordinateDtoSchema,
  GetTollRoadsResponseDtoSchema,
  TollRoadDtoSchema,
} from '../../api/contracts/toll-roads.dto.contract'

export type TollRoadDto = z.infer<typeof TollRoadDtoSchema>

export type GetTollRoadsResponseDto = z.infer<
  typeof GetTollRoadsResponseDtoSchema
>
export type CoordinateDto = z.infer<typeof CoordinateDtoSchema>
