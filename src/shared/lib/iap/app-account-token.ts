import * as Crypto from 'expo-crypto'
import { getUserId } from '../auth/token-storage'

/**
 * Generate a deterministic UUID v5-like token from userId.
 * Apple requires appAccountToken to be a valid UUID format.
 *
 * This creates a stable UUID for each user, so the same user
 * always gets the same appAccountToken across sessions.
 */
export async function getAppAccountToken(): Promise<string | null> {
  const userId = await getUserId()
  if (!userId) {
    return null
  }

  // Create a deterministic UUID from userId using SHA-256 hash
  // and formatting it as UUID v4 format (but deterministic)
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `roadsmart:${userId}`,
  )

  // Format hash as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // where y is 8, 9, a, or b (variant bits)
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16), // Version 4
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
      hash.substring(17, 20), // Variant
    hash.substring(20, 32),
  ].join('-')

  return uuid.toLowerCase()
}





