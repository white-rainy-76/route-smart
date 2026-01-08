import { API_URL } from '@/shared/env'
import { getRefreshToken, getToken, saveTokens } from '@/shared/lib/auth'
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios'
import { ApiErrorDataDtoSchema } from './api.contracts'
import { normalizeValidationErrors } from './api.lib'

export const api = axios.create({
  baseURL: API_URL,
})

// Flag to prevent multiple refresh requests
let isRefreshing = false
let failedQueue: {
  resolve: (value?: any) => void
  reject: (error?: any) => void
}[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Automatically add authorization token to all requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export function authorizedRequest(
  getAuthToken: () => string | undefined,
  config?: AxiosRequestConfig,
) {
  const token = getAuthToken()
  return {
    ...config,
    headers: {
      ...config?.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (!isAxiosError(error)) {
      return Promise.reject(error)
    }

    // Handle authorization error
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshTokenValue = await getRefreshToken()

        if (!refreshTokenValue) {
          // No refresh token, sign out user
          const { signOut } = await import('@/shared/lib/auth')
          await signOut()
          processQueue(new Error('No refresh token'), null)
          return Promise.reject(error)
        }

        // Try to refresh token (lazy import to avoid circular dependency)
        const { refreshToken } = await import('@/services/auth/auth.service')
        const refreshResponse = await refreshToken({
          refreshToken: refreshTokenValue,
        })

        // Save new tokens
        await saveTokens(refreshResponse.token, refreshResponse.refreshToken)

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.token}`
        }

        // Process queued requests
        processQueue(null, refreshResponse.token)

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, sign out user
        const { signOut } = await import('@/shared/lib/auth')
        await signOut()
        processQueue(refreshError, null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    const validation = ApiErrorDataDtoSchema.safeParse(error.response?.data)

    if (!validation.success) {
      return Promise.reject(error)
    }

    const normalizedErrorResponse = {
      ...error.response!,
      data: normalizeValidationErrors(validation.data),
    }

    return Promise.reject(
      new AxiosError(
        error.message,
        error.code,
        error.config,
        error.request,
        normalizedErrorResponse,
      ),
    )
  },
)
