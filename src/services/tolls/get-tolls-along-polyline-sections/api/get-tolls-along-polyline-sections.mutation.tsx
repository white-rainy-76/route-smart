import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { getTollsAlongPolylineSections } from './get-tolls-along-polyline-sections.service'
import { GetTollsAlongPolylineSectionsPayload } from './payload/get-tolls-along-polyline-sections.payload'
import { GetTollsAlongPolylineSectionsResponse } from '../types/toll-with-section'

export function useGetTollsAlongPolylineSectionsMutation(
  options: Pick<
    UseMutationOptions<
      GetTollsAlongPolylineSectionsResponse,
      DefaultError,
      GetTollsAlongPolylineSectionsPayload,
      { abortController: AbortController }
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  > = {},
) {
  const { mutationKey = [], onMutate, onSuccess, onError, onSettled } = options

  return useMutation({
    mutationKey: ['tolls', 'get-tolls-along-polyline-sections', ...mutationKey],

    mutationFn: async (payload: GetTollsAlongPolylineSectionsPayload) => {
      const controller = new AbortController()
      return getTollsAlongPolylineSections(payload, controller.signal)
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
