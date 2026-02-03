import {
  DefaultError,
  useMutation,
  UseMutationOptions,
} from '@tanstack/react-query'
import { deleteUser } from './auth.service'
import { deleteUserPayloadSchema } from './payload/delete-user.payload'
import { DeleteUserPayload } from './types/auth.payload'

export function useDeleteUserMutation(
  options: Pick<
    UseMutationOptions<
      void,
      DefaultError,
      DeleteUserPayload,
      { abortController: AbortController }
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  > = {},
) {
  const { mutationKey = [], onMutate, onSuccess, onError, onSettled } = options

  return useMutation({
    mutationKey: ['auth', 'deleteUser', ...mutationKey],

    mutationFn: async (payload: DeleteUserPayload) => {
      const validatedPayload = deleteUserPayloadSchema.parse(payload)
      const controller = new AbortController()
      return deleteUser(validatedPayload, controller.signal)
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