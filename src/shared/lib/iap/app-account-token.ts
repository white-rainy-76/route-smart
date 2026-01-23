import { getUserId } from '../auth/token-storage'

/**
 * Get appAccountToken for Apple StoreKit.
 * Apple requires appAccountToken to be a valid UUID format.
 *
 * Since userId from backend is already a UUID, we can use it directly.
 */
export async function getAppAccountToken(): Promise<string | null> {
  const userId = await getUserId()
  if (!userId) {
    return null
  }

  // Simple UUID format validation (8-4-4-4-12 hex digits with hyphens)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(userId)) {
    return userId
  }

  // Fallback: if userId is not a UUID (shouldn't happen), return null
  console.warn('[appAccountToken] userId is not a valid UUID:', userId)
  return null
}
















