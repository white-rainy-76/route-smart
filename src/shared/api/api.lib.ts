import { AxiosError } from 'axios'
import { apiInstance } from './api.instance'
import { ApiError, ApiResponse } from './api.types'

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.code,
      errors: error.response?.data?.errors,
    }
  }
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  }
}

export const apiRequest = async <T = any>(
  request: () => Promise<{ data: any }>,
): Promise<ApiResponse<T>> => {
  try {
    const response = await request()
    return {
      data: response.data,
      success: true,
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

