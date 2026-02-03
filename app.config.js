require('dotenv').config()

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''

module.exports = {
  expo: {
    name: 'Road Smart',
    slug: 'road-smart',
    scheme: 'roadsmart',
    version: '1.0.1',
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
          'Road Smart uses your location to show you on the map, calculate routes from your current position to your destination (including toll costs), and provide real-time guidance as you drive. For example, when you plan a trip, we use your location to build the route from where you are, display toll costs along the way, and keep your position updated on the map.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Road Smart uses your location to show you on the map, calculate routes from your current position to your destination (including toll costs), and provide real-time guidance as you drive. For example, when you plan a trip, we use your location to build the route from where you are, display toll costs along the way, and keep your position updated on the map.',
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
            'Road Smart uses your location to show you on the map, calculate routes from your current position to your destination (including toll costs), and provide real-time guidance as you drive. For example, when you plan a trip, we use your location to build the route from where you are, display toll costs along the way, and keep your position updated on the map.',
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
    devClient: {
      // Enable DevTools in development
      devToolsEnabled: true,
    },
    owner: 'elimalikovsky',
  },
}
