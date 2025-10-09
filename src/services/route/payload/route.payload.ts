import { z } from 'zod'

export const getRoutePayloadSchema = z.object({
  truckId: z.string(),
})

export const getRouteByIdPayloadSchema = z.object({
  routeId: z.string(),
  fuelPlanId: z.string().optional(),
})

export const getAssignedRouteByTruckIdPayloadSchema = z.object({
  truckId: z.string(),
})

export const assignRoutePayloadSchema = z.object({
  routeId: z.string(),
  routeSectionId: z.string(),
  truckId: z.string(),
})

export const acceptRoutePayloadSchema = z.object({
  routeId: z.string(),
  routeSectionId: z.string(),
  fuelPlanId: z.string(),
  fuelPlanValidatorId: z.string(),
  fuelRouteVersionId: z.string(),
})

export const declineFuelRoutePayloadSchema = z.object({
  routeId: z.string(),
  routeSectionId: z.string(),
  fuelPlanId: z.string(),
  fuelPlanValidatorId: z.string(),
  fuelRouteVersionId: z.string(),
})

export const completeRoutePayloadSchema = z.object({
  routeId: z.string(),
})

export type GetRoutePayload = z.infer<typeof getRoutePayloadSchema>
export type GetRouteByIdPayload = z.infer<typeof getRouteByIdPayloadSchema>
export type GetAssignedRouteByTruckIdPayload = z.infer<
  typeof getAssignedRouteByTruckIdPayloadSchema
>
export type AssignRoutePayload = z.infer<typeof assignRoutePayloadSchema>
export type AcceptRoutePayload = z.infer<typeof acceptRoutePayloadSchema>
export type DeclineFuelRoutePayload = z.infer<
  typeof declineFuelRoutePayloadSchema
>
export type CompleteRoutePayload = z.infer<typeof completeRoutePayloadSchema>
