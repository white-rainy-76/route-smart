import '@/../global.css'
import { NetworkStatusBanner } from '@/components/network-status-banner'
import '@/i18n/config'
import { queryClient } from '@/shared/api/query-client'
import { AppProvider } from '@/shared/contexts/app-context'
import { ThemeProvider } from '@/shared/contexts/theme-context'
import { useTheme } from '@/shared/hooks/use-theme'
import { initMapbox } from '@/shared/lib/mapbox/init-mapbox'
import {
  Nunito_400Regular,
  Nunito_400Regular_Italic,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito'
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_400Regular_Italic,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="system">
            <AppProvider>
              <AppContent />
            </AppProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

function AppContent() {
  const { resolvedTheme } = useTheme()

  // Initialize Mapbox for Android
  useEffect(() => {
    initMapbox()
  }, [])

  // Programmatically set status bar style
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(
      resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
    )
  }, [resolvedTheme])

  return (
    <NavigationThemeProvider
      value={
        resolvedTheme === 'dark' ? NavigationDarkTheme : NavigationDefaultTheme
      }>
      <NetworkStatusBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(utils)" />
        <Stack.Screen name="(root)" />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  )
}
