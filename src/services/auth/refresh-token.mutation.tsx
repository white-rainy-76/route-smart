import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { refreshToken } from './auth.service'
import { refreshTokenPayloadSchema } from './payload/refresh-token.payload'
import { RefreshTokenResponse } from './types/auth'
import { RefreshTokenPayload } from './types/auth.payload'

export function useRefreshTokenMutation(
  options: Pick<
    UseMutationOptions<
      RefreshTokenResponse,
      DefaultError,
      RefreshTokenPayload,
      { abortController: AbortController }
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  > = {},
) {
  const { mutationKey = [], onMutate, onSuccess, onError, onSettled } = options

  return useMutation({
    mutationKey: ['auth', 'refreshToken', ...mutationKey],

    mutationFn: async (payload: RefreshTokenPayload) => {
      const validatedPayload = refreshTokenPayloadSchema.parse(payload)
      const controller = new AbortController()
      return refreshToken(validatedPayload, controller.signal)
    },

    onMutate: async (variables, context) => {
      const controller = new AbortController()
      await onMutate?.(variables, context)
      return { abortController: controller }
    },

    onSuccess: async (data, variables, context, mutationMeta) => {
      await Promise.all([onSuccess?.(data, variables, context, mutationMeta)])
    },

    onError: (error, variables, context, mutationMeta) => {
      if (context?.abortController) {
        context.abortController.abort('Request cancelled due to error')
      }
      onError?.(error, variables, context, mutationMeta)
    },

    onSettled: (data, error, variables, context, mutationMeta) => {
      if (context?.abortController) {
        context.abortController.abort('Request settled')
      }
      onSettled?.(data, error, variables, context, mutationMeta)
    },
  })
}
