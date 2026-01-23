import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { GetWeighStationsAlongPolylineSectionsResponse } from '../types/weigh-stations-with-section'
import { getWeighStationsAlongPolylineSections } from './get-weigh-stations-along-polyline-sections.service'
import { GetWeighStationsAlongPolylineSectionsPayload } from './payload/get-weigh-stations-along-polyline-sections.payload'

export function useGetWeighStationsAlongPolylineSectionsMutation(
  options: Pick<
    UseMutationOptions<
      GetWeighStationsAlongPolylineSectionsResponse,
      DefaultError,
      GetWeighStationsAlongPolylineSectionsPayload,
      { abortController: AbortController }
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  > = {},
) {
  const { mutationKey = [], onMutate, onSuccess, onError, onSettled } = options

  return useMutation({
    mutationKey: [
      'weigh-stations',
      'get-weigh-stations-along-polyline-sections',
      ...mutationKey,
    ],

    mutationFn: async (payload: GetWeighStationsAlongPolylineSectionsPayload) => {
      const controller = new AbortController()
      return getWeighStationsAlongPolylineSections(payload, controller.signal)
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
