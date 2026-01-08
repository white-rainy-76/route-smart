import { useApp } from '@/shared/contexts/app-context'
import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

export default function Index() {
  const { hasCompletedOnboarding, isAuthenticated, isLoading } = useApp()

  // Show loading screen while checking app state
  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    )
  }

  // Redirect to appropriate screen based on app state
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />
  }

  return <Redirect href="/home" />
}
