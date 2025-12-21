import '@/../global.css'
import { NetworkStatusBanner } from '@/components/network-status-banner'
import { AppProvider } from '@/contexts/app-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { useTheme } from '@/hooks/use-theme'
import '@/i18n/config'
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

function AppContent() {
  const { resolvedTheme } = useTheme()

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
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="create-truck-profile" />
        <Stack.Screen name="home" />
      </Stack>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider defaultTheme="system">
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
