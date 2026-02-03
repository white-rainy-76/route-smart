import { api } from '@/shared/api/api.instance'
import { responseContract } from '@/shared/api/api.lib'
import { AxiosRequestConfig } from 'axios'
import {
  authResponseSchema,
  refreshTokenResponseSchema,
} from './contracts/auth.contract'
import { appleSignInPayloadSchema } from './payload/apple-sign-in.payload'
import {
  signInPayloadSchema,
  signUpPayloadSchema,
} from './payload/auth.payload'
import { deleteUserPayloadSchema } from './payload/delete-user.payload'
import { refreshTokenPayloadSchema } from './payload/refresh-token.payload'
import { AuthResponse, RefreshTokenResponse } from './types/auth'
import {
  AppleSignInPayload,
  DeleteUserPayload,
  RefreshTokenPayload,
  SignInPayload,
  SignUpPayload,
} from './types/auth.payload'

export const signIn = async (
  payload: SignInPayload,
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  const validatedPayload = signInPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }
  const response = await api
    .post(`/auth-api/Auth/login-mobile`, validatedPayload, config)
    .then(responseContract(authResponseSchema))

  return response.data
}

export const signUp = async (
  payload: SignUpPayload,
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  const validatedPayload = signUpPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }
  const response = await api
    .post(`/auth-api/Auth/register-mobile`, validatedPayload, config)
    .then(responseContract(authResponseSchema))

  return response.data
}

export const refreshToken = async (
  payload: RefreshTokenPayload,
  signal?: AbortSignal,
): Promise<RefreshTokenResponse> => {
  const validatedPayload = refreshTokenPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }
  const response = await api
    .post(`/auth-api/Auth/refresh-mobile`, validatedPayload, config)
    .then(responseContract(refreshTokenResponseSchema))
  return response.data
}

export const appleSignIn = async (
  payload: AppleSignInPayload,
  signal?: AbortSignal,
): Promise<AuthResponse> => {
  const validatedPayload = appleSignInPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }
  const response = await api
    .post(`/auth-api/AppleOAuth/login`, validatedPayload, config)
    .then(responseContract(authResponseSchema))

  return response.data
}

export const logout = async (signal?: AbortSignal): Promise<void> => {
  const config: AxiosRequestConfig = { signal }
  await api.post(`/auth-api/Auth/logout-mobile`, {}, config)
}

export const deleteUser = async (
  payload: DeleteUserPayload,
  signal?: AbortSignal,
): Promise<void> => {
  const validatedPayload = deleteUserPayloadSchema.parse(payload)
  const config: AxiosRequestConfig = { signal }
  await api.delete(`/auth-api/User/${validatedPayload.userId}`, config)
}