import { useApp } from '@/shared/contexts/app-context'
import { useLocation } from '@/shared/hooks/use-location'
import { Redirect } from 'expo-router'
import { ActivityIndicator, Platform, View } from 'react-native'

export default function Index() {
  const {
    hasCompletedOnboarding,
    isAuthenticated,
    hasSeenLocationPermission,
    hasActiveSubscription,
    isSubscriptionLoading,
    isLoading,
  } = useApp()
  const { isLoading: locationLoading } = useLocation()

  // Show loading screen while checking app state or location permissions
  if (isLoading || locationLoading || isSubscriptionLoading) {
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

  // Check if user has seen location permission screen
  // If not, redirect to location permission screen
  if (!hasSeenLocationPermission) {
    return <Redirect href="/location-permission" />
  }

  // Check if user has completed subscription flow
  // Skip subscription screen on Android (not implemented yet)
  if (!hasActiveSubscription && Platform.OS === 'ios') {
    return <Redirect href="/subscription" />
  }

  return <Redirect href="/home" />
}
