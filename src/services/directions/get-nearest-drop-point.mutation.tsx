import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { getNearestDropPoint } from './direction.service'
import { PointRequestPayload } from './types/directions.payload'
import { Coordinate } from '@/shared/types'
import { PointRequestPayloadSchema } from './payload/directions.payload'

export function useGetNearestDropPointMutation(
  options: Pick<
    UseMutationOptions<
      Coordinate,
      DefaultError,
      PointRequestPayload,
      { abortController: AbortController }
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  > = {},
) {
  const { mutationKey = [], onMutate, onSuccess, onError, onSettled } = options

  return useMutation({
    mutationKey: ['drop-point', 'create', ...mutationKey],

    mutationFn: async (payload: PointRequestPayload) => {
      const validatedPayload = PointRequestPayloadSchema.parse(payload)
      const controller = new AbortController()
      return getNearestDropPoint(validatedPayload, controller.signal)
    },

    onMutate: async (variables) => {
      const controller = new AbortController()
      await onMutate?.(variables)
      return { abortController: controller }
    },

    onSuccess: async (data, variables, context) => {
      await Promise.all([onSuccess?.(data, variables, context)])
    },

    onError: (error, variables, context) => {
      if (context?.abortController) {
        context.abortController.abort('Request cancelled due to error')
      }
      onError?.(error, variables, context)
    },

    onSettled: (data, error, variables, context) => {
      if (context?.abortController) {
        context.abortController.abort('Request settled')
      }
      onSettled?.(data, error, variables, context)
    },
  })
}
