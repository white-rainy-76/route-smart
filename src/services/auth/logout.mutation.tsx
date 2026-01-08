import { clearAllTokens } from '@/shared/lib/auth'
import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { logout } from './auth.service'

export function useLogoutMutation(
  options: Pick<
    UseMutationOptions<
      void,
      DefaultError,
      void,
      { abortController: AbortController }
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  > = {},
) {
  const { mutationKey = [], onMutate, onSuccess, onError, onSettled } = options

  return useMutation({
    mutationKey: ['auth', 'logout', ...mutationKey],

    mutationFn: async () => {
      const controller = new AbortController()
      await logout(controller.signal)
      // Clear tokens after successful logout
      await clearAllTokens()
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
