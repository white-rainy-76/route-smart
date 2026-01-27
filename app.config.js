require('dotenv').config()

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// Определяем платформу для условного включения плагинов
// EAS Build устанавливает EAS_BUILD_PLATFORM или EXPO_PUBLIC_PLATFORM
// Если не установлено (локальная разработка), включаем оба плагина для совместимости
const buildPlatform = process.env.EAS_BUILD_PLATFORM || process.env.EXPO_PUBLIC_PLATFORM

const getPlugins = () => {
  const basePlugins = [
    'expo-router',
    'expo-apple-authentication',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow 4uscorp to use your location.',
      },
    ],
    'react-native-iap',
    [
      'expo-build-properties',
      {
        android: {
          kotlinVersion: '2.2.0',
        },
      },
    ],
  ]

  // На iOS - только react-native-maps
  if (buildPlatform === 'ios') {
    basePlugins.push([
      'react-native-maps',
      {
        iosGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
        // android не используется на iOS, но оставляем для совместимости
        androidGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    ])
  }
  // На Android - только @rnmapbox/maps
  // Не указываем RNMapboxMapsVersion, используем дефолтную (11.0.* для @rnmapbox/maps 10.2)
  else if (buildPlatform === 'android') {
    basePlugins.push('@rnmapbox/maps')
  }
  // Если платформа не определена (локальная разработка) - включаем оба
  // Это позволяет работать в dev-режиме, но в production сборках будет только нужный
  else {
    basePlugins.push(
      [
        'react-native-maps',
        {
          iosGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
          androidGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
        },
      ],
      '@rnmapbox/maps',
    )
  }

  return basePlugins
}

module.exports = {
  expo: {
    name: 'Road Smart',
    slug: 'road-smart',
    scheme: 'roadsmart',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'us.roadsmart.app',

      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocalNetworkUsageDescription:
          'This app uses the local network to connect to the development server during development.',
        NSLocationWhenInUseUsageDescription:
          'Road Smart uses your location to calculate routes from your current position to your destination, display your location on the map, and provide real-time navigation guidance. For example, when you search for a route, we use your current location to calculate the best route from your position to your destination and show your location on the map as you travel.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Road Smart uses your location to calculate routes from your current position to your destination, display your location on the map, and provide real-time navigation guidance. For example, when you search for a route, we use your current location to calculate the best route from your position to your destination and show your location on the map as you travel.',
      },
      usesAppleSignIn: true,
    },
    android: {
      package: 'us.roadsmart.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      googleServicesFile: './google-services.json',
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: getPlugins(),
    extra: {
      router: {},
      eas: {
        projectId: 'd670ff49-b132-4a8d-9e39-0c774262017b',
      },
    },
    owner: 'elimalikovsky',
  },
}
