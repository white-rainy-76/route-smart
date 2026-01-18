require('dotenv').config()

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

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
    plugins: [
      'expo-router',
      'expo-apple-authentication',
      'expo-secure-store',
      [
        'react-native-maps',
        {
          iosGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
          androidGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
        },
      ],
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
    ],
    extra: {
      router: {},
      eas: {
        projectId: 'd670ff49-b132-4a8d-9e39-0c774262017b',
      },
    },
    owner: 'elimalikovsky',
  },
}
