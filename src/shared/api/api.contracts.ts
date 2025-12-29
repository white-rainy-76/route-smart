// API contracts and endpoints definitions
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },
} as const

