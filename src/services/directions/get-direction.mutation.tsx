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
  // Ensure we abort the *same* request we started for this mutation call.
  // React Query runs `onMutate` before `mutationFn`, so we create the controller there
  // and then use it inside `mutationFn`.
  let abortController: AbortController | null = null

  return useMutation({
    mutationKey: ['directions', action, ...mutationKey],

    mutationFn: async (payload: RouteRequestPayload) => {
      const validatedPayload = RouteRequestPayloadSchema.parse(payload)
      if (!abortController) abortController = new AbortController()
      return handleFuelRoute(validatedPayload, action, abortController.signal)
    },

    onMutate: async (variables) => {
      abortController = new AbortController()
      // Forward any additional args expected by the project's react-query types.
      await (onMutate as any)?.(variables)
      return { abortController: abortController }
    },

    onSuccess: async (data, variables, context, ...rest) => {
      await (onSuccess as any)?.(data, variables, context, ...rest)
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
