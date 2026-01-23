import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_ID_KEY = 'user_id'

// iOS 18+ requires explicit keychainService to avoid crashes during Keychain access.
// Use the bundle identifier for consistency.
const KEYCHAIN_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: 'us.roadsmart.app',
}

/**
 * Save access token to AsyncStorage
 */
export async function saveAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token)
}

/**
 * Get access token from AsyncStorage
 */
export async function getAccessToken(): Promise<string | null> {
  return await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * Remove access token from AsyncStorage
 */
export async function removeAccessToken(): Promise<void> {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY)
}

/**
 * Save refresh token to SecureStore
 */
export async function saveRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, KEYCHAIN_OPTIONS)
}

/**
 * Get refresh token from SecureStore
 */
export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY, KEYCHAIN_OPTIONS)
}

/**
 * Remove refresh token from SecureStore
 */
export async function removeRefreshToken(): Promise<void> {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, KEYCHAIN_OPTIONS)
}

/**
 * Save user ID to AsyncStorage
 */
export async function saveUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(USER_ID_KEY, userId)
}

/**
 * Get user ID from AsyncStorage
 */
export async function getUserId(): Promise<string | null> {
  return await AsyncStorage.getItem(USER_ID_KEY)
}

/**
 * Remove user ID from AsyncStorage
 */
export async function removeUserId(): Promise<void> {
  await AsyncStorage.removeItem(USER_ID_KEY)
}

/**
 * Save user email to AsyncStorage
 */

/**
 * Clear all tokens and user data
 */
export async function clearAllTokens(): Promise<void> {
  await Promise.all([
    removeAccessToken(),
    removeRefreshToken(),
    removeUserId(),
  ])
}

/**
 * Save tokens and optionally user ID
 */
export async function saveTokens(
  accessToken: string,
  refreshToken: string,
  userId?: string,
): Promise<void> {
  const promises: Promise<void>[] = [
    saveAccessToken(accessToken),
    saveRefreshToken(refreshToken),
  ]
  if (userId) {
    promises.push(saveUserId(userId))
  }
  await Promise.all(promises)
}
