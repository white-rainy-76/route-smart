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
            'Road Smart uses your location to calculate routes from your current position to your destination, display your location on the map, and provide real-time navigation guidance. For example, when you search for a route, we use your current location to calculate the best route from your position to your destination and show your location on the map as you travel.',
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
