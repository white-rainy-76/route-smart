import { getAccessToken } from './token-storage'

/**
 * Get access token for API requests
 * This is used by the API interceptor
 */
export async function getToken(): Promise<string | null> {
  return await getAccessToken()
}

/**
 * Sign out user - clear all tokens and auth state
 */
export async function signOut(): Promise<void> {
  const { clearAllTokens } = await import('./token-storage')
  await clearAllTokens()

  // Clear auth state in app context if needed
  // This will be handled by the component using the mutation
}
