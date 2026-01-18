import { Coordinate } from '@/shared/types'
import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { getNearestDropPoint } from './direction.service'
import { PointRequestPayloadSchema } from './payload/directions.payload'
import { PointRequestPayload } from './types/directions.payload'

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
  // Keep a single controller per mutation call so cancellation actually affects the request.
  let abortController: AbortController | null = null

  return useMutation({
    mutationKey: ['drop-point', 'create', ...mutationKey],

    mutationFn: async (payload: PointRequestPayload) => {
      const validatedPayload = PointRequestPayloadSchema.parse(payload)
      if (!abortController) abortController = new AbortController()
      return getNearestDropPoint(validatedPayload, abortController.signal)
    },

    onMutate: async (variables) => {
      abortController = new AbortController()
      await (onMutate as any)?.(variables)
      return { abortController: abortController }
    },

    onSuccess: async (data, variables, context, ...rest) => {
      await Promise.all([
        (onSuccess as any)?.(data, variables, context, ...rest),
      ])
    },

    onError: (error, variables, context, ...rest) => {
      if (context?.abortController) {
        context.abortController.abort('Request cancelled due to error')
      }
      abortController?.abort('Request cancelled due to error')
      ;(onError as any)?.(error, variables, context, ...rest)
    },

    onSettled: (data, error, variables, context, ...rest) => {
      if (context?.abortController) {
        context.abortController.abort('Request settled')
      }
      abortController?.abort('Request settled')
      abortController = null
      ;(onSettled as any)?.(data, error, variables, context, ...rest)
    },
  })
}
