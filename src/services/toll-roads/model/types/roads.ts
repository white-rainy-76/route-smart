import { z } from 'zod'
import {
  GetTollRoadsResponseSchema,
  TollRoadSchema,
} from '../../api/contracts/toll-roads.contract'

export type TollRoad = z.infer<typeof TollRoadSchema>

export type GetTollRoadsResponse = z.infer<typeof GetTollRoadsResponseSchema>
