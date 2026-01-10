import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { handleFuelRoute } from './direction.service'
import { RouteRequestPayloadSchema } from './payload/directions.payload'
import { ActionType, Directions } from './types/directions'
import { RouteRequestPayload } from './types/directions.payload'

export function useGetDirectionsMutation(
  action: ActionType = 'create',
  options: Pick<
    UseMutationOptions<
      Directions,
      DefaultError,
      RouteRequestPayload,
      { abortController: AbortController }
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  > = {},
) {
  const { mutationKey = [], onMutate, onSuccess, onError, onSettled } = options

  return useMutation({
    mutationKey: ['directions', action, ...mutationKey],

    mutationFn: async (payload: RouteRequestPayload) => {
      const validatedPayload = RouteRequestPayloadSchema.parse(payload)
      const controller = new AbortController()
      return handleFuelRoute(validatedPayload, action, controller.signal)
    },

    onMutate: async (variables, context) => {
      const controller = new AbortController()
      if (onMutate) {
        await onMutate(variables, context)
      }
      return { abortController: controller }
    },

    onSuccess: async (data, variables, context) => {
      if (onSuccess) {
        await onSuccess(data, variables, context)
      }
    },

    onError: (error, variables, context) => {
      if (context?.abortController) {
        context.abortController.abort('Request cancelled due to error')
      }
      if (onError) {
        onError(error, variables, context)
      }
    },

    onSettled: (data, error, variables, context) => {
      if (context?.abortController) {
        context.abortController.abort('Request settled')
      }
      if (onSettled) {
        onSettled(data, error, variables, context)
      }
    },
  })
}
