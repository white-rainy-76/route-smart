import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { getTollRoads } from './get-toll-roads.service'
import { GetTollRoadsPayload } from '../model/types/roads.payload'
import { GetTollRoadsResponse } from '../model/types/roads'

export function useGetTollRoadsMutation(
  options: Pick<
    UseMutationOptions<
      GetTollRoadsResponse,
      DefaultError,
      GetTollRoadsPayload,
      { abortController: AbortController }
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  > = {},
) {
  const { mutationKey = [], onMutate, onSuccess, onError, onSettled } = options

  return useMutation({
    mutationKey: ['roads', 'get-toll-roads', ...mutationKey],

    mutationFn: async (payload: GetTollRoadsPayload) => {
      const controller = new AbortController()
      return getTollRoads(payload, controller.signal)
    },

    onMutate: async (variables, mutation) => {
      const controller = new AbortController()
      await onMutate?.(variables, mutation)
      return { abortController: controller }
    },

    onSuccess: async (data, variables, context, mutation) => {
      await Promise.all([onSuccess?.(data, variables, context, mutation)])
    },

    onError: (error, variables, context, mutation) => {
      if (context?.abortController) {
        context.abortController.abort('Request cancelled due to error')
      }
      onError?.(error, variables, context, mutation)
    },

    onSettled: (data, error, variables, context, mutation) => {
      if (context?.abortController) {
        context.abortController.abort('Request settled')
      }
      onSettled?.(data, error, variables, context, mutation)
    },
  })
}
