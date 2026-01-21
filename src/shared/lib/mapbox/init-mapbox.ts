import { MAPBOX_ACCESS_TOKEN } from '@/shared/env'
import { Platform } from 'react-native'

/**
 * Инициализирует Mapbox только на Android
 * На iOS используется react-native-maps
 */
export function initMapbox() {
  if (Platform.OS !== 'android') {
    return
  }

  if (!MAPBOX_ACCESS_TOKEN) {
    if (__DEV__) {
      console.warn(
        'Mapbox access token is not set. Mapbox will not work on Android.',
      )
    }
    return
  }

  try {
    // Динамический импорт, чтобы не ломать iOS сборку, если Mapbox не настроен
    require('@rnmapbox/maps').default.setAccessToken(MAPBOX_ACCESS_TOKEN)
    if (__DEV__) {
      console.log('Mapbox initialized successfully for Android')
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Failed to initialize Mapbox:', error)
    }
  }
}

